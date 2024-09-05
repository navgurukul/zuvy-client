import React, { useState, useCallback, useEffect } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import QuestionCard from '../[moduleID]/assessment/[assessmentOutSourceId]/QuestionCard'
import {
    handleFullScreenChange,
    handleVisibilityChange,
    requestFullScreen,
} from '@/utils/students'
import IDE from '@/app/student/playground/[editor]/editor'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getAssessmentStore } from '@/store/store'
import { cn, difficultyColor } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CodingQuestionCard from './CodingQuestionCard'

// import { UseFullScreenTab } from './useFullScreenTab'

export type Tag = {
    id: number
    tagName: string
}

function CodingChallenge({
    content,
    completeChapter,
}: {
    content: any
    completeChapter: () => void
}) {
    // const { openNewTab } = UseFullScreenTab();
    const router = useRouter()
    const { viewcourses, moduleID } = useParams()
    const [codingQuestions, setCodingQuestions] = useState<any[]>([])
    const [codingQuestionId, setCodingQuestionId] = useState()
    const [selectedQuesType, setSelectedQuesType] = useState<
        'quiz' | 'open-ended' | 'coding'
    >('coding')
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
        null
    )
    const [selectedCodingOutsourseId, setSelectedCodingOutsourseId] =
        useState<any>()
    const [seperateOpenEndedQuestions, setSeperateOpenEndedQuestions] =
        useState<any>()
    const [seperateQuizQuestions, setSeperateQuizQuestions] = useState<any>()
    const [isSolving, setIsSolving] = useState(false)
    const [isCodingQuesSubmitted, setIsCodingQuesSubmitted] = useState(false)
    const [assessmentSubmitId, setAssessmentSubmitId] = useState<any>()
    const [disableSubmit, setDisableSubmit] = useState(false)
    const [isSuccess, setIsScuccess] = useState(false)
    const [chapterStatus, setChapterStatus] = useState('Pending')
    const [codingQuestionResult, setCodingQuestionResult] = useState<any>()
    const [tagId, setTagId] = useState()
    const [tag, setTag] = useState<Tag>()

    const {
        tabChangeInstance,
        setTabChangeInstance,
        setFullScreenExitInstance,
        fullScreenExitInstance,
        setCopyPasteAttempt,
        copyPasteAttempt,
    } = getAssessmentStore()

    async function getCodingSubmissionsData(
        codingOutsourseId: any,
        // assessmentSubmissionId: any,
        questionId: any
    ) {
        console.log('Lets see')
        return null
        // try {
        //     const res = await api.get(
        //         `codingPlatform/submissions/questionId=${questionId}?assessmentSubmissionId=${assessmentSubmissionId}&codingOutsourseId=${codingOutsourseId}`
        //     )
        //     const action = res.data.data.action
        //     setIsCodingQuesSubmitted(action == 'submit')
        //     return action
        // } catch (error) {
        //     console.error('Error fetching coding submissions data:', error)
        //     return null
        // }
    }

    const getAllCodingQuestionHandler = useCallback(async () => {
        try {
            const res = await api.get(
                `/tracking/getQuizAndAssignmentWithStatus?chapterId=${content.id}`
                // `/tracking/getAllFormsWithStatus/${props.moduleId}?chapterId=${props.chapterId}`
            )
            console.log('res', res.data.data.status)
            // setChapterStatus(res.data.data.status)
            setCodingQuestions(res.data.data.codingProblem)
            setCodingQuestionId(res.data.data.codingProblem[0].id)
            // if (res.data && res.data.questions) {
            //     // setQuestions(res.data.questions)
            //     // setStatus('Not completed')
            // } else {
            //     // setQuestions(res.data.trackedData)
            //     // setStatus('Completed')
            // }
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    'An error occured while fetching the coding questions',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
            console.error('Error fetching quiz questions:', error)
        }
    }, [content.id])

    useEffect(() => {
        getAllCodingQuestionHandler()
    }, [getAllCodingQuestionHandler])

    const handleSolveChallenge = async (
        type: 'quiz' | 'open-ended' | 'coding',
        id?: number,
        codingOutsourseId?: number
    ) => {
        // let newWindow: any
        // const assessmentUrl = '/student/courses/122/modules/405/assessment/1'
        // if (typeof window !== 'undefined') {
        //     newWindow = window?.open(assessmentUrl, '_blank')
        // }

        // if (newWindow) {
        //     newWindow.focus()
        // } else {
        //     alert(
        //         'Failed to open the new window. Please allow pop-ups for this site.'
        //     )
        // }
        // setCodingQuestionId(id)
        console.log('Okay..!!', typeof id)
        setSelectedQuesType(type)
        setIsSolving(true)

        if (type === 'coding' && id) {
            const action = await getCodingSubmissionsData(
                codingOutsourseId,
                // assessmentSubmitId,
                id
            )

            if (action === 'submit') {
                toast({
                    title: 'Coding Question Already Submitted',
                    description:
                        'You have already submitted this coding question',
                    className: 'text-left capitalize',
                })
            } else {
                let newWindow: any
                const codePanelUrl = `/student/courses/${viewcourses}/modules/${moduleID}/codepanel/${id}`
                router.push(codePanelUrl)
                // if (typeof window !== 'undefined') {
                //     newWindow = window?.open(codePanelUrl, '_blank')
                // }
                // // openNewTab(assessmentUrl);
                setSelectedQuestionId(id)
                setSelectedCodingOutsourseId(codingOutsourseId)
                requestFullScreen(document.documentElement)
                // return (
                //     <IDE
                //         params={{ editor: String(2) }}
                //         onBack={() => console.log('Here..!')}
                //         remainingTime={remainingTime}
                //         assessmentSubmitId={assessmentSubmitId}
                //         selectedCodingOutsourseId={selectedCodingOutsourseId}
                //     />
                // )
            }
        } else if (
            type === 'quiz' &&
            seperateQuizQuestions[0]?.submissionsData.length > 0
        ) {
            toast({
                title: 'Quiz Already Submitted',
                description: 'You have already submitted the quiz',
                className: 'text-left capitalize',
            })
        } else if (
            type === 'open-ended' &&
            seperateOpenEndedQuestions[0]?.submissionsData.length > 0
        ) {
            toast({
                title: 'Open Ended Questions Already Submitted',
                description:
                    'You have already submitted the open ended questions',
                className: 'text-left capitalize',
            })
        } else {
            requestFullScreen(document.documentElement)
        }
    }

    const handleBack = () => {
        setIsSolving(false)
        setSelectedQuestionId(null)
    }

    // if (isSolving) {
    //     // if (selectedQuesType === 'quiz' && seperateQuizQuestions[0]?.submissionsData.length == 0) {
    //     //     return (
    //     //         <QuizQuestions
    //     //             onBack={handleBack}
    //     //             remainingTime={remainingTime}
    //     //             questions={seperateQuizQuestions}
    //     //             assessmentSubmitId={assessmentSubmitId}
    //     //             getSeperateQuizQuestions={getSeperateQuizQuestions}
    //     //         />
    //     //     )
    //     // } else if (selectedQuesType === 'open-ended' && seperateOpenEndedQuestions[0]?.submissionsData.length == 0) {
    //     //     return (
    //     //         <OpenEndedQuestions
    //     //             onBack={handleBack}
    //     //             remainingTime={remainingTime}
    //     //             questions={seperateOpenEndedQuestions}
    //     //             assessmentSubmitId={assessmentSubmitId}
    //     //             getSeperateOpenEndedQuestions={getSeperateOpenEndedQuestions}
    //     //         />
    //     //     )
    //     // }else
    //     if (selectedQuesType === 'coding' && selectedQuestionId !== null) {
    //         const remainingTime = null
    //         console.log('selectedQuestionId', selectedQuestionId)
    //         console.log('assessmentSubmitId', assessmentSubmitId)
    //         console.log('selectedCodingOutsourseId', selectedCodingOutsourseId)

    //         return (
    //             <IDE
    //                 params={{ editor: String(selectedQuestionId) }}
    //                 onBack={handleBack}
    //                 remainingTime={remainingTime}
    //                 assessmentSubmitId={assessmentSubmitId}
    //                 selectedCodingOutsourseId={selectedCodingOutsourseId}
    //             />
    //         )
    //     }
    // }

    async function submitAssessment() {
        // setDisableSubmit(true)
        // try {
        //     await api.patch(
        //         `/submission/assessment/submit?assessmentSubmissionId=${assessmentSubmitId}`,
        //         {
        //             tabChange: tabChangeInstance,
        //             copyPaste: copyPasteAttempt,
        //             embeddedGoogleSearch: 0,
        //             typeOfsubmission: 'studentSubmit',
        //         }
        //     )
        //     toast({
        //         title: 'Assessment Submitted',
        //         description: 'Your assessment has been submitted successfully',
        //         className: 'text-left capitalize',
        //     })

        completeChapter()

        //     const newTabChangeInstance = 0

        //     setTabChangeInstance(newTabChangeInstance)
        //     localStorage.setItem(
        //         'tabChangeInstance',
        //         JSON.stringify(newTabChangeInstance)
        //     )

        //     const newFullScreenExitInstance = 0
        //     localStorage.setItem(
        //         'fullScreenExitInstance',
        //         newFullScreenExitInstance.toString()
        //     )
        //     setFullScreenExitInstance(newFullScreenExitInstance)

        //     setTimeout(() => {
        //         window.close()
        //     }, 4000)
        // } catch (e) {
        //     console.error(e)
        // }
    }

    async function getResults() {
        try {
            const res = await api.get(
                `/codingPlatform/submissions/questionId=${codingQuestionId}`
                // ?studentId=62586`
            )

            console.log('ressss', res)
            setCodingQuestionResult(res.data.data)
            setIsScuccess(res.data.isSuccess)
            setTagId(res.data.data.questionDetail.tagId)

            // const response = await api.get('Content/allTags')
            // if (response) {
            //     const tag = response?.data?.allTags?.find(
            //         (item: any) => item.id == tagId
            //     )
            //     setTag(tag)
            // }
            // completeChapter()
            // Parse the timestamps into Date objects
            // const startedAt = new Date(res?.data?.startedAt)
            // const submitedAt = new Date(res?.data?.submitedAt)

            // // Calculate the time difference in milliseconds
            // const timeTakenMs = submitedAt.getTime() - startedAt.getTime()

            // // Convert the time difference to seconds
            // const timeTakenSeconds = timeTakenMs / 1000

            // // Convert the time difference to a more readable format
            // const timeTaken = {
            //     seconds: Math.floor(timeTakenSeconds % 60),
            //     minutes: Math.floor((timeTakenSeconds / 60) % 60),
            //     hours: Math.floor((timeTakenSeconds / 3600) % 24),
            // }

            // // Create the output string based on the hours
            // let output
            // if (timeTaken.hours > 0) {
            //     output = `Time taken: ${timeTaken.hours} hours, ${timeTaken.minutes} minutes, and ${timeTaken.seconds} seconds.`
            // } else {
            //     output = `Time taken: ${timeTaken.minutes} minutes and ${timeTaken.seconds} seconds.`
            // }

            // Set the time taken and other state
            // setTimeTaken(output)
            // setViewResultsData(res.data)
            // setAssessmentOutsourseId(res.data.assessmentOutsourseId)
        } catch (error: any) {
            console.log('e', error.response.data.isSuccess)
            setIsScuccess(error.response.data.isSuccess)
            // setShowErrorMessage(e?.response?.data?.message)
        }
    }

    useEffect(() => {
        // Call this when chapter gets change
        getResults()
    }, [codingQuestionId, content.id])

    async function getAllTags() {
        const response = await api.get('Content/allTags')
        if (response) {
            const tag = response?.data?.allTags?.find(
                (item: any) => item.id == tagId
            )
            setTag(tag)
        }
    }

    useEffect(() => {
        getAllTags()
    }, [tagId])

    console.log(
        'codingQuestionResult',
        codingQuestionResult?.questionDetail.tagId
    )

    function viewCodingSubmission(questionId: any) {
        router.push(
            `/student/courses/${viewcourses}/modules/${moduleID}/codingresult/question/${questionId}`
        )
        // } else {
        //     toast({
        //         title: 'Error',
        //         description: 'No Coding Submission Found',
        //         className: 'text-start capitalize border border-destructive',
        //     })
        // }
    }

    return (
        <div className="flex justify-center">
            <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                <h2 className="text-2xl font-bold mb-3">{content.title}</h2>
                <h2 className="font-bold">Coding Challenges</h2>
                {isSuccess ? (
                    <CodingQuestionCard
                        key={codingQuestionResult?.questionDetail.id}
                        id={codingQuestionResult?.questionDetail.id}
                        title={codingQuestionResult?.questionDetail.title}
                        difficulty={
                            codingQuestionResult?.questionDetail.difficulty
                        }
                        tagName={tag?.tagName}
                        description={
                            codingQuestionResult?.questionDetail.description
                        }
                        status={codingQuestionResult?.status}
                        onSolveChallenge={viewCodingSubmission}
                        isSuccess={isSuccess}
                    />
                ) : (
                    <>
                        {codingQuestions?.map((question: any) => (
                            <CodingQuestionCard
                                key={question.id}
                                id={question.id}
                                title={question.title}
                                difficulty={question.difficulty}
                                tagName={tag?.tagName}
                                description={question.description}
                                status={'Pending'}
                                isSuccess={isSuccess}
                                onSolveChallenge={() =>
                                    handleSolveChallenge(
                                        'coding',
                                        question.id,
                                        question.codingOutsourseId
                                    )
                                }
                            />
                        ))}
                    </>
                )}
            </div>
            {/* {!isSuccess && chapterStatus !== 'Completed' && (
                <Button onClick={submitAssessment} disabled={disableSubmit}>
                    Submit Coding Problem
                </Button>
            )} */}
        </div>
    )
}

export default CodingChallenge
