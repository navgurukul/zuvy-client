'use client'

// External imports
import React, { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'

// Internal imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/app/_components/datatable/data-table'
import { columns } from './column'
import NewMcqProblemForm from '../_components/NewMcqProblemForm'
import { api } from '@/utils/axios.config'
import { getAllQuizData, getCodingQuestionTags } from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import { getAllQuizQuestion } from '@/utils/admin'
import { Spinner } from '@/components/ui/spinner'

type Props = {}
export type Tag = {
    id: number
    tagName: string
}

const Mcqs = (props: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 500)
    const [difficulty, setDifficulty] = useState<string>('None')
    const { tags, setTags } = getCodingQuestionTags()
    const { quizData, setStoreQuizData } = getAllQuizData()
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

            console.log(url)
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
    }, [difficulty, debouncedSearch, setStoreQuizData, selectedTag.id])

    useEffect(() => {
        getAllTags()
    }, [])

    useEffect(() => {
        getAllQuizQuestion()
    }, [getAllQuizQuestion])

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-secondary" />
                </div>
            ) : (
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
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button>+ Create MCQ</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>New MCQ</DialogTitle>
                                </DialogHeader>
                                <div className="w-full">
                                    <NewMcqProblemForm
                                        tags={tags}
                                        closeModal={closeModal}
                                        setStoreQuizData={setStoreQuizData}
                                        getAllQuizQuesiton={getAllQuizQuestion}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
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
