'use client'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { ChevronLeft, Search, X } from 'lucide-react'
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
    DialogOverlay,
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
    getSelectedOptions,
    getDifficulty,
    getOffset,
    getPosition,
} from '@/store/store'
import {
    getAllCodingQuestions,
    filteredCodingQuestions,
} from '@/utils/admin'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'
import EditCodingQuestionForm from '../_components/EditCodingQuestionForm'
import MultiSelector from '@/components/ui/multi-selector'
import difficultyOptions from '@/app/utils'
import CreatTag from '../_components/creatTag'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import useDebounce from '@/hooks/useDebounce'

export type Tag = {
    id: number
    tagName: string
}

interface Option {
    label: string
    value: string
}

interface SearchSuggestion {
    id: number
    title: string
    difficulty: string
}

const CodingProblems = () => {
    const router = useRouter();
    const { codingQuestions, setCodingQuestions } = getcodingQuestionState()
    const [allCodingQuestions, setAllCodingQuestions] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [confirmedSearch, setConfirmedSearch] = useState('')
    const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [areOptionsLoaded, setAreOptionsLoaded] = useState(false)
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    const {
        isCodingEditDialogOpen,
        setIsCodingEditDialogOpen,
        isCodingDialogOpen,
        setIsCodingDialogOpen,
    } = getEditCodingQuestionDialogs()
    const { tags, setTags } = getCodingQuestionTags()
    const { selectedOptions, setSelectedOptions } = getSelectedOptions()
    const [options, setOptions] = useState<Option[]>([
        { value: '-1', label: 'All Topics' },
    ])
    const { difficulty, setDifficulty } = getDifficulty()

    // const activeFiltersCount = getActiveFiltersCount()
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCodingQuestion, setTotalCodingQuestion] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const { offset, setOffset } = getOffset()
    const { position, setPosition } = getPosition()
    const [newTopic, setNewTopic] = useState<string>('')
    const [urlInitialized, setUrlInitialized] = useState(false)

    // First, load all tags and options
    async function getAllTags() {
        try {
            const response = await api.get('Content/allTags')
            const tagArr = [
                { id: -1, tagName: 'All Topics' },
                ...response.data.allTags,
            ]

            const transformedData = tagArr.map((item: { id: any; tagName: any }) => ({
                value: item.id.toString(),
                label: item.tagName,
            }))

            setTags(tagArr.map(item => ({ id: item.id, tagName: item.tagName })))
            setOptions(transformedData)
            setAreOptionsLoaded(true)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch tags',
                variant: 'destructive',
            })
        }
    }

    // Initialize from URL - this runs ONCE when component mounts
    const initializeFromURL = useCallback(() => {
        if (!areOptionsLoaded || urlInitialized) return

        const urlParams = new URLSearchParams(window.location.search)

        // Initialize search
        const urlSearch = urlParams.get('search') || ''
        setSearchTerm(urlSearch)
        setConfirmedSearch(urlSearch)

        // Initialize topics
        const urlTopics = urlParams.get('topics')
        if (urlTopics) {
            const topicIds = urlTopics.split(',')
            const matchedOptions = topicIds
                .map(id => options.find(opt => opt.value === id))
                .filter(Boolean) as Option[]

            if (matchedOptions.length > 0) {
                setSelectedOptions(matchedOptions)
            } else {
                setSelectedOptions([{ value: '-1', label: 'All Topics' }])
            }
        } else {
            setSelectedOptions([{ value: '-1', label: 'All Topics' }])
        }

        // Initialize difficulty
        const urlDifficulty = urlParams.get('difficulty')
        if (urlDifficulty) {
            const difficultyValues = urlDifficulty.split(',')
            const matchedDifficulties = difficultyValues
                .map(val => difficultyOptions.find(opt => opt.value === val))
                .filter(Boolean) as Option[]

            if (matchedDifficulties.length > 0) {
                setDifficulty(matchedDifficulties)
            } else {
                setDifficulty([{ value: 'None', label: 'All Difficulty' }])
            }
        } else {
            setDifficulty([{ value: 'None', label: 'All Difficulty' }])
        }

        setUrlInitialized(true)
    }, [areOptionsLoaded, options, urlInitialized])

    // Initialize everything on mount
    useEffect(() => {
        getAllTags()
        setIsCodingDialogOpen(false)
        setIsCodingEditDialogOpen(false)
    }, [])

    // Initialize from URL when options are loaded
    useEffect(() => {
        initializeFromURL()
    }, [initializeFromURL])

    // Update URL when filters change - but only after URL is initialized
    useEffect(() => {
        if (!urlInitialized) return

        const params = new URLSearchParams()

        // Update search
        if (confirmedSearch) {
            params.set('search', confirmedSearch)
        }

        // Update topics
        if (selectedOptions.length > 0 && !selectedOptions.some(opt => opt.value === '-1')) {
            const topicValues = selectedOptions.map(opt => opt.value).join(',')
            params.set('topics', topicValues)
        }

        // Update difficulty
        if (difficulty.length > 0 && !difficulty.some(opt => opt.value === 'None')) {
            const difficultyValues = difficulty.map(opt => opt.value).join(',')
            params.set('difficulty', difficultyValues)
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`
        const currentUrl = `${window.location.pathname}${window.location.search}`

        if (newUrl !== currentUrl) {
            router.replace(newUrl)
        }
    }, [confirmedSearch, selectedOptions, difficulty, router, urlInitialized])

    // Generate search suggestions (debounced)
    useEffect(() => {
        if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
            setSearchSuggestions([])
            return
        }

        const suggestions = allCodingQuestions
            .filter((question: any) =>
                question.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            )
            .slice(0, 8)
            .map((question: any) => ({
                id: question.id,
                title: question.title,
                difficulty: question.difficulty
            }))

        setSearchSuggestions(suggestions)
    }, [debouncedSearchTerm, allCodingQuestions])

    const handleTagOption = (option: Option) => {
        if (option.value === '-1') {
            setSelectedOptions([option])
        } else {
            if (selectedOptions.some(item => item.value === '-1')) {
                setSelectedOptions([option])
            } else {
                if (selectedOptions.some(selected => selected.value === option.value)) {
                    setSelectedOptions(
                        selectedOptions.filter(selected => selected.value !== option.value)
                    )
                } else {
                    setSelectedOptions([...selectedOptions, option])
                }
            }
        }
    }

    const handleDifficulty = (option: Option) => {
        if (option.value === 'None') {
            setDifficulty([option])
        } else {
            if (difficulty.some(item => item.value === 'None')) {
                setDifficulty([option])
            } else {
                if (difficulty.some(item => item.value === option.value)) {
                    setDifficulty(
                        difficulty.filter(item => item.value !== option.value)
                    )
                } else {
                    setDifficulty([...difficulty, option])
                }
            }
        }
    }

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setShowSuggestions(true)
    }

    const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setConfirmedSearch(searchTerm)
            setShowSuggestions(false)
            setOffset(0)
            setCurrentPage(1)
        }
    }

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setSearchTerm(suggestion.title)
        setConfirmedSearch(suggestion.title)
        setShowSuggestions(false)
        setOffset(0)
        setCurrentPage(1)
    }

    const handleSearchFocus = () => {
        setIsSearchFocused(true)
        if (searchTerm.length > 0) setShowSuggestions(true)
    }

    const handleSearchBlur = () => {
        setTimeout(() => setShowSuggestions(false), 200)
    }

    // Clear ALL filters (search, topics, difficulty)
    const clearAllFilters = () => {
        setSearchTerm('')
        setConfirmedSearch('')
        setSelectedOptions([{ value: '-1', label: 'All Topics' }])
        setDifficulty([{ value: 'None', label: 'All Difficulty' }])
        setShowSuggestions(false)
        setOffset(0)
        setCurrentPage(1)
    }

    const fetchCodingQuestions = useCallback(
        async (offset: number) => {
            try {
                await filteredCodingQuestions(
                    setCodingQuestions,
                    offset,
                    position,
                    difficulty,
                    selectedOptions,
                    setTotalCodingQuestion,
                    setLastPage,
                    setTotalPages,
                    confirmedSearch,
                    ''
                )
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch questions',
                    variant: 'destructive',
                })
            }
        },
        [confirmedSearch, selectedOptions, difficulty, position, offset]
    )

    // Fetch data only after URL is initialized
    useEffect(() => {
        if (!urlInitialized) return

        const fetchData = async () => {
            await getAllCodingQuestions(setAllCodingQuestions)
            await fetchCodingQuestions(offset)
        }
        fetchData()
    }, [confirmedSearch, selectedOptions, difficulty, offset, urlInitialized, fetchCodingQuestions])

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    const getActiveFiltersCount = () => {
        let count = 0
        if (selectedOptions.length > 0 && !selectedOptions.some(opt => opt.value === '-1')) count++
        if (difficulty.length > 0 && !difficulty.some(diff => diff.value === 'None')) count++
        if (confirmedSearch) count++
        return count
    }

    const activeFiltersCount = getActiveFiltersCount()
    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-secondary" />
                </div>
            ) : isCodingEditDialogOpen ? (
                <EditCodingQuestionForm />
            ) : (
                <div>
                    {allCodingQuestions.length > 0 && !isCodingDialogOpen ? (
                        <MaxWidthWrapper>
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-left font-semibold text-2xl">
                                    Resource Library - Coding Problems
                                </h1>
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="relative w-full max-w-md">
                                    <div className="relative">
                                        <Input
                                            placeholder="Search problem name..."
                                            className="w-full p-2 pl-8 pr-8"
                                            value={searchTerm}
                                            onChange={handleSearchInputChange}
                                            onFocus={handleSearchFocus}
                                            onBlur={handleSearchBlur}
                                            onKeyDown={handleSearchInputKeyDown}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                            <Search className="text-gray-400" size={20} />
                                        </div>
                                        {(searchTerm || activeFiltersCount > 0) && (
                                            <button
                                                onClick={clearAllFilters}
                                                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                    {showSuggestions && searchSuggestions.length > 0 && (
                                        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                                            {searchSuggestions.map((suggestion) => (
                                                <div
                                                    key={suggestion.id}
                                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                                                    onMouseDown={() => handleSuggestionClick(suggestion)}
                                                >
                                                    <p className="text-sm font-medium text-gray-900 truncate text-left">
                                                        {suggestion.title}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>

                                <div className="flex flex-row items-center gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="text-white bg-secondary lg:max-w-[150px] w-full">
                                                <p>Create Topic</p>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogOverlay />
                                        <CreatTag
                                            newTopic={newTopic}
                                            handleNewTopicChange={(e) => setNewTopic(e.target.value)}
                                            handleCreateTopic={() => {
                                                api.post(`/Content/createTag`, { tagName: newTopic })
                                                    .then(() => {
                                                        toast({ title: 'Success', description: `${newTopic} topic created` })
                                                        getAllTags()
                                                        setNewTopic('')
                                                    })
                                                    .catch(() => {
                                                        toast({
                                                            title: 'Error',
                                                            description: 'Unable to create topic',
                                                            variant: 'destructive',
                                                        })
                                                    })
                                            }}
                                        />
                                    </Dialog>

                                    <Button onClick={() => setIsCodingDialogOpen(true)}>
                                        + Create Problems
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-full lg:w-[250px]">
                                    <MultiSelector
                                        selectedCount={difficulty.filter(d => d.value !== 'None').length}
                                        options={difficultyOptions}
                                        selectedOptions={difficulty}
                                        handleOptionClick={handleDifficulty}
                                        type="Difficulty"
                                    />
                                </div>
                                <div className="w-full lg:w-[250px]">
                                    <MultiSelector
                                        selectedCount={selectedOptions.filter(o => o.value !== '-1').length}
                                        options={options}
                                        selectedOptions={selectedOptions}
                                        handleOptionClick={handleTagOption}
                                        type="Topic"
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
                            {
                            !isCodingDialogOpen && 
                            !isCodingEditDialogOpen && 
                            codingQuestions.length === 0 && (
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
                            )}

                            {isCodingDialogOpen && !isCodingEditDialogOpen && (
                                <MaxWidthWrapper className="flex flex-col justify-center items-center gap-5">
                                    <div onClick={() => setIsCodingDialogOpen(false)} className="text-secondary cursor-pointer self-start flex">
                                        <ChevronLeft /> Coding Problems
                                    </div>
                                    <NewCodingProblemForm
                                        tags={tags}
                                        setIsDialogOpen={setIsCodingDialogOpen}
                                        filteredCodingQuestions={filteredCodingQuestions}
                                        setCodingQuestions={setCodingQuestions}
                                    />
                                </MaxWidthWrapper>
                            )}
                        </>
                    )}

                    {!isCodingDialogOpen && !isCodingEditDialogOpen && (
                        <DataTablePagination
                            totalStudents={totalCodingQuestion}
                            lastPage={lastPage}
                            pages={totalPages}
                            fetchStudentData={fetchCodingQuestions}
                        />
                    )}
                </div>
            )}
        </>
    )
}

export default CodingProblems