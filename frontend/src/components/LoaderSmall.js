import React from 'react'
import { Player } from '@lottiefiles/react-lottie-player';

export const LoaderSmall = () => {

  return (
    <div className="empty-container">
      <Player
        src="https://assets9.lottiefiles.com/packages/lf20_p8bfn5to.json"
        loop
        autoplay
        style={{
          width: '120px'
        }}
      />
    </div>
  )
}
