import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import QuizLibrary from '@/app/[admin]/courses/[courseId]/module/_components/quiz/QuizLibrary'
import { getUser } from '@/store/store'
import {
    QuizDataLibrary,
    LibraryOption,
} from '@/app/[admin]/courses/[courseId]/module/_components/quiz/ModuleQuizType'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import QuizModal from '@/app/[admin]/courses/[courseId]/module/_components/quiz/QuizModal'
import { api } from '@/utils/axios.config'
import { PageTag } from '@/app/[admin]/resource/mcq/adminResourceMcqType'
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
import {
    QuizProps,
    ChapterDetailsResponse,
} from '@/app/[admin]/courses/[courseId]/module/_components/quiz/ModuleQuizType'
import useDebounce from '@/hooks/useDebounce'
import CodingTopics from '../codingChallenge/CodingTopics'
import { FileQuestion } from 'lucide-react'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {SkeletonQuiz}  from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'

const quizSchema = z.object({
    title: z
        .string()
        .min(1, 'Quiz title is required')
        .max(50, 'You can enter up to 50 characters only.'),
})

function Quiz(props: QuizProps) {
    const router = useRouter()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const [tags, setTags] = useState<PageTag[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [addQuestion, setAddQuestion] = useState<QuizDataLibrary[]>([])
    const [questionId, setQuestionId] = useState()
    // const { quizData, setStoreQuizData } = getAllQuizData()
    const [quizTitle, setQuizTitle] = useState('')
    const [inputValue, setInputValue] = useState(props.activeChapterTitle)
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const { setQuizPreviewContent } = getQuizPreviewStore()
    const [isDataLoading, setIsDataLoading] = useState(true)
    const hasLoaded = useRef(false)

    const [isSaved, setIsSaved] = useState<boolean>(true)
    const [savedQuestions, setSavedQuestions] = useState<QuizDataLibrary[]>([])
    const [search, setSearch] = useState<string>('')
    const debouncedSeatch = useDebounce(search, 1000)
    const [selectedOptions, setSelectedOptions] = useState<LibraryOption[]>([
        { id: -1, tagName: 'All Topics' },
    ])
    const [selectedDifficulty, setSelectedDifficulty] = useState([
        'Any Difficulty',
    ])
    const [quizData, setQuizData] = useState<{
        allQuestions: QuizDataLibrary[]
        easyQuestions: QuizDataLibrary[]
        mediumQuestions: QuizDataLibrary[]
        hardQuestions: QuizDataLibrary[]
    }>({
        allQuestions: [],
        easyQuestions: [],
        mediumQuestions: [],
        hardQuestions: [],
    })

    const form = useForm<z.infer<typeof quizSchema>>({
        resolver: zodResolver(quizSchema),
        defaultValues: {
            title: inputValue || '',
        },
        mode: 'onChange',
    })

    const fetchQuizQuestions = useCallback(
        async (
            searchTerm: string = '',
            selectedOptions: any[],
            selectedDifficulty: any[]
        ) => {
            try {
                let url = '/Content/allQuizQuestions'

                const queryParams = []

                let selectedTagIds = ''
                selectedOptions.forEach((topic: any) => {
                    if (topic.id !== -1 && topic.id !== 0) {
                        // Skip 'All Topics'
                        selectedTagIds += `&tagId=${topic.id}`
                    }
                })

                // Handle multiple selected difficulties, but ignore 'Any Difficulty'
                let selectedDiff = ''
                selectedDifficulty.forEach((difficulty: string) => {
                    if (difficulty !== 'Any Difficulty') {
                        selectedDiff += `&difficulty=${difficulty}`
                    }
                })

                if (selectedTagIds.length > 0) {
                    queryParams.push(selectedTagIds.substring(1)) // Remove the first '&'
                }
                if (selectedDiff.length > 0) {
                    queryParams.push(selectedDiff.substring(1)) // Remove the first '&'
                }
                if (searchTerm) {
                    queryParams.push(`searchTerm=${searchTerm}`)
                }

                // Combine query parameters into the URL
                if (queryParams.length > 0) {
                    url += '?' + queryParams.join('&')
                }

                const response = await api.get(url)

                const allQuestions: QuizDataLibrary[] = response?.data?.data

                const easyQuestions = allQuestions.filter(
                    (question) => question.difficulty === 'Easy'
                )
                const mediumQuestions = allQuestions.filter(
                    (question) => question.difficulty === 'Medium'
                )
                const hardQuestions = allQuestions.filter(
                    (question) => question.difficulty === 'Hard'
                )

                setQuizData({
                    allQuestions,
                    easyQuestions,
                    mediumQuestions,
                    hardQuestions,
                })
            } catch (error) {
                console.error('Error fetching quiz questions:', error)
            }
        },
        [debouncedSeatch, selectedOptions, selectedDifficulty]
    )

    useEffect(() => {
        fetchQuizQuestions(debouncedSeatch, selectedOptions, selectedDifficulty)
    }, [
        debouncedSeatch,
        fetchQuizQuestions,
        selectedOptions,
        selectedDifficulty,
    ])

    const handleAddQuestion = (data: QuizDataLibrary[]) => {
        const uniqueData = data.filter((question: QuizDataLibrary) => {
            return !addQuestion.some(
                (existingQuestion: QuizDataLibrary) =>
                    existingQuestion.id === question.id
            )
        })
        setAddQuestion((prevQuestions: QuizDataLibrary[]) => [
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
        return addQuestion.every((selectedQ) =>
            savedQuestions.some((savedQ) => savedQ.id === selectedQ.id)
        )
    }

    // Update isSaved state when addQuestion changes
    useEffect(() => {
        setIsSaved(checkIfSaved())
        form.trigger("title") 
    }, [addQuestion, savedQuestions])

    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)
    async function getAllTags() {
        const response = await api.get('Content/allTags')
        if (response) {
            const transformedData = response.data.allTags.map(
                (item: { id: number; tagName: string }) => ({
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
        setAddQuestion((prevQuestions: QuizDataLibrary[]) =>
            prevQuestions.filter(
                (question: QuizDataLibrary) => question?.id !== questionId
            )
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
            const res = await api.get<ChapterDetailsResponse>(
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
                description:
                    'Please save the selected questions before previewing.',
            })
        }

        // If questions are selected and saved
        setQuizPreviewContent({
            ...props.content,
            quizQuestionDetails: addQuestion,
        })
        router.push(
            `/${userRole}/courses/${props.courseId}/module/${props.moduleId}/chapter/${props.chapterId}/quiz/${props.content.topicId}/preview`
        )
    }

    if (isDataLoading) {
        // return (
        //     <div className="px-5">
        //         <div className="w-full flex justify-center items-center py-8">
        //             <div className="animate-pulse">Loading Quiz details...</div>
        //         </div>
        //     </div>
        // )
        return <SkeletonQuiz/>
    }

    return (
        <div>
            <div className="">
                <div className="flex flex-row items-center justify-start gap-x-6 mb-5 mx-5">
                    <div className="w-full flex flex-col items-start">
                        {/* Input Field */}
                        <div className="flex justify-between items-center w-full">
                            {/* <div className="w-2/4 flex justify-center align-middle items-center relative">
                                <Input
                                    required
                                    onChange={(e) => {

                                         const newValue = e.target.value
                                        if (newValue.length>50) {
                                            toast.error({
                                               title: "Character Limit Reached",
                                               description: "You can enter up to 50 characters only.",
                                            })
                                        }else {
                                            setInputValue(newValue)
                                    }
                                    }}
                                    value={inputValue}
                                    placeholder="Untitled Quiz"
                                    className="text-2xl font-bold border px-2 focus-visible:ring-0 placeholder:text-foreground"
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
                                {/* <div
                                    id="previewQuiz"
                                    onClick={previewQuiz}
                                    className="flex w-[80px] text-gray-600 hover:bg-gray-300 rounded-md p-1 cursor-pointer mt-5 mr-2"
                                >
                                    <Eye size={18} />
                                    <h6 className="ml-1 text-sm">Preview</h6>
                                </div> */}
                            {/* {addQuestion?.length > 0 && (
                                    <div className="mt-5">
                                        <Button
                                            onClick={handleSaveQuiz}
                                            className="bg-primary opacity-75"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </div>  */}

                            <form
                                onSubmit={form.handleSubmit((data) => {
                                    setInputValue(data.title)
                                    handleSaveQuiz()
                                })}
                                className="flex justify-between items-center w-full"
                            >
                                <div className="w-2/4 flex flex-col justify-center relative">
                                    <Input
                                        {...form.register('title')}
                                        placeholder="Untitled Quiz"
                                        className="text-2xl font-bold border px-2 focus-visible:ring-0 placeholder:text-foreground"
                                    />
                                    {!form.watch('title') && (
                                        <Pencil
                                            fill="true"
                                            fillOpacity={0.4}
                                            size={20}
                                            className="absolute text-gray-100 pointer-events-none mt-1 right-5"
                                        />
                                    )}
                                    {form.formState.errors.title && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {
                                                form.formState.errors.title
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    {addQuestion?.length > 0 && (
                                        <div className="mt-5">
                                            {/* <Button
                                                type="submit"
                                                disabled={
                                                    !form.formState.isValid ||
                                                    form.formState.isSubmitting
                                                }
                                                className={`bg-primary opacity-75 ${
                                                    !form.formState.isValid
                                                        ? 'cursor-not-allowed opacity-50'
                                                        : ''
                                                }`}
                                            >
                                                Save
                                            </Button> */}


                                            <Button
  type="submit"
  disabled={
    form.formState.isSubmitting ||
    !form.formState.isValid ||
    isSaved
  }
  className={`bg-primary ${
    form.formState.isSubmitting || !form.formState.isValid || isSaved
      ? 'opacity-50 cursor-not-allowed'
      : 'opacity-75'
  }`}
>
  {form.formState.isSubmitting
    ? 'Saving...'
    : isSaved
    ? 'Saved'
    : 'Save'}
</Button>


                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileQuestion
                                size={20}
                                className="transition-colors"
                            />
                            <p className="text-muted-foreground">Quiz</p>
                        </div>
                    </div>
                </div>
                <div className="px-5 pt-4 bg-card">
                    <CodingTopics
                        setSearchTerm={setSearch}
                        searchTerm={search}
                        tags={tags}
                        selectedTopics={selectedOptions}
                        setSelectedTopics={setSelectedOptions}
                        selectedDifficulties={selectedDifficulty}
                        setSelectedDifficulties={setSelectedDifficulty}
                        selectedQuestions={undefined}
                        setSelectedQuestions={undefined}
                        content={undefined}
                        moduleId={''}
                        chapterTitle={''}
                    />
                    <div className="w-full h-max-content ">
                        <h2 className="text-left mt-4 ml-1 text-gray-600 text-[15px] font-semibold">
                            MCQ Library
                        </h2>
                        <div className="flex">
                            <QuizLibrary
                                addQuestion={addQuestion}
                                handleAddQuestion={handleAddQuestion}
                                tags={tags}
                                quizData={quizData}
                            />

                            <div className="w-full border-l border-gray-200 ml-4 pl-4">
                                <div>
                                    <div className="flex flex-col items-center justify-between">
                                        <div className="flex justify-between w-full">
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
                                    <ScrollArea className="h-96 pr-3">
                                        {addQuestion?.map(
                                            (
                                                questions: QuizDataLibrary,
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
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Quiz
