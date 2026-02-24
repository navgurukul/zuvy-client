'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { Eye, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'; 
import {
    cn,
    difficultyColor,
    getAssesmentBackgroundColorClass,
} from '@/lib/utils'
import { useParams } from 'next/navigation';
import { getUser } from '@/store/store'

type Props = {}

const IndividualStudentAssesment = ({
    data,
    type,
    params,
    codingOutsourseId,
    copyPaste,
    tabchanges,
    codingScore,
    totalCodingScore,
    mcqScore,
    totalMcqScore,
    openEndedScore,
    attemptedOpenEndedQuestions,
}: any) => {
    const { courseId, assessment_Id, IndividualReport, report } = params
    const { organizationId } = useParams()
    const color = getAssesmentBackgroundColorClass(25, 5)
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin';
    const orgId = isSuperAdmin ? organizationId : user?.orgId 

    const renderQuestion = () => {
        switch (type) {
            case 'openEndedSubmission':
                return {
                    title: 'Open Ended Question',
                    link: `/${userRole}/organizations/${orgId}/courses/${courseId}/submissionAssesments/${assessment_Id}/IndividualReport/${IndividualReport}/Report/${report}/ViewSolutionOpenEnded`,
                }
            case 'quizSubmission':
                return {
                    title: 'Quiz assessment',
                    link: `/${userRole}/organizations/${orgId}/courses/${courseId}/submissionAssesments/${assessment_Id}/IndividualReport/${IndividualReport}/Report/${report}/ViewSolutionQuizQuestion`,
                }
            case 'codingSubmission':
                return {
                    title: 'Coding Questions',
                    link: `/${userRole}/organizations/${orgId}/courses/${courseId}/submissionAssesments/${assessment_Id}/IndividualReport/${IndividualReport}/Report/${report}/ViewSolutionCodingQuestion/${codingOutsourseId}?id=${data?.questionId}`,
                }
            default:
                return {
                    title: 'Question not available',
                    link: '/not-available',
                }
        }
    }
    const questionInfo = renderQuestion()
    const scoreHandler = () => {
        let score, totalScore

        if (type === 'codingSubmission') {
            score = +codingScore
            totalScore = +totalCodingScore
        } else if (type === 'quizSubmission') {
            score = +mcqScore
            totalScore = +totalMcqScore
        } else {
            score = +openEndedScore
            totalScore = 0
        }

        const percentage = (score / totalScore) * 100

        let bgColorClass
        if (percentage < 50) {
            bgColorClass = 'bg-red-500'
        } else if (percentage >= 50 && percentage < 70) {
            bgColorClass = 'bg-yellow-300'
        } else if (percentage >= 70 && percentage <= 80) {
            bgColorClass = 'bg-green-200'
        } else {
            bgColorClass = 'bg-green-300'
        }

        return {
            score: Math.trunc(+score) + '/' + Math.trunc(+totalScore),
            className: bgColorClass,
        }
    }

    return (
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className='mb-4'>
                    <h4 className="text-left text-base font-bold mb-1">
                        {type === "codingSubmission"
                            ? data.questionDetail.title
                            : questionInfo.title}
                    </h4>

                    <div className="flex items-center gap-x-2 my-1">
                        <span
                            className={`h-2 w-2 rounded-full ${
                                type === 'codingSubmission'
                                    ? data.status == 'Accepted'
                                        ? 'bg-green-300'
                                        : 'bg-red-500'
                                    : type === 'openEndedSubmission'
                                        ? 'bg-gray-300'
                                        : scoreHandler().className
                                }`}
                        />
                        <span className="text-sm text-gray-600">
                            {type === 'codingSubmission' ? (
                                <>Status: {data.status}</>
                            ) : type === 'openEndedSubmission' ? (
                                <>Attempted: {attemptedOpenEndedQuestions ?? 0}</>
                            ) : (
                                <>Score: {scoreHandler().score}</>
                            )}
                        </span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-1 text-black hover:text-white font-semibold text-sm"
                >
                    <Link
                        className=" flex items-center justify-center"
                        href={questionInfo.link}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        View Answer
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}

export default IndividualStudentAssesment
