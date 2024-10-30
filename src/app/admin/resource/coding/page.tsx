'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, Search } from 'lucide-react'
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
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'

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
import { columns } from '@/app/admin/resource/coding/column'
import NewCodingProblemForm from '@/app/admin/resource/_components/NewCodingProblemForm'
import { api } from '@/utils/axios.config'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { OFFSET, POSITION } from '@/utils/constant'

import {
    getCodingQuestionTags,
    getEditCodingQuestionDialogs,
    getcodingQuestionState,
} from '@/store/store'
import {
    getAllCodingQuestions,
    filteredCodingQuestions,
    filterQuestions,
} from '@/utils/admin'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'
import EditCodingQuestionForm from '../_components/EditCodingQuestionForm'
import useDebounce from '@/hooks/useDebounce'
import MultiSelector from '@/components/ui/multi-selector'
import difficultyOptions from '@/app/utils'
// import CodingTopics from '../../courses/[courseId]/module/_components/codingChallenge/CodingTopics'
// import { POSITION } from '@/utils/constant'

export type Tag = {
    id: number
    tagName: string
}
// interface Option {
//     tagName: string
//     id: number
// }

interface Option {
    label: string
    value: string
}

const CodingProblems = () => {
    const { codingQuestions, setCodingQuestions } = getcodingQuestionState()
    const [allCodingQuestions, setAllCodingQuestions] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)
    const {
        setEditCodingQuestionId,
        isCodingEditDialogOpen,
        setIsCodingEditDialogOpen,
        isCodingDialogOpen,
        setIsCodingDialogOpen,
    } = getEditCodingQuestionDialogs()
    const { tags, setTags } = getCodingQuestionTags()
    const [selectedTag, setSelectedTag] = useState<Tag>(() => {
        if (typeof window !== 'undefined') {
            const storedTag = localStorage.getItem('codingCurrentTag')
            return storedTag !== null
                ? JSON.parse(storedTag)
                : { tagName: 'All Topics', id: -1 }
        }
        return { tagName: 'All Topics', id: -1 }
    })
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([
        // { id: -1, tagName: 'All Topics' },
        { value: '-1', label: 'All Topics' },
    ])
    const [selectedDifficulty, setSelectedDifficulty] = useState(['None'])
    const [difficulty, setDifficulty] = useState([
        { value: 'None', label: 'All Difficulty' },
    ])

    const [loading, setLoading] = useState(true)
    const [openEditDialog, setOpenEditDialog] = useState(false)
    const [position, setPosition] = useState(POSITION)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCodingQuestion, setTotalCodingQuestion] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [offset, setOffset] = useState<number>(OFFSET)

    const selectedLanguage = ''

    const handleTopicClick = (value: string) => {
        const tag = tags.find((t: Tag) => t.tagName === value) || {
            tagName: 'All Topics',
            id: -1,
        }
        setSelectedTag(tag)
        localStorage.setItem('codingCurrentTag', JSON.stringify(tag))
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

    useEffect(() => {
        getAllTags()
    }, [])

    const fetchCodingQuestions = useCallback(
        async (offset: number) => {
            filteredCodingQuestions(
                offset,
                setCodingQuestions,
                setTotalCodingQuestion,
                setLastPage,
                setTotalPages,
                difficulty,
                selectedOptions,
                debouncedSearch,
                position,
                selectedLanguage
            )
        },
        [
            searchTerm,
            selectedOptions,
            difficulty,
            // selectedDifficulty,
            debouncedSearch,
            isCodingDialogOpen,
            openEditDialog,
            position,
            offset,
        ]
    )

    useEffect(() => {
        getAllCodingQuestions(setAllCodingQuestions)
        fetchCodingQuestions(offset)
        // filteredCodingQuestions(
        //     offset,
        //     setCodingQuestions,
        //     difficulty,
        //     selectedOptions,
        //     selectedLanguage,
        //     debouncedSearch,
        //     position,
        //     setLastPage,
        //     setTotalPages,
        //     setTotalCodingQuestion
        // )
        // filterQuestions(
        //     setCodingQuestions,
        //     selectedDifficulty,
        //     selectedOptions,
        //     selectedLanguage,
        //     debouncedSearch,
        //     'coding'
        // )
    }, [
        searchTerm,
        selectedOptions,
        difficulty,
        // selectedDifficulty,
        debouncedSearch,
        isCodingDialogOpen,
        openEditDialog,
        position,
        offset,
    ])

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        setOpenEditDialog(isCodingEditDialogOpen)
    }, [isCodingEditDialogOpen])

    const selectedTagCount = selectedOptions.length
    const difficultyCount = difficulty.length

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-secondary" />
                </div>
            ) : openEditDialog ? (
                <EditCodingQuestionForm />
            ) : (
                <div>
                    {allCodingQuestions.length > 0 && !isCodingDialogOpen ? (
                        <MaxWidthWrapper>
                            <h1 className="text-left font-semibold text-2xl">
                                Resource Library - Coding Problems
                            </h1>
                            <div className="flex justify-between">
                                <div className="relative w-full">
                                    <Input
                                        placeholder="Problem Name..."
                                        className="w-1/4 p-2 my-6 input-with-icon pl-8"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <Search
                                            className="text-gray-400"
                                            size={20}
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setIsCodingDialogOpen(true)}
                                >
                                    + Create Problems
                                </Button>
                            </div>
                            {/* <CodingTopics
                                setSearchTerm={setSearchTerm}
                                searchTerm={searchTerm}
                                tags={tags}
                                selectedTopics={selectedOptions}
                                setSelectedTopics={setSelectedOptions}
                                selectedDifficulties={selectedDifficulty}
                                setSelectedDifficulties={setSelectedDifficulty}
                            /> */}
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

                            <DataTable
                                data={codingQuestions}
                                columns={columns}
                            />
                        </MaxWidthWrapper>
                    ) : (
                        <>
                            {!isCodingDialogOpen &&
                            !isCodingEditDialogOpen &&
                            codingQuestions.length === 0 ? (
                                <>
                                    <h1 className="text-left font-semibold text-2xl">
                                        Resource Library - Coding Problems
                                    </h1>
                                    <MaxWidthWrapper className="flex flex-col justify-center items-center gap-5">
                                        <div>
                                            <Image
                                                src="/resource_library_empty_state.svg"
                                                alt="Empty State"
                                                width={500}
                                                height={500}
                                            />
                                        </div>
                                        <h2>
                                            No coding problems have been created
                                            yet. Start by adding the first one
                                        </h2>
                                        <Button
                                            onClick={() =>
                                                setIsCodingDialogOpen(true)
                                            }
                                        >
                                            + Create Problems
                                        </Button>
                                    </MaxWidthWrapper>
                                </>
                            ) : (
                                <>
                                    {isCodingDialogOpen &&
                                        !isCodingEditDialogOpen && (
                                            <MaxWidthWrapper className="flex flex-col justify-center items-center gap-5">
                                                <div
                                                    onClick={() =>
                                                        setIsCodingDialogOpen(
                                                            false
                                                        )
                                                    }
                                                    className="text-secondary cursor-pointer self-start flex"
                                                >
                                                    {' '}
                                                    <ChevronLeft /> Coding
                                                    Problems
                                                </div>
                                                <NewCodingProblemForm
                                                    tags={tags}
                                                    setIsDialogOpen={
                                                        setIsCodingDialogOpen
                                                    }
                                                    getAllCodingQuestions={
                                                        getAllCodingQuestions
                                                    }
                                                    setCodingQuestions={
                                                        setCodingQuestions
                                                    }
                                                />
                                            </MaxWidthWrapper>
                                        )}
                                    {isCodingEditDialogOpen &&
                                        !isCodingDialogOpen && (
                                            <EditCodingQuestionForm />
                                        )}
                                </>
                            )}
                        </>
                    )}
                    <DataTablePagination
                        totalStudents={totalCodingQuestion}
                        position={position}
                        setPosition={setPosition}
                        pages={totalPages}
                        lastPage={lastPage}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        fetchStudentData={fetchCodingQuestions}
                        setOffset={setOffset}
                    />
                </div>
            )}
        </>
    )
}

export default CodingProblems
