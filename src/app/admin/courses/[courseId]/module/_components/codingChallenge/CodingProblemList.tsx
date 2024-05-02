'use client'

import { PlusCircle, XCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Separator } from '@/components/ui/separator'
import { cn, difficultyColor, ellipsis } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Question {
    id: number
    title: string
    description: string
    difficulty: string
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

interface CodingProblemProps {
    content: Content
}

const questions: Question[] = [
    {
        id: 1,
        title: 'Power Calculator',
        description:
            'Power Calculator is a simple coding problem meant to calculate the power of a number',
        difficulty: 'Easy',
    },
    {
        id: 2,
        title: 'Array Reversal',
        description: 'Reverse the elements of an array in place....',
        difficulty: 'Easy',
    },
    {
        id: 3,
        title: 'Binary Search',
        description: 'Implement a binary search algorithm....',
        difficulty: 'Medium',
    },
    {
        id: 4,
        title: 'Fibonacci Sequence',
        description: 'Generate the Fibonacci sequence up to n....',
        difficulty: 'Medium',
    },
    {
        id: 5,
        title: 'Palindrome Checker',
        description: 'Check if a given string is a palindrome....',
        difficulty: 'Hard',
    },
    {
        id: 6,
        title: 'Sorting Algorithm',
        description: 'Implement a sorting algorithm of your choice....',
        difficulty: 'Hard',
    },
    {
        id: 7,
        title: 'Graph Traversal',
        description: 'Implement a graph traversal algorithm....',
        difficulty: 'Hard',
    },
]

function CodingProblemList({ content }: CodingProblemProps) {
    const [activeTab, setActiveTab] = useState('anydifficulty')

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
    }

    const difficultyMapping: any = {
        anydifficulty: 'Any Difficulty',
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
    }

    const [selectedTopic, setSelectedTopic] = useState('All Topics')
    const [selectedDifficulty, setSelectedDifficulty] =
        useState('Any Difficulty')
    const [selectedLanguage, setSelectedLanguage] = useState('All Languages')

    const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])

    return (
        <div>
            <div className=" flex items-center mb-5">
                <input
                    placeholder="Untitled Video"
                    className="text-3xl text-left font-semibold outline-none border-none focus:ring-0"
                />

                <div className="text-secondary flex font-semibold items-center">
                    <h6 className="mr-2 text-sm">Preview</h6>
                    <ExternalLink size={15} />
                </div>
            </div>
            <div className="grid grid-cols-2">
                <div>
                    <div className="flex flex-col mb-5">
                        <h2 className="text-left text-gray-700 font-semibold">
                            Coding Problem Library
                        </h2>
                        <Input
                            placeholder="Search By Name "
                            className="w-full mb-2 "
                        />
                        <div className="dropDownsContainer flex gap-2">
                            <Select>
                                <SelectTrigger className="">
                                    <SelectValue placeholder={selectedTopic} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Topics</SelectLabel>
                                        <SelectItem
                                            onClick={() =>
                                                setSelectedTopic('All Topics')
                                            }
                                            value="alltopics"
                                        >
                                            All Topics
                                        </SelectItem>
                                        <SelectItem
                                            onClick={() =>
                                                setSelectedTopic('Frontend')
                                            }
                                            value="Frontend"
                                        >
                                            Frontend
                                        </SelectItem>
                                        <SelectItem
                                            onClick={() =>
                                                setSelectedTopic('Backend')
                                            }
                                            value="Backend"
                                        >
                                            Backend
                                        </SelectItem>
                                        <SelectItem
                                            onClick={() =>
                                                setSelectedTopic('DSA')
                                            }
                                            value="DSA"
                                        >
                                            DSA
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="">
                                    <SelectValue
                                        placeholder={selectedDifficulty}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Difficulty</SelectLabel>
                                        <SelectItem
                                            onClick={() =>
                                                setSelectedDifficulty(
                                                    'Any Difficulty'
                                                )
                                            }
                                            value="anydifficulty"
                                        >
                                            Any Difficulty
                                        </SelectItem>
                                        <SelectItem
                                            onClick={() =>
                                                setSelectedDifficulty('Easy')
                                            }
                                            value="easy"
                                        >
                                            Easy
                                        </SelectItem>
                                        <SelectItem
                                            onClick={() =>
                                                setSelectedDifficulty('medium')
                                            }
                                            value="medium"
                                        >
                                            Medium
                                        </SelectItem>
                                        <SelectItem
                                            onClick={() =>
                                                setSelectedDifficulty('hard')
                                            }
                                            value="hard"
                                        >
                                            Hard
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Select>
                                <SelectTrigger className="">
                                    <SelectValue
                                        placeholder={selectedLanguage}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel> Languages</SelectLabel>
                                        <SelectItem
                                            onClick={() =>
                                                setSelectedLanguage(
                                                    'All Languages'
                                                )
                                            }
                                            value="alllanguages"
                                        >
                                            All Languages
                                        </SelectItem>
                                        <SelectItem
                                            onClick={() =>
                                                setSelectedLanguage('Python')
                                            }
                                            value="Python"
                                        >
                                            Python
                                        </SelectItem>
                                        <SelectItem
                                            onClick={() =>
                                                setSelectedLanguage('Java')
                                            }
                                            value="Java"
                                        >
                                            Java
                                        </SelectItem>
                                        <SelectItem
                                            onClick={() =>
                                                setSelectedLanguage('React')
                                            }
                                            value="React"
                                        >
                                            React
                                        </SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <ScrollArea className="h-dvh pr-4">
                        {questions.map((question) => {
                            const isSelected = selectedQuestions.some(
                                (selectedQuestion) =>
                                    selectedQuestion.id === question.id
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
                                                    stroke-width="2"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
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
                                    {/* {index !== questions.length - 1 && ( */}
                                    <Separator className="my-3" />
                                    {/* )} */}
                                </>
                            )
                        })}
                    </ScrollArea>
                </div>
                {/* <Separator orientation="vertical" /> */}
                <div className=" ml-5 pl-5 border-l-2 text-start">
                    <h2 className="font-semibold mb-5">
                        Selected Coding Problems
                    </h2>
                    <div>
                        {selectedQuestions.map((selectedQuestion, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-start mb-7"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">
                                            {selectedQuestion.title}
                                        </h3>
                                        <span className="font-semibold text-secondary">
                                            {selectedQuestion.difficulty}
                                        </span>
                                    </div>
                                    <p className=" text-gray-600 mt-1">
                                        {ellipsis(
                                            selectedQuestion.description,
                                            50
                                        )}
                                    </p>
                                    <Link
                                        href={''}
                                        className="text-sm font-semibold mt-1 text-secondary"
                                    >
                                        View Full Description
                                    </Link>
                                </div>
                                <XCircle
                                    className="text-destructive ml-5 cursor-pointer"
                                    size={20}
                                    onClick={() => {
                                        setSelectedQuestions([]) // Clear the selected questions when cross icon is clicked
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CodingProblemList
