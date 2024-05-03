import React from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import QuizList from './QuizList'

function QuizLibrary({
    activeTab,
    setActiveTab,
}: {
    activeTab: string
    setActiveTab: (tab: string) => void
}) {
    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
    }

    return (
        <div className="w-1/2 flex flex-col gap-3">
            <h2 className="text-left text-gray-700 font-semibold">
                MCQ Library
            </h2>
            <Input placeholder="Search By Name " className="w-full my-7 " />
            <div className="flex">
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Topics" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>All Topics</SelectLabel>
                            <SelectItem value="apple">Apple</SelectItem>
                            <SelectItem value="banana">Banana</SelectItem>
                            <SelectItem value="blueberry">Blueberry</SelectItem>
                            <SelectItem value="grapes">Grapes</SelectItem>
                            <SelectItem value="pineapple">Pineapple</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Separator
                    orientation="vertical"
                    className="mx-4 w-[2px] h-15 rounded "
                />

                <div className="flex items-start gap-x-4">
                    <Button
                        onClick={() => handleTabChange('anydifficulty')}
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
            <div className="w-full h-max-content my-6">
                {activeTab === 'anydifficulty' && <QuizList />}
                {activeTab === 'easy' && <QuizList />}
                {activeTab === 'medium' && <QuizList />}
                {activeTab === 'hard' && <QuizList />}
            </div>
        </div>
    )
}

export default QuizLibrary
