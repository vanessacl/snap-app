import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'

const HowItWorks = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='center-content'>
        <Header showBackButton={true} />
        <h1 className='page-heading '>How it works</h1>
        <ol>
          <li>1. Connect to Wifi</li>
          <li>
            2. Position your head within the guides and find your perfect angle
          </li>
          <li>3. Take a pic</li>
          <li>4. Download and share your photo</li>
        </ol>
        <div className='btn-container'>
          <Link to='/choose-background'>
            <button className='btn white'>Got it</button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default HowItWorks
