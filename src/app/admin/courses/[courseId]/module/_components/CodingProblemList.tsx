'use client'

import { FolderSymlink, PlusCircle, XCircle, FolderCheck } from 'lucide-react'
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
        description: 'Power Calculator is a simple coding problem meant to....',
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
        <>
            <div className="headingContainer flex ">
                <h2 className="w-1/2 font-bold text-xl">
                    Untitled Coding Problem
                </h2>
                <h6 className="mr-2">Preview</h6>
                <FolderSymlink className="text-secondary" />
            </div>
            <div className="container flex w-full">
                <div className="leftSideContainer w-3/6">
                    <div className="flex flex-col m-5">
                        <h2 className="text-left text-gray-700 font-semibold">
                            Coding Problem Library
                        </h2>
                        <Input
                            placeholder="Search By Name "
                            className="w-full my-7 "
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
                    {questions.map((question) => {
                        const isSelected = selectedQuestions.some(
                            (selectedQuestion) =>
                                selectedQuestion.id === question.id
                        )
                        return (
                            <div
                                key={question.id}
                                className={`question mb-7 ${
                                    isSelected ? 'bg-gray-200' : ''
                                }`}
                            >
                                <div className="flex justify-between text-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="font-bold text-lg">
                                                {question.title}
                                            </h2>
                                            <span className="font-semibold text-secondary">
                                                {question.difficulty}
                                            </span>
                                        </div>
                                        <div className="w-full">
                                            <p className="description text-left font-semibold text-gray-600 mt-1">
                                                {question.description}
                                            </p>
                                        </div>
                                        <Link
                                            href={''}
                                            className="description font-semibold mt-2 text-secondary"
                                        >
                                            {`View Full Description`}
                                        </Link>
                                    </div>
                                    {isSelected ? (
                                        <FolderCheck
                                            className="text-primary"
                                            size={16}
                                        />
                                    ) : (
                                        <PlusCircle
                                            onClick={() => {
                                                setSelectedQuestions([question])
                                            }}
                                            className="text-secondary cursor-pointer"
                                            size={16}
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="rightSideContainer ml-5 border-l-2 p-5 text-start">
                    <h2 className="font-bold text-lg self-start mb-5">
                        Selected Coding Problems
                    </h2>
                    <div>
                        {selectedQuestions.map((selectedQuestion, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-start mb-7"
                            >
                                <div>
                                    <h3 className="font-bold text-lg">
                                        {selectedQuestion.title}
                                    </h3>
                                    <span className="font-semibold text-secondary">
                                        {selectedQuestion.difficulty}
                                    </span>
                                    <p className="description text-left font-semibold text-gray-600 mt-1">
                                        {selectedQuestion.description}
                                    </p>
                                    <Link
                                        href={''}
                                        className="description font-semibold mt-1 text-secondary"
                                    >
                                        {`View Full Description`}
                                    </Link>
                                </div>
                                <XCircle
                                    className="text-secondary ml-5 cursor-pointer"
                                    size={16}
                                    onClick={() => {
                                        setSelectedQuestions([]) // Clear the selected questions when cross icon is clicked
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default CodingProblemList
