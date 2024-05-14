import React, { useCallback, useEffect, useState } from 'react'
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
        // setSearch(' ')
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const questionSearchHandler = useCallback(
        async (difficulty: any) => {
            try {
                let endpoint = '/Content/allQuizQuestions'
                if (difficulty && difficulty !== 'anydifficulty') {
                    endpoint += `?difficulty=${difficulty}`
                    if (debouncedSeatch) {
                        endpoint += `&searchTerm=${debouncedSeatch}`
                    }
                } else if (debouncedSeatch) {
                    endpoint += `?searchTerm=${debouncedSeatch}`
                }

                const response = await api.get(endpoint)
                const allQuestions = response.data
                const easyQuestions = allQuestions.filter(
                    (question: any) => question.difficulty === 'Easy'
                )
                const mediumQuestions = allQuestions.filter(
                    (question: any) => question.difficulty === 'Medium'
                )
                const hardQuestions = allQuestions.filter(
                    (question: any) => question.difficulty === 'Hard'
                )
                setQuizData({
                    allQuestions,
                    easyQuestions,
                    mediumQuestions,
                    hardQuestions,
                })
            } catch (error) {
                console.error('Error searching quiz questions:', error)
            }
        },
        [debouncedSeatch]
    )

    const getQuizQuestionHandler = async () => {
        try {
            const response = await api.get(`/Content/allQuizQuestions`)
            const allQuestions = response.data
            const easyQuestions = allQuestions.filter(
                (question: any) => question.difficulty === 'Easy'
            )
            const mediumQuestions = allQuestions.filter(
                (question: any) => question.difficulty === 'Medium'
            )
            const hardQuestions = allQuestions.filter(
                (question: any) => question.difficulty === 'Hard'
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
    }

    useEffect(() => {
        getQuizQuestionHandler()
    }, [])
    useEffect(() => {
        questionSearchHandler(activeTab)
    }, [debouncedSeatch, questionSearchHandler, activeTab])

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
                        onClick={() => handleTabChange('Easy')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'Easy'
                                ? 'bg-secondary  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Easy
                    </Button>
                    <Button
                        onClick={() => handleTabChange('Medium')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'Medium'
                                ? 'bg-secondary  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Medium
                    </Button>
                    <Button
                        onClick={() => handleTabChange('Hard')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'Hard'
                                ? 'bg-secondary  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Hard
                    </Button>
                </div>
            </div>
            <div className="w-full h-max-content my-6">
                {activeTab === 'anydifficulty' && (
                    <QuizList
                        addQuestion={addQuestion}
                        handleAddQuestion={handleAddQuestion}
                        questionData={quizData.allQuestions}
                    />
                )}
                {activeTab === 'Easy' && (
                    <QuizList
                        addQuestion={addQuestion}
                        handleAddQuestion={handleAddQuestion}
                        questionData={quizData.easyQuestions}
                    />
                )}
                {activeTab === 'Medium' && (
                    <QuizList
                        addQuestion={addQuestion}
                        handleAddQuestion={handleAddQuestion}
                        questionData={quizData.mediumQuestions}
                    />
                )}
                {activeTab === 'Hard' && (
                    <QuizList
                        addQuestion={addQuestion}
                        handleAddQuestion={handleAddQuestion}
                        questionData={quizData.hardQuestions}
                    />
                )}
            </div>
        </div>
    )
}

export default QuizLibrary
