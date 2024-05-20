import React, { useCallback, useEffect, useMemo, useState } from 'react'
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

import { api } from '@/utils/axios.config'
import useDebounce from '@/hooks/useDebounce'

export interface quizData {
    id: number
    question: string
    options: Options
    correctOption: string
    marks: number
    difficulty: string
    tagId: number
}

export interface Options {
    option1: string
    option2: string
    option3: string
    option4: string
}
function QuizLibrary({
    activeTab,
    setActiveTab,
    addQuestion,
    handleAddQuestion,
}: {
    activeTab: string
    setActiveTab: (tab: string) => void
    addQuestion: any
    handleAddQuestion: any
}) {
    const [search, setSearch] = useState<string>('')
    const debouncedSeatch = useDebounce(search, 1000)
    const [quizData, setQuizData] = useState<{
        allQuestions: quizData[]
        easyQuestions: quizData[]
        mediumQuestions: quizData[]
        hardQuestions: quizData[]
    }>({
        allQuestions: [],
        easyQuestions: [],
        mediumQuestions: [],
        hardQuestions: [],
    })
    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
        setSearch(e.target.value)

    const fetchQuizQuestions = useCallback(
        async (difficulty: string = '', searchTerm: string = '') => {
            try {
                let endpoint = '/Content/allQuizQuestions'
                const params = new URLSearchParams()
                if (difficulty && difficulty !== 'anydifficulty') {
                    params.append('difficulty', difficulty)
                }
                if (searchTerm) {
                    params.append('searchTerm', searchTerm)
                }

                const response = await api.get(
                    `${endpoint}?${params.toString()}`
                )
                const allQuestions: quizData[] = response.data

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
        []
    )

    useEffect(() => {
        fetchQuizQuestions()
    }, [fetchQuizQuestions])

    useEffect(() => {
        fetchQuizQuestions(activeTab, debouncedSeatch)
    }, [debouncedSeatch, fetchQuizQuestions, activeTab])

    const renderQuizList = useMemo(() => {
        const questionData =
            activeTab === 'Easy'
                ? quizData.easyQuestions
                : activeTab === 'Medium'
                ? quizData.mediumQuestions
                : activeTab === 'Hard'
                ? quizData.hardQuestions
                : quizData.allQuestions

        return (
            <QuizList
                addQuestion={addQuestion}
                handleAddQuestion={handleAddQuestion}
                questionData={questionData}
            />
        )
    }, [activeTab, quizData, addQuestion, handleAddQuestion])
    return (
        <div className="w-1/2 flex flex-col gap-3">
            <h2 className="text-left text-gray-700 font-semibold">
                MCQ Library
            </h2>
            <Input
                placeholder="Search the Question"
                onChange={handleSearch}
                value={search}
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
                    {['anydifficulty', 'Easy', 'Medium', 'Hard'].map((tab) => (
                        <Button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                                activeTab === tab
                                    ? 'bg-secondary text-white'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            {tab === 'anydifficulty' ? 'Any Difficulty' : tab}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="w-full h-max-content my-6">{renderQuizList}</div>
        </div>
    )
}

export default QuizLibrary
