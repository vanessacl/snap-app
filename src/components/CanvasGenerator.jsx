import React, { useEffect, useState, useRef } from 'react'
//import { removeBackground} from "@imgly/background-removal";
import {
  ImageSegmenter,
  ImageSegmenterResult,
  FilesetResolver,
  MPMask,
} from '@mediapipe/tasks-vision'
import appStore from '../store/appStore'
//import { isIOs } from '../utils/iosCheck';

const CanvasGenerator = ({ userCapture, canvas, onProcessingComplete }) => {
  const [processedImage, setProcessedImage] = useState(null)

  //const bUseMediaPipe = isIOs() ? true : false;
  const bUseMediaPipe = true

  //#region background and footer image variables
  const backgrounds = [
    { id: 1, imageUrl: '/assets/BG1_City.png' },
    { id: 2, imageUrl: '/assets/BG2_University.png' },
    { id: 3, imageUrl: '/assets/BG3_CityWindow.png' },
  ]

  const footerOverlayUrl = '/assets/overlay-footer-x.png'

  const getImageUrl = (id) => {
    const background = backgrounds.find((bg) => bg.id === id)
    return background ? background.imageUrl : null
  }
  //#endregion

  //#region bg removal variables
  // bg removal states
  const [bgRemovedSelfieImage, setBgRemovedSelfieImage] = useState(null) // this used to be called bgProcessedImage
  const [bgMaskVals, setBgMaskVals] = useState(null)
  const [selfieMaskReady, setSelfieMaskReady] = useState(false)

  // refs
  const removalStartedRef = useRef(false)

  // mediapipe image segmenter variables
  let runningMode = 'IMAGE'

  /** @type {ImageSegmenter} */
  let imageSegmenter

  /** @type {Array<string>} */
  let labels
  //#endregion

  // #region final selfie creation variables
  // final selfie states
  const [imagesReady, setImagesReady] = useState(false)
  const [colorBalImage, setColorBalImage] = useState()
  const [finalSelfieReady, setFinalSelfieReady] = useState(false)
  const [loadedImages, setLoadedImages] = useState([])

  const selfieIdx = 1
  const footerIdx = 2
  //#endregion

  // #region bg removal methods
  /**
   * @param {HTMLImageElement} imageref
   */
  const CreateImageSegmenter = async (imageref) => {
    const audio = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )

    //console.log("In create segmenter code");
    imageSegmenter = await ImageSegmenter.createFromOptions(audio, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite',
        //"https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
        delegate: 'CPU',
      },
      runningMode: runningMode,
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    })
    labels = imageSegmenter.getLabels()
    if (imageSegmenter) {
      //console.log("Ok we have a segmenter Here " + labels)
      imageSegmenter.segment(imageref, FinishImageSegmentBGRemoval)
    }
  }

  /**
   * @param {ImageSegmenterResult} result - The result from the image segmenter.
   */
  function FinishImageSegmentBGRemoval(result) {
    /** @type {Uint8Array} */
    const mask = result.categoryMask.getAsUint8Array()

    setBgMaskVals(mask)
    //setBgMaskConfidence(result?.confidenceMasks);
    setSelfieMaskReady(true)
  }
  //#endregion

  // #region final selfie methods
  const BlurAlphaChannel = (imgData) => {
    const width = imgData.width
    const height = imgData.height
    const data = imgData.data
    const blurSize = 2 // Change this value to increase/decrease the blur effect

    const getCoord = (x, y) => (y * width + x) * 4

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0
        let count = 0

        for (let k = -blurSize; k <= blurSize; k++) {
          for (let j = -blurSize; j <= blurSize; j++) {
            const yy = y + k
            const xx = x + j

            if (xx >= 0 && xx < width && yy >= 0 && yy < height) {
              const index = getCoord(xx, yy)
              sum += data[index + 3] // Add the alpha value
              count++
            }
          }
        }

        const avg = sum / count
        const index = getCoord(x, y)

        data[index + 3] = avg // Modify the alpha value
      }
    }
  }

  const WhiteBalanceImage = (imgData) => {
    let copyData = new ImageData(imgData.data, imgData.width, imgData.height)
    let allData = copyData.data
    let numPixels = allData.length / 4
    let redChannel = [numPixels]
    let greenChannel = [numPixels]
    let blueChannel = [numPixels]

    let idx = 0
    for (let i = 0; i < allData.length; i += 4) {
      redChannel[idx] = allData[i]
      greenChannel[idx] = allData[i + 1]
      blueChannel[idx] = allData[i + 2]
      ++idx
    }

    let balancedRed = WhiteBalanceChannel(redChannel)
    let balanceGreen = WhiteBalanceChannel(greenChannel)
    let balanceBlue = WhiteBalanceChannel(blueChannel)

    idx = 0
    for (let i = 0; i < allData.length; i += 4) {
      allData[i] = balancedRed[idx]
      allData[i + 1] = balanceGreen[idx]
      allData[i + 2] = balanceBlue[idx]
      ++idx
    }
    return copyData
  }

  const WhiteBalanceChannel = (channelArray) => {
    let sortedArray = channelArray.map((x) => x)
    // sort the arrays
    sortedArray.sort(function (a, b) {
      return a - b
    })

    // percent (configurable) for balance
    const percentForBalance = 0.6

    // calculate the percentile
    const perc05 = CalculatePercentile(sortedArray, percentForBalance)
    const perc95 = CalculatePercentile(sortedArray, 100 - percentForBalance)

    let bandBalancedArray = [channelArray.length]
    let valueBalanced = 0
    for (let i = 0; i < channelArray.length; i++) {
      // calculate balanced value
      valueBalanced = ((channelArray[i] - perc05) * 255.0) / (perc95 - perc05)
      // limit values between 0 and 255
      bandBalancedArray[i] = LimitToByte(valueBalanced)
    }

    return bandBalancedArray
  }

  const CalculatePercentile = (arrayValues, percentile) => {
    let nArray = arrayValues.length
    let nPercent = ((nArray + 1) * percentile) / 100

    if (nPercent === 1) {
      return arrayValues[0]
    } else if (nPercent === nArray) {
      return arrayValues[nArray - 1]
    } else {
      let intNPercent = nPercent | 0
      let d = nPercent - intNPercent
      return (
        arrayValues[intNPercent - 1] +
        d * (arrayValues[intNPercent] - arrayValues[intNPercent - 1])
      )
    }
  }

  const LimitToByte = (value) => {
    if (value < 0) {
      return 0
    } else if (value > 255) {
      return 255
    }

    return value
  }

  const ColorCorrectSelfie = (context) => {
    if (loadedImages) {
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(
        loadedImages[selfieIdx],
        0,
        0,
        loadedImages[selfieIdx].width,
        loadedImages[selfieIdx].height
      )

      const selfieImageData = context.getImageData(
        0,
        0,
        loadedImages[selfieIdx].width,
        loadedImages[selfieIdx].height
      )
      let data = selfieImageData.data
      let maskVal = 1

      if (bUseMediaPipe) {
        for (let i = 0; i < data.length; i += 4) {
          maskVal = bgMaskVals[i / 4]

          if (maskVal > 0) {
            data[i + 3] = 255
          } else {
            data[i + 3] = 0
          }
        }
      }

      context.clearRect(0, 0, canvas.width, canvas.height)
      canvas.width = selfieImageData.width
      canvas.height = selfieImageData.height
      context.putImageData(selfieImageData, 0, 0)

      if (bUseMediaPipe) BlurAlphaChannel(selfieImageData)

      context.clearRect(0, 0, canvas.width, canvas.height)

      let balancedImageData = WhiteBalanceImage(selfieImageData)

      context.clearRect(0, 0, canvas.width, canvas.height)
      canvas.width = balancedImageData.width
      canvas.height = balancedImageData.height
      context.putImageData(balancedImageData, 0, 0)

      let dataURL = canvas.toDataURL()
      const userCaptureImg = new Image()
      userCaptureImg.src = dataURL
      const imageloaded = () => {
        // use userCaptureImg
        setColorBalImage(userCaptureImg)
        setFinalSelfieReady(true)
      }

      // call function when the image is loaded
      userCaptureImg.onload = imageloaded
      // canvas.width = 1080;
      // canvas.height = 1080;
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const PositionAndDrawSelfie = (context) => {
    if (colorBalImage) {
      //console.log("Color Balance Image Width = " + colorBalImage.width + " | Color Balance Image Height = " + colorBalImage.height);
      const sizeMultiplier = 0.75
      let selfieW = colorBalImage.width * sizeMultiplier
      let selfieH = colorBalImage.height * sizeMultiplier

      let topPos = canvas.height - selfieH
      let leftPos = (canvas.width - selfieW) / 2
      //console.log("Canvas height is " + canvas.height);

      context.drawImage(colorBalImage, leftPos, topPos, selfieW, selfieH)
    }
  }

  const AddBottomImageElement = (context) => {
    if (loadedImages[footerIdx] && context) {
      let aspectRatio =
        loadedImages[footerIdx].width / loadedImages[footerIdx].height
      let overlayWidth = loadedImages[footerIdx].width
      let overlayHeight = loadedImages[footerIdx].height

      //let topPos = canvas.height - loadedImages[footerIdx].height;
      let topPos = canvas.height - canvas.height / aspectRatio // testing
      let leftPos = 0
      //context.drawImage(loadedImages[footerIdx], leftPos, topPos, overlayWidth, overlayHeight);
      context.drawImage(
        loadedImages[footerIdx],
        leftPos,
        topPos,
        canvas.width,
        canvas.height / aspectRatio
      ) // I'm testing this until output is 1080 x 1080
    }
  }
  //#endregion

  //#region useEffects bg removal of user's selfie
  useEffect(() => {
    if (userCapture && !removalStartedRef.current) {
      //console.log("We have a userImage here");
      if (bUseMediaPipe) {
        // media pipe
        removalStartedRef.current = true

        // converting base64 to image element
        /** @type {HTMLImageElement} */
        const userCaptureImg = new Image()
        userCaptureImg.src = userCapture

        const imageloaded = () => {
          setBgRemovedSelfieImage(userCaptureImg)
          CreateImageSegmenter(userCaptureImg)
        }

        // call function when the image is loaded
        userCaptureImg.onload = imageloaded
      }
      // else // not iOS and we'll use the imgly background remover
      // {
      //     removalStartedRef.current = true;

      //     let finalURL;
      //     removeBackground(userCapture)
      //     .then((blob) => {
      //         //result is a blob encoded as PNG.
      //         //It can be converted to an URL to be used as HTMLImage.src
      //         finalURL = URL.createObjectURL(blob);
      //         //console.log("Should run image processing on selfie");

      //         setBgRemovedSelfieImage(finalURL);
      //         setSelfieMaskReady(true);
      //     })
      //     .catch(error=> {
      //         console.log('error during background removal message: ', error);
      //         removalStartedRef.current = false;
      //     });
      // }
    }
  }, [userCapture])

  // update canvas generator once bg removed image is ready & load images that make up final selfie
  useEffect(() => {
    if (
      (bgRemovedSelfieImage && !bUseMediaPipe) ||
      (selfieMaskReady && bgMaskVals)
    ) {
      // there's selfie and processed image is ready
      /** @type {string} */
      let selfieURL =
        !bUseMediaPipe && bgRemovedSelfieImage
          ? bgRemovedSelfieImage
          : userCapture

      // load images ---------------
      /** @type {Array<string>} */
      let imageUrls = []

      /** @type {Array<HTMLImageElement>} */
      let images = []
      let loadedImageCount = 0

      const selectedBgImageUrl = getImageUrl(appStore.selectedBackgroundId)

      imageUrls = [selectedBgImageUrl, selfieURL, footerOverlayUrl]

      imageUrls.forEach((src) => {
        const tempImage = new Image()
        tempImage.src = src
        tempImage.onload = () => {
          loadedImageCount += 1
          if (loadedImageCount === imageUrls.length) {
            setLoadedImages(images)
            setImagesReady(true)
          }
        }
        images.push(tempImage)
      })
    }
  }, [bgRemovedSelfieImage, selfieMaskReady])
  //#endregion

  //#region useEffects create final selfie
  // color correct the selfie and remove background if using media pipe
  useEffect(() => {
    if (imagesReady) {
      if (canvas) {
        const context = canvas.getContext('2d')

        if (context) {
          if (!finalSelfieReady) {
            ColorCorrectSelfie(context)
          }
        }
      }
    }
  }, [imagesReady])

  // create final selfie image with user, selected background, and footer image
  useEffect(() => {
    if (imagesReady && finalSelfieReady) {
      if (canvas) {
        const context = canvas.getContext('2d')

        if (context) {
          // console.log("We are showing the selfie here ");

          context.clearRect(0, 0, canvas.width, canvas.height)

          // add background image
          context.drawImage(loadedImages[0], 0, 0, canvas.width, canvas.height)

          // add selfie with bg removed
          PositionAndDrawSelfie(context)

          // add bottom element
          AddBottomImageElement(context)

          //convert the processed canvas to a data URL and send it back
          const processedImageUrl = canvas.toDataURL()
          setProcessedImage(processedImageUrl)
          onProcessingComplete(processedImageUrl)
        }
      }
    }
  }, [imagesReady, finalSelfieReady])
  //#endregion

  return <div></div>
}

export default CanvasGenerator
