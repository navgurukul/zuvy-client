import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import { X } from 'lucide-react'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

const QuizPreview = ({
    setShowPreview,
}: {
    setShowPreview: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const params = useParams<any>()
    const [quizData, setQuizData] = useState<any>()

    const fetchAllQuizQuestions = useCallback(async () => {
        await api
            .get(
                `/Content/chapterDetailsById/${params.chapterID}?bootcampId=${params.courseId}&moduleId=${params.moduleId}&topicId=0`
            )
            .then((res) => {
                setQuizData(res.data)
            })
    }, [params])

    useEffect(() => {
        fetchAllQuizQuestions()
    }, [fetchAllQuizQuestions])

    console.log(quizData)
    if (quizData?.quizQuestionDetails.length > 0)
        return (
            <div>
                <div>
                    <h1 className="text-start text-lg font-semibold">
                        {quizData?.title}
                    </h1>

                    <Button
                        onClick={() => setShowPreview(false)}
                        className="gap-x-1 flex items-center"
                        variant={'ghost'}
                    >
                        <X className="text-red-400" size={15} />
                        <h1 className="text-red-400">Close Preview</h1>
                    </Button>
                    {quizData?.quizQuestionDetails.map(
                        (question: any, index: number) => (
                            <div key={question.id} className="mb-4 p-4 ">
                                <h3 className="font-semibold text-left">
                                    Q{index + 1}.{question.question}
                                </h3>

                                {/* Render options */}
                                <div className="mt-2">
                                    {Object.entries(question.options).map(
                                        ([optionId, optionText]) => (
                                            <div
                                                key={optionId}
                                                className="flex p-4 items-center"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={optionId}
                                                    checked={
                                                        Number(optionId) ===
                                                        question.correctOption
                                                    }
                                                    readOnly
                                                    className="mr-2"
                                                />
                                                <label>
                                                    {optionText as String}
                                                </label>
                                                {/* {Number(optionId) ===
                                                    question.correctOption && (
                                                    // <span className="ml-2 text-green-600 font-bold">
                                                    //     (Correct)
                                                    // </span>
                                                )} */}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        )
    else
        return (
            <div>
                There is nothing to preview oyu havenot Selected any Quiz
                Questions
            </div>
        )
}

export default QuizPreview
