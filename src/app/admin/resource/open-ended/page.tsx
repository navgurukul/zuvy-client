'use client'

// External imports
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

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
    DialogOverlay,
    DialogTrigger,
} from '@/components/ui/dialog'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/app/_components/datatable/data-table'
import { columns } from './column'
import NewOpenEndedQuestionForm from '@/app/admin/resource/_components/NewOpenEndedQuestionForm'
import {
    getCodingQuestionTags,
    getopenEndedQuestionstate,
    getOffset,
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
import { POSITION } from '@/utils/constant'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import CreatTag from '../_components/creatTag'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'

type Props = {}
export type Tag = {
    id: number
    tagName: string
}

interface Option {
    label: string
    value: string
}
interface OpenEndedQuestionType {
    id: number
    question: string
    difficulty: string
    tagId: number
    marks: number | null
    usage: number
}

const OpenEndedQuestions = (props: Props) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [selectedTag, setSelectedTag] = useState<Tag>(() => {
        if (typeof window !== 'undefined') {
            const storedTag = localStorage.getItem('openEndedCurrentTag')
            return storedTag !== null
                ? JSON.parse(storedTag)
                : { tagName: 'All Topics', id: -1 }
        }
        return { tagName: 'All Topics', id: -1 }
    })

    const { selectedOptions, setSelectedOptions } = getSelectedOpenEndedOptions()
    const [options, setOptions] = useState<Option[]>([
        { value: '-1', label: 'All Topics' },
    ])
    const { tags, setTags } = getCodingQuestionTags()
    const { difficulty, setDifficulty } = getOpenEndedDifficulty()
    const [allOpenEndedQuestions, setAllOpenEndedQuestions] = useState<OpenEndedQuestionType[]>([])
    const { openEndedQuestions, setOpenEndedQuestions } = getopenEndedQuestionstate()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [confirmedSearch, setConfirmedSearch] = useState('')
    const [newTopic, setNewTopic] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalOpenEndedQuestion, setTotalOpenEndedQuestion] = useState<any>(0)
    const [totalPages, setTotalPages] = useState(0)
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const { offset, setOffset } = getOffset()
    const position = useMemo(() => searchParams.get('limit') || POSITION, [searchParams])
    const [loading, setLoading] = useState(true)
    const selectedLanguage = ''
    const [suggestions, setSuggestions] = useState<OpenEndedQuestionType[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isSuggestionClicked, setIsSuggestionClicked] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [filtersInitialized, setFiltersInitialized] = useState(false)
    const [hasSetInitialTopicsFromURL, setHasSetInitialTopicsFromURL] = useState(false)

    // Debounced value for suggestions
    const debouncedSearchForSuggestions = useDebounce(searchTerm, 300)
    useEffect(() => {
        if (!options || options.length <= 1 || hasSetInitialTopicsFromURL) return

        const params = new URLSearchParams(window.location.search)

        // Search
        const urlSearch = params.get('search') || ''
        setSearchTerm(urlSearch)
        setConfirmedSearch(urlSearch)

        // Topics
        const topicsParam = params.get('topics')
        if (topicsParam) {
            const topicValues = topicsParam.split(',')
            const selectedTopics = topicValues
                .map(value => options.find(opt => opt.value === value))
                .filter(Boolean) as Option[]
            setSelectedOptions(selectedTopics.length > 0
                ? selectedTopics
                : [{ value: '-1', label: 'All Topics' }]
            )
        }

        // Difficulty
        const difficultyParam = params.get('difficulty')
        if (difficultyParam) {
            const difficultyValues = difficultyParam.split(',')
            const selectedDifficulties = difficultyValues
                .map(value => difficultyOptions.find(opt => opt.value === value))
                .filter(Boolean) as Option[]
            setDifficulty(selectedDifficulties.length > 0
                ? selectedDifficulties
                : [{ value: 'None', label: 'All Difficulty' }]
            )
        }

        // Tag from localStorage
        if (typeof window !== 'undefined') {
            const storedTag = localStorage.getItem('openEndedCurrentTag')
            if (storedTag) {
                setSelectedTag(JSON.parse(storedTag))
            }
        }

        setHasSetInitialTopicsFromURL(true)
        setFiltersInitialized(true)
    }, [options, hasSetInitialTopicsFromURL])

    // Update URL when filters change
    useEffect(() => {
        if (!filtersInitialized) return

        const params = new URLSearchParams(window.location.search)

        // Update topics
        if (!(selectedOptions.length === 1 && selectedOptions[0].value === '-1')) {
            const topicValues = selectedOptions.map(option => option.value).join(',')
            params.set('topics', topicValues)
        } else {
            params.delete('topics')
        }

        // Update difficulty
        if (!(difficulty.length === 1 && difficulty[0].value === 'None')) {
            const difficultyValues = difficulty.map(option => option.value).join(',')
            params.set('difficulty', difficultyValues)
        } else {
            params.delete('difficulty')
        }

        // Update search
        if (confirmedSearch) {
            params.set('search', confirmedSearch)
        } else {
            params.delete('search')
        }

        const newUrl = `?${params.toString()}`
        router.replace(newUrl)
    }, [selectedOptions, difficulty, confirmedSearch, filtersInitialized, router])

    // Handle suggestions with debouncing
    useEffect(() => {
        if (debouncedSearchForSuggestions.trim() !== '' && allOpenEndedQuestions.length > 0 && !isSuggestionClicked) {
            const filtered = allOpenEndedQuestions
                .filter((item: OpenEndedQuestionType) =>
                    item.question.toLowerCase().includes(debouncedSearchForSuggestions.toLowerCase())
                )
                .slice(0, 5)
            setSuggestions(filtered)
        } else {
            setSuggestions([])
        }
    }, [debouncedSearchForSuggestions, allOpenEndedQuestions, isSuggestionClicked])

    const fetchCodingQuestions = useCallback(
        async (offset: number) => {
            await filteredOpenEndedQuestions(
                (data: OpenEndedQuestionType[]) => {
                    if (confirmedSearch.trim()) {
                        const filtered = data.filter((item: OpenEndedQuestionType) =>
                            item.question.toLowerCase().includes(confirmedSearch.toLowerCase())
                        )
                        setOpenEndedQuestions(filtered)
                    } else {
                        setOpenEndedQuestions(data)
                    }
                },
                offset,
                position,
                difficulty,
                selectedOptions,
                setTotalOpenEndedQuestion,
                setLastPage,
                setTotalPages,
                confirmedSearch,
            )

            if (isSuggestionClicked) {
                setIsSuggestionClicked(false)
            }
        },
        [confirmedSearch, difficulty, selectedOptions, position, offset, isSuggestionClicked, setOpenEndedQuestions]
    )

    // Fetch questions when filters or confirmed search changes
    useEffect(() => {
        if (!filtersInitialized) return
        fetchCodingQuestions(offset)
    }, [confirmedSearch, difficulty, selectedOptions, offset, filtersInitialized, fetchCodingQuestions])

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    // Load all questions for suggestions
    useEffect(() => {
        getAllOpenEndedQuestions((data: OpenEndedQuestionType[]) => {
            setAllOpenEndedQuestions(data)
        })
    }, [])

    const handleTopicClick = (value: string) => {
        const tag = tags.find((t) => t.tagName === value) || { tagName: 'All Topics', id: -1 }
        setSelectedTag(tag)
        localStorage.setItem('openEndedCurrentTag', JSON.stringify(tag))
    }

    const handleNewTopicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewTopic(event.target.value)
    }

    const handleCreateTopic = async () => {
        try {
            const res = await api.post(`/Content/createTag`, { tagName: newTopic })
            toast.success({ title: `${newTopic} Topic created`, description: res.data.message })
            getAllTags(setTags, setOptions)
            setNewTopic('')
        } catch (error) {
            toast.error({ title: 'Network error', description: 'Unable to create topic.' })
        }
    }

    const selectedTagCount = selectedOptions.length
    const difficultyCount = difficulty.length

    const handleTagOption = (option: Option) => {
        if (option.value === '-1') {
            if (selectedOptions.some((item) => item.value === option.value)) {
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
                    setSelectedOptions(
                        selectedOptions.filter(
                            (selected) => selected.value !== option.value
                        )
                    )
                } else {
                    setSelectedOptions([...selectedOptions, option])
                }
            }
        }
    }

    const handleDifficulty = (option: Option) => {
        if (option.value === 'None') {
            if (difficulty.some((item) => item.value === option.value)) {
                const filteredDifficulty = difficulty.filter(
                    (item) => item.value !== option.value
                )
                setDifficulty(filteredDifficulty)
            } else {
                setDifficulty([option])
            }
        } else {
            if (difficulty.some((item) => item.value === 'None')) {
                setDifficulty([option])
            } else {
                if (difficulty.some((item) => item.value === option.value)) {
                    const filteredDifficulty = difficulty.filter(
                        (item) => item.value !== option.value
                    )
                    setDifficulty(filteredDifficulty)
                } else {
                    const filteredDifficulty = [...difficulty, option]
                    setDifficulty(filteredDifficulty)
                }
            }
        }
    }

    useEffect(() => {
        getAllTags(setTags, setOptions)
    }, [])

    // Clear all filters and search
    const clearSearch = () => {
        setSearchTerm('')
        setConfirmedSearch('')
        setShowSuggestions(false)
        setCurrentPage(1)
        searchInputRef.current?.focus()

        // Clear URL parameters
        router.replace(window.location.pathname)
    }

    // Handle Enter key in search
    const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setConfirmedSearch(searchTerm)
            setCurrentPage(1)
            setShowSuggestions(false)
            setIsSuggestionClicked(true)
        }
    }

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchTerm(value)
        setShowSuggestions(true)
        setIsSuggestionClicked(false)
    }

    const handleSuggestionClick = (question: string) => {
        setSearchTerm(question)
        setConfirmedSearch(question)
        setShowSuggestions(false)
        setIsSuggestionClicked(true)
        setCurrentPage(1)
    }

    useEffect(() => {
        const handleRouteChange = () => {
            // Reset filters on route change
            setSelectedOptions([{ value: '-1', label: 'All Topics' }])
            setDifficulty([{ value: 'None', label: 'All Difficulty' }])
            localStorage.removeItem('openEndedCurrentTag')
        }
    
        window.addEventListener('beforeunload', handleRouteChange)
        return () => {
            handleRouteChange() // manually call on unmount
            window.removeEventListener('beforeunload', handleRouteChange)
        }
    }, [])
    
    useEffect(() => {
        if (!filtersInitialized) return
    
        if (searchTerm.trim() === '' && confirmedSearch !== '') {
            setConfirmedSearch('')
            setCurrentPage(1)
    
            // Remove `search` from URL
            const params = new URLSearchParams(window.location.search)
            params.delete('search')
            const newUrl = `?${params.toString()}`
            router.replace(newUrl)
        }
    }, [searchTerm, filtersInitialized, confirmedSearch, router])
    
    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-[rgb(81,134,114)]" />
                </div>
            ) : (
                <div>
                    {allOpenEndedQuestions?.length > 0 ? (
                        <MaxWidthWrapper>
                            <h1 className="text-left font-semibold text-2xl text-gray-600">
                                Resource Library - Open-Ended-Questions
                            </h1>
                            <div className="flex justify-between">
                                <div className="relative w-full">
                                    <div className="relative w-1/4">
                                        <Input
                                            ref={searchInputRef}
                                            value={searchTerm}
                                            onChange={handleSearchInputChange}
                                            onKeyDown={handleSearchInputKeyDown}
                                            placeholder="Search Question"
                                            className="w-full p-2 my-6 input-with-icon pl-8"
                                            onFocus={() => searchTerm && setShowSuggestions(true)}
                                            onBlur={() => {
                                                setTimeout(() => setShowSuggestions(false), 200)
                                            }}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                            <Search className="text-gray-400" size={20} />
                                        </div>
                                        {searchTerm && (
                                            <button
                                                onClick={clearSearch}
                                                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-50 mt-1">
                                            <div className="bg-white border border-border rounded-md shadow-lg overflow-hidden">
                                                {suggestions.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onMouseDown={() => handleSuggestionClick(item.question)}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-left"
                                                    >
                                                        {item.question}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    </div>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="text-white bg-success-dark opacity-75 lg:max-w-[150px] w-full">
                                                <p>Create Topic</p>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogOverlay />
                                        <CreatTag
                                            newTopic={newTopic}
                                            handleNewTopicChange={handleNewTopicChange}
                                            handleCreateTopic={handleCreateTopic}
                                        />
                                    </Dialog>
                                    <Dialog
                                        onOpenChange={setIsDialogOpen}
                                        open={isDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button className='bg-success-dark opacity-75'> Create Question</Button>
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
                                                    setIsDialogOpen={setIsDialogOpen}
                                                    filteredOpenEndedQuestions={filteredOpenEndedQuestions}
                                                    setOpenEndedQuestions={setOpenEndedQuestions}
                                                />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
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
                            <h1 className="text-left font-semibold text-2xl text-gray-600">
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
                                                setIsDialogOpen={setIsDialogOpen}
                                                filteredOpenEndedQuestions={filteredOpenEndedQuestions}
                                                setOpenEndedQuestions={setOpenEndedQuestions}
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </MaxWidthWrapper>
                        </>
                    )}
                    <DataTablePagination
                        totalStudents={totalOpenEndedQuestion}
                        lastPage={lastPage}
                        pages={totalPages}
                        fetchStudentData={fetchCodingQuestions}
                    />
                </div>
            )}
        </>
    )
}

export default OpenEndedQuestions