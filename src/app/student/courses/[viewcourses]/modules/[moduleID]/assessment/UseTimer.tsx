import { useState, useEffect } from 'react'

const UseTimer = (startImmediately: boolean = false) => {
    const [elapsedTime, setElapsedTime] = useState<number>(() => {
        const savedTime = 0
        return savedTime ? parseInt(savedTime, 10) : 0
    })
    const [isRunning, setIsRunning] = useState(startImmediately)

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isRunning) {
            const startTime = Date.now() - elapsedTime
            timer = setInterval(() => {
                setElapsedTime(Date.now() - startTime)
            }, 1000)
        }

        return () => clearInterval(timer)
    }, [isRunning])

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
