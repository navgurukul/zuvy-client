'use client'

import React, { useEffect } from 'react'
import { getQuizPreviewStore } from '@/store/store'
import { fetchPreviewData } from '@/utils/admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { addClassToCodeTags } from '@/utils/admin'
import { Button } from '@/components/ui/button'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'

const PreviewQuiz = ({ params }: { params: any }) => {
    const { quizPreviewContent, setQuizPreviewContent } = getQuizPreviewStore()

    useEffect(() => {
        fetchPreviewData(params, setQuizPreviewContent)
    }, [params.chapterId, fetchPreviewData])

    return (
        <>
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center z-50">
                <h1 className="text-center text-[16px] text-[#FFFFFF]">
                    You are in the Admin Preview Mode. The questions cannot be
                    interacted with.
                </h1>
            </div>

            <div className="relative flex mt-20 px-8 gap-8">
                {/* Left Section: Go Back Button */}
                <div className="w-1/4 flex flex-col mt-20">
                    <Link
                        href={`/admin/courses/${params.courseId}/module/${params.moduleId}/chapters/${params.chapterId}`}
                        className="absolute left-0 top-0 flex items-center space-x-2 p-4"
                    >
                        {' '}
                        {/* Absolute positioning */}
                        <ArrowLeft size={20} />
                        <p className="ml-1 text-sm font-medium text-gray-800">
                            Go back
                        </p>
                    </Link>
                </div>

                <div className="pt-5">
                    <h1 className="text-start text-lg text-gray-600 font-semibold">
                        {quizPreviewContent?.title}
                    </h1>
                    {quizPreviewContent?.quizQuestionDetails.map(
                        (question: any, index: number) => {
                            return (
                                <div key={question.id} className="mb-4 p-4 ">
                                    {/* <div className="flex items-center space-x-2">
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
                                    </div> */}
                                    <h3 className="font-semibold text-gray-600 text-[15px] text-left">
                                        Q{index + 1}.
                                    </h3>
                                    {/* Render question using RemirrorForm */}
                                    <div className="text-left text-gray-600 mb-2">
                                        <RemirrorForm
                                            description={question.quizVariants[0].question}
                                            preview={true} // Enable preview mode
                                        />
                                    </div>

                                    {/* Render options */}
                                    <div className="mt-2">
                                        {Object.entries(
                                            question.quizVariants[0].options ||
                                                {}
                                        ).map(([optionId, optionText]) => (
                                            <div
                                                key={optionId}
                                                className="flex items-center p-3 text-gray-600"
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
                                                    className="mr-5"
                                                />
                                                <label>
                                                    {optionText as String}
                                                </label>
                                                {Number(optionId) ===
                                                    question.correctOption && (
                                                    <span className="ml-5 text-green-600 font-bold">
                                                        (Correct)
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }
                    )}
                </div>
            </div>
            <div className="mt-2 text-end">
                <Button className='bg-success-dark opacity-75' disabled>Submit</Button>
            </div>
        </>
    )
}

export default PreviewQuiz
