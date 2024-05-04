import React, { useState } from 'react'

import Link from 'next/link'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { Separator } from '@/components/ui/separator'
import { ArrowUpRight, GripVertical, X, Plus } from 'lucide-react'
import QuizLibrary from './QuizLibrary'
interface QuizProps {
    content: Object
}

function Quiz({ content }: QuizProps) {
    const [activeTab, setActiveTab] = useState('anydifficulty')

    return (
        <>
            <div className="flex items-center gap-x-6 mb-10">
                <Input
                    placeholder="Untitled Quiz"
                    className="p-0 text-3xl text-left font-semibold outline-none border-none focus:ring-0 capitalize"
                />
                <Link className="text-secondary font-semibold flex" href={''}>
                    Preview
                    <ArrowUpRight />
                </Link>
            </div>

            <div className="flex gap-x-2">
                <QuizLibrary
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                <Separator
                    orientation="vertical"
                    className="mx-4 w-[2px] h-screen rounded "
                />
                <div>
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
        </>
    )
}

export default Quiz
