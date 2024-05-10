'use client'

import { PlusCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { cn, difficultyColor, ellipsis } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import CodingTopics from './CodingTopics'
import SelectedProblems from './SelectedProblems'
import { Input } from '@/components/ui/input'
import { api } from '@/utils/axios.config'

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

function CodingChallenge({ content }: CodeProps) {
    const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
    const [selectedTopic, setSelectedTopic] = useState<string>('All Topics')
    const [selectedDifficulty, setSelectedDifficulty] =
        useState<string>('Any Difficulty')
    const [selectedLanguage, setSelectedLanguage] =
        useState<string>('All Languages')
    const [allCodingQuestions, setAllCodingQuestions] = useState<Question[]>([])
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])

    useEffect(() => {
        async function getAllCodingQuestions() {
            try {
                const response = await api.get('/Content/allCodingQuestions')
                setAllCodingQuestions(response.data)
            } catch (error) {
                console.error('Error:', error)
            }
        }

        getAllCodingQuestions()
    }, [])

    return (
        <div>
            {/* SearchBar component */}
            <div className="flex items-center mb-5">
                <Input
                    placeholder="Untitled Coding Problem"
                    className="p-0 text-3xl w-2/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                />

                <div className="text-secondary flex font-semibold items-center">
                    <h6 className="mr-2 text-sm">Preview</h6>
                    <ExternalLink size={15} />
                </div>
            </div>
            <div className="grid grid-cols-2">
                <div>
                    <CodingTopics
                        selectedTopic={selectedTopic}
                        setSelectedTopic={setSelectedTopic}
                        selectedDifficulty={selectedDifficulty}
                        setSelectedDifficulty={setSelectedDifficulty}
                        selectedLanguage={selectedLanguage}
                        setSelectedLanguage={setSelectedLanguage}
                    />
                    <ScrollArea className="h-dvh pr-4">
                        {allCodingQuestions?.map((question: any) => {
                            const isSelected = selectedQuestions.some(
                                (selectedQuestion) =>
                                    selectedQuestion?.id === question.id
                            )
                            return (
                                <>
                                    <div
                                        key={question.id}
                                        className={`p-5 rounded-sm ${
                                            isSelected ? 'bg-gray-200' : ''
                                        }`}
                                    >
                                        <div className="flex justify-between text-start">
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
                                            {isSelected ? (
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
                                    <Separator className="my-3" />
                                </>
                            )
                        })}
                    </ScrollArea>
                </div>
                <SelectedProblems
                    selectedQuestions={selectedQuestions as Question[]}
                    setSelectedQuestions={
                        setSelectedQuestions as React.Dispatch<
                            React.SetStateAction<Question[]>
                        >
                    }
                />
            </div>
        </div>
    )
}

export default CodingChallenge
