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
import { POSITION, OFFSET } from '@/utils/constant'

import {
    getCodingQuestionTags,
    getEditCodingQuestionDialogs,
    getcodingQuestionState,
    getSelectedOptions,
    getDifficulty,
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
import { useSearchParams, useRouter } from 'next/navigation'
import useDebounce from '@/hooks/useDebounce'
import { ROWS_PER_PAGE } from '@/utils/constant'
import {Tag,SearchSuggestion,Option} from "@/app/admin/resource/coding/adminResourceCodinType"


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
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

    // Only debounce for suggestions, not for confirmed search
    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    const {
        isCodingEditDialogOpen,
        setIsCodingEditDialogOpen,
        isCodingDialogOpen,
        setIsCodingDialogOpen,
    } = getEditCodingQuestionDialogs()
    const searchParams = useSearchParams()
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
    const position = useMemo(() => searchParams.get('limit') || POSITION, [searchParams])
    const offset = useMemo(() => {
        const page = searchParams.get('page');
        return page ? parseInt(page) : OFFSET;
    }, [searchParams]);
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

    // Fetch suggestions with debouncing - FIXED VERSION
    useEffect(() => {
        const fetchSuggestions = async () => {
            // Clear suggestions if search term is too short
            if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
                setSearchSuggestions([])
                setIsLoadingSuggestions(false)
                return
            }

            setIsLoadingSuggestions(true)

            try {
                const response = await api.get('/Content/allCodingQuestions', {
                    params: {
                        searchTerm: debouncedSearchTerm,
                        limit: 8 // Add limit to get only top 8 suggestions
                    },
                })

                console.log("Suggestions API response:", response.data)

                // Handle different response structures
                let questionsData = response.data;

                // If the response has a data property, use that
                if (response.data.data) {
                    questionsData = response.data.data;
                }

                // If the response has a questions property, use that
                if (response.data.questions) {
                    questionsData = response.data.questions;
                }

                // Ensure questionsData is an array
                if (!Array.isArray(questionsData)) {
                    console.error("Expected array but got:", typeof questionsData);
                    setSearchSuggestions([]);
                    return;
                }

                const suggestions = questionsData
                    .filter((question: SearchSuggestion) =>
                        question.title &&
                        question.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                    )
                    .slice(0, 8)
                    .map((question: SearchSuggestion) => ({
                        id: question.id,
                        title: question.title,
                        difficulty: question.difficulty || 'N/A',
                    }));

                setSearchSuggestions(suggestions)
            } catch (error) {
                console.error('Error fetching suggestions:', error)
                setSearchSuggestions([])
            } finally {
                setIsLoadingSuggestions(false)
            }
        }

        fetchSuggestions()
    }, [debouncedSearchTerm])

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (urlInitialized && searchTerm.trim() === '' && confirmedSearch !== '') {
            // User cleared input manually (not via X), so reset search filter
            clearOnlySearchTerm()
        }
    }, [searchTerm, confirmedSearch, urlInitialized])

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
        const value = e.target.value;
        setSearchTerm(value);

        // Show suggestions when typing (if there's text and input is focused)
        if (value.length > 0 && isSearchFocused) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }

    const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setConfirmedSearch(searchTerm)
            setShowSuggestions(false)
            setCurrentPage(1)
        }
        // Hide suggestions on Escape
        if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        setSearchTerm(suggestion.title)
        setConfirmedSearch(suggestion.title)
        setShowSuggestions(false)
        setCurrentPage(1)
    }

    const handleSearchFocus = () => {
        setIsSearchFocused(true)
        // Show suggestions if there's text and suggestions available
        if (searchTerm.length > 1 && searchSuggestions.length > 0) {
            setShowSuggestions(true)
        }
    }

    const handleSearchBlur = () => {
        setIsSearchFocused(false)
        // Use a longer timeout to allow clicking on suggestions
        setTimeout(() => {
            setShowSuggestions(false)
        }, 200)
    }

    // Clear ALL filters (search, topics, difficulty)
    const clearOnlySearchTerm = () => {
        setSearchTerm('')
        setConfirmedSearch('')
        setShowSuggestions(false)
        setCurrentPage(1)

        const params = new URLSearchParams(window.location.search)
        params.delete('search')

        const newUrl = `${window.location.pathname}?${params.toString()}`
        router.replace(newUrl)
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

    // Add this effect to preserve URL parameters including pagination
    useEffect(() => {
        if (!urlInitialized) return

        const params = new URLSearchParams(window.location.search)
        
        // Preserve existing URL parameters that are not handled by other effects
        const currentParams = new URLSearchParams(window.location.search)
        
        // Keep pagination related parameters (limit, page, offset etc.) that might be set by DataTablePagination
        currentParams.forEach((value, key) => {
            if (!['search', 'topics', 'difficulty'].includes(key)) {
                params.set(key, value)
            }
        })

        // Update search
        if (confirmedSearch) {
            params.set('search', confirmedSearch)
        } else {
            params.delete('search')
        }

        // Update topics
        if (selectedOptions.length > 0 && !selectedOptions.some(opt => opt.value === '-1')) {
            const topicValues = selectedOptions.map(opt => opt.value).join(',')
            params.set('topics', topicValues)
        } else {
            params.delete('topics')
        }

        // Update difficulty
        if (difficulty.length > 0 && !difficulty.some(opt => opt.value === 'None')) {
            const difficultyValues = difficulty.map(opt => opt.value).join(',')
            params.set('difficulty', difficultyValues)
        } else {
            params.delete('difficulty')
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`
        const currentUrl = `${window.location.pathname}${window.location.search}`

        if (newUrl !== currentUrl) {
            router.replace(newUrl)
        }
    }, [confirmedSearch, selectedOptions, difficulty, router, urlInitialized])

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
                    <Spinner className="text-[rgb(81,134,114)]" />
                </div>
            ) : isCodingEditDialogOpen ? (
                <EditCodingQuestionForm />
            ) : (
                <div>
                    {allCodingQuestions.length > 0 && !isCodingDialogOpen ? (
                        <MaxWidthWrapper>
                            <h1 className="text-left font-semibold text-2xl text-gray-600">
                                Resource Library - Coding Problems
                            </h1>

                            <div className="flex justify-between">
                                <div className="relative w-full">
                                    <div className="relative w-1/4">
                                        <Input
                                            placeholder="Problem Name..."
                                            className="w-full p-2 my-6 input-with-icon pl-8"
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
                                                onClick={clearOnlySearchTerm}
                                                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}

                                        {/* Fixed Suggestions dropdown */}
                                        {showSuggestions && (
                                            <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg top-full mt-1">
                                                {isLoadingSuggestions ? (
                                                    <div className="px-4 py-3 text-sm text-gray-500">
                                                        Loading suggestions...
                                                    </div>
                                                ) : searchSuggestions.length > 0 ? (
                                                    searchSuggestions.map((suggestion) => (
                                                        <div
                                                            key={suggestion.id}
                                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault(); // Prevent input blur
                                                                handleSuggestionClick(suggestion);
                                                            }}
                                                        >
                                                            <p className="text-sm font-medium text-gray-900 truncate text-left">
                                                                {suggestion.title}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : debouncedSearchTerm && debouncedSearchTerm.length >= 2 ? (
                                                    <div className="px-4 py-3 text-sm text-gray-500">
                                                        No suggestions found
                                                    </div>
                                                ) : null}
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

                                    <Button className='bg-success-dark opacity-75'
                                        onClick={() =>
                                            setIsCodingDialogOpen(true)
                                        }
                                    >
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
                                        <h1 className="text-left font-semibold text-2xl text-gray-600">
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
                                                className="bg-success-dark opacity-75"
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
                                    <div onClick={() => setIsCodingDialogOpen(false)}
                                        className="text-[rgb(81,134,114)] cursor-pointer self-start flex">
                                        {' '}
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