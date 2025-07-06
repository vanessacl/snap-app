import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import appStore from '../store/appStore' //global state
import Header from '../components/Header'
import { getImageURL } from '../utils/imageURL'

const ChooseBackground = () => {
  const [selectedId, setSelectedId] = useState(null)
  const navigate = useNavigate()
  const sliderRef = useRef(null)

  //background images
  const backgrounds = [
    { id: 1, imageUrl: '/assets/bg-1.png' },
    { id: 2, imageUrl: '/assets/bg-2.png' },
    { id: 3, imageUrl: '/assets/bg-3.png' },
  ]

  const totalPages = backgrounds.length
  const [currentPage, setCurrentPage] = useState(1)

  const handleBackgroundSelect = (id) => {
    if (selectedId === id) {
      setSelectedId(null) //unselect the image if clicked again
      appStore.setBackgroundId(null) //clear global state
    } else {
      setSelectedId(id)
      appStore.setBackgroundId(id) //save selected background ID globally
    }
  }

  const handleScroll = () => {
    const slider = sliderRef.current
    const slideWith = slider.clientWidth
    const scrollPosition = slider.scrollLeft

    const newPage = Math.round(scrollPosition / slideWith) + 1

    setCurrentPage(newPage)
  }

  const handleConfirm = () => {
    if (selectedId !== null) {
      navigate('/image-capture') // proceed to the image capture page
    }
  }

  const scrollToPage = (page) => {
    const slider = sliderRef.current
    const slideWidth = slider.clientWidth

    slider.scrollTo({
      left: (page - 1) * slideWidth,
      behavior: 'smooth',
    })

    //add a slight delay before updating the current page to match the scroll animation
    setTimeout(() => {
      setCurrentPage(page)
    }, 300)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <div className='center-content'>
          <Header showBackButton={true} />
          <h1 className='page-heading '>Choose a background</h1>
        </div>

        <div
          className='background-slider'
          ref={sliderRef}
          onScroll={handleScroll}
        >
          {backgrounds.map((bg) => (
            <div key={bg.id} className={`background-slide slide-${bg.id}`}>
              <img
                src={bg.imageUrl}
                alt={`Background ${bg.id}`}
                onClick={() => handleBackgroundSelect(bg.id)}
                className={selectedId === bg.id ? 'selected' : ''}
              />
              <img
                src={getImageURL('ico-selected-bg.png')}
                alt='left arrow btn'
                className='ico-selected'
              />
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className=' center-content pagination-controls'>
          <button
            onClick={() => scrollToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <img src={getImageURL('ico-left-arrow.png')} alt='left arrow btn' />
          </button>
          <span>
            {currentPage}/{totalPages}
          </span>
          <button
            onClick={() => scrollToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <img
              src={getImageURL('ico-right-arrow.png')}
              alt='right arrow btn'
            />
          </button>
        </div>

        <div className=' center-content btn-container'>
          {/*show text when no image is selected */}
          {selectedId === null && <p>Tap to select</p>}

          {/* confirm button only appears when a background is selected */}
          {selectedId !== null && (
            <button className='btn white' onClick={handleConfirm}>
              Confirm
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ChooseBackground
