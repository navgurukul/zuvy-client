'use client'

import { EditIcon, Eye, Pencil, Settings } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import {
    filterQuestions,
    getAllTags,
    getAllTagsWithoutFilter,
} from '@/utils/admin'
import OpenEndedQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/OpenEndedQuestions'
import QuizQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/QuizQuestions'
import CodingTopics from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/CodingTopics'
import CodingQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/CodingQuestions'
import { Button } from '@/components/ui/button'
import SettingsAssessment from '@/app/admin/courses/[courseId]/module/_components/Assessment/SettingsAssessment'
import SelectedQuestions from '@/app/admin/courses/[courseId]/module/_components/Assessment/SelectedQuestions'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import useDebounce from '@/hooks/useDebounce'
import { getAssessmentPreviewStore } from '@/store/store'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'

type AddAssessmentProps = {
    chapterData: any
    content: any
    fetchChapterContent: (chapterId: number, topicId: number) => void
    moduleId: any
    topicId: any
    activeChapterTitle: string
}

export type Tag = {
    id: number
    tagName: string
}

const AddAssessment: React.FC<AddAssessmentProps> = ({
    chapterData,
    content,
    fetchChapterContent,
    moduleId,
    topicId,
    activeChapterTitle,
}) => {
    const [isDataLoading, setIsDataLoading] = useState(true) 
    const [searchQuestionsInAssessment, setSearchQuestionsInAssessment] =
        useState<string>('')

    const [selectedDifficulties, setSelectedDifficulties] = useState([
        'Any Difficulty',
    ])

    const [selectedTopics, setSelectedTopics] = useState([
        {
            tagName: 'All Topics',
            id: -1,
        },
    ])

    const [selectedLanguage, setSelectedLanguage] =
        useState<string>('All Languages')

    const [filteredQuestions, setFilteredQuestions] = useState<any[]>([])

    const [chapterTitle, setChapterTitle] = useState<string>(activeChapterTitle)

    const [questionType, setQuestionType] = useState<string>('coding')

    const [selectedCodingQuestions, setSelectedCodingQuestions] = useState<
        any[]
    >([])

    const [selectedQuizQuestions, setSelectedQuizQuestions] = useState<any[]>(
        []
    )

    const [selectedOpenEndedQuestions, setSelectedOpenEndedQuestions] =
        useState<any[]>([])

    const [selectedCodingQuesIds, setSelectedCodingQuesIds] = useState<
        number[]
    >([])
    const [selectedCodingQuesTagIds, setSelectedCodingQuesTagIds] = useState<
        number[]
    >([])

    const [selectedQuizQuesIds, setSelectedQuizQuesIds] = useState<number[]>([])
    const [selectedQuizQuesTagIds, setSelectedQuizQuesTagIds] = useState<
        number[]
    >([])

    const [selectedOpenEndedQuesIds, setSelectedOpenEndedQuesIds] = useState<
        number[]
    >([])

    const debouncedSearch = useDebounce(searchQuestionsInAssessment, 500)

    const [saveSettings, setSaveSettings] = useState(false)

    const [tags, setTags] = useState<any>()

    const { setAssessmentPreviewContent } = getAssessmentPreviewStore()

    const router = useRouter()

    const [isNewQuestionAdded, setIsNewQuestionAdded] = useState(false)

    const [selectCodingDifficultyCount, setSelectCodingDifficultyCount] =
        useState<Object>({})
    const [selectQuizDifficultyCount, setSelectQuizDifficultyCount] =
        useState<Object>({})
    const hasLoaded = useRef(false)

    const handleCodingButtonClick = () => {
        setQuestionType('coding')
        setSearchQuestionsInAssessment('')
        filterQuestions(
            setFilteredQuestions,
            selectedDifficulties,
            selectedTopics,
            selectedLanguage,
            debouncedSearch,
            'coding'
        )
    }

    const handleMCQButtonClick = () => {
        setQuestionType('mcq')
        setSearchQuestionsInAssessment('')

        filterQuestions(
            setFilteredQuestions,
            selectedDifficulties,
            selectedTopics,
            selectedLanguage,
            debouncedSearch,
            'mcq'
        )
    }

    const handleOpenEndedButtonClick = () => {
        setQuestionType('open-ended')
        setSearchQuestionsInAssessment('')

        filterQuestions(
            setFilteredQuestions,
            selectedDifficulties,
            selectedTopics,
            selectedLanguage,
            debouncedSearch,
            'open-ended'
        )
    }
    const handleSettingsButtonClick = () => {
        setQuestionType('settings')
    }

    function previewAssessment() {
        if (
            content.Quizzes.length > 0 ||
            content.CodingQuestions.length > 0 ||
            content.OpenEndedQuestions.length > 0
        ) {
            setAssessmentPreviewContent(content)
            router.push(
                `/admin/courses/${content.bootcampId}/module/${content.moduleId}/chapter/${content.chapterId}/assessment/${topicId}/preview`
            )
        } else {
            toast({
                title: 'No questions to preview',
                description: 'Please save the assessment first to preview.',
                className:
                    'border border-red-500 text-red-500 text-left w-[90%]',
            })
        }
    }

    useEffect(() => {
        if (questionType === 'coding') {
            filterQuestions(
                setFilteredQuestions,
                selectedDifficulties,
                selectedTopics,
                selectedLanguage,
                debouncedSearch,
                'coding'
            )
        } else if (questionType === 'mcq') {
            filterQuestions(
                setFilteredQuestions,
                selectedDifficulties,
                selectedTopics,
                selectedLanguage,
                debouncedSearch,
                'mcq'
            )
        } else {
            filterQuestions(
                setFilteredQuestions,
                selectedDifficulties,
                selectedTopics,
                selectedLanguage,
                debouncedSearch,
                'open-ended'
            )
        }
    }, [questionType, selectedDifficulties, selectedTopics, debouncedSearch])

    useEffect(() => {
        const difficultyCount = selectedCodingQuestions.reduce(
            (acc: any, question: any) => {
                const key = `codingProblems${question.difficulty}` // Construct the key
                acc[key] = acc[key] ? acc[key] + 1 : 1 // Increment the count
                return acc
            },
            {}
        )

        setSelectCodingDifficultyCount(difficultyCount)
    }, [selectedCodingQuestions])

    useEffect(() => {
        const difficultyCount = selectedQuizQuestions.reduce(
            (acc: any, question: any) => {
                const key = `mcqs${question.difficulty}` // Construct the key
                acc[key] = acc[key] ? acc[key] + 1 : 1 // Increment the count
                return acc
            },
            {}
        )

        setSelectQuizDifficultyCount(difficultyCount)
    }, [selectedQuizQuestions])

    useEffect(() => {
        // Ensure unique coding questions
        const uniqueCodingQuestions = Array.from(
            new Set(
                content.CodingQuestions?.map((question: any) => question.id)
            )
        ).map((id) =>
            content.CodingQuestions.find((question: any) => question.id === id)
        )
        setSelectedCodingQuestions(uniqueCodingQuestions || [])

        // Ensure unique quiz questions
        const uniqueQuizQuestions = Array.from(
            new Set(content.Quizzes?.map((question: any) => question.id))
        ).map((id) =>
            content.Quizzes.find((question: any) => question.id === id)
        )
        setSelectedQuizQuestions(uniqueQuizQuestions || [])

        // Ensure unique open-ended questions
        const uniqueOpenEndedQuestions = Array.from(
            new Set(
                content.OpenEndedQuestions?.map((question: any) => question.id)
            )
        ).map((id) =>
            content.OpenEndedQuestions.find(
                (question: any) => question.id === id
            )
        )
        setSelectedOpenEndedQuestions(uniqueOpenEndedQuestions || [])
    }, [content])

    useEffect(() => {
        setSelectedCodingQuesIds(
            Array.from(
                new Set(selectedCodingQuestions.map((question) => question.id))
            )
        )
        setSelectedCodingQuesTagIds(
            Array.from(
                new Set(
                    selectedCodingQuestions.map((question) => question.tagId)
                )
            )
        )
    }, [selectedCodingQuestions])

    useEffect(() => {
        setSelectedQuizQuesIds(
            Array.from(
                new Set(selectedQuizQuestions.map((question) => question.id))
            )
        )
        setSelectedQuizQuesTagIds(
            Array.from(
                new Set(selectedQuizQuestions.map((question) => question.tagId))
            )
        )
    }, [selectedQuizQuestions])

    useEffect(() => {
        setSelectedOpenEndedQuesIds(
            Array.from(
                new Set(
                    selectedOpenEndedQuestions.map((question) => question.id)
                )
            )
        )
    }, [selectedOpenEndedQuestions])

    useEffect(() => {
        if (chapterData.id && topicId > 0) {
            setIsDataLoading(true) 
            fetchChapterContent(chapterData.id, topicId)
            setChapterTitle(content.ModuleAssessment?.title)
            setChapterTitle(activeChapterTitle) // Always sync with the chapter title
            setIsDataLoading(false)
        }
    }, [chapterData.id, topicId, activeChapterTitle])

    useEffect(() => {
        if (hasLoaded.current) return
        hasLoaded.current = true
        const loadTags = async () => {
            setIsDataLoading(true) // Start loading
            try {
                await getAllTagsWithoutFilter(setTags)
            } catch (error) {
                console.error('Error loading tags:', error)
            } finally {
                setIsDataLoading(false) // End loading
            }
        }
        loadTags()
    }, [])
    if (isDataLoading) {
        return (
            <div className="px-5">
                <div className="w-full flex justify-center items-center py-8">
                    <div className="animate-pulse">Loading Assessment  details...</div>
                </div>
            </div>
        )
    }

    useEffect(() => {
        if (content?.ModuleAssessment?.title) {
            setChapterTitle(content.ModuleAssessment.title)
        } else if (activeChapterTitle) {
            setChapterTitle(activeChapterTitle)
        }
    }, [content?.ModuleAssessment?.title, activeChapterTitle])

    return (
        <div className="w-full pb-2 px-5">
            {questionType !== 'settings' && (
                <div className="flex items-center mb-5 w-full justify-between">
                    <div className="w-2/6 flex justify-center align-middle items-center relative">
                        <Input
                            required
                            onChange={(e) => {
                                setChapterTitle(e.target.value)
                            }}
                            value={chapterTitle}
                            // placeholder={content?.ModuleAssessment?.title}
                            placeholder="Untitled Assessment"
                            className="pl-1 pr-8 text-xl text-left font-semibold capitalize placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 border-gray-400 border-dashed focus:outline-none"
                            autoFocus
                        />
                        {chapterTitle.length == 0 && (
                            <Pencil
                                fill="true"
                                fillOpacity={0.4}
                                size={20}
                                className="absolute text-gray-100 pointer-events-none mt-1 right-5"
                            />
                        )}
                    </div>

                    {/* preview & settings buttons */}
                    <div className="text-[#4A4A4A] flex font-semibold items-center cursor-pointer mr-14 gap-2">
                        <div
                            id="previewAssessment"
                            onClick={previewAssessment}
                            className="flex hover:bg-gray-300 rounded-md p-1"
                        >
                            <Eye size={18} />
                            <h6 className="ml-1 text-sm">Preview</h6>
                        </div>

                        <div
                            onClick={handleSettingsButtonClick}
                            id="settingsAssessment"
                            className="flex hover:bg-gray-300 rounded-md p-1"
                        >
                            <Settings size={18} />
                            <h6 className="mx-1 text-sm">Settings</h6>
                        </div>
                    </div>
                </div>
            )}
            {/* select type of questions */}
            {questionType !== 'settings' && (
                <div className="flex gap-2 mb-5">
                    <Button
                        className={`${
                            questionType === 'coding'
                                ? 'bg-transparent text-secondary border-b-4 border-secondary rounded-none my-0 mx-2 p-0'
                                : 'bg-transparent text-[#6E6E6E] border-none my-0 mx-2 p-0'
                            }`}
                        onClick={handleCodingButtonClick}
                    >
                        Coding Problems ({selectedCodingQuestions.length})
                    </Button>
                    <Button
                        className={`${
                            questionType === 'mcq'
                                ? 'bg-transparent text-secondary border-b-4 border-secondary rounded-none my-0 mx-2 p-0'
                                : 'bg-transparent text-[#6E6E6E] border-none my-0 mx-2 p-0'
                            }`}
                        onClick={handleMCQButtonClick}
                    >
                        MCQs ({selectedQuizQuestions.length})
                    </Button>
                    <Button
                        className={`${
                            questionType === 'open-ended'
                                ? 'bg-transparent text-secondary border-b-4 border-secondary rounded-none my-0 mx-2 p-0'
                                : 'bg-transparent text-[#6E6E6E] border-none my-0 mx-2 p-0'
                            }`}
                        onClick={handleOpenEndedButtonClick}
                    >
                        Open-Ended Questions (
                        {selectedOpenEndedQuestions.length})
                    </Button>
                </div>
            )}

            {/* DropDown Filters for questions:- */}
            {questionType !== 'settings' && (
                <>
                    <div className="flex mb-3">
                        <CodingTopics
                            searchTerm={searchQuestionsInAssessment}
                            setSearchTerm={setSearchQuestionsInAssessment}
                            tags={tags}
                            selectedTopics={selectedTopics}
                            setSelectedTopics={setSelectedTopics}
                            selectedDifficulties={selectedDifficulties}
                            setSelectedDifficulties={setSelectedDifficulties}
                        />
                    </div>
                    <div className="flex justify-between w-2/3">
                        <h3 className="text-left font-bold mb-5 ml-2">
                            {questionType === 'coding'
                                ? 'Coding Problem Library'
                                : questionType === 'mcq'
                                    ? 'MCQ Library'
                                    : questionType === 'open-ended'
                                        ? 'Open-Ended Question Library'
                                        : ''}
                        </h3>
                        <h1 className="text-left font-bold mb-5 mr-3">
                            Selected Questions
                        </h1>
                    </div>
                </>
            )}

            <div className="h-full">
                {/* <ScrollBar orientation="vertical" className="h-dvh" /> */}
                <div
                    className={`${
                        questionType == 'settings'
                            ? 'grid grid-cols-1'
                            : 'grid grid-cols-[1fr_2px_1fr]'
                        } h-screen `}
                >
                    <>
                        <div className="h-full ">
                            {questionType === 'coding' && (
                                <CodingQuestions
                                    questions={filteredQuestions}
                                    setSelectedQuestions={
                                        setSelectedCodingQuestions
                                    }
                                    selectedQuestions={selectedCodingQuestions}
                                    tags={tags}
                                    setIsNewQuestionAdded={setIsNewQuestionAdded}
                                />
                            )}
                            {questionType === 'mcq' && (
                                <QuizQuestions
                                    questions={filteredQuestions}
                                    setSelectedQuestions={
                                        setSelectedQuizQuestions
                                    }
                                    selectedQuestions={selectedQuizQuestions}
                                    tags={tags}
                                    setIsNewQuestionAdded={setIsNewQuestionAdded}
                                />
                            )}
                            {questionType === 'open-ended' && (
                                <OpenEndedQuestions
                                    questions={filteredQuestions}
                                    setSelectedQuestions={
                                        setSelectedOpenEndedQuestions
                                    }
                                    selectedQuestions={
                                        selectedOpenEndedQuestions
                                    }
                                    tags={tags}
                                />
                            )}
                            {questionType === 'settings' && (
                                <div className="">
                                    <SettingsAssessment
                                        selectedCodingQuesIds={
                                            selectedCodingQuesIds
                                        }
                                        selectedQuizQuesIds={
                                            selectedQuizQuesIds
                                        }
                                        selectedOpenEndedQuesIds={
                                            selectedOpenEndedQuesIds
                                        }
                                        selectedCodingQuesTagIds={
                                            selectedCodingQuesTagIds
                                        }
                                        selectedQuizQuesTagIds={
                                            selectedQuizQuesTagIds
                                        }
                                        content={content}
                                        fetchChapterContent={
                                            fetchChapterContent
                                        }
                                        chapterTitle={chapterTitle}
                                        activeChapterTitle={activeChapterTitle}
                                        saveSettings={saveSettings}
                                        setSaveSettings={setSaveSettings}
                                        setQuestionType={setQuestionType}
                                        selectCodingDifficultyCount={
                                            selectCodingDifficultyCount
                                        }
                                        selectQuizDifficultyCount={
                                            selectQuizDifficultyCount
                                        }
                                        topicId={topicId}
                                        isNewQuestionAdded={isNewQuestionAdded}
                                        setIsNewQuestionAdded={setIsNewQuestionAdded}
                                    />
                                </div>
                            )}
                        </div>
                    </>

                    <Separator
                        orientation="vertical"
                        className="mx-4 w-[2px] h-96 rounded"
                    />

                    {questionType !== 'settings' && (
                        <div className='h-screen'>
                            <ScrollArea className="h-96 px-2 pb-4">
                                <ScrollBar orientation="vertical" className="" />

                                {selectedCodingQuesIds.length > 0 ||
                                    selectedQuizQuesIds.length > 0 ||
                                    selectedOpenEndedQuesIds.length > 0 ? (
                                    <SelectedQuestions
                                        selectedCodingQuestions={
                                            selectedCodingQuestions
                                        }
                                        selectedQuizQuestions={
                                            selectedQuizQuestions
                                        }
                                        selectedOpenEndedQuestions={
                                            selectedOpenEndedQuestions
                                        }
                                        setSelectedCodingQuestions={
                                            setSelectedCodingQuestions
                                        }
                                        setSelectedQuizQuestions={
                                            setSelectedQuizQuestions
                                        }
                                        setSelectedOpenEndedQuestions={
                                            setSelectedOpenEndedQuestions
                                        }
                                        questionType={questionType}
                                        tags={tags}
                                        setIsNewQuestionAdded = {setIsNewQuestionAdded}
                                    />
                                ) : (
                                    <h1 className="text-left italic pl-5">
                                        No Selected questions
                                    </h1>
                                )}
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AddAssessment
