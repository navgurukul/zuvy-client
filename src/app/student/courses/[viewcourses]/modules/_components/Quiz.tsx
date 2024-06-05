'use client'
import React, { useState, useCallback, useEffect } from 'react'

import { api } from '@/utils/axios.config'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

type Props = {
    moduleId: string
    chapterId: number
    content: any
}

function Quiz(props: Props) {
    const [questions, setQuestions] = useState<any[]>([])
    const getAllQuizQuestionHandler = useCallback(async () => {
        try {
            const res = await api.get(
                `/tracking/getAllQuizAndAssignmentWithStatus/${props.moduleId}?chapterId=${props.chapterId}`
            )
            setQuestions(res.data[0].questions)
        } catch (error) {
            console.error('Error fetching quiz questions:', error)
        }
    }, [props.moduleId, props.chapterId])

    useEffect(() => {
        getAllQuizQuestionHandler()
    }, [getAllQuizQuestionHandler])

    return (
        <div>
            <ScrollArea className="h-vh w-full   rounded-md">
                <div className="flex flex-col justify-center items-center">
                    <div className="p-4 flex gap-y-4 flex-col items-start">
                        <h1 className="text-xl font-semibold">
                            {props.content.title}
                        </h1>
                        {questions.map((question, index) => (
                            <div key={question.id}>
                                <h1 className="font-semibold">
                                    {'Q'}
                                    {index + 1} .{question.question}
                                </h1>
                                <div className="flex flex-col items-start">
                                    {Object.entries(question.options).map(
                                        ([optionId, optionText]) => (
                                            <div key={optionId} className="">
                                                <label
                                                    key={optionId}
                                                    className="block mt-2 "
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question_${question.id}`}
                                                        value={optionId}
                                                        className="m-5"
                                                    />
                                                    {String(optionText)}
                                                </label>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollArea>
            <div className="flex flex-col items-end">
                <Button className="flex w-1/6 flex-col">Submit</Button>
            </div>
        </div>
    )
}

export default Quiz
