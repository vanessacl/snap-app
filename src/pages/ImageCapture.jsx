import React, { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import CanvasGenerator from '../components/CanvasGenerator'
import { getImageURL } from '../utils/imageURL'
import appStore from '../store/appStore'
//import { removeBackground} from "@imgly/background-removal";

const ImageCapture = () => {
  const webcamRef = useRef(null)
  const navigate = useNavigate()

  const [imgSrc, setImgSrc] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImgSrc, setProcessedImgSrc] = useState(null)
  const [error, setError] = useState(null)
  const [canvas, setCanvas] = useState(null) //add state for storing canvas
  const [facingMode, setFacingMode] = useState('user') //default to front camera
  const [userCaptureUrl, setUserCaptureUrl] = useState(null) // Ian added
  const [isHighRes, setIsHighRes] = useState(false)

  const videoSize = 329
  const videoHighResSize = 1080

  //video constraints
  const videoConstraints = {
    width: isHighRes ? videoHighResSize : videoSize,
    height: isHighRes ? videoHighResSize : videoSize,
    facingMode: facingMode,
  }

  //handle toggle camera facing mode
  const handleFlipCamera = () => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'))
  }

  //handle capturing the image using canvas
  const capture = useCallback(() => {
    setIsHighRes(true) //switch to high-resolution before taking the screenshot
    const imageSrc = webcamRef.current.getScreenshot() //capture a screenshot from the webcam
    setImgSrc(imageSrc)

    if (!imageSrc) {
      setError('Failed to capture selfie')
      setIsProcessing(false)
      console.log('Failed to capture selfie')
      return
    }

    if (imageSrc) {
      //create low-resolution canvas for user preview
      setIsHighRes(false) //switch to low-resolution after the screenshot
      const tempCanvas = document.createElement('canvas')
      const ctx = tempCanvas.getContext('2d')
      const videoElement = webcamRef.current.video
      tempCanvas.width = videoSize
      tempCanvas.height = videoSize

      //flip the canvas horizontally for the front camera
      /*if (facingMode === 'environment') {
                ctx.translate(tempCanvas.width, 0);
                ctx.scale(-1, 1);
            }*/

      //draw the video frame onto the preview canvas
      ctx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height)

      //set the low-resolution preview to imgSrc (for display in the UI)
      const previewImageSrc = tempCanvas.toDataURL('image/png')
      console.log('low-resolution image:', previewImageSrc)
      setImgSrc(previewImageSrc)

      //create high-resolution canvas for processing
      setIsHighRes(true) //switch to high-resolution before creating high-res canvas
      const tempCanvasHighRes = document.createElement('canvas')
      const ctxHighRes = tempCanvasHighRes.getContext('2d')
      tempCanvasHighRes.width = videoHighResSize
      tempCanvasHighRes.height = videoHighResSize

      //flip the canvas horizontally for the front camera
      /*if (facingMode === 'environment') {
                ctxHighRes.translate(tempCanvasHighRes.width, 0);
                ctxHighRes.scale(-1, 1);
            }*/

      //draw the video frame onto the high-res canvas
      ctxHighRes.drawImage(
        videoElement,
        0,
        0,
        tempCanvasHighRes.width,
        tempCanvasHighRes.height
      )

      const croppedImageSrc = tempCanvasHighRes.toDataURL('image/png')
      console.log('high resolution image for Ian:', croppedImageSrc)
      setUserCaptureUrl(croppedImageSrc)

      setCanvas(tempCanvasHighRes)
      setIsProcessing(true)
      setError(null)
      setProcessedImgSrc(null)
      setIsHighRes(false)
    }
  }, [])

  //start coundown before capturing photo
  const startCountdown = () => {
    setIsCapturing(true)
    setCountdown(3)
    let intervalId = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount === 1) {
          clearInterval(intervalId)
          capture() //capture the photo when countdown reaches 0
          setIsCapturing(false)
          return 0
        }
        return prevCount - 1
      })
    }, 1000)
  }

  const retake = () => {
    setImgSrc(null)
    setError(null)
    setIsProcessing(false)
    setProcessedImgSrc(false)
  }

  const nextPage = () => {
    appStore.setProcessedImage(processedImgSrc)
    navigate('/result')
  }

  //completion of image processing
  const handleProcessingComplete = (modifiedImage) => {
    setProcessedImgSrc(modifiedImage)
    setIsProcessing(false)
  }

  //redirect to webcamDisabed if webcam access is denied
  const redirectToDisabledMessage = () => {
    console.log('camera access denied')
    navigate('/webcam-disabled')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <div
          className={`selfie-screen ${
            isProcessing || processedImgSrc || error ? 'hide' : 'show'
          }`}
        >
          <div className='center-content'>
            <Header showBackButton={true} />
            <h1 className='page-heading'>Take a picture in Oz</h1>
            <p className='page-subheading'>
              Background will appear in your final photo
            </p>
          </div>
          <div
            className={`container ${!imgSrc ? 'active' : ''} ${
              facingMode === 'environment' ? 'rear-flip' : ''
            }`}
          >
            {imgSrc ? (
              <img src={imgSrc} alt='webcam capture' />
            ) : (
              <>
                <Webcam
                  audio={false}
                  width={videoSize}
                  height={videoSize}
                  mirrored={true}
                  screenshotFormat='image/jpeg'
                  videoConstraints={videoConstraints}
                  ref={webcamRef}
                  onUserMediaError={redirectToDisabledMessage}
                />
                {!imgSrc && (
                  <div className='silhouette-overlay'>
                    {/* render the silhouette as an overlay */}
                    <img
                      src={getImageURL('selfie-silhouette.png')}
                      alt='Silhouette'
                      className='silhouette'
                    />
                  </div>
                )}
                {isCapturing && (
                  <div
                    className={`countdown ${
                      facingMode === 'environment' ? 'rear-flip' : ''
                    }`}
                  >
                    <h3>{countdown}</h3>
                  </div>
                )}
              </>
            )}
            <div
              className={`center-content btns-container ${
                imgSrc ? 'group' : ''
              }`}
            >
              {!imgSrc && !isProcessing && !processedImgSrc && !error && (
                <div className='btns-step1'>
                  <div className='flip-container'>
                    <button
                      onClick={handleFlipCamera}
                      className='btn-flip'
                    ></button>
                  </div>
                  <button
                    onClick={startCountdown}
                    className='btn-capture'
                  ></button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`waiting-screen ${isProcessing ? 'show' : 'hide'}`}>
          {isProcessing && !processedImgSrc && (
            <div className='center-content'>
              <Header showBackButton={false} />
              <div className='waiting-msg'>
                <img
                  src={getImageURL('ico-loading.png')}
                  alt='Loading'
                  className='ico-loading'
                />
                <h3>Working our magic...</h3>
                <p>Your photo is being generated</p>
              </div>
            </div>
          )}
        </div>
        <div className={`error-screen ${error ? 'show' : 'hide'}`}>
          {error && (
            <div className='center-content'>
              <Header showBackButton={false} />
              <div className='error-msg'>
                <h3>Sorry!</h3>
                <p>
                  There was an error with your selfie. <br />
                  Position your face in the <br />
                  brackets and try again.
                </p>
                <button onClick={retake} className='btn-retake2'>
                  Retake selfie
                </button>
              </div>
            </div>
          )}
        </div>
        <div className={`reveal-screen ${processedImgSrc ? 'show' : 'hide'}`}>
          {processedImgSrc && (
            <>
              <div className='center-content'>
                <Header showBackButton={false} />
                <h2 className='page-heading'>Check it out</h2>
              </div>
              <div className='container'>
                <img src={processedImgSrc} alt='processed Image' />
              </div>
              <div className='center-content'>
                <div className='btns-step2'>
                  <button onClick={retake} className='btn-retake'></button>
                  <button onClick={nextPage} className='btn-white'>
                    Looks great
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/*pass canvas to CanvasGenerator when processing */}
        {isProcessing && canvas && userCaptureUrl && (
          <CanvasGenerator
            userCapture={userCaptureUrl}
            canvas={canvas}
            onProcessingComplete={handleProcessingComplete}
          />
        )}
      </div>
    </motion.div>
  )
}

export default ImageCapture
