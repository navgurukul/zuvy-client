import React from 'react'
import { ChevronLeft, Timer } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import TimerDisplay from './TimerDisplay'

const QuizQuestions = ({ onBack }: { onBack: () => void }) => {
    return (
        <div>
            <div className="flex items-center justify-between gap-2">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={onBack}
                >
                    <ChevronLeft strokeWidth={2} size={18} />
                    <h1 className="font-extrabold">Python Quiz</h1>
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
                    <h2 className="font-bold mb-4">
                        1. Which one of these is a variable?
                    </h2>
                    <RadioGroup>
                        <div className="flex items-center gap-2 mb-2">
                            <RadioGroupItem value="container123" />
                            <p>container123</p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <RadioGroupItem value="12345" />
                            <p>12345</p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <RadioGroupItem value="%43dabcd" />
                            <p>%43dabcd</p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <RadioGroupItem value="container" />
                            <p>container</p>
                        </div>
                    </RadioGroup>
                </div>

                <div className="flex flex-col items-start w-full max-w-md">
                    <h2 className="font-bold mb-4">
                        2. Which one of these is a variable adsfasdfasdf?
                    </h2>
                    <RadioGroup>
                        <div className="flex items-center gap-2 mb-2">
                            <RadioGroupItem value="container123" />
                            <p>container123</p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <RadioGroupItem value="12345" />
                            <p>12345</p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <RadioGroupItem value="%43dabcd" />
                            <p>%43dabcd</p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <RadioGroupItem value="container" />
                            <p>container</p>
                        </div>
                    </RadioGroup>
                    <Button className="mt-10">Submit Quiz</Button>
                </div>
            </div>
        </div>
    )
}

export default QuizQuestions
