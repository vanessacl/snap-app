import React, { useEffect, useState } from 'react'
import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import HowItWorks from './pages/HowItWorks'
import ChooseBackground from './pages/ChooseBackground'
import WebcamDisabled from './pages/WebcamDisabled'
import ImageCapture from './pages/ImageCapture'
import Result from './pages/Result'
import QRCode from './pages/qrRedirect'
import BodyClassManager from './components/BodyClassManager'
import Header from './components/Header'
//import { isMobileDevice } from './utils/deviceCheck' //TODO: uncomment before deploying and once the QR code has been updated
import { getImageURL } from './utils/imageURL'

const App = () => {
  const [isMobile, setIsMobile] = useState(true)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    //setIsMobile(isMobileDevice()) //TODO: uncomment before deploying and once the QR code has been updated
    setIsMobile(true)

    const handleOrientationChange = () => {
      if (window.innerWidth > window.innerHeight) {
        //landscape mode
        setIsLandscape(true)
      } else {
        //portrait mode
        setIsLandscape(false)
      }
    }

    handleOrientationChange()
    window.addEventListener('resize', handleOrientationChange) //listen for resize/orientation changes

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
    }
  }, [])

  const BodyClassWrapper = () => {
    const location = useLocation()

    const currentClassName = isMobile
      ? location.pathname.substring(1) || 'home'
      : 'qr-redirect'

    return (
      <>
        <BodyClassManager className={currentClassName} />
        <AnimatePresence mode='wait'>
          <Routes>
            {isMobile ? (
              <>
                <Route path='/' element={<Home />} />
                <Route path='/how-it-works' element={<HowItWorks />} />
                <Route
                  path='/choose-background'
                  element={<ChooseBackground />}
                />
                <Route path='/webcam-disabled' element={<WebcamDisabled />} />
                <Route path='/image-capture' element={<ImageCapture />} />
                <Route path='/result' element={<Result />} />
              </>
            ) : (
              <Route path='*' element={<QRCode />} />
            )}
          </Routes>
        </AnimatePresence>
      </>
    )
  }

  return (
    <Router>
      <BodyClassWrapper />
      {isMobile && isLandscape && (
        <section className='landscape-overlay'>
          <div className='center-content'>
            <Header showBackButton={false} />
            <img
              src={getImageURL('device-orientation.png')}
              alt='Device orientation'
            />
            <h1>Whoops!</h1>
            <p>Please rotate your phone for the best experience.</p>
          </div>
        </section>
      )}
    </Router>
  )
}

export default App
