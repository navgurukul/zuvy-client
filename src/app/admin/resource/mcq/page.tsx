'use client'

// External imports
import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, Search } from 'lucide-react'

// Internal imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/app/_components/datatable/data-table'
import { columns } from './column'
import NewMcqProblemForm from '../_components/NewMcqProblemForm'
import { api } from '@/utils/axios.config'
import {
    getAllQuizData,
    getCodingQuestionTags,
    getmcqdifficulty,
    getMcqSearch,
} from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import BulkUploadMcq from '../_components/BulkUploadMcq'
import NewMcqProblemFormNew from '../_components/DummyForm'

type Props = {}
export type Tag = {
    id: number
    tagName: string
}

const Mcqs = (props: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 500)
    // const [difficulty, setDifficulty] = useState<string>('None')
    const [isMcqModalOpen, setIsMcqModalOpen] = useState<boolean>(false)
    const { tags, setTags } = getCodingQuestionTags()
    const { quizData, setStoreQuizData } = getAllQuizData()
    const { mcqDifficulty: difficulty, setMcqDifficulty: setDifficulty } =
        getmcqdifficulty()

    const [mcqType, setMcqType] = useState<string>('')

    const { setmcqSearch } = getMcqSearch()

    const [selectedTag, setSelectedTag] = useState<Tag>(() => {
        if (typeof window !== 'undefined') {
            const storedTag = localStorage.getItem('MCQCurrentTag')
            return storedTag !== null
                ? JSON.parse(storedTag)
                : { id: -1, tagName: 'All Topics' }
        }
        return { id: -1, tagName: 'All Topics' }
    })
    const [loading, setLoading] = useState(true)

    const handleTopicClick = (value: string) => {
        const tag = tags.find((t: Tag) => t.tagName === value) || {
            tagName: 'All Topics',
            id: -1,
        }
        setSelectedTag(tag)
        localStorage.setItem('MCQCurrentTag', JSON.stringify(tag))
    }

    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)
    const handleSetsearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    async function getAllTags() {
        const response = await api.get('Content/allTags')
        if (response) {
            const tagArr = [
                { id: -1, tagName: 'All Topics' },
                ...response.data.allTags,
            ]
            setTags(tagArr)
        }
    }

    const getAllQuizQuestion = useCallback(async () => {
        try {
            let url = `/Content/allQuizQuestions`
            setmcqSearch(debouncedSearch)

            const queryParams = []

            if (difficulty && difficulty !== 'None') {
                queryParams.push(`difficulty=${encodeURIComponent(difficulty)}`)
            }
            if (selectedTag.id !== -1) {
                queryParams.push(`tagId=${selectedTag.id}`)
            }
            if (debouncedSearch) {
                queryParams.push(
                    `searchTerm=${encodeURIComponent(debouncedSearch)}`
                )
            }

            if (queryParams.length > 0) {
                url += `?${queryParams.join('&')}`
            }

            const res = await api.get(url)
            setStoreQuizData(res.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching quiz questions:', error)
        }
    }, [
        difficulty,
        debouncedSearch,
        setStoreQuizData,
        selectedTag.id,
        setmcqSearch,
    ])

    useEffect(() => {
        getAllTags()
    }, [])

    useEffect(() => {
        getAllQuizQuestion()
    }, [getAllQuizQuestion])

    return (
        <>
            {isMcqModalOpen && (
                <div className="flex flex-col items-start ">
                    <div
                        className="flex cursor-pointer p-5 text-secondary"
                        onClick={() =>
                            setIsMcqModalOpen((prevState) => !prevState)
                        }
                    >
                        <ChevronLeft />
                        <h1>MCQ Problems</h1>
                    </div>
                    <h1 className="text-xl mb-4 text-center w-full items-start justify-start">
                        New MCQ
                    </h1>
                    <div className="flex flex-col items-center justify-center w-screen">
                        <RadioGroup
                            className="flex flex-col items-center w-1/2"
                            defaultValue="oneatatime"
                            onValueChange={(value) => setMcqType(value)}
                        >
                            <div className="flex w-1/3 items-start justify-start gap-3">
                                <div className="flex  space-x-2">
                                    <RadioGroupItem
                                        value="bulk"
                                        id="r1"
                                        className="text-secondary"
                                    />
                                    <Label htmlFor="r1">Bulk</Label>
                                </div>
                                <div className="flex  space-x-2">
                                    <RadioGroupItem
                                        value="oneatatime"
                                        id="r2"
                                        className="text-secondary"
                                    />
                                    <Label htmlFor="r2">One At A Time</Label>
                                </div>
                            </div>
                        </RadioGroup>

                        {mcqType === 'bulk' ? (
                            <BulkUploadMcq />
                        ) : (
                            <div className="flex items-center justify-center w-screen ">
                                {/* <NewMcqProblemForm
                                    tags={tags}
                                    closeModal={closeModal}
                                    setStoreQuizData={setStoreQuizData}
                                    getAllQuizQuesiton={getAllQuizQuestion}
                                /> */}
                                <NewMcqProblemFormNew
                                    tags={tags}
                                    closeModal={closeModal}
                                    setStoreQuizData={setStoreQuizData}
                                    getAllQuizQuesiton={getAllQuizQuestion}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
            {!isMcqModalOpen && (
                <MaxWidthWrapper>
                    <h1 className="text-left font-semibold text-2xl">
                        Resource Library - MCQs
                    </h1>
                    <div className="flex justify-between">
                        <div className="relative w-full">
                            <Input
                                value={search}
                                onChange={handleSetsearch}
                                placeholder="Search for Question"
                                className="w-1/4 p-2 my-6 input-with-icon pl-8"
                            />
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <Search className="text-gray-400" size={20} />
                            </div>
                        </div>
                        <Button
                            onClick={() =>
                                setIsMcqModalOpen((prevState) => !prevState)
                            }
                        >
                            + Create MCQ
                        </Button>
                    </div>
                    <div className="flex items-center">
                        <Select
                            onValueChange={(value: string) =>
                                setDifficulty(value)
                            }
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="None">
                                        Any Difficulty
                                    </SelectItem>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">
                                        Medium
                                    </SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Separator
                            orientation="vertical"
                            className="w-1 h-12 mx-4 bg-gray-400 rounded-lg"
                        />
                        <Select
                            value={selectedTag.tagName}
                            onValueChange={handleTopicClick}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Choose Topic" />
                            </SelectTrigger>
                            <SelectContent>
                                {tags.map((tag: Tag) => (
                                    <SelectItem
                                        key={tag.id}
                                        value={tag.tagName}
                                    >
                                        {tag.tagName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DataTable data={quizData} columns={columns} />
                </MaxWidthWrapper>
            )}
        </>
    )
}

export default Mcqs
