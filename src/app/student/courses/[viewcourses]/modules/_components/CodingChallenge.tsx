// External imports
import React, { useState, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

// Internal imports
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { requestFullScreen } from '@/utils/students'
import CodingQuestionCard from './CodingQuestionCard'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Image from 'next/image'
import {Tag, CodingQuestion, CodingQuestionResult, ChapterContent, QuizAndAssignmentRes} from "@/app/student/courses/[viewcourses]/modules/_components/type";

// export type Tag = {
//     id: number
//     tagName: string
// }

function CodingChallenge({
    content,
    completeChapter,
    fetchChapters,
}: {
    content: ChapterContent 
    completeChapter: () => void
    fetchChapters: () => void
}) {
    const router = useRouter()
    const { viewcourses, moduleID } = useParams()
    const [codingQuestions, setCodingQuestions] = useState<CodingQuestion[]>([])
    const [codingQuestionId, setCodingQuestionId] = useState<number | undefined>()
    const [selectedQuesType, setSelectedQuesType] = useState<
        'quiz' | 'open-ended' | 'coding'
    >('coding')
    const [isSolving, setIsSolving] = useState(false)
    const [isSuccess, setIsScuccess] = useState<boolean>(false)
    // const [chapterStatus, setChapterStatus] = useState('Pending')
    const [codingQuestionResult, setCodingQuestionResult] = useState<CodingQuestionResult | null>(null)
    const [tagId, setTagId] = useState<number | undefined>()
    const [tag, setTag] = useState<Tag>()

    const getAllCodingQuestionHandler = useCallback(async () => {
        try {
            const res = await api.get<QuizAndAssignmentRes>(
                `/tracking/getQuizAndAssignmentWithStatus?chapterId=${content.id}`
            )
            setCodingQuestions(res.data.data.codingProblem)
            setCodingQuestionId(res.data.data.codingProblem[0].id)
            setTagId(res.data.data.codingProblem[0].tagId)
        } catch (error) {
            if (codingQuestions.length == 0) {
                console.error('No questions Added by the instructor yet')
            } else {
                toast.error({
                    title: 'Error',
                    description:
                        'An error occured while fetching the coding questions',
                })
            }
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
            const res = await api.get<{data:CodingQuestionResult}>(
                `/codingPlatform/submissions/questionId=${codingQuestionId}`
                // ?studentId=62586`
            )
            setCodingQuestionResult(res.data.data)
            setIsScuccess(res.data.data.action === 'submit')
            completeChapter()
        } catch (error: any) {
            setIsScuccess(error?.response?.data?.isSuccess)
        }
    }

    useEffect(() => {
        if (codingQuestionId) getResults()
    }, [codingQuestionId, content.id])

    async function getAllTags() {
        const response = await api.get('Content/allTags')
        if (response) {
            const tag = response?.data?.allTags?.find(
                (item: Tag) => item.id == tagId
            )
            setTag(tag)
        }
    }

    useEffect(() => {
        getAllTags()
    }, [tagId])

    function viewCodingSubmission(questionId: number) {
        router.push(
            `/student/courses/${viewcourses}/modules/${moduleID}/codingresult/question/${questionId}`
        )
    }

    return (
        <div className="mt-8 lg:mt-20 md:mt-20">
            {codingQuestions.length > 0 ? (
                <div className="flex justify-center">
                    <div className="flex flex-col gap-5 lg:w-1/2 w-full text-left mt-10 mr-4 md:mr-0 lg:mr-0">
                        <h2 className="text-2xl font-bold mb-3">
                            {content.title}
                        </h2>
                        <h2 className="font-bold">Coding Challenges</h2>
                        {isSuccess  && codingQuestionResult  ? (
                            <CodingQuestionCard
                                key={codingQuestionResult?.questionDetail.id}
                                id={codingQuestionResult?.questionDetail.id}
                                title={
                                    codingQuestionResult?.questionDetail.title
                                }
                                difficulty={
                                    codingQuestionResult?.questionDetail
                                        .difficulty
                                }
                                tagName={tag?.tagName}
                                description={
                                    codingQuestionResult?.questionDetail
                                        .description
                                }
                                status={codingQuestionResult?.status}
                                onSolveChallenge={viewCodingSubmission}
                                isSuccess={isSuccess}
                            />
                        ) : (
                            <>
                                {codingQuestions?.map((question:  CodingQuestion) => (
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
            ) : (
                <div>
                    <div>
                        {/* <h1 className="text-center font-semibold text-2xl">
                            There are no question added yet
                        </h1> */}
                        <MaxWidthWrapper className="flex flex-col justify-center items-center gap-5">
                            <div>
                                <Image
                                    src="/resource_library_empty_state.svg"
                                    alt="Empty State"
                                    width={500}
                                    height={500}
                                />
                            </div>
                            <h2>
                                No Coding questions have been added by the
                                Intructor
                            </h2>
                        </MaxWidthWrapper>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CodingChallenge
