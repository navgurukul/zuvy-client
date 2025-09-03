'use client'
// External imports
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

// Internal imports
import { Button } from '@/components/ui/button'
import { SearchBox } from '@/utils/searchBox'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { DataTable } from '@/app/_components/datatable/data-table'
import { columns } from './column'
import dynamic from 'next/dynamic'
import { api } from '@/utils/axios.config'
import {
    getAllQuizData,
    getCodingQuestionTags,
    getEditQuizQuestion,
    getmcqdifficulty,
    getMcqSearch,
    getSelectedMCQOptions,
} from '@/store/store'
import { Spinner } from '@/components/ui/spinner'
import MultiSelector from '@/components/ui/multi-selector'
import difficultyOptions from '@/app/utils'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { POSITION, OFFSET } from '@/utils/constant'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import CreatTag from '../_components/creatTag'
import { toast } from '@/components/ui/use-toast'
import { filteredQuizQuestions } from '@/utils/admin'
import { PageOption, PageSearchSuggestion } from './adminResourceMcqType'


const NewMcqProblemForm = dynamic(() => import('../_components/NewMcqProblemForm'), {
    ssr: false,
    loading: () => <div className="flex justify-center"><Spinner /></div>
})

const BulkUploadMcq = dynamic(() => import('../_components/BulkMcqForm'), {
    ssr: false,
    loading: () => <div className="flex justify-center"><Spinner /></div>
})

const NewMcqForm = dynamic(() => import('../_components/NewMcqForm'), {
    ssr: false,
    loading: () => <div className="flex justify-center"><Spinner /></div>
})

const EditMcqForm = dynamic(() => import('../_components/EditMcqForm'), {
    ssr: false,
    loading: () => <div className="flex justify-center"><Spinner /></div>
})

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
    const router = useRouter()
    const searchParams = useSearchParams()

    const [isOpen, setIsOpen] = useState(false)
    const [isMcqModalOpen, setIsMcqModalOpen] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalMCQQuestion, setTotalMCQQuestion] = useState<any>(0)
    const [totalPages, setTotalPages] = useState(0)
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [mcqType, setMcqType] = useState<string>('')
    const [newTopic, setNewTopic] = useState<string>('')
    const [options, setOptions] = useState<PageOption[]>([
        { value: '-1', label: 'All Topics' },
    ])
    const [loading, setLoading] = useState(true)

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

    // Updated URL function to create clean URLs without encoding issues
    const updateURL = useCallback((searchTerm: string, topics: PageOption[], difficulties: PageOption[]) => {
        let urlParts: string[] = []

        // Add difficulty if not "None"
        const validDifficulties = difficulties.filter(d => d.value !== 'None')
        if (validDifficulties.length > 0) {
            urlParts.push(`difficulty=${validDifficulties.map(d => d.value).join(',')}`)
        }

        // Add topic if not "All Topics"  
        const validTopics = topics.filter(t => t.value !== '-1')
        if (validTopics.length > 0) {
            urlParts.push(`topic=${validTopics.map(t => t.value).join(',')}`)
        }

        // Add search term
        if (searchTerm.trim()) {
            urlParts.push(`search=${encodeURIComponent(searchTerm.trim())}`)
        }

        // Build final URL
        const queryString = urlParts.join('&')
        const newURL = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname

        // Use window.history for direct URL manipulation
        window.history.replaceState({}, '', newURL)
    }, [])
    const fetchSuggestionsApi = useCallback(async (query: string): Promise<any[]> => {
        if (!query.trim()) {
            return []
        }
    
        try {
            // API call to fetch quiz questions based on the query
            const response = await api.get('Content/allQuizQuestions', {
                params: {
                    searchTerm: encodeURIComponent(query),
                    // Add additional filters if needed (tags, difficulty, etc.)
                }
            })
    
            if (response && response.data && response.data.data) {
                const questionSuggestions = response.data.data
                    .map((item: any) => {
                        // Directly use the clean question returned from the backend
                        const question = item.quizVariants?.[0]?.question || item.title || ''
                        const plainText = question.replace(/<[^>]+>/g, '').trim() // Simple HTML clean-up if needed, but ideally this should be done in the backend
    
                        if (!plainText) return null // Skip empty questions
    
                        // Truncate the question for display purposes
                        const truncatedText = plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
    
                        // Get topic name from tags (backend should ideally return topic name too)
                        const tagName = tags.find(tag => tag.id === item.tagId)?.tagName || 'General'
    
                        return {
                            id: item.id?.toString() || Math.random().toString(),
                            question: truncatedText,
                            fullQuestion: plainText,
                            topic: tagName,
                            type: 'question',
                        }
                    })
                    .filter((item: any) => item !== null) // Filter out null items (empty questions)
    
                // Topic suggestions from backend should be handled similarly
                const topicSuggestions = tags
                    .filter(tag => tag.tagName.toLowerCase().includes(query.toLowerCase()))
                    .slice(0, 3)
                    .map(tag => ({
                        id: tag.id.toString(),
                        question: `Search in ${tag.tagName}`,
                        topic: tag.tagName,
                        type: 'topic',
                    }))
    
                return [...questionSuggestions, ...topicSuggestions]
            }
    
            return []
        } catch (error) {
            console.error('Error fetching suggestions:', error)
            return []
        }
    }, [tags]);

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        setmcqSearch(query);
        setCurrentPage(1);
    
        try {
            const apiParams: Record<string, string | number> = {
                limit: parseInt(position),
                offset: 0,
                searchTerm: query.trim(),
            };    
            const response = await api.get('Content/allQuizQuestions', { params: apiParams });
    
            if (response && response.data) {
                setStoreQuizData(response.data.data || []);
                setTotalMCQQuestion(response.data.totalRows || 0);
                setTotalPages(response.data.totalPages || 0);
                setLastPage(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    }, [ position]);
    
    const defaultFetchApi = useCallback(async () => {
        return fetchCodingQuestions(0, '')
    }, [])



    // Initialize filters from URL params
    useEffect(() => {
        const topicFilter = searchParams.get('topic')
        const difficultyFilter = searchParams.get('difficulty')

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

    const handleTagOption = (option: PageOption) => {
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
        // Get current search query from SearchBox
        const currentSearchQuery = searchParams.get('search') || ''
        updateURL(currentSearchQuery, newSelectedOptions, difficulty)
        fetchCodingQuestions(0, currentSearchQuery)
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
        // Get current search query from SearchBox
        const currentSearchQuery = searchParams.get('search') || ''
        updateURL(currentSearchQuery, selectedOptions, newDifficulty)
        fetchCodingQuestions(0, currentSearchQuery)
    }

    const openModal = () => setIsOpen(true)
    const closeModal = () => setIsOpen(false)

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

    // Add this after your existing useEffects
    useEffect(() => {
        // When component mounts, if URL is clean, clear filters  
        const urlParams = new URLSearchParams(window.location.search)
        const hasAnyFilters = urlParams.has('topic') || urlParams.has('difficulty') || urlParams.has('search')

        if (!hasAnyFilters) {
            setDifficulty([{ value: 'None', label: 'All Difficulty' }])
            setSelectedOptions([{ value: '-1', label: 'All Topics' }])
            setmcqSearch('')
        }
    }, []) // Empty dependency - runs only when component mounts

    const fetchCodingQuestions = useCallback(
        async (offset: number, searchTerm?: string) => {
            if (offset >= 0) {
                // Use the passed searchTerm if provided, otherwise use the current search from URL
                const currentSearchTerm = searchTerm !== undefined ? searchTerm : (searchParams.get('search') || '')
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
            searchParams,
        ]
    )

    // Effect to fetch data when filters change
    // useEffect(() => {
    //     if (options.length > 0) {
    //         const searchFilter = searchParams.get('search') || ''
    //         fetchCodingQuestions(offset, searchFilter)
    //     }
    // }, [offset, position, difficulty, selectedOptions, options, searchParams, fetchCodingQuestions])

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

    const handleSearchChange = (value: string) => {
        setmcqSearch(value)
    }

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
                        <div className="relative w-1/4">
                            <SearchBox
                                placeholder="Search for Question"
                                fetchSuggestionsApi={fetchSuggestionsApi}
                                fetchSearchResultsApi={fetchSearchResultsApi}
                                defaultFetchApi={defaultFetchApi}
                                getSuggestionLabel={(suggestion) => suggestion.question}
                                getSuggestionValue={(suggestion) => suggestion.question}
                                inputWidth="w-full my-6"
                                onSearchChange={handleSearchChange}
                            /> 
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