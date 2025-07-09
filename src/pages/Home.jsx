import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import { getImageURL } from '../utils/imageURL'

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='center-content'>
        <Header showBackButton={false} />
        <img
          src={getImageURL('snap.png')}
          alt='Wicked'
          className='primary-img'
        />
        <h1>
          Capture the magic of Oz and see yourself in the world of Wicked.
        </h1>
        <div className='btn-container'>
          <Link to='/how-it-works'>
            <button className='btn white'>Start</button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default Home
