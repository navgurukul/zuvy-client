'use client'

// External imports
import React, { useCallback,useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import Image from 'next/image'

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
import NewOpenEndedQuestionForm from '@/app/admin/resource/_components/NewOpenEndedQuestionForm'
import { 
    getCodingQuestionTags, 
    getopenEndedQuestionstate ,
    getOffset,
    getPosition,
    getSelectedOpenEndedOptions,
    getOpenEndedDifficulty,

} from '@/store/store'
import {
    getAllOpenEndedQuestions,
    getAllTags,
    filteredOpenEndedQuestions,
} from '@/utils/admin'
import { Spinner } from '@/components/ui/spinner'
import useDebounce from '@/hooks/useDebounce'
import MultiSelector from '@/components/ui/multi-selector'
import difficultyOptions from '@/app/utils'
import { OFFSET, POSITION } from '@/utils/constant'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'


type Props = {}
export type Tag = {
    id: number
    tagName: string
}

interface Option {
    label: string
    value: string
}

const OpenEndedQuestions = (props: Props) => {
    const [selectedTag, setSelectedTag] = useState<Tag>(() => {
        if (typeof window !== 'undefined') {
            const storedTag = localStorage.getItem('openEndedCurrentTag')
            return storedTag !== null
                ? JSON.parse(storedTag)
                : { tagName: 'All Topics', id: -1 }
        }
        return { tagName: 'All Topics', id: -1 }
    })
    const { selectedOptions, setSelectedOptions } =  getSelectedOpenEndedOptions()
  
    const [options, setOptions] = useState<Option[]>([
        { value: '-1', label: 'All Topics' },
    ])
    const { tags, setTags } = getCodingQuestionTags()

    const {difficulty, setDifficulty} = getOpenEndedDifficulty()

    const [allOpenEndedQuestions, setAllOpenEndedQuestions] = useState([])
    const { openEndedQuestions, setOpenEndedQuestions } =
        getopenEndedQuestionstate()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    
    const [currentPage, setCurrentPage] = useState(1)
    const [totalOpenEndedQuestion,  setTotalOpenEndedQuestion] = useState <any>(0)
    const [totalPages, setTotalPages] = useState(0)
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const { offset, setOffset} = getOffset()
    const {position, setPosition} = getPosition()
    const debouncedSearch = useDebounce(searchTerm, 500)
    const [loading, setLoading] = useState(true)
    const selectedLanguage = ''

    const handleTopicClick = (value: string) => {
        const tag = tags.find((t: Tag) => t.tagName === value) || {
            tagName: 'All Topics',
            id: -1,
        }
        setSelectedTag(tag)
        localStorage.setItem('openEndedCurrentTag', JSON.stringify(tag))
    }

    const handleTagOption = (option: Option) => {
        if (option.value === '-1') {
            if (selectedOptions.some((item) => item.value === option.value)) {
                // setSelectedOptions((prev) =>
                //     prev.filter((selected) => selected.value !== option.value)
                // )
                setSelectedOptions(
                    selectedOptions.filter(
                        (selected) => selected.value !== option.value
                    )
                    
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
                    // setSelectedOptions((prev) =>
                    //     prev.filter(
                    //         (selected) => selected.value !== option.value
                    //     )
                    // )
                    setSelectedOptions(
                        selectedOptions.filter(
                            (selected) => selected.value !== option.value
                        )
                    )
                } else {
                    // setSelectedOptions((prev) => [...prev, option])
                    setSelectedOptions([...selectedOptions, option])
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
    console.log("potion",position)

    useEffect(() => {
        getAllTags(setTags, setOptions)
    }, [setTags])
    
    const fetchCodingQuestions = useCallback(
        async (offset: number) => {
            filteredOpenEndedQuestions(
                setOpenEndedQuestions,
                offset,
                position,
                difficulty,
                selectedOptions,
                setTotalOpenEndedQuestion,
                setLastPage,
                setTotalPages,
                debouncedSearch,
              
            )
        },
        [
            searchTerm,
            selectedOptions,
            difficulty,
            setOpenEndedQuestions,
            debouncedSearch,
            isDialogOpen,
            position,
            offset,
        ]
    )
    useEffect(() => {
        getAllOpenEndedQuestions(setAllOpenEndedQuestions)
        fetchCodingQuestions(offset)
     
    }, [
        searchTerm,
        selectedOptions,
        difficulty,
        setOpenEndedQuestions,
        // selectedDifficulty,
        debouncedSearch,
        isDialogOpen,
        position,
        offset,
    ])
    // useEffect(() => {
    //     getAllOpenEndedQuestions(setAllOpenEndedQuestions)
    //     filteredOpenEndedQuestions(
    //         offset,
    //         setOpenEndedQuestions,
    //         difficulty,
    //         selectedOptions,
    //         selectedLanguage,
    //         debouncedSearch,
    //         position
    // )
            
        
    // }, [
    //     searchTerm,
    //     selectedOptions,
    //     difficulty,
    //     setOpenEndedQuestions,
    //     debouncedSearch,
    // ])

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const selectedTagCount = selectedOptions.length
    const difficultyCount = difficulty.length

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-secondary" />
                </div>
            ) : (
                <div>
                    {allOpenEndedQuestions?.length > 0 ? (
                        <MaxWidthWrapper>
                            <h1 className="text-left font-semibold text-2xl">
                                Resource Library - Open-Ended-Questions
                            </h1>
                            <div className="flex justify-between">
                                <div className="relative w-full">
                                    <Input
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        placeholder="Search for Name, Email"
                                        className="w-1/4 p-2 my-6 input-with-icon pl-8" // Add left padding for the icon
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <Search
                                            className="text-gray-400"
                                            size={20}
                                        />
                                    </div>
                                </div>
                                <Dialog
                                    onOpenChange={setIsDialogOpen}
                                    open={isDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button> Create Question</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>
                                                New Open-Ended Questions
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="w-full">
                                            <NewOpenEndedQuestionForm
                                                tags={tags}
                                                setIsDialogOpen={
                                                    setIsDialogOpen
                                                }
                                                getAllOpenEndedQuestions={
                                                    getAllOpenEndedQuestions
                                                }
                                                setOpenEndedQuestions={
                                                    setOpenEndedQuestions
                                                }
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
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
                                        type={
                                            selectedTagCount > 1
                                                ? 'Topics'
                                                : 'Topic'
                                        }
                                    />
                                </div>
                            </div>

                            <DataTable
                                data={openEndedQuestions}
                                columns={columns}
                            />
                        </MaxWidthWrapper>
                    ) : (
                        <>
                            <h1 className="text-left font-semibold text-2xl">
                                Resource Library - Open-Ended-Questions
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
                                    No open-ended questions have been created
                                    yet. Start by adding the first one
                                </h2>
                                <Dialog
                                    onOpenChange={setIsDialogOpen}
                                    open={isDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button> Create Question</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>
                                                New Open-Ended Questions
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="w-full">
                                            <NewOpenEndedQuestionForm
                                                tags={tags}
                                                setIsDialogOpen={
                                                    setIsDialogOpen
                                                }
                                                getAllOpenEndedQuestions={
                                                    getAllOpenEndedQuestions
                                                }
                                                setOpenEndedQuestions={
                                                    setOpenEndedQuestions
                                                }
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </MaxWidthWrapper>
                        </>
                    )}
                      <DataTablePagination
                            totalStudents={totalOpenEndedQuestion}
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

export default OpenEndedQuestions
