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
import { useParams } from 'next/navigation'

// import { UseFullScreenTab } from './useFullScreenTab'

function CodingChallenge({
    content,
    completeChapter,
}: {
    content: any
    completeChapter: () => void
}) {
    // const { openNewTab } = UseFullScreenTab();
    const { viewcourses, moduleID } = useParams()
    const [codingQuestions, setCodingQuestions] = useState<any[]>([])
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
            console.log('res', res.data.data.codingProblem)
            setCodingQuestions(res.data.data.codingProblem)
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

        console.log('Okay..!!')
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
                const assessmentUrl =
                    `/student/courses/${viewcourses}/modules/${moduleID}/chapter/${content.id}`
                if (typeof window !== 'undefined') {
                    newWindow = window?.open(assessmentUrl, '_blank')
                }
                // openNewTab(assessmentUrl);
                setSelectedQuestionId(id)
                setSelectedCodingOutsourseId(codingOutsourseId)
                requestFullScreen(document.documentElement)
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
    //     if (
    //         selectedQuesType === 'coding' &&
    //         selectedQuestionId !== null
    //     ) {
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

    return (
        <div className="flex justify-center">
            <div className="flex flex-col gap-5 w-1/2 text-left mt-10">
                <h2 className="font-bold">Coding Challenges</h2>
                {codingQuestions?.map((question: any) => (
                    <QuestionCard
                        key={question.id}
                        id={question.id}
                        title={question.title}
                        description={question.difficulty}
                        tagId={question.tagId}
                        onSolveChallenge={() =>
                            handleSolveChallenge(
                                'coding',
                                question.id,
                                question.codingOutsourseId
                            )
                        }
                    />
                ))}
            </div>
        </div>
    )
}

export default CodingChallenge
