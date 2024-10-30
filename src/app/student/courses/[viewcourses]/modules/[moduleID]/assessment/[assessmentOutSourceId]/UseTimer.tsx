import { useState, useEffect } from 'react'

const UseTimer = (startImmediately: boolean = false) => {
    const [elapsedTime, setElapsedTime] = useState<number>(() => {
        const savedTime = localStorage.getItem('elapsedTime')
        return savedTime ? parseInt(savedTime, 10) : 0
    })
    const [isRunning, setIsRunning] = useState(startImmediately)

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isRunning) {
            const startTime = Date.now() - elapsedTime
            timer = setInterval(() => {
                const newElapsedTime = Date.now() - startTime
                setElapsedTime(newElapsedTime)
                localStorage.setItem('elapsedTime', newElapsedTime.toString())
            }, 1000)
        }

        const handleVisibilityChange = () => {
            if (document.hidden && isRunning) {
                setIsRunning(false)
            } else if (!document.hidden && !isRunning) {
                setIsRunning(true)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            clearInterval(timer)
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            )
        }
    }, [isRunning, elapsedTime])

    const startTimer = () => setIsRunning(true)
    const stopTimer = () => setIsRunning(false)
    const resetTimer = () => {
        setElapsedTime(0)
        setIsRunning(false)
        localStorage.removeItem('elapsedTime')
    }

    return { elapsedTime, startTimer, stopTimer, resetTimer, isRunning }
}

export default UseTimer
