import React from 'react'
import { useRouter } from 'next/navigation'
import { requestFullScreen } from '@/utils/students'
import { useTimerStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Clock, Timer } from 'lucide-react'

const Assessment = () => {
    const router = useRouter()
    const startTimer = useTimerStore((state) => state.startTimer)

    const testDuration = 2 * 60 * 60 // 2 hours in seconds

    const handleStartAssessment = () => {
        requestFullScreen(document.documentElement)
        startTimer(testDuration) // Start the timer with dynamic duration
        router.push(
            '/student/courses/[viewcourses]/modules/[moduleID]/assessment'
        )
    }

    return (
        <React.Fragment>
            <div className="flex justify-center">
                <div className="flex flex-col gap-5 text-left">
                    <h1 className="font-bold">Testing Your Knowledge</h1>
                    <div className="mainContainer2 flex gap-5 ">
                        <div className="coding ">
                            <h2 className="font-bold">5</h2>
                            <p>Coding Challenges</p>
                        </div>
                        <div className="mcq ">
                            <h2 className="font-bold">10</h2>
                            <p>Mcqs</p>
                        </div>
                        <div className="open-ended ">
                            <h2 className="font-bold">2</h2>
                            <p>Open-Ended Questions</p>
                        </div>
                    </div>
                    <p className="description">
                        Short description of the problem in one to two lines
                        that is easy to read and understand
                    </p>
                    <p className="deadline flex items-center gap-2">
                        <Clock size={18} />
                        Deadline: 10 May 2024 (25 days remaining)
                    </p>
                    <p className="testTime flex items-center gap-2">
                        <Timer size={18} />
                        Test Time: 2 hours
                    </p>
                </div>
            </div>
            <Button onClick={handleStartAssessment}>Start Assessment</Button>
        </React.Fragment>
    )
}

export default Assessment
