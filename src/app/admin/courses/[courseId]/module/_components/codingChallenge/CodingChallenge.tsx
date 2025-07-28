'use client'

import { PlusCircle, Pencil } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { cn, difficultyBgColor, difficultyColor, ellipsis } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import CodingTopics from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/CodingTopics'
import SelectedProblems from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/SelectedProblems'
import { Input } from '@/components/ui/input'
import { api } from '@/utils/axios.config'
import useDebounce from '@/hooks/useDebounce'
import {
    getChapterUpdateStatus,
    getCodingQuestionTags,
    getCodingPreviewStore,
} from '@/store/store'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import QuestionDescriptionModal from '../Assessment/QuestionDescriptionModal'
import { Button } from '@/components/ui/button'
import { handleSaveChapter } from '@/utils/admin'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

interface Example {
    input: number[]
    output: number[]
}

interface Question {
    id: number
    title: string
    description: string
    difficulty: string
    tags: number
    constraints: string
    authorId: number
    inputBase64: string | null
    examples: Example[]
    testCases: Example[]
    expectedOutput: number[]
    solution: string
    createdAt: string
    updatedAt: string
}
interface ContentDetail {
    title: string
    description: string | null
    links: string | null
    file: string | null
    content: string | null
}
interface Content {
    id: number
    moduleId: number
    topicId: number
    order: number
    contentDetails: ContentDetail[]
}
interface CodeProps {
    content: Content
}

export type Tag = {
    id: number
    tagName: string
}

interface Option {
    tagName: string
    id: number
}

function CodingChallenge({
    content,
    activeChapterTitle,
    moduleId,
    courseId,
}: {
    content: any
    activeChapterTitle: string
    moduleId: string
    courseId: any
}) {
    const router = useRouter()
    const { setCodingPreviewContent } = getCodingPreviewStore()
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 1000)
    const { tags, setTags } = getCodingQuestionTags()
    
    // SIMPLE FIX: Direct computation instead of useEffect
    const codingQuestions = content?.codingQuestionDetails || []
    const [selectedQuestions, setSelectedQuestions] = useState<Question[]>(codingQuestions)
    const [savedQuestions, setSavedQuestions] = useState<Question[]>(codingQuestions)
    
    const [selectedTopic, setSelectedTopic] = useState<string>('All Topics')
    const [selectedTag, setSelectedTag] = useState<Tag>({
        tagName: 'All Topics',
        id: -1,
    })
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([
        { id: -1, tagName: 'All Topics' },
    ])
    const [selectedDifficulty, setSelectedDifficulty] = useState([
        'Any Difficulty',
    ])
    const [selectedLanguage, setSelectedLanguage] =
        useState<string>('All Languages')
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
    const [chapterTitle, setChapterTitle] = useState<string>(activeChapterTitle)
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const [isDataLoading, setIsDataLoading] = useState(true)
    const hasLoaded = useRef(false)

    const [isSaved, setIsSaved] = useState<boolean>(true)

    // FORCE UPDATE: Use a key to force re-render when content changes
    const contentKey = `${content?.id}-${content?.codingQuestionDetails?.length || 0}`

    const [initialTitle] = useState<string>(activeChapterTitle)
    const [savedTitle, setSavedTitle] = useState<string>(activeChapterTitle)
    const [hasTitleChanged, setHasTitleChanged] = useState(false)

    const handleSaveClick = async () => {
        try {
            const titleToSave = chapterTitle.trim() === '' ? savedTitle : chapterTitle
            
            await handleSaveChapter(
                moduleId,
                content.id,
                {
                    title: titleToSave,
                    codingQuestions: selectedQuestions[0]?.id,
                }
            )
            
            setIsChapterUpdated(!isChapterUpdated)
            setIsSaved(true)
            setSavedQuestions([...selectedQuestions])
            setSavedTitle(titleToSave)
            setHasTitleChanged(false)
            
            toast.success({
                title:'Success',
                description: " Chapter edited successfully",
            })
        } catch (error) {
            toast.error({
                title:'Error',
                description: "Failed to save changes",
            })
        }
    }
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setChapterTitle(newTitle)
        setHasTitleChanged(newTitle !== savedTitle)
    }
    useEffect(() => {
        const newQuestions = content?.codingQuestionDetails || []
        setSelectedQuestions(newQuestions)
        setSavedQuestions(newQuestions)
        setIsSaved(true)
        
        // Reset title changes when content changes
        setChapterTitle(activeChapterTitle)
        setSavedTitle(activeChapterTitle)
        setHasTitleChanged(false)
    }, [content?.id]) // Only depend on content.id

    // Function to check if current selection matches saved questions
    const checkIfSaved = () => {
        if (!selectedQuestions || !savedQuestions) {
            return true
        }
        if (selectedQuestions.length !== savedQuestions.length) {
            return false
        }

        // Check if all selected questions are in saved questions
        return selectedQuestions.every(selectedQ =>
            savedQuestions.some(savedQ => savedQ.id === selectedQ.id)
        )
    }

    // IMMEDIATE UPDATE: React to content prop changes immediately
    useEffect(() => {
        const newCodingQuestions = content?.codingQuestionDetails || []
        setSelectedQuestions(newCodingQuestions)
        setSavedQuestions(newCodingQuestions)
        setIsSaved(true)
        console.log('Content updated, new questions:', newCodingQuestions)
    }, [contentKey]) // Use contentKey instead of content

    useEffect(() => {
        setIsSaved(checkIfSaved())
    }, [selectedQuestions, savedQuestions])

    useEffect(() => {
        async function getAllCodingQuestions() {
            try {
                let url = '/Content/allCodingQuestions'

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
                if (debouncedSearch) {
                    queryParams.push(
                        `searchTerm=${encodeURIComponent(debouncedSearch)}`
                    )
                }
                if (queryParams.length > 0) {
                    url += `?${queryParams.join('&')}`
                }

                const response = await api.get(url)

                setFilteredQuestions(response.data.data)
            } catch (error) {
                console.error('Error:', error)
            }
        }
        getAllCodingQuestions()
    }, [
        selectedDifficulty,
        selectedQuestions,
        debouncedSearch,
        selectedOptions,
    ])

    async function getAllTags() {
        try {
            setIsDataLoading(true)
            const response = await api.get('Content/allTags')
            if (response) {
                const tagArr = [
                    { tagName: 'All Topics', id: -1 },
                    ...response.data.allTags,
                ]
                setTags(tagArr)
            }
        } catch (error) {
            console.error('Error fetching tags:', error)
        } finally {
            setIsDataLoading(false)
        }
    }

    useEffect(() => {
        if (hasLoaded.current) return
        hasLoaded.current = true
        getAllTags()
    }, [])

    // Update chapter title when activeChapterTitle prop changes
    useEffect(() => {
        setChapterTitle(activeChapterTitle)
    }, [activeChapterTitle])

    function previewCodingChallenge() {
        if (!selectedQuestions || selectedQuestions.length === 0) {
            return toast.error({
                title: 'Cannot Preview',
                description: 'Nothing to Preview please save coding question.',
            })
        }
        // Check if question is selected but not saved
        if (!isSaved) {
            return toast.error({
                title: 'Cannot Preview',
                description: 'Please save the selected question before previewing.',
            })
        }
        const updatedContent = {
            ...content,
            codingQuestionDetails: selectedQuestions,
        }
        setCodingPreviewContent(updatedContent)
        router.push(
            `/admin/courses/${courseId}/module/${content.moduleId}/chapter/${content.id}/coding/${content.topicId}/preview`
        )
    }
    
    if (isDataLoading) {
        return (
            <div className="px-5">
                <div className="w-full flex justify-center items-center py-8">
                    <div className="animate-pulse">Loading Coding Problem details...</div>
                </div>
            </div>
        )
    }
    return (
        <>
            <div className="px-5" key={contentKey}>
                {/* SearchBar component */}
                <div className="flex flex-col items-start mb-15">
                    <div className="flex justify-between items-center w-full">
                        <div className="w-2/6 flex justify-center align-middle items-center relative">
                            <Input
                                required
                                onChange={handleTitleChange}
                                value={chapterTitle}
                                placeholder="Untitled Coding Problem"
                                className="pl-1 pr-8 text-xl text-left text-gray-600 font-semibold capitalize placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 border-gray-400 border-dashed focus:outline-none"
                                autoFocus
                            />
                            {!chapterTitle && (
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
                                id="previewCodingChallenge"
                                onClick={previewCodingChallenge}
                                className="flex w-[80px] text-gray-600 hover:bg-gray-300 rounded-md p-1 cursor-pointer mt-5 mr-2"
                            >
                                <Eye size={18} />
                                <h6 className="ml-1 text-sm">Preview</h6>
                            </div>
                            {selectedQuestions?.length > 0 && (
                                <Button
                                    onClick={handleSaveClick}
                                    className="mt-5 bg-success-dark opacity-75"
                                >
                                    Save
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2">
                    <div className="">
                        <div className="flex">
                            <CodingTopics
                                setSearchTerm={setSearchTerm}
                                searchTerm={searchTerm}
                                selectedTopics={selectedOptions}
                                setSelectedTopics={setSelectedOptions}
                                selectedDifficulties={selectedDifficulty}
                                setSelectedDifficulties={setSelectedDifficulty}
                                tags={tags}
                            />
                        </div>
                        <h1 className="text-left text-[15px] text-gray-600 font-bold mt-5 pb-3">
                            Coding Library
                        </h1>
                        <div className="">
                            <ScrollArea className="h-screen pb-80">
                                {filteredQuestions?.map((question: any) => {
                                    const selectedTagName = tags?.filter(
                                        (tag: any) => tag.id == question.tagId
                                    )
                                    return (
                                        <div
                                            key={question.id}
                                            className={`rounded-sm py-5 pr-5`}
                                        >
                                            <div className="flex justify-between text-start items-center w-full">
                                                <div className="w-full">
                                                    <div className="flex items-center gap-2 justify-between">
                                                        <h2 className="font-bold text-[16px] text-gray-600">
                                                            {ellipsis(
                                                                question.title,
                                                                30
                                                            )}
                                                        </h2>

                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-[#518672] bg-[#DCE7E3] py-1 rounded-2xl px-2">
                                                                {
                                                                    selectedTagName[0]
                                                                        ?.tagName
                                                                }
                                                            </span>

                                                            <span
                                                                className={cn(
                                                                    `text-sm rounded-xl p-1 `,
                                                                    difficultyColor(
                                                                        question.difficulty
                                                                    ), // Text color
                                                                    difficultyBgColor(
                                                                        question.difficulty
                                                                    ) // Background color
                                                                )}
                                                            >
                                                                {
                                                                    question.difficulty
                                                                }
                                                            </span>

                                                            <div>
                                                                {selectedQuestions?.some(
                                                                    (
                                                                        selectedQuestion
                                                                    ) =>
                                                                        selectedQuestion?.id ===
                                                                        question.id
                                                                ) ? (
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width="20"
                                                                        height="20"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        className="lucide lucide-circle-check"
                                                                    >
                                                                        <circle
                                                                            cx="12"
                                                                            cy="12"
                                                                            r="10"
                                                                        />
                                                                        <path d="m9 12 2 2 4-4" />
                                                                    </svg>
                                                                ) : (
                                                                    <PlusCircle
                                                                        onClick={() => {
                                                                            setSelectedQuestions(
                                                                                [
                                                                                    question,
                                                                                ]
                                                                            )
                                                                        }}
                                                                        className="text-[rgb(81,134,114)] cursor-pointer"
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-full">
                                                        <p className="text-gray-600 text-[15px] mt-1">
                                                            {ellipsis(
                                                                question.description,
                                                                60
                                                            )}
                                                        </p>
                                                    </div>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <p className="font-bold text-sm mt-2 text-[#518672] cursor-pointer">
                                                                View Full
                                                                Description
                                                            </p>
                                                        </DialogTrigger>
                                                        <DialogOverlay />
                                                        <QuestionDescriptionModal
                                                            question={question}
                                                            type="coding"
                                                        />
                                                    </Dialog>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </ScrollArea>
                        </div>
                    </div>
                    <div className="mt-36">
                        {/* FORCE RE-RENDER: Pass contentKey as key */}
                        <SelectedProblems
                            key={contentKey}
                            chapterTitle={chapterTitle}
                            selectedQuestions={selectedQuestions as Question[]}
                            setSelectedQuestions={
                                setSelectedQuestions as React.Dispatch<
                                    React.SetStateAction<Question[]>
                                >
                            }
                            content={content}
                            moduleId={moduleId}
                            tags={tags}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default CodingChallenge