import React from 'react'
import Player from 'lottie-react'
import animationData from '../../../public/animations/loader.json'

const LottieLoader = () => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                margin: '0 auto',
            }}
        >
            <div
                style={{
                    width: 210,
                    height: 210,
                }}
            >
                <Player
                    autoplay
                    loop
                    animationData={animationData}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    )
}

export default LottieLoader
