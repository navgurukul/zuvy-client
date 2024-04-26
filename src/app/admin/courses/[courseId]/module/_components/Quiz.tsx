import React, { useState } from 'react'

import Link from 'next/link'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, GripVertical, X, Plus } from 'lucide-react'
interface QuizProps {
    content: Object
}

function Quiz({ content }: QuizProps) {
    const [activeTab, setActiveTab] = useState('anydifficulty')

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
    }
    return (
        <div className="mx-7">
            <div className="flex items-center gap-x-6 mb-10">
                <Input
                    placeholder="Untitled Quiz"
                    className="w-2/5 text-2xl text-left font-semibold border-0 bg-gray-100 rounded-md py-2 px-4   focus:outline-none"
                />
                <Link className="text-secondary font-semibold flex" href={''}>
                    Preview
                    <ArrowUpRight />
                </Link>
            </div>
            <h1 className="text-left text-gray-700 font-semibold my-6">
                MCQ Library
            </h1>
            <div className="flex gap-x-2 w-[1100px]">
                <div className="w-1/2 flex flex-col gap-3">
                    <Input
                        placeholder="Search By Name "
                        className="w-full my-7 "
                    />
                    <div className="flex">
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Topics" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>All Topics</SelectLabel>
                                    <SelectItem value="apple">Apple</SelectItem>
                                    <SelectItem value="banana">
                                        Banana
                                    </SelectItem>
                                    <SelectItem value="blueberry">
                                        Blueberry
                                    </SelectItem>
                                    <SelectItem value="grapes">
                                        Grapes
                                    </SelectItem>
                                    <SelectItem value="pineapple">
                                        Pineapple
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Separator
                            orientation="vertical"
                            className="mx-4 w-[2px] h-15 rounded "
                        />
                        <div className="w-full">
                            <div className="flex ml-5 items-start gap-x-4">
                                <Button
                                    onClick={() =>
                                        handleTabChange('anydifficulty')
                                    }
                                    className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                                        activeTab === 'anydifficulty'
                                            ? 'bg-secondary  text-white'
                                            : 'bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    Any Difficulty
                                </Button>
                                <Button
                                    onClick={() => handleTabChange('easy')}
                                    className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                                        activeTab === 'easy'
                                            ? 'bg-secondary  text-white'
                                            : 'bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    Easy
                                </Button>
                                <Button
                                    onClick={() => handleTabChange('medium')}
                                    className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                                        activeTab === 'medium'
                                            ? 'bg-secondary  text-white'
                                            : 'bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    Medium
                                </Button>
                                <Button
                                    onClick={() => handleTabChange('hard')}
                                    className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                                        activeTab === 'hard'
                                            ? 'bg-secondary  text-white'
                                            : 'bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    Hard
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="w-full my-6">
                        {activeTab === 'anydifficulty' && (
                            <div className="flex justify-between">
                                <div className="flex gap-x-4 ">
                                    <h1 className="text-left font-semibold text-gray-600 ">
                                        Using Which Block can we rotate the
                                        block ?
                                    </h1>
                                    <span className="font-semibold text-secondary">
                                        Easy
                                    </span>
                                </div>
                                <Plus className="text-secondary" />
                            </div>
                        )}
                        {activeTab === 'easy' && (
                            <div className="flex justify-between">
                                <div className="flex gap-x-4 ">
                                    <h1 className="text-left font-semibold text-gray-600 ">
                                        Using Which Block can we rotate the
                                        block ?
                                    </h1>
                                    <span className="font-semibold text-secondary">
                                        Easy
                                    </span>
                                </div>
                                <Plus className="text-secondary" />
                            </div>
                        )}
                        {activeTab === 'medium' && (
                            <div className="flex justify-between">
                                <div className="flex gap-x-4 ">
                                    <h1 className="text-left font-semibold text-gray-600 ">
                                        Using Which Block can we rotate the
                                        block ?
                                    </h1>
                                    <span className="font-semibold text-yellow">
                                        Medium
                                    </span>
                                </div>
                                <Plus className="text-secondary" />
                            </div>
                        )}
                        {activeTab === 'hard' && (
                            <div className="flex justify-between">
                                <div className="flex gap-x-4 ">
                                    <h1 className="text-left font-semibold text-gray-600 ">
                                        Using Which Block can we rotate the
                                        block ?
                                    </h1>
                                    <span className="font-semibold text-destructive">
                                        Hard
                                    </span>
                                </div>
                                <Plus className="text-secondary" />
                            </div>
                        )}
                    </div>
                </div>
                {/* <div></div> */}
                <Separator
                    orientation="vertical"
                    className="mx-4 w-[2px] h-screen rounded "
                />
                <div className="w-600px">
                    <h1 className="text-left font-semibold">
                        Selected Questions
                    </h1>
                    <div className="gap-y-4 flex flex-col ">
                        <h1 className="text-left font-semibold">
                            Question Text
                        </h1>
                        <div className="flex w-full">
                            <div className="border-2 w-full text-left border-gray-400 rounded-lg p-2">
                                <p>
                                    Using which block can we rotate the sprite ?
                                </p>
                            </div>
                            <div className="flex flex-col">
                                <X className="text-gray-400" />
                                <GripVertical className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <div className="w-full mt-6">
                        {' '}
                        {content &&
                            (
                                content as {
                                    id: number
                                    question: string
                                    options: string[]
                                    correctOption: string
                                }[]
                            )?.map(
                                (
                                    { id, question, options, correctOption },
                                    index
                                ) => {
                                    return (
                                        <div
                                            key={id}
                                            className="text-start mb-5"
                                        >
                                            <p>
                                                Q{index + 1}. {question}
                                            </p>
                                            <ul className="text-start">
                                                {Object.entries(options).map(
                                                    ([key, value]) => {
                                                        return (
                                                            <li
                                                                key={key}
                                                                className={cn(
                                                                    'rounded-sm my-1 p-2',
                                                                    correctOption ===
                                                                        key.toString()
                                                                        ? 'bg-secondary text-white'
                                                                        : ''
                                                                )}
                                                            >
                                                                {value}
                                                            </li>
                                                        )
                                                    }
                                                )}
                                            </ul>
                                        </div>
                                    )
                                }
                            )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Quiz
