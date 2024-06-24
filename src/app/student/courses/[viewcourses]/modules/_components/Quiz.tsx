'use client'
import React, { useState, useCallback, useEffect } from 'react'

import { api } from '@/utils/axios.config'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'

type Props = {
    moduleId: string
    chapterId: number
    content: any
    bootcampId: number
}

function Quiz(props: Props) {
    const [questions, setQuestions] = useState<any[]>([])
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
        console.log(transformedBody)
        await api
            .post(
                `/tracking/updateQuizAndAssignmentStatus/${props.bootcampId}/${props.moduleId}?chapterId=${props.chapterId}`,
                transformedBody
            )
            .then(() => {
                toast({
                    title: 'Success',
                    description: 'Submitted Quiz Successfully',
                })
            })
    }

    return (
        <div>
            <ScrollArea className="h-screen w-full   rounded-md">
                <div className="flex flex-col justify-center items-center">
                    <div className="p-4 flex gap-y-4 flex-col items-start">
                        <h1 className="text-xl font-semibold">
                            {props.content.title}
                        </h1>
                        {!status ? (
                            <h2 className="text-red-600">
                                Please complete all the questions and then
                                submit.
                            </h2>
                        ) : (
                            <h1 className=" text-lg text-secondary font-semibold">
                                You have already submitted this Quiz
                            </h1>
                        )}
                        {status
                            ? questions?.map((question, index) => (
                                  <div key={question.id}>
                                      <h1 className="font-semibold my-3">
                                          {'Q'}
                                          {index + 1} .{question.question}
                                      </h1>
                                      <div className="flex flex-col items-start">
                                          {Object.entries(question.options).map(
                                              ([optionId, optionText]) => (
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
                                                      <label
                                                          key={optionId}
                                                          className="m-4 flex items-center"
                                                      >
                                                          {String(optionText)}
                                                      </label>
                                                  </div>
                                              )
                                          )}
                                          {(question.status === 'pass' ||
                                              question.status === 'fail' ||
                                              question.status === 'done') && (
                                              <p
                                                  className={`mt-2 ${
                                                      question.status === 'fail'
                                                          ? 'text-red-600'
                                                          : 'text-secondary'
                                                  }`}
                                              >
                                                  Chosen Option:{' '}
                                                  {
                                                      question.options[
                                                          question.chosenOption
                                                      ]
                                                  }
                                              </p>
                                          )}
                                      </div>
                                  </div>
                              ))
                            : questions?.map((question, index) => (
                                  <div key={question.id}>
                                      <h1 className="font-semibold my-3">
                                          {'Q'}
                                          {index + 1} .{question.question}
                                      </h1>
                                      <div className="flex flex-col items-start">
                                          {Object.entries(question.options).map(
                                              ([optionId, optionText]) => (
                                                  <div
                                                      key={optionId}
                                                      className="flex items-center gap-5"
                                                  >
                                                      <input
                                                          type="radio"
                                                          name={`question_${question.id}`}
                                                          value={optionId}
                                                          className="m-4 w-4 h-4 text-secondary "
                                                          onChange={() =>
                                                              handleCorrectQuizQuestion(
                                                                  question.id,
                                                                  optionId
                                                              )
                                                          }
                                                      />
                                                      <label
                                                          key={optionId}
                                                          className="m-4 flex items-center  "
                                                      >
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
                <Button
                    disabled={!allQuestionsAnswered()}
                    onClick={handleSubmit}
                    className="flex w-1/6 flex-col"
                >
                    Submit
                </Button>
            </div>
        </div>
    )
}

export default Quiz
