import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getImageURL } from '../utils/imageURL'
import appStore from '../store/appStore'

const Result = () => {
  const navigate = useNavigate()

  useEffect(() => {
    if (!appStore.processedImage) {
      navigate('/')
    }
  }, [navigate])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = appStore.processedImage
    link.download = 'wicked_selfie.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='center-content'>
        <Header showBackButton={false} />
        <div className='photo-container'>
          <img src={appStore.processedImage} alt='Wicked Selfie' />
        </div>
        <h1 className='page-heading '>Your photo is ready!</h1>
        <div className='btn-container'>
          {/*<a href={appStore.processedImage} className="btn white" download="wicked_selfie.jpg">Download photo</a> */}
          <button className='btn white' onClick={handleDownload}>
            Download photo
          </button>
        </div>
        <p>*iPhone users, check your Files app for your downloaded photo.</p>
        <div className='divider'></div>
        <img
          src={getImageURL('wicked.png')}
          alt='Wicked'
          className='primary-img'
        />
        <h2>Thank you for checking this app!</h2>
        <div className='divider'></div>
        <Footer />
      </div>
    </motion.div>
  )
}

export default Result
