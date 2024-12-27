'use client'
import CodingQuestionCard from '@/app/student/courses/[viewcourses]/modules/_components/CodingQuestionCard'
import { Button } from '@/components/ui/button'
import { ArrowLeft, X } from 'lucide-react'
import React, { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import IDE from '@/app/student/playground/[editor]/editor'
import { requestFullScreen } from '@/utils/students'
import Link from 'next/link'

type Props = {
    content: any
    tags: any
    chapterId: any
}

const PreviewCodingChallenge = ({ content, tags, chapterId }: Props) => {
    const { courseId, moduleId } = useParams()
    const router = useRouter()
    const [showCodePanel, setShowCodePanel] = useState(false)

    // Add a check to prevent accessing properties of undefined
    const tag =
        content?.codingQuestionDetails &&
        content.codingQuestionDetails.length > 0
            ? tags.find(
                  (item: any) =>
                      item.id === content?.codingQuestionDetails[0].tagId
              )
            : null

    useEffect(() => {
        if (showCodePanel) requestFullScreen(document.documentElement)
    }, [showCodePanel])

    const remainingTime = null
    const assessmentSubmitId = 1
    const selectedCodingOutsourseId = ''

    return (
        <div>
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#518672] flex items-center justify-center">
                <h1 className="text-center text-[#FFFFFF]">
                    You are in the Admin Preview Mode. The questions cannot be
                    interacted with.
                </h1>
            </div>
            {/* Main Content */}
            <div className="relative flex flex-col items-center justify-center px-4 py-8 mt-20">
                {/* "Go Back" button */}
                <Link
                    href={`/admin/courses/${courseId}/module/${moduleId}/chapter/${chapterId}`}
                    className="absolute left-4 top-4 flex items-center space-x-2 p-2 text-gray-800 hover:text-gray-600"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-medium">Go back</span>
                </Link>
            </div>
            <div className="flex justify-center">
                <div className="flex flex-col gap-5 text-left mt-10">
                    <div className="flex  flex-col items-start w-1/2">
                        <h2 className="text-2xl font-bold mb-3">
                            {content?.title}
                        </h2>
                        <Button
                            className="gap-x-1 flex items-center"
                            variant={'ghost'}
                        ></Button>
                    </div>
                    {showCodePanel ? (
                        <IDE
                            params={{
                                editor: String(
                                    content.codingQuestionDetails[0]?.id
                                ), // Use optional chaining here
                            }}
                            onBack={() => console.log('Here..!')}
                            remainingTime={remainingTime}
                            assessmentSubmitId={assessmentSubmitId}
                            selectedCodingOutsourseId={
                                selectedCodingOutsourseId
                            }
                        />
                    ) : (
                        <>
                            <h2 className="font-bold">Coding Challenges</h2>
                            {content?.codingQuestionDetails?.map(
                                (question: any) => (
                                    <CodingQuestionCard
                                        key={question.id}
                                        id={question.id}
                                        title={question.title}
                                        difficulty={question.difficulty}
                                        tagName={tag?.tagName} // Optional chaining for safety
                                        description={question.description}
                                        status={'Pending'}
                                        onSolveChallenge={() =>
                                            setShowCodePanel(true)
                                        }
                                    />
                                )
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PreviewCodingChallenge
