import React, { useState } from 'react'

import Link from 'next/link'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { Separator } from '@/components/ui/separator'
import { ExternalLink } from 'lucide-react'
import QuizLibrary from './QuizLibrary'
import { quizData, Options } from './QuizLibrary'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import QuizModal from './QuizModal'

interface QuizProps {
    content: Object
}

function Quiz({ content }: QuizProps) {
    const [activeTab, setActiveTab] = useState('anydifficulty')
    const [addQuestion, setAddQuestion] = useState<quizData[]>([])

    const handleAddQuestion = (data: any) => {
        const uniqueData = data.filter((question: quizData) => {
            return !addQuestion.some(
                (existingQuestion: quizData) =>
                    existingQuestion.id === question.id
            )
        })
        setAddQuestion((prevQuestions: quizData[]) => [
            ...prevQuestions,
            ...uniqueData,
        ])
    }
    const removeQuestionById = (questionId: number) => {
        setAddQuestion((prevQuestions: any) =>
            prevQuestions.filter((question: any) => question.id !== questionId)
        )
    }
    console.log(addQuestion)
    return (
        <>
            <div className="flex flex-row items-center justify-start gap-x-6 mb-10">
                <Input
                    placeholder="Untitled Quiz"
                    className="p-0 text-3xl w-1/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                />
                <Link
                    className="text-secondary font-semibold flex mt-2"
                    href={''}
                >
                    Preview
                    <ExternalLink size={20} />
                </Link>
            </div>

            <div className="flex gap-x-2">
                <QuizLibrary
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    addQuestion={addQuestion}
                    handleAddQuestion={handleAddQuestion}
                />
                <Separator
                    orientation="vertical"
                    className="mx-4 w-[2px] h-screen rounded "
                />
                <ScrollArea className="h-screen w-full rounded-md ">
                    <div className="flex flex-col gap-y-4">
                        {addQuestion.map(
                            (questions: quizData, index: number) => {
                                return (
                                    <QuizModal
                                        key={index}
                                        data={questions}
                                        removeQuestionById={removeQuestionById}
                                    />
                                )
                            }
                        )}
                        <Button
                            variant={'outline'}
                            className="text-secondary font-semibold"
                        >
                            Add Question
                        </Button>
                    </div>
                </ScrollArea>

                <div>
                    <div className="w-full mt-6">
                        {' '}
                        {content &&
                            (
                                content as {
                                    id: number
                                    question: string
                                    options: string[]
                                    correctOption: string
                                }[]
                            )?.map(
                                (
                                    { id, question, options, correctOption },
                                    index
                                ) => {
                                    return (
                                        <div
                                            key={id}
                                            className="text-start mb-5"
                                        >
                                            <p>
                                                Q{index + 1}. {question}
                                            </p>
                                            <ul className="text-start">
                                                {Object.entries(options).map(
                                                    ([key, value]) => {
                                                        return (
                                                            <li
                                                                key={key}
                                                                className={cn(
                                                                    'rounded-sm my-1 p-2',
                                                                    correctOption ===
                                                                        key.toString()
                                                                        ? 'bg-secondary text-white'
                                                                        : ''
                                                                )}
                                                            >
                                                                {value}
                                                            </li>
                                                        )
                                                    }
                                                )}
                                            </ul>
                                        </div>
                                    )
                                }
                            )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Quiz
