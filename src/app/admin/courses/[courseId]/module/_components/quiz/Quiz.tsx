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
import { getAllQuizData } from '@/store/store'
import { ArrowUpRightSquare, Eye, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'

function Quiz(props: any) {
    const [tags, setTags] = useState<Tag[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [addQuestion, setAddQuestion] = useState<quizData[]>([])
    const [questionId, setQuestionId] = useState()
    const { quizData, setStoreQuizData } = getAllQuizData()
    const [showPreview, setShowPreview] = useState(false)
    const [quizTitle, setQuizTitle] = useState('')
    const router = useRouter()

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
            router.push(
                `/admin/courses/${props.courseId}/module/${props.moduleId}/chapter/${props.chapterId}/quiz/preview`
            )
        }
    }

    const handleSaveQuiz = () => {
        const selectedIds = addQuestion?.map((item) => item.id)
        const requestBody = {
            quizQuestions: selectedIds,
        }

        saveQuizQuestionHandler(requestBody)
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
            <div className="ml-12">
                <div className="flex flex-row items-center justify-between gap-x-4 mb-10">
                    {/* Left Section: Input */}
                    <div className="w-2/6 flex flex-col items-start gap-3 relative">
                        <div className="w-full relative">
                            <Input
                                required
                                onChange={(e) => {
                                    setInputValue(e.target.value)
                                }}
                                placeholder={quizTitle}
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
                    </div>

                    {/* Right Section: Preview Button */}
                    <div className=" items-center cursor-pointer justify-end mr-14 pr-60 text-[#4A4A4A] flex font-semibold">
                        {' '}
                        {/* Adjusted padding */}
                        <div
                            id="previewAssessment"
                            onClick={handlePreviewClick}
                            className="flex items-center cursor-pointer"
                        >
                            <Eye size={18} className="mr-2" />{' '}
                            {/* Adjusted margin */}
                            <h6 className="text-sm">Preview</h6>
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
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}

export default Quiz
