import React, { useEffect, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import QuizLibrary from '@/app/admin/courses/[courseId]/module/_components/quiz/QuizLibrary'
import {
    quizData,
    Options,
} from '@/app/admin/courses/[courseId]/module/_components/quiz/QuizLibrary'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import QuizModal from '@/app/admin/courses/[courseId]/module/_components/quiz/QuizModal'
import { api } from '@/utils/axios.config'
import { Tag } from '@/app/admin/resource/mcq/page'
import { toast } from '@/components/ui/use-toast'
import { getAllQuizQuestion } from '@/utils/admin'
import {
    getAllQuizData,
    getChapterUpdateStatus,
    getQuizPreviewStore,
} from '@/store/store'
import { ArrowUpRightSquare, Pencil } from 'lucide-react'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

function Quiz(props: any) {
    const router = useRouter()
    const [tags, setTags] = useState<Tag[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [addQuestion, setAddQuestion] = useState<quizData[]>([])
    const [questionId, setQuestionId] = useState()
    const { quizData, setStoreQuizData } = getAllQuizData()
    const [quizTitle, setQuizTitle] = useState('')
    const [inputValue, setInputValue] = useState(props.activeChapterTitle)
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const { setQuizPreviewContent } = getQuizPreviewStore()

    const handleAddQuestion = (data: any) => {
        const uniqueData = data.filter((question: quizData) => {
            return !addQuestion.some(
                (existingQuestion: quizData) =>
                    existingQuestion.id === question.id
            )
        })
        setAddQuestion((prevQuestions: quizData[]) => [
            ...prevQuestions,
            ...uniqueData,
        ])
    }
    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)
    async function getAllTags() {
        const response = await api.get('Content/allTags')
        if (response) {
            const transformedData = response.data.allTags.map(
                (item: { id: any; tagName: any }) => ({
                    id: item.id.toString(),
                    tagName: item.tagName,
                })
            )
            const tagArr = [
                { id: -1, tagName: 'All Topics' },
                ...transformedData,
            ]
            setTags(tagArr)
        }
    }
    const removeQuestionById = (questionId: number) => {
        setAddQuestion((prevQuestions: any) =>
            prevQuestions.filter((question: any) => question?.id !== questionId)
        )
    }

    const saveQuizQuestionHandler = async (
        requestBody: Record<string, any>
    ) => {
        try {
            const response = await api.put(
                `/Content/editChapterOfModule/${props.moduleId}?chapterId=${props.chapterId}`,
                requestBody
            )
            toast({
                title: 'Success',
                description: response?.data?.message || 'Saved successfully!',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'An error occurred while saving the chapter.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    const handleSaveQuiz = () => {
        const selectedIds = addQuestion?.map((item) => item.id)
        const requestBody = {
            title: inputValue,
            quizQuestions: selectedIds,
        }
        saveQuizQuestionHandler(requestBody)
        setIsChapterUpdated(!isChapterUpdated)
    }

    const getAllSavedQuizQuestion = useCallback(async () => {
        await api
            .get(`/Content/chapterDetailsById/${props.chapterId}`)
            .then((res) => {
                setAddQuestion(res.data.quizQuestionDetails)
                setQuizTitle(res.data.title)
            })
    }, [props.chapterId])

    useEffect(() => {
        getAllTags()
        getAllSavedQuizQuestion()
    }, [getAllSavedQuizQuestion])

    function previewQuiz() {
        if (props.content) {
            setQuizPreviewContent(props.content)
            router.push(
                `/admin/courses/${props.courseId}/module/${props.moduleId}/chapter/${props.chapterId}/quiz/${props.content.topicId}/preview`
            )
        }
    }

    return (
        <div>
            <div className="px-5">
                <div className="flex flex-row items-center justify-start gap-x-6 mb-5">
                    <div className="w-full flex flex-col items-start gap-3">
                        {/* Input Field */}
                        <div className="flex justify-between items-center w-full">
                            <div className="w-full relative">
                                <Input
                                    required
                                    onChange={(e) => {
                                        setInputValue(e.target.value)
                                    }}
                                    value={inputValue}
                                    placeholder="Untitled Quiz"
                                    className="pl-1 pr-8 text-xl text-left font-semibold capitalize placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 w-1/3 border-gray-400 border-dashed focus:outline-none"
                                    autoFocus
                                />
                                {!inputValue && (
                                    <Pencil
                                        fill="true"
                                        fillOpacity={0.4}
                                        size={20}
                                        className="absolute text-gray-100 pointer-events-none top-1/2 right-5 transform -translate-y-1/2"
                                    />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <div
                                    id="previewQuiz"
                                    onClick={previewQuiz}
                                    className="flex w-[80px] hover:bg-gray-300 rounded-md p-1 cursor-pointer mt-5 mr-2"
                                >
                                    <Eye size={18} />
                                    <h6 className="ml-1 text-sm">Preview</h6>
                                </div>
                                {addQuestion?.length > 0 && (
                                    <div className="mt-5">
                                        <Button
                                            onClick={handleSaveQuiz}
                                            className=""
                                        >
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex">
                    <QuizLibrary
                        addQuestion={addQuestion}
                        handleAddQuestion={handleAddQuestion}
                        tags={tags}
                    />
                    <Separator
                        orientation="vertical"
                        className="mx-4 w-[2px] h-96 mt-36 rounded"
                    />
                    <div className="w-full">
                        <div>
                            <div className="flex flex-col items-center justify-between">
                                <div className="flex justify-between w-full mt-36">
                                    <h2 className="text-left text-gray-700 w-full font-semibold">
                                        Selected Question
                                    </h2>
                                </div>
                                <div className="text-left w-full">
                                    {addQuestion?.length === 0 && (
                                        <h1 className="text-left italic">
                                            No Selected Questions
                                        </h1>
                                    )}
                                </div>
                            </div>
                            <ScrollArea className="h-96 pr-3 pb-10">
                                {addQuestion?.map(
                                    (questions: quizData, index: number) => (
                                        <QuizModal
                                            key={index}
                                            tags={tags}
                                            data={questions}
                                            addQuestion={addQuestion}
                                            removeQuestionById={
                                                removeQuestionById
                                            }
                                            saveQuizQuestionHandler={
                                                saveQuizQuestionHandler
                                            }
                                        />
                                    )
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Quiz
