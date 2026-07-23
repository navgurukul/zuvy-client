import { useState, useEffect } from 'react'

const useResponsiveHeight = () => {
    const [screenWidth, setScreenWidth] = useState<number | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                setScreenWidth(window.innerWidth)
            }

            // Set initial width
            handleResize()

            // Add event listener for resizing
            window.addEventListener('resize', handleResize)

            // Cleanup on unmount
            return () => {
                window.removeEventListener('resize', handleResize)
            }
        }
    }, [])

    // If the screenWidth is still null (during SSR), return a default value
    const getHeightClass = () => {
        if (screenWidth === null) return 'h-[600px]' // Default during SSR
        if (screenWidth > 1500) return 'h-[600px]'
        if (screenWidth > 1300) return 'h-[500px]'
        return 'h-[600px]'
    }

    return getHeightClass()
}

export default useResponsiveHeight
