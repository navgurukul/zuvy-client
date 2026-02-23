'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import IndividualStudentAssesment from '../../../../_components/individualStudentAssesment'
import { api } from '@/utils/axios.config'
import { Spinner } from '@/components/ui/spinner'
import { formatDate } from '@/lib/utils'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { object } from 'zod'
import OverviewComponent from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/OverviewComponent'
import IndividualStudentAssesment from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/individualStudentAssesment'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { getProctoringDataStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
    Check,
    CheckCircle,
    User,
    X,
    XCircle,
    ClockIcon,
    Code,
    CheckSquare,
    FileText,
    ArrowLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { calculateTimeTaken } from '@/utils/admin'
import { paramsType } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/submissionAssesments/[assessment_Id]/IndividualReport/[IndividualReport]/Report/[report]/ViewSolutionOpenEnded/ViewSolutionPageType'
import {
    SubmissionData,
    BootcampData,
    AssessmentResponse,
    CodingQuestion,
    PageParams,
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/submissionAssesments/[assessment_Id]/IndividualReport/[IndividualReport]/Report/[report]/ViewSolutionQuizQuestion/viewQuizQuestionPageType'

const Page = ({ params }: { params: paramsType }) => {
    const router = useRouter()
    const [bootcampData, setBootcampData] = useState<BootcampData | null>(null)
    const [assesmentData, setAssesmentData] = useState<any>()
    const [codingdata, setCodingData] = useState<CodingQuestion[]>([])
    const [username, setUsername] = useState<string>('')
    const [moduleId, setmoduleId] = useState<number>(0)
    const [proctoringData, setProctoringData] = useState<any>()
    const [timeTaken, setTimeTaken] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [totalQuestions, setTotalQuestion] = useState({
        totalCodingQuestion: 0,
        totalMcqQuestion: 0,
        totalOpenEnded: 0,
    })

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get<{ bootcamp: BootcampData }>(
                `/bootcamp/${params.courseId}`
            )
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.courseId])

    const getIndividualCodingDataHandler = useCallback(async () => {
        try {
            await api
                .get<AssessmentResponse>(
                    `/tracking/assessment/submissionId=${params.report}?studentId=${params.IndividualReport}`
                )
                .then((res) => {
                    const timeTaken = calculateTimeTaken(
                        res?.data?.startedAt,
                        res?.data?.submitedAt
                    )
                    setTimeTaken(timeTaken)
                    setCodingData(res?.data?.PracticeCode)
                    setUsername(res?.data?.user?.name)
                    setmoduleId(
                        res?.data?.submitedOutsourseAssessment?.moduleId
                    )
                    setAssesmentData(res?.data)
                    setTotalQuestion({
                        totalCodingQuestion: res?.data?.codingQuestionCount,
                        totalMcqQuestion: res?.data?.mcqQuestionCount,
                        totalOpenEnded: res?.data?.openEndedQuestionCount,
                    })
                    setProctoringData({
                        canEyeTrack:
                            res?.data?.submitedOutsourseAssessment?.canEyeTrack,
                        canTabChange:
                            res?.data?.submitedOutsourseAssessment
                                ?.canTabChange,
                        canScreenExit:
                            res?.data?.submitedOutsourseAssessment
                                ?.canScreenExit,
                        canCopyPaste:
                            res?.data?.submitedOutsourseAssessment
                                ?.canCopyPaste,
                    })
                })
        } catch (error) {
            toast.error({
                title: 'Error',
                description: 'Error in fetching the data',
            })
        } finally {
            // setLoading(false)
        }
    }, [params])

    useEffect(() => {
        getBootcampHandler()
        getIndividualCodingDataHandler()
    }, [getBootcampHandler, getIndividualCodingDataHandler, params])

    const timestamp = assesmentData?.submitedAt
    const date = new Date(timestamp)
    const options2: any = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    const formattedDate = date.toLocaleDateString('en-US', options2)

    return (
        <div className="container mx-auto px-2 pt-2 pb-2 max-w-7xl">
            <div className="flex items-center gap-4 mb-8 mt-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="hover:bg-transparent hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course Submissions
                </Button>
            </div>
            <div className="flex flex-col gap-y-8">
                {codingdata && (
                    <div className="flex items-center justify-between w-full mb-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage
                                    src="https://github.com/shadcn.png"
                                    alt="@shadcn"
                                />
                                <AvatarFallback className="text-sm font-medium">
                                    CN
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-semibold text-left">
                                    {username}
                                </h2>
                                <p className="text-muted-foreground">
                                    Submitted on {formattedDate}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                                <ClockIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Time Taken
                                </span>
                            </div>
                            <p className="text-base font-bold">{timeTaken}</p>
                        </div>
                    </div>
                )}
            </div>
            {codingdata ? (
                <OverviewComponent
                    totalCodingChallenges={
                        assesmentData?.submitedOutsourseAssessment
                            ?.totalCodingQuestions
                    }
                    correctedCodingChallenges={9}
                    correctedMcqs={9}
                    totalCorrectedMcqs={
                        assesmentData?.submitedOutsourseAssessment
                            ?.totalMcqQuestions
                    }
                    openEndedCorrect={1}
                    totalOpenEnded={assesmentData?.attemptedOpenEndedQuestions}
                    score={assesmentData?.percentage}
                    totalScore={100}
                    copyPaste={assesmentData?.copyPaste}
                    tabchanges={assesmentData?.tabChange}
                    fullScreenExit={assesmentData?.fullScreenExit}
                    eyeMomentCount={assesmentData?.eyeMomentCount}
                    embeddedSearch={assesmentData?.embeddedGoogleSearch}
                    submissionType={assesmentData?.typeOfsubmission}
                    totalCodingScore={
                        assesmentData?.submitedOutsourseAssessment
                            ?.weightageCodingQuestions
                    }
                    codingScore={assesmentData?.codingScore}
                    mcqScore={assesmentData?.mcqScore}
                    totalMcqScore={
                        assesmentData?.submitedOutsourseAssessment
                            ?.weightageMcqQuestions
                    }
                    openEndedScore={assesmentData?.openEndedScore}
                    totalOpenEndedScore={assesmentData?.requiredOpenEndedScore}
                    proctoringData={proctoringData}
                />
            ) : (
                <div className="flex gap-x-20 ">
                    <div>
                        <Skeleton className="h-[175px] w-[700px] rounded-xl" />
                        <div className="space-y-2 "></div>
                    </div>
                    <div>
                        <Skeleton className="h-[175px] w-[700px] rounded-xl" />
                        <div className="space-y-2 "></div>
                    </div>
                </div>
            )}
            {codingdata ? (
                <div className="space-y-8">
                    <h3 className="text-left text-lg font-semibold mb-4 mt-8">
                        Question Breakdown
                    </h3>
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-4">
                            <Code className="h-5 w-5 text-primary" />
                            <h1 className="text-lg font-semibold">
                                Coding Questions
                            </h1>
                        </div>

                        {codingdata.length === 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="mb-4">
                                            <p className="text-base font-bold mb-1">
                                                This student has not submitted
                                                any coding question.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {codingdata.map((data) => (
                                    <IndividualStudentAssesment
                                        key={data.id}
                                        data={data}
                                        params={params}
                                        type="codingSubmission"
                                        codingOutsourseId={
                                            data.codingOutsourseId
                                        }
                                        copyPaste={assesmentData?.copyPaste}
                                        tabchanges={assesmentData?.tabChange}
                                        totalCodingScore={
                                            assesmentData
                                                ?.submitedOutsourseAssessment
                                                ?.weightageCodingQuestions
                                        }
                                        codingScore={assesmentData?.codingScore}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {(assesmentData?.submitedOutsourseAssessment
                        ?.easyMcqQuestions ||
                        assesmentData?.submitedOutsourseAssessment
                            ?.mediumMcqQuestions ||
                        assesmentData?.submitedOutsourseAssessment
                            ?.hardMcqQuestions > 0) && (
                        <div className="w-full">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckSquare className="h-5 w-5 text-primary" />
                                <h1 className="text-lg font-semibold">
                                    Multiple Choice Questions
                                </h1>
                            </div>

                            {assesmentData?.mcqQuestionCount === 0 &&
                            assesmentData?.attemptedMCQQuestions === 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="mb-4">
                                                <p className="text-base font-bold mb-1">
                                                    This student has not
                                                    submitted any quiz question.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : assesmentData?.attemptedMCQQuestions >= 1 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <IndividualStudentAssesment
                                        data={[]}
                                        params={params}
                                        type="quizSubmission"
                                        copyPaste={assesmentData?.copyPaste}
                                        tabchanges={assesmentData?.tabChange}
                                        mcqScore={assesmentData?.mcqScore}
                                        totalMcqScore={
                                            assesmentData
                                                ?.submitedOutsourseAssessment
                                                .weightageMcqQuestions
                                        }
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="mb-4">
                                                <p className="text-base font-bold mb-1">
                                                    This student has not
                                                    submitted any quiz question.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}

                    {assesmentData?.attemptedOpenEndedQuestions !== null && (
                        <div className="w-full">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="h-5 w-5 text-primary" />
                                <h1 className="text-lg font-semibold">
                                    Open Ended Questions
                                </h1>
                            </div>

                            {assesmentData?.openEndedQuestionCount === 0 &&
                            assesmentData?.attemptedOpenEndedQuestions === 0 ? (
                                <p className="text-center py-20 font-semibold h-[100px] w-4/5 shadow-lg transition-transform transform hover:shadow-xl">
                                    There are no open-ended questions in this
                                    assessment.
                                </p>
                            ) : assesmentData?.attemptedOpenEndedQuestions >=
                              1 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <IndividualStudentAssesment
                                        data={[]}
                                        params={params}
                                        type="openEndedSubmission"
                                        copyPaste={assesmentData?.copyPaste}
                                        tabchanges={assesmentData?.tabChange}
                                        openEndedScore={
                                            assesmentData?.openEndedScore
                                        }
                                        attemptedOpenEndedQuestions={
                                            assesmentData.attemptedOpenEndedQuestions
                                        }
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="mb-4">
                                                <p className="text-base font-bold mb-1">
                                                    This student has not
                                                    submitted any open-ended
                                                    questions.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center font-semibold">Loading data...</p>
            )}
        </div>
    )
}

export default Page
