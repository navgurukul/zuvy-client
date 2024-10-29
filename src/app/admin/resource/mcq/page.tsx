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
import {
    getAllQuizData,
    getCodingQuestionTags,
    getmcqdifficulty,
    getMcqSearch,
} from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import { getAllQuizQuestion } from '@/utils/admin'
import { Spinner } from '@/components/ui/spinner'
import MultiSelector from '@/components/ui/multi-selector'
import difficultyOptions from '@/app/utils'

type Props = {}
export type Tag = {
    label: string
    value: string
    id: number
    tagName: string
}

interface Option {
    label: string
    value: string
}

const Mcqs = (props: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 500)
    // const [difficulty, setDifficulty] = useState<string>('None')
    const { tags, setTags } = getCodingQuestionTags()
    const { quizData, setStoreQuizData } = getAllQuizData()
    const { mcqDifficulty: difficulty, setMcqDifficulty: setDifficulty } =
        getmcqdifficulty()
    const { setmcqSearch } = getMcqSearch()
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([
        { value: '-1', label: 'All Topics' },
    ])

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

    const handleTagOption = (option: Option) => {
        if (option.value === '-1') {
            if (selectedOptions.some((item) => item.value === option.value)) {
                setSelectedOptions((prev) =>
                    prev.filter((selected) => selected.value !== option.value)
                )
            } else {
                setSelectedOptions([option])
            }
        } else {
            if (selectedOptions.some((item) => item.value === '-1')) {
                setSelectedOptions([option])
            } else {
                if (
                    selectedOptions.some(
                        (selected) => selected.value === option.value
                    )
                ) {
                    setSelectedOptions((prev) =>
                        prev.filter(
                            (selected) => selected.value !== option.value
                        )
                    )
                } else {
                    setSelectedOptions((prev) => [...prev, option])
                }
            }
        }
    }

    const handleDifficulty = (option: Option) => {
        // When user selects All Difficulty
        if (option.value === 'None') {
            // It will check if the user has already selected All Difficulty or not
            if (difficulty.some((item) => item.value === option.value)) {
                // If All Difficulty is already selected it will remove
                const filteredDifficulty = difficulty.filter(
                    (item) => item.value !== option.value
                )
                setDifficulty(filteredDifficulty)
            } else {
                // If user selects All Difficulty when it is not already selected,
                // Rest other difficulties will be removed and only All Difficulty will be added in the array
                setDifficulty([option])
            }
        } else {
            // When user selects other Difficulties
            if (difficulty.some((item) => item.value === 'None')) {
                // When All Difficulty is already selected and user selects other difficulties
                // then All Difficulty will be removed and new difficulty will be added to the list
                setDifficulty([option])
            } else {
                if (difficulty.some((item) => item.value === option.value)) {
                    // Removing other difficulty when already selected
                    const filteredDifficulty = difficulty.filter(
                        (item) => item.value !== option.value
                    )
                    setDifficulty(filteredDifficulty)
                } else {
                    // Add other difficulties
                    const filteredDifficulty = [...difficulty, option]
                    setDifficulty(filteredDifficulty)
                }
            }
        }
    }

    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)
    const handleSetsearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    async function getAllTags() {
        const response = await api.get('Content/allTags')
        if (response) {
            const transformedData = response.data.allTags.map(
                (item: { id: any; tagName: any }) => ({
                    value: item.id.toString(),
                    label: item.tagName,
                })
            )
            const tagArr = [
                { value: '-1', label: 'All Topics' },
                ...transformedData,
            ]
            setTags(tagArr)
        }
    }

    const getAllQuizQuestion = useCallback(async () => {
        try {
            let url = `/Content/allQuizQuestions`
            setmcqSearch(debouncedSearch)
            let selectedTagIds = ''
            selectedOptions.map(
                (item: any) => (selectedTagIds += '&tagId=' + item.value)
            )

            let selectedDiff = ''
            difficulty.map(
                (item: any) => (selectedDiff += '&difficulty=' + item.value)
            )

            const queryParams = []

            if (difficulty.length > 0) {
                if (difficulty[0].value !== 'None') {
                    queryParams.push(selectedDiff.substring(1))
                }
            }
            if (selectedTagIds.length > 0) {
                if (selectedOptions[0].value !== '-1') {
                    queryParams.push(selectedTagIds.substring(1))
                }
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
            setStoreQuizData(res.data.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching quiz questions:', error)
        }
    }, [
        difficulty,
        debouncedSearch,
        setStoreQuizData,
        selectedTag.id,
        selectedOptions,
        setmcqSearch,
    ])

    useEffect(() => {
        getAllTags()
    }, [])

    useEffect(() => {
        getAllQuizQuestion()
    }, [getAllQuizQuestion])

    const selectedTagCount = selectedOptions.length
    const difficultyCount = difficulty.length

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
                        <div className="w-full lg:w-[250px]">
                            <MultiSelector
                                selectedCount={difficultyCount}
                                options={difficultyOptions}
                                selectedOptions={difficulty}
                                handleOptionClick={handleDifficulty}
                            />
                        </div>
                        <Separator
                            orientation="vertical"
                            className="w-1 h-12 mx-4 bg-gray-400 rounded-lg"
                        />
                        <div className="w-full lg:w-[250px]">
                            <MultiSelector
                                selectedCount={selectedTagCount}
                                options={tags}
                                selectedOptions={selectedOptions}
                                handleOptionClick={handleTagOption}
                            />
                        </div>
                    </div>

                    <DataTable data={quizData} columns={columns} />
                </MaxWidthWrapper>
            )}
        </>
    )
}

export default Mcqs
