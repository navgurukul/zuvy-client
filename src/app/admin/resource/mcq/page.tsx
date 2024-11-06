'use client'

// External imports
import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, Search, Trash2 } from 'lucide-react'

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
import NewMcqForm from '../_components/NewMcqProblemForm'
import { api } from '@/utils/axios.config'
import {
    getAllQuizData,
    getCodingQuestionTags,
    getmcqdifficulty,
    getMcqSearch,
    handleMcqDelete,
} from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import BulkUploadMcq from '../_components/BulkUploadMcq'
import NewMcqProblemFormNew from '../_components/DummyForm'
import { getAllQuizQuestion } from '@/utils/admin'
import { Spinner } from '@/components/ui/spinner'
import MultiSelector from '@/components/ui/multi-selector'
import difficultyOptions from '@/app/utils'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { OFFSET, POSITION } from '@/utils/constant'
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
    const [position, setPosition] = useState(POSITION)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalMCQQuestion, setTotalMCQQuestion] = useState<any>(0)
    const [totalPages, setTotalPages] = useState(0)
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [offset, setOffset] = useState<number>(OFFSET)
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
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([
        { value: '-1', label: 'All Topics' },
    ])
    const [options, setOptions] = useState<Option[]>([
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
            const tagArr = [
                { id: -1, tagName: 'All Topics' },
                ...response.data.allTags,
            ]
            const transformedTags = tagArr.map(
                (item: { id: any; tagName: any }) => ({
                    id: item.id,
                    tagName: item.tagName,
                })
            )
            const transformedData = tagArr.map(
                (item: { id: any; tagName: any }) => ({
                    value: item.id.toString(),
                    label: item.tagName,
                })
            )

            setTags(transformedTags)
            setOptions(transformedData)
        }
    }

    const getAllQuizQuestion = useCallback(
        async (offset: number) => {
            try {
                const safeOffset = Math.max(0, offset)
                let url = `/Content/allQuizQuestions?limit=${position}&offset=${offset}`
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
                    url += `&${queryParams.join('&')}`
                }
                const res = await api.get(url)
                setStoreQuizData(res.data.data)
                setTotalMCQQuestion(res.data.totalRows)
                setTotalPages(res.data.totalPages)
                setLastPage(res.data.totalPages)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching quiz questions:', error)
            }
        },
        [
            offset,
            difficulty,
            debouncedSearch,
            setStoreQuizData,
            selectedOptions,
            setmcqSearch,
            setTotalMCQQuestion,
            position,
        ]
    )

    useEffect(() => {
        getAllTags()
    }, [])

    useEffect(() => {
        getAllQuizQuestion(offset)
    }, [getAllQuizQuestion, offset, position])

    const selectedTagCount = selectedOptions.length
    const difficultyCount = difficulty.length
    const transformedTags = tags?.map((tag) => ({
        id: +tag.value,
        tagName: tag.label,
    }))
    return (
        <>
            {isMcqModalOpen && (
                <div className=" ">
                    <div
                        className="flex cursor-pointer p-5 text-secondary"
                        onClick={() =>
                            setIsMcqModalOpen((prevState) => !prevState)
                        }
                    >
                        <ChevronLeft />
                        <h1>MCQ Problems</h1>
                    </div>
                    <div className="flex items-center justify-center w-full"></div>
                    <div className="flex flex-col items-center justify-center ">
                        <div>
                            <RadioGroup
                                className="flex flex-col items-center w-full  "
                                defaultValue="oneatatime"
                                onValueChange={(value) => setMcqType(value)}
                            >
                                <h1 className="text-xl mb-4 ml-4 font-semibold text-start w-[300px] justify-start ">
                                    New MCQ
                                </h1>
                                <div className="flex w-[300px] items-start justify-start ml-4 gap-3">
                                    <div className="flex  space-x-2">
                                        <RadioGroupItem
                                            value="bulk"
                                            id="r1"
                                            className="text-secondary mt-1"
                                        />
                                        <Label
                                            className="font-semibold text-md"
                                            htmlFor="r1"
                                        >
                                            Bulk
                                        </Label>
                                    </div>
                                    <div className="flex  space-x-2">
                                        <RadioGroupItem
                                            value="oneatatime"
                                            id="r2"
                                            className="text-secondary mt-1"
                                        />
                                        <Label
                                            className="font-semibold text-md"
                                            htmlFor="r2"
                                        >
                                            One At A Time
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                            {mcqType === 'bulk' ? (
                                <BulkUploadMcq />
                            ) : (
                                <div className="flex items-start justify-center w-screen ">
                                    <NewMcqForm
                                        tags={transformedTags}
                                        closeModal={closeModal}
                                        setStoreQuizData={setStoreQuizData}
                                        getAllQuizQuesiton={getAllQuizQuestion}
                                    />
                                    {/* <NewMcqProblemFormNew
                                    tags={tags}
                                    closeModal={closeModal}
                                    setStoreQuizData={setStoreQuizData}
                                    getAllQuizQuesiton={getAllQuizQuestion}
                                /> */}
                                </div>
                            )}
                        </div>
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
                        <div className="flex flex-row items-center gap-2">
                            <Button
                                onClick={() =>
                                    setIsMcqModalOpen((prevState) => !prevState)
                                }
                                className=""
                            >
                                + Create MCQ
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-full lg:w-[250px]">
                            <MultiSelector
                                selectedCount={difficultyCount}
                                options={difficultyOptions}
                                selectedOptions={difficulty}
                                handleOptionClick={handleDifficulty}
                                type={
                                    difficultyCount > 1
                                        ? 'Difficulties'
                                        : 'Difficulty'
                                }
                            />
                        </div>
                        <div className="w-full lg:w-[250px]">
                            <MultiSelector
                                selectedCount={selectedTagCount}
                                options={options}
                                selectedOptions={selectedOptions}
                                handleOptionClick={handleTagOption}
                                type={selectedTagCount > 1 ? 'Topics' : 'Topic'}
                            />
                        </div>
                    </div>

                    <DataTable data={quizData} columns={columns} />
                    <DataTablePagination
                        totalStudents={totalMCQQuestion}
                        position={position}
                        setPosition={setPosition}
                        pages={totalPages}
                        lastPage={lastPage}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        fetchStudentData={getAllQuizQuestion}
                        setOffset={setOffset}
                    />
                </MaxWidthWrapper>
            )}
        </>
    )
}

export default Mcqs
