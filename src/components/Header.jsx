import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getImageURL } from '../utils/imageURL'

const Header = ({ showBackButton }) => {
  const navigate = useNavigate()

  //handle back navigation
  const handleBackClick = () => {
    navigate(-1) //navigates back in history
  }

  return (
    <header className='header'>
      {showBackButton && (
        <button onClick={handleBackClick} className='back-btn'>
          <img src={getImageURL('ico-back-btn.png')} alt='Back button' />
        </button>
      )}
    </header>
  )
}

export default Header
