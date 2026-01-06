'use client'

// DO NOT import Header here to disable it for this page
import { toast } from '@/components/ui/use-toast'
import { cn, difficultyColor } from '@/lib/utils'
import { useLazyLoadedStudentData, useThemeStore } from '@/store/store'
import { X, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import Image from 'next/image'
import { getAssesmentBackgroundColorClass } from '@/lib/utils'
import useAssessmentResult from '@/hooks/useAssessmentResult'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {AssessmentParams} from "@/app/student/course/[courseId]/modules/[moduleId]/assessmentResult/AssessmentSubmmisionPageType"
import { SubmissionIdPage } from "@/app/student/_components/Skeletons"

const ViewAssessmentResults = ({ params }: { params: AssessmentParams }) => {
    // State Variables
    const [assessmentOutsourseId, setAssessmentOutsourseId] = useState<number | null>(null)
    const { studentData } = useLazyLoadedStudentData()
    const { isDark, toggleTheme } = useThemeStore();

    const router = useRouter()

    // Use the custom hook
    const { data: viewResultsData, loading, error, refetch } = useAssessmentResult(params.submissionId)
   

    React.useEffect(() => {
        if (viewResultsData && viewResultsData.assessmentOutsourseId) {
            setAssessmentOutsourseId(viewResultsData.assessmentOutsourseId)
        }
    }, [viewResultsData])

    const isPassed = viewResultsData?.isPassed
    const percentage = viewResultsData?.percentage
    const passPercentage = viewResultsData?.submitedOutsourseAssessment?.passPercentage

    const formatTime = (milliseconds: number): string => {
        const seconds = Math.floor((milliseconds / 1000) % 60)
        const minutes = Math.floor((milliseconds / (1000 * 60)) % 60)
        const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24)

        return hours > 0
            ? `Time taken: ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`
            : `Time taken: ${minutes} minutes and ${seconds} seconds.`
    }

    // Navigation Handlers
    const navigateTo = (path: string) => router.push(path)

    const viewCodingSubmission = (
        codingOutsourseId: number,
        questionId: number
    ) => {
        if (codingOutsourseId) {
            navigateTo(
                `/student/course/${params.courseId}/modules/${params.moduleId}/assessmentResult/${params.submissionId}/codingResult/?codingOutsourseId=${codingOutsourseId}&questionId=${questionId}`
            )
        } else {
            toast.error({
                title: 'Error',
                description: 'No Coding Submission Found',
            })
        }
    }

    // Calculate Time Taken
    let timeTaken: string | null = null
    if (viewResultsData?.startedAt && viewResultsData?.submitedAt) {
        const startedAt = new Date(viewResultsData.startedAt)
        const submitedAt = new Date(viewResultsData.submitedAt)
        const timeTakenMs = submitedAt.getTime() - startedAt.getTime()
        timeTaken = formatTime(timeTakenMs)
    }

    if (loading) {
        return <SubmissionIdPage />
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background p-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 text-primary hover:text-primary-dark"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="bg-destructive-light border border-destructive rounded-lg p-6 max-w-md mx-auto">
                    <h2 className="text-destructive font-semibold mb-2">Error Loading Results</h2>
                    <p className="text-destructive-dark">{error}</p>
                </div>
            </div>
        )
    }

    if (!viewResultsData) {
        return (
            <div className="min-h-screen bg-background p-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 text-primary hover:text-primary-dark"
                >
                    {/* <ChevronLeft className="w-4 h-4 mr-2" />
                    Back */}
                     <X className="w-5 h-5" />
                </Button>
                <div className="bg-muted-light border border-border rounded-lg p-6 max-w-md mx-auto text-center">
                    <p className="text-muted-foreground">No assessment results found.</p>
                </div>
            </div>
        )
    }

    // Render Helpers
    const renderCodingChallenges = () => {
        const totalCodingQuestions = viewResultsData.submitedOutsourseAssessment.totalCodingQuestions;
        const attemptedCodingQuestions = viewResultsData.PracticeCode.length ;
        

        // Don't show section if no coding questions exist
        if (!totalCodingQuestions || totalCodingQuestions === 0) {
            return null;
        }

        const getCodingQuestionWeightage = (difficulty: string) => {
            let weightageCodingQuestions = ''

            switch (difficulty) {
                case 'Easy':
                    weightageCodingQuestions =
                        viewResultsData?.submitedOutsourseAssessment
                            ?.easyCodingMark
                    break
                case 'Medium':
                    weightageCodingQuestions =
                        viewResultsData?.submitedOutsourseAssessment
                            ?.mediumCodingMark
                    break
                case 'Hard':
                    weightageCodingQuestions =
                        viewResultsData?.submitedOutsourseAssessment
                            ?.hardCodingMark
                    break
                default:
                    weightageCodingQuestions = ''
            }
            return weightageCodingQuestions
        }

        return (
            <div className="mb-8">
                <SectionHeading title="Coding Challenges" />
                {attemptedCodingQuestions === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-8 shadow-4dp">
                        <div className="flex flex-col items-start text-left">
                            <Image
                                src="/no-data.svg"
                                alt="No Coding Attempts"
                                width={120}
                                height={120}
                                className="mb-4 opacity-60 mx-auto"
                            />
                            <div className="w-full text-left">
                                <h3 className="text-lg font-medium text-muted-foreground mb-2 text-left">
                                    No Coding Questions Attempted
                                </h3>
                                <p className="text-sm text-muted-foreground text-left">
                                    You did not attempt any of the {totalCodingQuestions} coding challenge{totalCodingQuestions > 1 ? 's' : ''} in this assessment.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {viewResultsData.PracticeCode.map((codingQuestion: any) => {
                            const weightageCodingQuestions = getCodingQuestionWeightage(
                                codingQuestion.questionDetail.difficulty
                            )
                            const isAccepted = codingQuestion.status === 'Accepted'

                            return (
                                <div
                                    key={codingQuestion.id}
                                    className="bg-card border border-border rounded-lg p-6 shadow-4dp hover:shadow-8dp transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-semibold text-lg text-foreground text-left">
                                            {codingQuestion.questionDetail.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    'px-2 py-1 rounded-full text-xs font-medium',
                                                    difficultyColor(codingQuestion.questionDetail.difficulty)
                                                )}
                                            >
                                                {codingQuestion.questionDetail.difficulty}
                                            </span>
                                            <span className="bg-muted px-2 py-1 text-xs rounded-full font-medium">
                                                {Math.trunc(Number(weightageCodingQuestions))} Marks
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                            <span
                                                className={cn(
                                                    'font-medium',
                                                    isAccepted ? 'text-success' : 'text-destructive'
                                                )}
                                            >
                                                {codingQuestion.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">Score:</span>
                                            <span className="font-medium">
                                                {isAccepted
                                                    ? `${Number(weightageCodingQuestions).toFixed(2)} / ${Number(weightageCodingQuestions).toFixed(2)}`
                                                    : `0 / ${Number(weightageCodingQuestions).toFixed(2)}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() =>
                                                viewCodingSubmission(
                                                    codingQuestion.codingOutsourseId,
                                                    codingQuestion.questionId
                                                )
                                            }
                                            className="bg-primary hover:bg-primary-dark text-primary-foreground"
                                        >
                                            View Submission
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }

    const renderQuizQuestions = () => {
        const {
            easyMcqQuestions,
            mediumMcqQuestions,
            hardMcqQuestions,
            weightageMcqQuestions,
            totalMcqQuestions,
        } = viewResultsData.submitedOutsourseAssessment

        const attemptedMCQQuestions = viewResultsData.attemptedMCQQuestions;

        // Don't show section if no MCQ questions exist
        if (!totalMcqQuestions || totalMcqQuestions === 0) {
            return null;
        }

        return (
            <div className="mb-8">
                <SectionHeading title="Multiple Choice Questions" />
                {attemptedMCQQuestions === 0 || attemptedMCQQuestions === null ? (
                    <div className="bg-card border border-border rounded-lg p-8 shadow-4dp">
                        <div className="flex flex-col items-start text-left">
                            <Image
                                src="/no-data.svg"
                                alt="No MCQ Attempts"
                                width={120}
                                height={120}
                                className="mb-4 opacity-60 mx-auto"
                            />
                            <div className="w-full text-left">
                                <h3 className="text-lg font-medium text-muted-foreground mb-2 text-left">
                                    No MCQ Questions Attempted
                                </h3>
                                <p className="text-sm text-muted-foreground text-left">
                                    You did not attempt any of the {totalMcqQuestions} multiple choice question{totalMcqQuestions > 1 ? 's' : ''} in this assessment.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-lg p-6 shadow-4dp hover:shadow-8dp transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold text-lg text-foreground text-left">
                                Quiz Questions
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-warning-light text-warning-dark px-2 py-1 text-xs rounded-full font-medium dark:text-white">
                                    {totalMcqQuestions} questions
                                </span>
                                <span className="bg-muted px-2 py-1 text-xs rounded-full font-medium">
                                    {weightageMcqQuestions} Marks
                                </span>
                            </div>
                        </div>

                        <div className="mb-4 text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Score:</span>
                                <span className="font-medium text-lg">
                                    {Number(viewResultsData.mcqScore) % 1 === 0
                                        ? Number(viewResultsData.mcqScore)
                                        : Number(viewResultsData.mcqScore).toFixed(2)
                                    } / {weightageMcqQuestions}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={() =>
                                    navigateTo(
                                        `/student/course/${params.courseId}/modules/${params.moduleId}/assessmentResult/${assessmentOutsourseId}/quizResult`
                                    )
                                }
                                className="bg-primary hover:bg-primary-dark text-primary-foreground"
                            >
                                View Submission
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderOpenEndedQuestions = () => {
        const openEndedCount = viewResultsData.openEndedQuestionCount
        const attemptedOpenEndedQuestions = viewResultsData.attemptedOpenEndedQuestions

        // Don't show section if no open-ended questions exist
        if (!openEndedCount || openEndedCount === 0) {
            return null;
        }

        return (
            <div className="mb-8">
                <SectionHeading title="Open-Ended Questions" />
                {attemptedOpenEndedQuestions === 0 || attemptedOpenEndedQuestions === null ? (
                    <div className="bg-card border border-border rounded-lg p-8 shadow-4dp">
                        <div className="flex flex-col items-start text-left">
                            <Image
                                src="/no-data.svg"
                                alt="No Open-Ended Attempts"
                                width={120}
                                height={120}
                                className="mb-4 opacity-60 mx-auto"
                            />
                            <div className="w-full text-left">
                                <h3 className="text-lg font-medium text-muted-foreground mb-2 text-left">
                                    No Open-Ended Questions Attempted
                                </h3>
                                <p className="text-sm text-muted-foreground text-left">
                                    You did not attempt any of the {openEndedCount} open-ended question{openEndedCount > 1 ? 's' : ''} in this assessment.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-lg p-6 shadow-4dp hover:shadow-8dp transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold text-lg text-foreground text-left">
                                Open-Ended Questions
                            </h3>
                            <span className="bg-warning-light text-warning-dark px-2 py-1 text-xs rounded-full font-medium">
                                {openEndedCount} questions
                            </span>
                        </div>

                        <div className="mb-4 text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Attempted:</span>
                                <span className="font-medium">
                                    {attemptedOpenEndedQuestions} / {openEndedCount}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={() =>
                                    navigateTo(
                                        `/student/course/${params.courseId}/modules/${params.moduleId}/assessment/${assessmentOutsourseId}/openendedresults`
                                    )
                                }
                                className="bg-primary hover:bg-primary-dark text-primary-foreground"
                            >
                                View Submission
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="text-left flex justify-between mr-4">

                <div
                    onClick={() => router.back()}
                    className="inline-flex text-left w-full m-3 items-center space-x-2 text-primary hover:text-primary-dark transition-colors duration-200 cursor-pointer group"
                >
                        <X className="w-5 h-5 mt-5 ml-4" />
                </div>
                <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-9 sm:h-9 p-0 mt-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

            </div>
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6 text-left">

                    <h1 className="text-3xl font-bold text-left text-foreground mb-2">Assessment Results</h1>
                    {timeTaken && (
                        <p className=" text-left text-muted-foreground">{timeTaken}</p>
                    )}
                </div>

                {/* Score Card */}
                <div className="mb-8">
                    <div
                        className={cn(
                            'p-6 rounded-lg border shadow-8dp',
                            isPassed
                                ? 'bg-success-light border-success'
                                : 'bg-destructive-light border-destructive'
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl text-left font-bold mb-2">
                                    Your Score: {percentage
                                        ? percentage % 1 === 0
                                            ? percentage
                                            : percentage.toFixed(2)
                                        : 0}/100
                                </h2>
                                <p className={  cn(
                                    'text-lg dark:text-gray-300',
                                    isPassed ? 'text-success-dark' : 'text-destructive-dark'
                                )}>
                                    {isPassed
                                        ? '🎉 Congratulations, you passed!'
                                        : `You needed at least ${passPercentage}% to pass`}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className={cn(
                                    'w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold',
                                    isPassed ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
                                )}>
                                    {isPassed ? '✓' : '✗'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assessment Sections */}
                {renderCodingChallenges()}
                {renderQuizQuestions()}
                {renderOpenEndedQuestions()}
            </div>
        </div>
    )
}

// Section Heading Component
const SectionHeading = ({ title }: { title: string }) => (
    <div className="mb-6">
        <h2 className="text-2xl font-semibold text-left text-foreground border-b border-border pb-2">
            {title}
        </h2>
    </div>
)

export default ViewAssessmentResults
