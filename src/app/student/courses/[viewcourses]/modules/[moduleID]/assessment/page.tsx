'use client'

import React, { useEffect } from 'react'

const Page = () => {
    // Functions:-

    // tab change event listener
    function handleVisibilityChange() {
        if (document.hidden) {
            console.log('The Page is no longer visible. Test ended.')
        }
    }

    // Request full screen as full screen is only allowed by user click
    function requestFullScreen(element: HTMLElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen()
        } else if ((element as any).mozRequestFullScreen) {
            /* Firefox */
            ;(element as any).mozRequestFullScreen()
        } else if ((element as any).webkitRequestFullscreen) {
            /* Chrome, Safari and Opera */
            ;(element as any).webkitRequestFullscreen()
        } else if ((element as any).msRequestFullscreen) {
            /* IE/Edge */
            ;(element as any).msRequestFullscreen()
        }
    }

    function handleFullScreenChange() {
        if (!document.fullscreenElement) {
            alert('User has exited full screen. Test ended.')
            // Here you could end the test, show a warning, etc.
        }
    }

    // Event Listeners:-
    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange)
        document.addEventListener('fullscreenchange', handleFullScreenChange)

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            )
            document.removeEventListener(
                'fullscreenchange',
                handleFullScreenChange
            )
        }
    }, [])

    return (
        <>
            <h1 className="text-secondary text-5xl">
                Assessment Page Under Construction
            </h1>
            <div className="mt-52 w-full flex justify-center items-center">
                <div
                    onPaste={(e) => {
                        e.preventDefault()
                        // alert('You are not allowed to paste here')
                    }}
                    onCopy={(e) => {
                        e.preventDefault()
                        // alert('Copying is not allowed')
                    }}
                >
                    <h1>Welcome to the Assessment Page</h1>
                    {/* <textarea cols={30} rows={10}></textarea> */}
                    {/* <button
                        onClick={() =>
                            requestFullScreen(document.documentElement)
                        }
                    >
                        Start Test
                    </button> */}
                </div>
            </div>
        </>
    )
}

export default Page
