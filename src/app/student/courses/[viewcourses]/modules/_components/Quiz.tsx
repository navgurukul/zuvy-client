'use client'
import React, { useState, useCallback, useEffect } from 'react'

import { api } from '@/utils/axios.config'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Image from 'next/image'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'
import {Question,FetchFormRes,Props} from "@/app/student/courses/[viewcourses]/modules/_components/type";


function Quiz(props: Props) {
    const [questions, setQuestions] = useState<Question[]>([])
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
            const res = await api.get<FetchFormRes>(
                `/tracking/getQuizAndAssignmentWithStatus?chapterId=${props.chapterId}`
            )

            if (res.data.isSuccess) {
                const updatedQuestions = res.data.data.quizDetails.map(
                    (item: Question) => ({
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
                    toast.success({
                        title: 'Success',
                        description: 'Chapter Status Updated',
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
        if (transformedBody.submitQuiz.length === 0) {
            return toast.error({
                title: 'Cannot Submit',
                description: 'Select alleast one question',
    
            })
        } else {
            await api
                .post(
                    `/tracking/updateQuizAndAssignmentStatus/${props.bootcampId}/${props.moduleId}?chapterId=${props.chapterId}`,
                    transformedBody
                )
                .then(() => {
                    toast.success({
                        title: 'Success',
                        description: 'Submitted Quiz Successfully',
                        className:
                            'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                    })
                })
            await updateQuizChapterHandler()
            await getAllQuizQuestionHandler()
        }
    }

    return (
        <ScrollArea className="h-[calc(100vh-110px)] lg:h-screen md:h-screen">
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
                            No quiz questions have been added by the Intructor
                        </h2>
                    </MaxWidthWrapper>
                </div>
            ) : (
                <div>
                    <div className="h-full w-full rounded-md mt-4 md:mt-20 lg:mt-20">
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
                                    const isCompleted =
                                        question.status === 'Completed'
                                    const isPending =
                                        question.status === 'Pending'
                                    const quizTrack =
                                        question.quizTrackingData?.[0]
                                    const isAttempted = !!quizTrack

                                    return (
                                        <div key={question.id}>
                                            <div className="flex text-left space-x-2">
                                                <h1 className="font-semibold">
                                                    {'Q'}
                                                    {index + 1}.
                                                </h1>
                                                <RemirrorForm
                                                    description={
                                                        question.question
                                                    }
                                                    preview={true}
                                                    bigScreen={true}
                                                />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                {Object.entries(
                                                    question.options
                                                ).map(
                                                    ([
                                                        optionId,
                                                        optionText,
                                                    ]) => {
                                                        const isCorrect =
                                                            question.correctOption ===
                                                            Number(optionId)
                                                        const isChosen =
                                                            isAttempted &&
                                                            quizTrack.chosenOption ===
                                                                Number(optionId)
                                                        const isWrongChoice =
                                                            isChosen &&
                                                            !isCorrect

                                                        const labelClass = [
                                                            'm-2.5 flex items-center font-semibold',
                                                            isCorrect &&
                                                            isCompleted
                                                                ? 'text-green-600'
                                                                : '',
                                                            isWrongChoice &&
                                                            isCompleted
                                                                ? 'text-red-600'
                                                                : '',
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ')

                                                        return (
                                                            <div
                                                                key={optionId}
                                                                className="flex items-center"
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`question_${question.id}`}
                                                                    value={
                                                                        optionId
                                                                    }
                                                                    className="ml-8 w-3 h-3 text-secondary focus:ring-secondary-500"
                                                                    checked={
                                                                        isCompleted
                                                                            ? isCorrect
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
                                                                        isCompleted
                                                                    }
                                                                />
                                                                <label
                                                                    className={
                                                                        labelClass
                                                                    }
                                                                >
                                                                    {String(
                                                                        optionText
                                                                    )}
                                                                </label>
                                                            </div>
                                                        )
                                                    }
                                                )}

                                                {isCompleted && (
                                                    <p
                                                        className={`mt-2 font-semibold ${
                                                            isAttempted
                                                                ? quizTrack.status ===
                                                                  'fail'
                                                                    ? 'text-red-600'
                                                                    : 'text-green-600'
                                                                : 'text-yellow-600'
                                                        }`}
                                                    >
                                                        Status:{' '}
                                                        {isAttempted
                                                            ? quizTrack.status
                                                            : 'Not attempted'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end pb-24 md:pb-0 lg:pb-0 mr-3 md:mr-0 lg:mr-0">
                        <Button
                            disabled={status}
                            onClick={handleSubmit}
                            className="flex w-1/5 lg:w-1/6 flex-col"
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
