import React, { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn, difficultyColor } from '@/lib/utils'
import { ChevronRight, CheckCircle, Play, Award } from 'lucide-react'
import { api } from '@/utils/axios.config'
import { ellipsis } from '@/lib/utils'
import { useCodingSubmissionStore } from '@/store/store'
import { QuestionCardProps, Tag } from '@/app/student/course/[courseId]/studentAssessment/_studentAssessmentComponents/projectStudentAssessmentUtilsType'

const QuestionCard = ({
    id,
    title,
    weightage,
    easyCodingMark,
    mediumCodingMark,
    hardCodingMark,
    description,
    tagId,
    assessmentSubmitId,
    codingOutsourseId,
    codingQuestions,
    onSolveChallenge,
    isQuizSubmitted,
    isMobile,
    setIsCodingSubmitted,
}: QuestionCardProps) => {
    // const [tag, setTag] = useState<Tag>()
    const [action, setAction] = useState<string | null>(null)
    const { setCodingSubmissionAction } = useCodingSubmissionStore()
    // async function getAllTags() {
    //     const response = await api.get('/content/allTags')
    //     if (response) {
    //         const tag = response?.data?.allTags?.find(
    //             (item: any) => item.id == tagId
    //         )
    //         setTag(tag)
    //     }
    // }

    // useEffect(() => {
    //     getAllTags()
    // }, [])

    function codingQuestionMarks(difficulty: string) {
        if (difficulty === 'Easy') {
            return easyCodingMark
        } else if (difficulty === 'Medium') {
            return mediumCodingMark
        } else if (difficulty === 'Hard') {
            return hardCodingMark
        }
    }

    const getCodingSubmissionsData = useCallback(async (
        codingOutsourseId: any,
        assessmentSubmissionId: any,
        questionId: any
    ) => {
        try {
            const res = await api.get(
                `codingPlatform/submissions/questionId=${questionId}?assessmentSubmissionId=${assessmentSubmissionId}&codingOutsourseId=${codingOutsourseId}`
            )
            const action = res.data.data.action
            setAction(action)
            setCodingSubmissionAction(action)
            setIsCodingSubmitted(true)
        } catch (error) {
            console.error('Error fetching coding submissions data:', error)
            return null
        }
    }, [setCodingSubmissionAction, setIsCodingSubmitted]);

    useEffect(() => {
        if (codingOutsourseId && assessmentSubmitId && id) {
            getCodingSubmissionsData(codingOutsourseId, assessmentSubmitId, id)
        }
    }, [codingOutsourseId, assessmentSubmitId, id, getCodingSubmissionsData])

    return (
        <div className="bg-card  rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 text-left capitalize pr-4 flex-1 dark:text-white">
                        {isMobile ? ellipsis(title, 30) : title}
                    </h3>
                    <div className="flex items-center gap-3 ml-4">
                        <span
                            className={cn(
                                'px-3 py-1 rounded-full text-sm font-medium font-semibold border',
                                description === 'Easy' && 'bg-green-50 text-green-700 border-green-200',
                                description === 'Medium' && 'bg-orange-50 text-orange-700 border-orange-200',
                                description === 'Hard' && 'bg-red-50 text-red-700 border-red-200',
                                !['Easy', 'Medium', 'Hard'].includes(description) && 'bg-gray-50 text-gray-700 border-gray-200'
                            )}
                        >
                            {description}
                        </span>
                        {title !== 'Open-Ended Questions' && (
                            <span className="text-sm font-semibold dark:bg-gray-600  px-1 rounded-lg text-gray-900 dark:text-white">
                                {`${codingQuestions
                                        ? Math.trunc(
                                            Number(
                                                codingQuestionMarks(description)
                                            )
                                        )
                                        : weightage
                                    } marks`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Button Section */}
                <div className="flex justify-end items-center mt-6">
                    {action === 'submit' ? (
                        <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium text-sm">Already Submitted</span>
                        </div>
                    ) : (
                        <>
                            {isQuizSubmitted ? (
                                <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="font-medium text-sm">Already Submitted</span>
                                </div>
                            ) : (
                                // <Button
                                //     onClick={() => onSolveChallenge(id)}
                                //     className="flex items-center  space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
                                // >
                                // </Button>
                                <span onClick={() => onSolveChallenge(id)} className="text-primary font-semibold cursor-pointer text-sm font-medium ">Solve Challenge</span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default QuestionCard