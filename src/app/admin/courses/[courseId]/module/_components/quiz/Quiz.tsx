import React, { useEffect, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import QuizLibrary from '@/app/admin/courses/[courseId]/module/_components/quiz/QuizLibrary'
import {
    quizData,
    Options,
} from '@/app/admin/courses/[courseId]/module/_components/quiz/QuizLibrary'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import QuizModal from '@/app/admin/courses/[courseId]/module/_components/quiz/QuizModal'
import { api } from '@/utils/axios.config'
import { Tag } from '@/app/admin/resource/mcq/page'
import { toast } from '@/components/ui/use-toast'
import { getAllQuizQuestion } from '@/utils/admin'
import { getAllQuizData, getChapterUpdateStatus } from '@/store/store'
import { ArrowUpRightSquare, Pencil } from 'lucide-react'
import QuizPreview from '@/app/admin/courses/[courseId]/module/_components/quiz/QuizPreview'

function Quiz(props: any) {
    const [tags, setTags] = useState<Tag[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [addQuestion, setAddQuestion] = useState<quizData[]>([])
    const [questionId, setQuestionId] = useState()
    const { quizData, setStoreQuizData } = getAllQuizData()
    const [showPreview, setShowPreview] = useState(false)
    const [quizTitle, setQuizTitle] = useState('')
    const [inputValue, setInputValue] = useState(props.activeChapterTitle)
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()

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
    const handlePreviewClick = () => {
        if (addQuestion.length === 0) {
            // Show toast if no questions are added
            toast({
                title: 'No Questions',
                description:
                    'Please add at least one question to preview the quiz.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-warning max-w-sm px-6 py-5 box-border z-50',
            })
        } else {
            setShowPreview(true)
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

    return (
        <div>
            {showPreview ? (
                <QuizPreview setShowPreview={setShowPreview} />
            ) : (
                <div className="ml-12">
                    <div className="flex flex-row items-center justify-start gap-x-6 mb-10">
                        <div className="w-2/6 flex flex-col items-start gap-3 relative">
                            {/* Input Field */}
                            <div className="w-full relative">
                                <Input
                                    required
                                    onChange={(e) => {
                                        setInputValue(e.target.value)
                                    }}
                                    value={inputValue}
                                    placeholder="Untitled Quiz"
                                    className="pl-1 pr-8 text-xl text-left font-semibold capitalize placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 border-gray-400 border-dashed focus:outline-none"
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

                            {/* Preview Button */}
                            <Button
                                variant={'ghost'}
                                type="button"
                                className="text-secondary w-[100px] h-[30px] gap-x-1"
                                onClick={handlePreviewClick}
                            >
                                <ArrowUpRightSquare />
                                <h1>Preview</h1>
                            </Button>
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
                        <ScrollArea className="w-full rounded-md">
                            <div>
                                <div className="flex flex-col items-center justify-between">
                                    <div className="flex justify-between w-full mt-36">
                                        <h2 className="text-left text-gray-700 w-full font-semibold">
                                            Selected Question
                                        </h2>
                                        <div>
                                            {addQuestion?.length > 0 && (
                                                <div className="text-end mr-10">
                                                    <Button
                                                        onClick={handleSaveQuiz}
                                                        className="h-8"
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-left w-full">
                                        {addQuestion?.length === 0 && (
                                            <h1 className="text-left italic">
                                                No Selected Questions
                                            </h1>
                                        )}
                                    </div>
                                </div>
                                <div className="h-96 overflow-y-scroll">
                                    {addQuestion?.map(
                                        (
                                            questions: quizData,
                                            index: number
                                        ) => (
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
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Quiz
