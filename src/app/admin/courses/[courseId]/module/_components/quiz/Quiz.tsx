import React, { useEffect, useState, useCallback, useRef } from 'react'
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
import {PageTag} from '@/app/admin/resource/mcq/adminResourceMcqType'
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
    const [tags, setTags] = useState<PageTag[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [addQuestion, setAddQuestion] = useState<quizData[]>([])
    const [questionId, setQuestionId] = useState()
    const { quizData, setStoreQuizData } = getAllQuizData()
    const [quizTitle, setQuizTitle] = useState('')
    const [inputValue, setInputValue] = useState(props.activeChapterTitle)
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const { setQuizPreviewContent } = getQuizPreviewStore()
    const [isDataLoading, setIsDataLoading] = useState(true)
    const hasLoaded = useRef(false)

    const [isSaved, setIsSaved] = useState<boolean>(true)
    const [savedQuestions, setSavedQuestions] = useState<quizData[]>([])

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
    const checkIfSaved = () => {

        if (!addQuestion || !savedQuestions) {
            return true
        }

        if (addQuestion.length !== savedQuestions.length) {
            return false
        }

        // Check if all selected questions are in saved questions
        return addQuestion.every(selectedQ =>
            savedQuestions.some(savedQ => savedQ.id === selectedQ.id)
        )
    }

    // Update isSaved state when addQuestion changes
    useEffect(() => {
        setIsSaved(checkIfSaved())
    }, [addQuestion, savedQuestions])

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
            toast.success({
                title: 'Success',
                description: response?.data?.message || 'Saved successfully!',
            })
        } catch (error: any) {
            toast.error({
                title: 'Error',
                description: 'An error occurred while saving the chapter.',
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

        setIsSaved(true)
        setSavedQuestions([...addQuestion])
    }

    const getAllSavedQuizQuestion = useCallback(async () => {
        if (!props.chapterId || props.chapterId === 0) return

        try {
            const res = await api.get(
                `/Content/chapterDetailsById/${props.chapterId}?bootcampId=${props.courseId}&moduleId=${props.moduleId}&topicId=${props.content.topicId}`
            )
            setAddQuestion(res.data.quizQuestionDetails)
            setQuizTitle(res.data.title)
            setSavedQuestions(res.data.quizQuestionDetails)
            setIsSaved(true)
        } catch (error) {
            console.error('Failed to fetch chapter details', error)
        }
    }, [props.chapterId])

    useEffect(() => {
        if (hasLoaded.current) return
        hasLoaded.current = true
        const fetchData = async () => {
            setIsDataLoading(true)
            await getAllTags()
            if (props.chapterId && props.chapterId !== 0) {
                await getAllSavedQuizQuestion()
            }
            setIsDataLoading(false)
        }
        fetchData()
    }, [props.chapterId, getAllSavedQuizQuestion])

    function previewQuiz() {

        if (addQuestion.length === 0) {
            return toast.error({
                title: 'Cannot Preview',
                description: 'Please select at least one question to preview.',
            })
        }

        // Check if questions are selected but not saved
        if (!isSaved) {
            return toast.error({
                title: 'Cannot Preview',
                description: 'Please save the selected questions before previewing.',
            })
        }

        // If questions are selected and saved, proceed with preview
        setQuizPreviewContent({
            ...props.content,
            quizQuestionDetails: addQuestion,
        })
        router.push(
            `/admin/courses/${props.courseId}/module/${props.moduleId}/chapter/${props.chapterId}/quiz/${props.content.topicId}/preview`
        )
    }

    if (isDataLoading) {
        return (
            <div className="px-5">
                <div className="w-full flex justify-center items-center py-8">
                    <div className="animate-pulse">Loading Quiz details...</div>
                </div>
            </div>
        )
    }
    
    return (
        <div>
            <div className="px-5">
                <div className="flex flex-row items-center justify-start gap-x-6 mb-5">
                    <div className="w-full flex flex-col items-start gap-3">
                        {/* Input Field */}
                        <div className="flex justify-between items-center w-full">
                            <div className="w-2/6 flex justify-center align-middle items-center relative">
                                <Input
                                    required
                                    onChange={(e) => {
                                        setInputValue(e.target.value)
                                    }}
                                    value={inputValue}
                                    placeholder="Untitled Quiz"
                                    className="pl-1 pr-8 text-xl text-left text-gray-600 font-semibold capitalize placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 border-gray-400 border-dashed focus:outline-none"

                                    autoFocus
                                />
                                {!inputValue && (
                                    <Pencil
                                        fill="true"
                                        fillOpacity={0.4}
                                        size={20}
                                        className="absolute text-gray-100 pointer-events-none mt-1 right-5"
                                    />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <div
                                    id="previewQuiz"
                                    onClick={previewQuiz}
                                    className="flex w-[80px] text-gray-600 hover:bg-gray-300 rounded-md p-1 cursor-pointer mt-5 mr-2"
                                >
                                    <Eye size={18} />
                                    <h6 className="ml-1 text-sm">Preview</h6>
                                </div>
                                {addQuestion?.length > 0 && (
                                    <div className="mt-5">
                                        <Button
                                            onClick={handleSaveQuiz}
                                            className="bg-success-dark opacity-75"
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
                                    <h2 className="text-left text-gray-600 text-[15px] w-full font-semibold">
                                        Selected Question
                                    </h2>
                                </div>
                                <div className="text-left w-full">
                                    {addQuestion?.length === 0 && (
                                        <h1 className="text-left text-gray-600 text-[15px] italic">
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