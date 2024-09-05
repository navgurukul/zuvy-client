import React, { useState, useCallback, useEffect } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import {
    requestFullScreen,
} from '@/utils/students'
import { useParams, useRouter } from 'next/navigation'
import CodingQuestionCard from './CodingQuestionCard'

export type Tag = {
    id: number
    tagName: string
}

function CodingChallenge({
    content,
    completeChapter,
    fetchChapters,
}: {
    content: any
    completeChapter: () => void
    fetchChapters: () => void
}) {
    const router = useRouter()
    const { viewcourses, moduleID } = useParams()
    const [codingQuestions, setCodingQuestions] = useState<any[]>([])
    const [codingQuestionId, setCodingQuestionId] = useState()
    const [selectedQuesType, setSelectedQuesType] = useState<
        'quiz' | 'open-ended' | 'coding'
    >('coding')
    const [isSolving, setIsSolving] = useState(false)
    const [isSuccess, setIsScuccess] = useState(false)
    // const [chapterStatus, setChapterStatus] = useState('Pending')
    const [codingQuestionResult, setCodingQuestionResult] = useState<any>()
    const [tagId, setTagId] = useState()
    const [tag, setTag] = useState<Tag>()

    const getAllCodingQuestionHandler = useCallback(async () => {
        try {
            const res = await api.get(
                `/tracking/getQuizAndAssignmentWithStatus?chapterId=${content.id}`
            )
            console.log('res', res.data.data.status)
            setCodingQuestions(res.data.data.codingProblem)
            setCodingQuestionId(res.data.data.codingProblem[0].id)
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
        setSelectedQuesType(type)
        setIsSolving(true)

        if (type === 'coding' && id) {
            const codePanelUrl = `/student/courses/${viewcourses}/modules/${moduleID}/codepanel/${id}`
            router.push(codePanelUrl)
            requestFullScreen(document.documentElement)
        }
    }

    async function submitAssessment() {
        completeChapter()
    }

    async function getResults() {
        try {
            const res = await api.get(
                `/codingPlatform/submissions/questionId=${codingQuestionId}`
                // ?studentId=62586`
            )
            setCodingQuestionResult(res.data.data)
            setIsScuccess(res.data.isSuccess)
            setTagId(res.data.data.questionDetail.tagId)
        } catch (error: any) {
            setIsScuccess(error.response.data.isSuccess)
        }
    }

    useEffect(() => {
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

    function viewCodingSubmission(questionId: any) {
        router.push(
            `/student/courses/${viewcourses}/modules/${moduleID}/codingresult/question/${questionId}`
        )
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
