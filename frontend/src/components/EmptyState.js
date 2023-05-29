import React from 'react'
import { Player } from '@lottiefiles/react-lottie-player';

export const EmptyState = () => {

  return (
    <div className="empty-container">
      <Player
        src="https://assets6.lottiefiles.com/private_files/lf30_waesfnkk.json"
        className="player"
        loop
        autoplay
        style={{
          width: '200px',
          opacity: 0.8
        }}
      />
    </div>
  )
}

