'use client'
import React, { useState, useCallback, useEffect } from 'react'

import { api } from '@/utils/axios.config'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { ellipsis } from '@/lib/utils'
import { addClassToCodeTags } from '@/utils/admin'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Image from 'next/image'

type Props = {
    moduleId: string
    chapterId: number
    content: any
    bootcampId: number
    fetchChapters: any
}

function Quiz(props: Props) {
    const [questions, setQuestions] = useState<any[]>([])
    const [data, setData] = useState()
    const [status, setStatus] = useState<boolean>(false)
    const [selectedAnswers, setSelectedAnswers] = useState<{
        [key: number]: string
    }>({})

    const handleCorrectQuizQuestion = (
        questionId: number,
        optionId: string
    ) => {
        setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }))
    }

    const allQuestionsAnswered = () => {
        return (
            questions?.length > 0 &&
            questions?.every(
                (question) => selectedAnswers[question.id] !== undefined
            )
        )
    }

    const getAllQuizQuestionHandler = useCallback(async () => {
        try {
            const res = await api.get(
                `/tracking/getQuizAndAssignmentWithStatus?chapterId=${props.chapterId}`
            )

            if (res.data.isSuccess) {
                const updatedQuestions = res.data.data.quizDetails.map(
                    (item: any) => ({
                        ...item,
                        status: res?.data.data.status,
                    })
                )
                setQuestions(updatedQuestions)
                setStatus(res.data.data.status === 'Completed')
            } else {
                console.error('Failed to fetch quiz details')
            }
        } catch (error) {
            console.error('Error fetching quiz questions:', error)
        }
    }, [props.chapterId])

    const updateQuizChapterHandler = useCallback(async () => {
        try {
            await api
                .post(
                    `/tracking/updateChapterStatus/${props.bootcampId}/${props.moduleId}?chapterId=${props.chapterId}`
                )
                .then(() => {
                    toast({
                        title: 'Success',
                        description: 'Chapter Status Updated',
                        className:
                            'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                    })
                    props.fetchChapters()
                })
        } catch (error) {
            console.error('Error updating chapter status:', error)
        }
    }, [props])

    useEffect(() => {
        getAllQuizQuestionHandler()
    }, [getAllQuizQuestionHandler])

    const handleSubmit = async () => {
        const mappedAnswers = Object.entries(selectedAnswers).map(
            ([mcqId, chosenOption]) => ({
                mcqId: Number(mcqId),
                chossenOption: Number(chosenOption),
            })
        )
        const transformedBody = {
            submitQuiz: mappedAnswers,
        }

        await api
            .post(
                `/tracking/updateQuizAndAssignmentStatus/${props.bootcampId}/${props.moduleId}?chapterId=${props.chapterId}`,
                transformedBody
            )
            .then(() => {
                toast({
                    title: 'Success',
                    description: 'Submitted Quiz Successfully',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
            })
        await updateQuizChapterHandler()
        await getAllQuizQuestionHandler()
    }

    return (
        <ScrollArea className="h-screen">
            {questions.length == 0 ? (
                <div>
                    <h1 className="text-center font-semibold text-2xl">
                        There are no question added yet
                    </h1>
                    <MaxWidthWrapper className="flex flex-col justify-center items-center gap-5">
                        <div>
                            <Image
                                src="/resource_library_empty_state.svg"
                                alt="Empty State"
                                width={500}
                                height={500}
                            />
                        </div>
                        <h2>
                            No quiz questions have been added by the Instructor
                        </h2>
                    </MaxWidthWrapper>
                </div>
            ) : (
                <div>
                    <div className="h-full w-full rounded-md mt-20">
                        <div className="flex flex-col justify-center items-center">
                            <div className="p-4 flex gap-y-4 flex-col items-start">
                                <h1 className="text-xl font-semibold">
                                    {props.content.title}
                                </h1>
                                {!status ? (
                                    <h2 className="text-red-600">
                                        Please complete all the questions and
                                        then submit.
                                    </h2>
                                ) : (
                                    <h1 className="text-lg text-secondary font-semibold">
                                        You have already submitted this Quiz
                                    </h1>
                                )}
                                {questions?.map((question, index) => {
                                    const additionalClass =
                                        'bg-gray-300 text-start '
                                    const processedHtml = addClassToCodeTags(
                                        question.question,
                                        additionalClass
                                    )
                                    return (
                                        <div key={question.id}>
                                            <div className="flex items-center space-x-2">
                                                <h1 className="font-semibold my-3">
                                                    {'Q'}
                                                    {index + 1}
                                                </h1>
                                                <span
                                                    className=""
                                                    dangerouslySetInnerHTML={{
                                                        __html: processedHtml,
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                {Object.entries(
                                                    question.options
                                                ).map(
                                                    ([
                                                        optionId,
                                                        optionText,
                                                    ]) => (
                                                        <div
                                                            key={optionId}
                                                            className="flex items-center gap-5"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question_${question.id}`}
                                                                value={optionId}
                                                                className="m-4 w-4 h-4 text-secondary focus:ring-secondary-500"
                                                                checked={
                                                                    question.status ===
                                                                        'pass' ||
                                                                    question.status ===
                                                                        'fail' ||
                                                                    question.status ===
                                                                        'done'
                                                                        ? question.correctOption ===
                                                                          Number(
                                                                              optionId
                                                                          )
                                                                        : selectedAnswers[
                                                                              question
                                                                                  .id
                                                                          ] ===
                                                                          optionId
                                                                }
                                                                onChange={() =>
                                                                    handleCorrectQuizQuestion(
                                                                        question.id,
                                                                        optionId
                                                                    )
                                                                }
                                                                disabled={
                                                                    question.status ===
                                                                        'pass' ||
                                                                    question.status ===
                                                                        'fail' ||
                                                                    question.status ===
                                                                        'done'
                                                                }
                                                            />
                                                            {status ? (
                                                                <label
                                                                    key={
                                                                        optionId
                                                                    }
                                                                    className={`m-4 flex  font-semibold items-center ${
                                                                        question
                                                                            .quizTrackingData[0]
                                                                            .chosenOption ===
                                                                        Number(
                                                                            optionId
                                                                        )
                                                                            ? question
                                                                                  .quizTrackingData[0]
                                                                                  .chosenOption ===
                                                                              question.correctOption
                                                                                ? 'text-green-600'
                                                                                : 'text-red-600'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {String(
                                                                        optionText
                                                                    )}
                                                                </label>
                                                            ) : (
                                                                <label
                                                                    key={
                                                                        optionId
                                                                    }
                                                                    className="m-4 flex items-center"
                                                                >
                                                                    {String(
                                                                        optionText
                                                                    )}
                                                                </label>
                                                            )}
                                                        </div>
                                                    )
                                                )}

                                                {status && (
                                                    <p
                                                        className={`mt-2 font-semibold ${
                                                            question.status ===
                                                            'fail'
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                        }`}
                                                    >
                                                        Status:{' '}
                                                        {
                                                            question
                                                                .quizTrackingData[0]
                                                                .status
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <Button
                            disabled={!allQuestionsAnswered()}
                            onClick={handleSubmit}
                            className="flex w-1/6 flex-col"
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            )}
        </ScrollArea>
    )
}

export default Quiz
