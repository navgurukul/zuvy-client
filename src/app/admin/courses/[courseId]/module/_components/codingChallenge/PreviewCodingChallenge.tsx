import CodingQuestionCard from '@/app/student/courses/[viewcourses]/modules/_components/CodingQuestionCard'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import React, { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import IDE from '@/app/student/playground/[editor]/editor'
import { requestFullScreen } from '@/utils/students'

type Props = {
    content: any
    tags: any
    setShowPreview: React.Dispatch<React.SetStateAction<boolean>>
}

const PreviewCodingChallenge = ({ content, tags, setShowPreview }: Props) => {
    const { courseId, moduleId } = useParams()
    const router = useRouter()
    const [showCodePanel, setShowCodePanel] = useState(false)

    // Add a check to prevent accessing properties of undefined
    const tag =
        content.codingQuestionDetails &&
        content.codingQuestionDetails.length > 0
            ? tags.find(
                  (item: any) =>
                      item.id === content.codingQuestionDetails[0].tagId
              )
            : null

    useEffect(() => {
        if (showCodePanel) requestFullScreen(document.documentElement)
    }, [showCodePanel])

    const remainingTime = null
    const assessmentSubmitId = 1
    const selectedCodingOutsourseId = ''

    return (
        <div className="flex justify-center">
            <div className="flex flex-col gap-5 text-left mt-10">
                {/* <div className="flex  flex-col items-start w-1/2"> */}
                <div className="flex  flex-col items-start w-full">
                    <h2 className="text-2xl font-bold mb-3">{content.title}</h2>
                    <Button
                        onClick={() => setShowPreview(false)}
                        className="gap-x-1 flex items-center"
                        variant={'ghost'}
                    >
                        <X className="text-red-400" size={15} />
                        <h1 className="text-red-400">Close Preview</h1>
                    </Button>
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
                        selectedCodingOutsourseId={selectedCodingOutsourseId}
                    />
                ) : (
                    <>
                        <h2 className="font-bold">Coding Challenges</h2>
                        {content.codingQuestionDetails?.map((question: any) => (
                            <CodingQuestionCard
                                key={question.id}
                                id={question.id}
                                title={question.title}
                                difficulty={question.difficulty}
                                tagName={tag?.tagName} // Optional chaining for safety
                                description={question.description}
                                status={'Pending'}
                                onSolveChallenge={() => setShowCodePanel(true)}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

export default PreviewCodingChallenge
