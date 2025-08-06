'use client'

// External imports
import React, { useState, useEffect, useCallback, useRef, useMemo} from 'react'
import { ChevronLeft, Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

// Internal imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { DataTable } from '@/app/_components/datatable/data-table'
import { columns } from './column'
import NewMcqProblemForm from '../_components/NewMcqProblemForm'
import { api } from '@/utils/axios.config'
import {
    getAllQuizData,
    getCodingQuestionTags,
    getEditQuizQuestion,
    getmcqdifficulty,
    getMcqSearch,
    getSelectedMCQOptions,
} from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import { Spinner } from '@/components/ui/spinner'
import MultiSelector from '@/components/ui/multi-selector'
import difficultyOptions from '@/app/utils'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { POSITION, OFFSET } from '@/utils/constant'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import BulkUploadMcq from '../_components/BulkMcqForm'
import NewMcqForm from '../_components/NewMcqForm'
import EditMcqForm from '../_components/EditMcqForm'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import CreatTag from '../_components/creatTag'
import { toast } from '@/components/ui/use-toast'
import { filteredQuizQuestions } from '@/utils/admin'
import {PageSearchSuggestion,PageOption} from "@/app/admin/resource/mcq/adminResourceMcqType"

type Props = {}

const Mcqs = (props: Props) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [isOpen, setIsOpen] = useState(false)
    const [isMcqModalOpen, setIsMcqModalOpen] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalMCQQuestion, setTotalMCQQuestion] = useState<any>(0)
    const [totalPages, setTotalPages] = useState(0)
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [search, setSearch] = useState('')
    const [mcqType, setMcqType] = useState<string>('')
    const [newTopic, setNewTopic] = useState<string>('')
    const [options, setOptions] = useState<PageOption[]>([
        { value: '-1', label: 'All Topics' },
    ])
    const [loading, setLoading] = useState(true)

    // New search enhancement states
    const [searchSuggestions, setSearchSuggestions] = useState< PageSearchSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Zustand stores
    const position = useMemo(() => searchParams.get('limit') || POSITION, [searchParams])
    const offset = useMemo(() => {
        const page = searchParams.get('page');
        return page ? parseInt(page) : OFFSET;
        }, [searchParams]);
    const { tags, setTags } = getCodingQuestionTags()
    const { quizData, setStoreQuizData } = getAllQuizData()
    const { mcqDifficulty: difficulty, setMcqDifficulty: setDifficulty } =
        getmcqdifficulty()
    const { mcqSearch, setmcqSearch } = getMcqSearch()
    const { selectedOptions, setSelectedOptions } = getSelectedMCQOptions()
    const { isEditQuizModalOpen, setIsEditModalOpen } = getEditQuizQuestion()

    const debouncedSearch = useDebounce(search, 300)

    // Update mcqSearch store when search changes
    useEffect(() => {
        setmcqSearch(debouncedSearch)
    }, [debouncedSearch, setmcqSearch])

    const updateURL = useCallback((searchTerm: string, topics: PageOption[], difficulties: PageOption[]) => {
        let query = ''

        // Always follow this order: difficulty > topic > search
        const difficultyPart =
            difficulties.length > 0 && !difficulties.some(d => d.value === 'None')
                ? `difficulty=${difficulties.map(d => d.value).join(',')}`
                : ''

        const topicPart =
            topics.length > 0 && !topics.some(t => t.value === '-1')
                ? `topic=${topics.map(t => t.value).join(',')}`
                : ''

        const searchPart = searchTerm.trim() ? `search=${encodeURIComponent(searchTerm.trim())}` : ''

        // Combine in order
        const parts = [difficultyPart, topicPart, searchPart].filter(Boolean)
        query = parts.length > 0 ? `?${parts.join('&')}` : window.location.pathname

        router.replace(query, { scroll: false })
    }, [router])

    // Initialize search from URL params
    useEffect(() => {
        const searchQuery = searchParams.get('search')
        const topicFilter = searchParams.get('topic')
        const difficultyFilter = searchParams.get('difficulty')

        if (searchQuery) {
            setSearch(searchQuery)
        }

        if (topicFilter && options.length > 0) {
            const topicIds = topicFilter.split(',')
            const topicOptions = topicIds.map(id => {
                const foundOption = options.find(opt => opt.value === id)
                return foundOption || { value: id, label: id }
            })
            setSelectedOptions(topicOptions)
        }

        if (difficultyFilter) {
            const difficultyValues = difficultyFilter.split(',')
            const difficultyOptionsArr = difficultyValues.map(value => {
                const foundDifficulty = difficultyOptions.find(opt => opt.value === value)
                return foundDifficulty || { value: value, label: value }
            })
            setDifficulty(difficultyOptionsArr)
        }
    }, [searchParams, options])

    const fetchSearchSuggestions = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSearchSuggestions([])
            return
        }

        // Fallback: create suggestions from existing data
        const questionSuggestions = quizData
            .filter(item => {
                return item.quizVariants?.some(variant =>
                    variant.question?.toLowerCase().includes(query.toLowerCase())
                ) || item.title?.toLowerCase().includes(query.toLowerCase())
            })
            .slice(0, 5)
            .map(item => {
                const matchingVariant = item.quizVariants?.find(variant =>
                    variant.question?.toLowerCase().includes(query.toLowerCase())
                )

                const rawHTML = matchingVariant?.question || item.title || ''
                const tempDiv = document.createElement('div')
                tempDiv.innerHTML = rawHTML

                    // Remove <pre>, <code>, <img> completely to avoid including code and images
                    Array.from(tempDiv.querySelectorAll('pre, code, img')).forEach(el => el.remove())

                let plainText = tempDiv.textContent || tempDiv.innerText || ''
                plainText = plainText
                    .split('\n')
                    .find(line => line.trim() !== '') // ✅ First meaningful line
                    ?.trim() || ''
                const tagName = tags.find(tag => tag.id === item.tagId)?.tagName || 'General'

                return {
                    id: item.id?.toString() || Math.random().toString(),
                    question: plainText,
                    topic: tagName,
                    type: 'question' as const,
                }
            })

        const topicSuggestions = tags
            .filter(tag => tag.tagName.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3)
            .map(tag => ({
                id: tag.id.toString(),
                question: `Search in ${tag.tagName}`,
                topic: tag.tagName,
                type: 'topic' as const
            }))

        setSearchSuggestions([...questionSuggestions, ...topicSuggestions])
    }, [quizData, tags])

    const debouncedSuggestionSearch = useDebounce(search, 200)

    useEffect(() => {
        if (debouncedSuggestionSearch && isSearchFocused) {
            fetchSearchSuggestions(debouncedSuggestionSearch)
        } else {
            setSearchSuggestions([])
        }
    }, [debouncedSuggestionSearch, isSearchFocused, fetchSearchSuggestions])

    const submitSearch = () => {
        setCurrentPage(1)
        updateURL(search.trim(), selectedOptions, difficulty)
        fetchCodingQuestions(0, search.trim())
    }

    const handleTagOption = (option: PageOption ) => {
        let newSelectedOptions: PageOption[] = []
        
        if (option.value === '-1') {
            if (selectedOptions.some((item) => item.value === option.value)) {
                newSelectedOptions = selectedOptions.filter(
                    (selected) => selected.value !== option.value
                )
            } else {
                newSelectedOptions = [option]
            }
        } else {
            if (selectedOptions.some((item) => item.value === '-1')) {
                newSelectedOptions = [option]
            } else {
                if (selectedOptions.some((selected) => selected.value === option.value)) {
                    newSelectedOptions = selectedOptions.filter(
                        (selected) => selected.value !== option.value
                    )
                } else {
                    newSelectedOptions = [...selectedOptions, option]
                }
            }
        }
        
        setSelectedOptions(newSelectedOptions)
        setCurrentPage(1)
        // Immediately update URL
        updateURL(search, newSelectedOptions, difficulty)
        fetchCodingQuestions(0, search)
    }

    const handleDifficulty = (option: PageOption) => {
        let newDifficulty: PageOption[] = []
        
        // When user selects All Difficulty
        if (option.value === 'None') {
            if (difficulty.some((item) => item.value === option.value)) {
                newDifficulty = difficulty.filter(
                    (item) => item.value !== option.value
                )
            } else {
                newDifficulty = [option]
            }
        } else {
            // When user selects other Difficulties
            if (difficulty.some((item) => item.value === 'None')) {
                newDifficulty = [option]
            } else {
                if (difficulty.some((item) => item.value === option.value)) {
                    newDifficulty = difficulty.filter(
                        (item) => item.value !== option.value
                    )
                } else {
                    newDifficulty = [...difficulty, option]
                }
            }
        }
        
        setDifficulty(newDifficulty)
        setCurrentPage(1)
        // Immediately update URL
        updateURL(search, selectedOptions, newDifficulty)
        fetchCodingQuestions(0, search)
    }

    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)

    const handleSetsearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearch(value)
        setShowSuggestions(value.trim().length > 0)
        setSelectedSuggestionIndex(-1)
    }

    const handleSearchFocus = () => {
        setIsSearchFocused(true)
        setShowSuggestions(search.trim().length > 0)
    }

    const handleSearchBlur = () => {
        // Delay hiding suggestions to allow for clicks
        setTimeout(() => {
            setIsSearchFocused(false)
            setShowSuggestions(false)
        }, 200)
    }

    const handleSuggestionClick = (suggestion: PageSearchSuggestion) => {
        if (suggestion.type === 'question') {
            const trimmed = suggestion.question.trim()
            setSearch(trimmed)
            setCurrentPage(1)
            updateURL(trimmed, selectedOptions, difficulty)
            fetchCodingQuestions(0, trimmed)
        } else {
            // Topic click
            const topicOption = options.find(opt => opt.label === suggestion.topic)
            if (topicOption) {
                let newSelectedOptions: PageOption[] = []
                
                if (topicOption.value === '-1') {
                    newSelectedOptions = [topicOption]
                } else {
                    if (selectedOptions.some((item) => item.value === '-1')) {
                        newSelectedOptions = [topicOption]
                    } else {
                        if (selectedOptions.some((selected) => selected.value === topicOption.value)) {
                            newSelectedOptions = selectedOptions.filter(
                                (selected) => selected.value !== topicOption.value
                            )
                        } else {
                            newSelectedOptions = [...selectedOptions, topicOption]
                        }
                    }
                }
                
                setSelectedOptions(newSelectedOptions)
                setCurrentPage(1)
                updateURL('', newSelectedOptions, difficulty)
                fetchCodingQuestions(0, '')
            }
            setSearch('')
        }

        setShowSuggestions(false)
        setIsSearchFocused(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || searchSuggestions.length === 0) {
            if (e.key === 'Enter') {
                e.preventDefault()
                submitSearch()
            }
            return
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedSuggestionIndex(prev =>
                    prev < searchSuggestions.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedSuggestionIndex(prev =>
                    prev > 0 ? prev - 1 : searchSuggestions.length - 1
                )
                break
            case 'Enter':
                e.preventDefault()
                if (selectedSuggestionIndex >= 0) {
                    handleSuggestionClick(searchSuggestions[selectedSuggestionIndex])
                } else {
                    submitSearch()
                }
                break
            case 'Escape':
                setShowSuggestions(false)
                setIsSearchFocused(false)
                break
        }
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

    useEffect(() => {
        // Ensure the code runs only on the client side
        getAllTags()
        setIsEditModalOpen(false)
    }, [])

    const fetchCodingQuestions = useCallback(
        async (offset: number, searchTerm?: string) => {
            if (offset >= 0) {
                // Use the passed searchTerm if provided, otherwise use the current debouncedSearch
                const currentSearchTerm = searchTerm !== undefined ? searchTerm : debouncedSearch
                filteredQuizQuestions(
                    setStoreQuizData,
                    offset,
                    position,
                    difficulty,
                    selectedOptions,
                    setTotalMCQQuestion,
                    setLastPage,
                    setTotalPages,
                    currentSearchTerm
                )
            }
        },
        [
            setStoreQuizData,
            position,
            difficulty,
            selectedOptions,
            setTotalMCQQuestion,
            setLastPage,
            setTotalPages,
            debouncedSearch,
        ]
    )

    // Effect to fetch data when filters change (but not search while typing)
    useEffect(() => {
        if (options.length > 0) {
            fetchCodingQuestions(offset)
        }
    }, [offset, position, difficulty, selectedOptions, options])

    const handleNewTopicChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setNewTopic(event.target.value)
    }

    const handleCreateTopic = async () => {
        try {
            await api
                .post(`/Content/createTag`, { tagName: newTopic })
                .then((res) => {
                    toast.success({
                        title: `${newTopic} Topic has created`,
                        description: res.data.message,
                    })
                    getAllTags()
                    setNewTopic('')
                })
        } catch (error) {
            toast.error({
                title: 'Network error',
                description:
                    'Unable to create session. Please try again later.',
            })
        }
    }

    const clearSearch = () => {
        setSearch('')
        setCurrentPage(1)
        // Only clear search, keep filters
        updateURL('', selectedOptions, difficulty)
        fetchCodingQuestions(0, '')
        setShowSuggestions(false)
        searchInputRef.current?.focus()
    }

    useEffect(() => {
        const handleRouteChange = () => {
            setSelectedOptions([{ value: '-1', label: 'All Topics' }])
            setDifficulty([{ value: 'None', label: 'All Difficulty' }])
            setmcqSearch('')
            setSearch('')
        }
    
        window.addEventListener('beforeunload', handleRouteChange)
    
        return () => {
            handleRouteChange() // 🔁 Run when navigating away
            window.removeEventListener('beforeunload', handleRouteChange)
        }
    }, [])
    
    useEffect(() => {
        if (debouncedSearch.trim() === '' && searchParams.get('search')) {
            updateURL('', selectedOptions, difficulty)
            fetchCodingQuestions(0, '')
        }
    }, [debouncedSearch, searchParams, selectedOptions, difficulty])
    
    
    const selectedTagCount = selectedOptions.length
    const difficultyCount = difficulty.length

    const renderComponent = () => {
        switch (mcqType) {
            case 'bulk':
                return <BulkUploadMcq setIsMcqModalOpen={setIsMcqModalOpen} />
            case 'oneatatime':
                return (
                    <div className="flex items-start justify-center w-full">
                        <NewMcqForm
                            setIsMcqModalOpen={setIsMcqModalOpen}
                            tags={tags}
                            closeModal={closeModal}
                            setStoreQuizData={setStoreQuizData}
                            getAllQuizQuesiton={filteredQuizQuestions}
                        />
                    </div>
                )
            case 'AI':
                return (
                    <div className="flex items-start justify-center w-full">
                        <NewMcqProblemForm
                            tags={tags}
                            closeModal={closeModal}
                            setStoreQuizData={setStoreQuizData}
                            getAllQuizQuesiton={filteredQuizQuestions}
                            setIsMcqModalOpen={setIsMcqModalOpen}
                            setMcqType={setMcqType}
                        />
                    </div>
                )
            default:
                return (
                    <div className="flex items-start justify-center w-full">
                        <NewMcqForm
                            setIsMcqModalOpen={setIsMcqModalOpen}
                            tags={tags}
                            closeModal={closeModal}
                            setStoreQuizData={setStoreQuizData}
                            getAllQuizQuesiton={filteredQuizQuestions}
                        />
                    </div>
                )
        }
    }

    return (
        <>
            {isEditQuizModalOpen && (
                <div>
                    <div
                        className="flex cursor-pointer p-5 text-[rgb(81,134,114)]"
                        onClick={() => setIsEditModalOpen(false)}
                    >
                        <ChevronLeft />
                        <h6 className="text-[15px]">MCQ Problems</h6>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <h1 className="text-lg mb-4 ml-4 font-semibold text-start w-[590px] justify-start text-gray-600">
                            Edit MCQ
                        </h1>
                        <EditMcqForm
                            tags={tags}
                            closeModal={closeModal}
                            setStoreQuizData={setStoreQuizData}
                            getAllQuizQuesiton={filteredQuizQuestions}
                        />
                    </div>
                </div>
            )}
            {isMcqModalOpen && (
                <div className=" ">
                    <div
                        className="flex cursor-pointer items-center text-[rgb(81,134,114)]"
                        onClick={() =>
                            setIsMcqModalOpen((prevState) => !prevState)
                        }
                    >
                        <ChevronLeft />
                        <h6>MCQ Problems</h6>
                    </div>
                    <div className="flex flex-col items-center justify-center text-gray-600">
                        <div>
                            <RadioGroup
                                className="flex flex-col items-center w-full  "
                                defaultValue="oneatatime"
                                onValueChange={(value) => setMcqType(value)}
                            >
                                <div className="flex w-[630px] flex-col items-start justify-start ml-4 gap-3">
                                    <h1 className="font-semibold text-3xl mb-4 ">
                                        New MCQ
                                    </h1>
                                    <div className="flex gap-x-6 ">
                                        <div className="flex  space-x-2">
                                            <RadioGroupItem
                                                value="bulk"
                                                id="r1"
                                                className="text-[rgb(81,134,114)] border-black mt-1"
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
                                                className="text-[rgb(81,134,114)] border-black mt-1"
                                            />
                                            <Label
                                                className="font-semibold text-md"
                                                htmlFor="r2"
                                            >
                                                One At A Time
                                            </Label>
                                        </div>
                                        <div className="flex space-x-2 pr-2">
                                            <RadioGroupItem
                                                value="AI"
                                                id="r2"
                                                className="text-[rgb(81,134,114)] border-black mt-1"
                                            />
                                            <Label
                                                className="font-semibold text-lg"
                                                htmlFor="r2"
                                            >
                                                Generate with AI
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </RadioGroup>
                            {renderComponent()}
                        </div>
                    </div>
                </div>
            )}
            {!isMcqModalOpen && !isEditQuizModalOpen && (
                <MaxWidthWrapper className="h-screen">
                    <h1 className="text-left font-semibold text-2xl text-gray-600">
                        Resource Library - MCQs
                    </h1>
                    <div className="flex justify-between">
                        <div className="relative w-full">
                            <div className="relative w-1/4">
                                <Input
                                    ref={searchInputRef}
                                    value={search}
                                    onChange={handleSetsearch}
                                    onFocus={handleSearchFocus}
                                    onBlur={handleSearchBlur}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Search for Question"
                                    className="w-full p-2 my-6 input-with-icon pl-8 pr-8"
                                />
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                    <Search className="text-gray-400" size={20} />
                                </div>
                                {search && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                {showSuggestions && searchSuggestions.length > 0 && (
                                    <div
                                        ref={suggestionsRef}
                                        className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
                                        style={{ top: '100%' }}
                                    >
                                        {searchSuggestions.slice(0, 6).map((suggestion, index) => (
                                            <div
                                                key={`${suggestion.type}-${suggestion.id}`}
                                                className={`pl-2 pr-3 py-2 cursor-pointer hover:bg-gray-100 ${index === selectedSuggestionIndex ? 'bg-blue-50' : ''}`}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                <p className="text-sm font-medium text-gray-900 truncate text-left m-0">
                                                    {suggestion.question}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}


                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="text-white bg-success-dark opacity-75 lg:max-w-[150px] w-full mt-5">
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
                            <Button
                                onClick={() =>
                                    setIsMcqModalOpen((prevState) => !prevState)
                                }
                                className="mt-5 bg-success-dark opacity-75"
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

                    <DataTable
                        data={quizData}
                        columns={columns}
                        mcqSide={true}
                    />
                    {totalMCQQuestion > 0 && (
                        <DataTablePagination
                            totalStudents={totalMCQQuestion}
                            lastPage={lastPage}
                            pages={totalPages}
                            fetchStudentData={fetchCodingQuestions}
                        />
                    )}
                </MaxWidthWrapper>
            )}
        </>
    )
}

export default Mcqs