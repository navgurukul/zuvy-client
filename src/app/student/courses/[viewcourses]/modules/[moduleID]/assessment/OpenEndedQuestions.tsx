import React, { useEffect } from 'react'
import { ChevronLeft, Timer } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
    handleFullScreenChange,
    handleVisibilityChange,
} from '@/utils/students'
import TimerDisplay from './TimerDisplay'

const OpenEndedQuestions = ({ onBack }: { onBack: () => void }) => {
    // Event Listeners

    return (
        <div className="px-4">
            <div className="flex items-center justify-between gap-2">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={onBack}
                >
                    <ChevronLeft strokeWidth={2} size={18} />
                    <h1 className="font-extrabold">Open-Ended Questions</h1>
                </div>
                <div className="flex items-center">
                    <TimerDisplay />
                </div>
            </div>
            <Separator />
            <div
                className="flex flex-col items-center mt-10"
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
            >
                <div className="flex flex-col items-start mb-10 w-full max-w-md">
                    <h2 className="font-bold mb-4 w-full text-left">
                        1. Explain the difference between a variable and a
                        constant.
                    </h2>
                    <Textarea
                        placeholder="Type your answer here..."
                        className="w-full"
                    />
                </div>

                <div className="flex flex-col items-start w-full max-w-md">
                    <h2 className="font-bold mb-4 w-full text-left">
                        2. Describe how a for loop works in Python.
                    </h2>
                    <Textarea
                        placeholder="Type your answer here..."
                        className="w-full"
                    />
                    <Button className="mt-10">Submit Answers</Button>
                </div>
            </div>
        </div>
    )
}

export default OpenEndedQuestions
