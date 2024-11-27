'use client'

import { PlusCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { cn, difficultyColor, ellipsis } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import CodingTopics from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/CodingTopics'
import SelectedProblems from '@/app/admin/courses/[courseId]/module/_components/codingChallenge/SelectedProblems'
import { Input } from '@/components/ui/input'
import { api } from '@/utils/axios.config'
import useDebounce from '@/hooks/useDebounce'
import { getCodingQuestionTags } from '@/store/store'
import { ArrowUpRightSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PreviewCodingChallenge from './PreviewCodingChallenge'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import QuestionDescriptionModal from '../Assessment/QuestionDescriptionModal'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'

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
}: {
    content: any
    activeChapterTitle: string
    moduleId: string
}) {
    const heightClass = useResponsiveHeight()
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 1000)
    const { tags, setTags } = getCodingQuestionTags()
    const [selectedQuestions, setSelectedQuestions] = useState<Question[]>(
        content.codingQuestionDetails
    )
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
    // const [selectedDifficulty, setSelectedDifficulty] =
    //     useState<string>('Any Difficulty')
    const [selectedLanguage, setSelectedLanguage] =
        useState<string>('All Languages')
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
    const [chapterTitle, setChapterTitle] = useState<string>(activeChapterTitle)
    const [showPreview, setShowPreview] = useState<boolean>(false)
    const handlePreviewClick = () => {
        if (selectedQuestions.length === 0) {
            // Show toast if no questions are added
            toast({
                title: 'No Questions',
                description:
                    'Please add at least one question to preview the codiing question',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-warning max-w-sm px-6 py-5 box-border z-50',
            })
        } else {
            setShowPreview(true)
        }
    }

    useEffect(() => {
        async function getAllCodingQuestions() {
            try {
                let url = '/Content/allCodingQuestions'

                const queryParams = []

                // if (
                //     selectedDifficulty &&
                //     selectedDifficulty !== 'Any Difficulty'
                // ) {
                //     queryParams.push(
                //         `difficulty=${encodeURIComponent(selectedDifficulty)}`
                //     )
                // }
                // if (selectedTag.id !== -1) {
                //     queryParams.push(`tagId=${selectedTag.id}`)
                // }
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
        const response = await api.get('Content/allTags')
        if (response) {
            const tagArr = [
                { tagName: 'All Topics', id: -1 },
                ...response.data.allTags,
            ]
            setTags(tagArr)
        }
    }

    useEffect(() => {
        getAllTags()
    }, [])

    useEffect(() => {
        setSelectedQuestions(content.codingQuestionDetails)
        setChapterTitle(activeChapterTitle)
    }, [content])

    return (
        <>
            {showPreview ? (
                <PreviewCodingChallenge
                    content={content}
                    setShowPreview={setShowPreview}
                    tags={tags}
                />
            ) : (
                <div>
                    {/* SearchBar component */}
                    <div className="flex items-center mb-5">
                        <Input
                            required
                            onChange={(e) => {
                                setChapterTitle(e.target.value)
                            }}
                            placeholder={`${
                                activeChapterTitle
                                    ? activeChapterTitle
                                    : 'Untitled Coding Problem'
                            }`}
                            className="p-0 text-3xl w-2/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                        />
                        <Button
                            variant={'ghost'}
                            type="button"
                            className=" text-secondary w-[100px] h-[30px] gap-x-1 "
                            onClick={handlePreviewClick}
                        >
                            <ArrowUpRightSquare />
                            <h1>Preview</h1>
                        </Button>

                        {/* <div className="text-secondary flex font-semibold items-center">
                    <h6 className="mr-2 text-sm">Preview</h6>
                    <ExternalLink size={15} />
                </div> */}
                    </div>
                    <div className="grid grid-cols-2">
                        <div>
                            <CodingTopics
                                setSearchTerm={setSearchTerm}
                                searchTerm={searchTerm}
                                selectedTopics={selectedOptions}
                                setSelectedTopics={setSelectedOptions}
                                selectedDifficulties={selectedDifficulty}
                                setSelectedDifficulties={setSelectedDifficulty}
                                // selectedLanguage={selectedLanguage}
                                // setSelectedLanguage={setSelectedLanguage}
                                tags={tags}
                            />
                            {/* <ScrollArea className="h-dvh pr-4"> */}
                            <ScrollArea className={`${heightClass} pr-4`}>
                                {filteredQuestions?.map((question: any) => (
                                    <div
                                        key={question.id}
                                        className={`p-5 rounded-sm ${
                                            selectedQuestions?.some(
                                                (selectedQuestion) =>
                                                    selectedQuestion?.id ===
                                                    question.id
                                            )
                                                ? 'bg-gray-200'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex justify-between text-start items-center">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="font-bold text-lg">
                                                        {question.title}
                                                    </h2>
                                                    <span
                                                        className={cn(
                                                            `font-semibold text-secondary`,
                                                            difficultyColor(
                                                                question.difficulty
                                                            )
                                                        )}
                                                    >
                                                        {question.difficulty}
                                                    </span>
                                                </div>
                                                <div className="w-full">
                                                    <p className="text-gray-600 mt-1">
                                                        {ellipsis(
                                                            question.description,
                                                            60
                                                        )}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={''}
                                                    className="font-semibold text-sm mt-2 text-secondary"
                                                >
                                                    View Full Description
                                                </Link>
                                            </div>
                                            <div>
                                                {selectedQuestions?.some(
                                                    (selectedQuestion) =>
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
                                                                [question]
                                                            )
                                                        }}
                                                        className="text-secondary cursor-pointer"
                                                        size={20}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <p className="text-gray-600 mt-1">
                                                {ellipsis(
                                                    question.description,
                                                    60
                                                )}
                                            </p>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <p className="font-bold text-sm mt-2 text-[#518672] cursor-pointer">
                                                    View Full Description
                                                </p>
                                            </DialogTrigger>
                                            <DialogOverlay />
                                            <QuestionDescriptionModal
                                                question={question}
                                                type="coding"
                                            />
                                        </Dialog>
                                        <div>
                                            {selectedQuestions?.some(
                                                (selectedQuestion) =>
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
                                                        setSelectedQuestions([
                                                            question,
                                                        ])
                                                    }}
                                                    className="text-secondary cursor-pointer"
                                                    size={20}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                        </div>
                        <SelectedProblems
                            chapterTitle={chapterTitle}
                            selectedQuestions={selectedQuestions as Question[]}
                            setSelectedQuestions={
                                setSelectedQuestions as React.Dispatch<
                                    React.SetStateAction<Question[]>
                                >
                            }
                            content={content}
                            moduleId={moduleId}
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default CodingChallenge
