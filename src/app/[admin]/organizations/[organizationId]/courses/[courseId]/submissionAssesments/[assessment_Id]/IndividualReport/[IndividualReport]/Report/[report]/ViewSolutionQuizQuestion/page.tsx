'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getProctoringDataStore } from '@/store/store'
import { paramsType } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/submissionAssesments/[assessment_Id]/IndividualReport/[IndividualReport]/Report/[report]/ViewSolutionOpenEnded/ViewSolutionPageType'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { RemirrorForm } from '@/components/remirror-editor/RemirrorForm'
import { useCourseExistenceCheck } from '@/app/[admin]/hooks/useCourseExistenceCheck'
import useAssessmentDetailsOfQuiz from '@/app/[admin]/hooks/useAssessmentDetailsOfQuiz'
import { QuizMcqDetail } from '@/app/[admin]/hooks/hookType'

const Page = ({ params }: { params: paramsType }) => {
    const router = useRouter()
    const { proctoringData, fetchProctoringData } = getProctoringDataStore()
    useCourseExistenceCheck(params.courseId)

    const {
        quizDetails: quizQuestionDetails,
    } = useAssessmentDetailsOfQuiz(params.assessment_Id, params.IndividualReport)

    useEffect(() => {
        fetchProctoringData(params.report, params.IndividualReport)
    }, [fetchProctoringData, params])
    const { tabChange, user } = proctoringData

    return (
        <>
            <MaxWidthWrapper className="container mx-auto px-2 pt-2 pb-2 max-w-7xl">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="hover:bg-transparent hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Course Submissions
                    </Button>
                </div>
                <Card className="bg-gradient-to-r from-card to-muted/30 border border-border rounded-2xl shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-x-4 p-6">
                        <Avatar className="h-14 w-14 shadow-md ring-2 ring-muted-foreground/20">
                            <AvatarImage
                                src="https://github.com/shadcn.png"
                                alt="@shadcn"
                            />
                            <AvatarFallback className="font-bold bg-muted">
                                CN
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl font-bold">
                                {user?.name} - Quiz Questions Report
                            </CardTitle>
                            <p className="text-left text-muted-foreground text-md">
                                Detailed breakdown of your quiz performance
                            </p>
                        </div>
                    </CardHeader>
                </Card>

                <h1 className="text-left font-semibold text-2xl mt-4">
                    Overview
                </h1>

                <div className="space-y-10">
                    {quizQuestionDetails?.mcqs?.map(
                        (quizDetail: QuizMcqDetail, index: number) => {
                            const { submissionsData } = quizDetail
                            const chosenOption = submissionsData?.chosenOption
                            const isAttempted =
                                chosenOption !== null &&
                                chosenOption !== undefined

                            return (
                                <Card
                                    key={quizDetail.variantId}
                                    className="bg-gradient-to-br from-background to-muted/20 border border-border/60 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
                                >
                                    <CardHeader className="p-6">
                                        <div className="text-left space-y-2">
                                            <span className="text-muted-foreground text-sm font-medium">
                                                Question {index + 1}
                                            </span>
                                            <RemirrorForm
                                                description={
                                                    quizDetail.question
                                                }
                                                preview={true}
                                                bigScreen={true}
                                            />
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-6 space-y-4">
                                        {Object.entries(quizDetail.options).map(
                                            ([key, option]) => {
                                                const optionKey = parseInt(key)
                                                const isCorrect =
                                                    optionKey ===
                                                    quizDetail.correctOption
                                                const isChosen =
                                                    optionKey === chosenOption

                                                const showChecked =
                                                    isCorrect || isChosen

                                                const baseClasses =
                                                    'flex items-start gap-3 p-4 rounded-lg border text-sm transition-all'

                                                const colorClasses = isCorrect
                                                    ? 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/20'
                                                    : isChosen && !isCorrect
                                                        ? 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/20'
                                                        : 'bg-white dark:bg-muted/20 border-gray-200 dark:border-muted text-gray-900 dark:text-gray-100'

                                                return (
                                                    <div
                                                        key={key}
                                                        className={`${baseClasses} ${colorClasses}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${quizDetail.variantId}-${index}`}
                                                            value={key}
                                                            checked={
                                                                showChecked
                                                            }
                                                            readOnly
                                                            disabled
                                                            className="mt-1 accent-green-500"
                                                        />
                                                        <span className="break-words">
                                                            {option as string}
                                                        </span>
                                                    </div>
                                                )
                                            }
                                        )}

                                        {!isAttempted && (
                                            <div className="mt-2">
                                                <span className="inline-block px-3 py-1 text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full font-medium italic">
                                                    Not Answered
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        }
                    )}
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
