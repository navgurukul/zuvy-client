'use client'
// External imports
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ChevronLeft,Search } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {McqSkeleton} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton'

import { 
    Dialog, 
    DialogOverlay,
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from '@/components/ui/dialog'
import CreatTag from '../_components/creatTag'
import { toast } from '@/components/ui/use-toast'
import { filteredQuizQuestions } from '@/utils/admin'
import { PageOption, PageSearchSuggestion } from './adminResourceMcqType'
import ManageTopics from '../_components/ManageTopics'
import McqDeleteVaiarntComp from '../_components/McqDeleteComponent'

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
    const hasLoaded = useRef(false);
    const router = useRouter()
    const searchParams = useSearchParams()

    const [isOpen, setIsOpen] = useState(false)
    const [isMcqModalOpen, setIsMcqModalOpen] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalMCQQuestion, setTotalMCQQuestion] = useState<any>(0)
    const [totalPages, setTotalPages] = useState(0)
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [mcqType, setMcqType] = useState<string>('oneatatime')
    const [newTopic, setNewTopic] = useState<string>('')
    const [options, setOptions] = useState<PageOption[]>([
        { value: '-1', label: 'All Topics' },
    ])
    const [loading, setLoading] = useState(true)
    const [isCreateMcqDialogOpen, setIsCreateMcqDialogOpen] = useState(false)

    // Zustand stores
    const position = useMemo(() => searchParams.get('limit') || POSITION, [searchParams])
    const offset = useMemo(() => {
        const page = searchParams.get('page')
        const limit = searchParams.get('limit') || POSITION
        if (page) {
            const pageNum = parseInt(page)
            const limitNum = parseInt(limit)
            return (pageNum - 1) * limitNum
        }
        return 0
    }, [searchParams])
    const { tags, setTags } = getCodingQuestionTags()
    const { quizData, setStoreQuizData } = getAllQuizData()
    const { mcqDifficulty: difficulty, setMcqDifficulty: setDifficulty } =
        getmcqdifficulty()
    const { mcqSearch, setmcqSearch } = getMcqSearch()
    const { selectedOptions, setSelectedOptions } = getSelectedMCQOptions()
    const { isEditQuizModalOpen, setIsEditModalOpen } = getEditQuizQuestion()
    const [isManageTopicsOpen, setIsManageTopicsOpen] = useState(false)
    const [tableInstance, setTableInstance] = useState<any>(null)
    const [logSelectedRowsFunction, setLogSelectedRowsFunction] = useState<(() => any[]) | null>(null)

    // Function to receive the logSelectedRows function from DataTable
    const handleGetSelectedRowsFunction = useCallback((fn: () => any[], table?: any) => {
        setLogSelectedRowsFunction(() => fn)
        if (table) {
            setTableInstance(table)
        }
    }, [])

    // Debug selected rows
    useEffect(() => {
        if (logSelectedRowsFunction) {
            const selectedRows = logSelectedRowsFunction()
        }
    }, [logSelectedRowsFunction])

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
        // Don't return empty if query has spaces - only check if completely empty
        if (!query || query.trim().length === 0) {
            return []
        }
    
        try {
            // API call to fetch quiz questions based on the query
            const response = await api.get('Content/allQuizQuestions', {
                params: {
                    searchTerm: query.trim(), // Remove encodeURIComponent here as axios handles it
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
                        // const truncatedText = plainText.length > 100 ? plainText.substring(0, 15) + '...' : plainText
                        const truncatedText = plainText.length > 45
                        ? plainText.split(' ').slice(0, 6).join(' ') + '...'
                        : plainText                        // Get topic name from tags (backend should ideally return topic name too)

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

        updateURL(query, selectedOptions, difficulty);

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
            setStoreQuizData([]);
        }
    }, [position, selectedOptions, difficulty, updateURL, setStoreQuizData]);

    useEffect(() => {
        const searchQuery = searchParams.get('search') || ''
        if (searchQuery !== mcqSearch) {
            setmcqSearch(searchQuery)
        }
    }, [searchParams, mcqSearch])

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

    // Data fetching function को update करो
    const fetchCodingQuestions = useCallback(
        async (offset: number, searchTerm?: string) => {
            if (offset >= 0 && options.length > 0) { // Add options.length check
                try {
                    const currentSearchTerm = searchTerm !== undefined ? searchTerm : (searchParams.get('search') || '')
                    await filteredQuizQuestions(
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
                    setLoading(false) 
                } catch (error) {
                    console.error('Error fetching questions:', error)
                    // Set empty data on error to prevent table crashes
                    setStoreQuizData([])
                }
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
            options.length,
        ]
    )

    const defaultFetchApi = useCallback(async () => {
        // Clear search from URL when defaultFetch is called
        updateURL('', selectedOptions, difficulty);
        setmcqSearch('');
        return fetchCodingQuestions(0, '');
    }, [selectedOptions, difficulty, updateURL, fetchCodingQuestions]);

    // Effect to fetch data when filters change
    useEffect(() => {
        if (options.length > 0) {
            const searchFilter = searchParams.get('search') || ''
            fetchCodingQuestions(offset, searchFilter)
        }
    }, [ difficulty, selectedOptions, options])

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
        // If search is cleared manually, trigger default fetch
        if (!value || value.trim() === '') {
            updateURL('', selectedOptions, difficulty);
            fetchCodingQuestions(0, '');
        }
    }

    const selectedTagCount = selectedOptions.length
    const difficultyCount = difficulty.length

    const renderTabContent = (tabValue: string) => {
        switch (tabValue) {
            case 'bulk':
                return (
                    <BulkUploadMcq
                        closeModal={() => setIsCreateMcqDialogOpen(false)}
                        setStoreQuizData={setStoreQuizData}
                        getAllQuizQuesiton={() => filteredQuizQuestions(setStoreQuizData)}
                    />
                )
            case 'oneatatime':
                return (
                    <div className="flex items-start justify-center w-full">
                        <NewMcqForm
                            setIsMcqModalOpen={setIsMcqModalOpen}
                            tags={tags}
                            closeModal={() => setIsCreateMcqDialogOpen(false)}
                            setStoreQuizData={setStoreQuizData}
                            getAllQuizQuesiton={filteredQuizQuestions}
                        />
                    </div>
                )
            case 'ai':
                return (
                    <div className="flex items-start justify-center w-full">
                        <NewMcqProblemForm
                            tags={tags}
                            closeModal={() => setIsCreateMcqDialogOpen(false)}
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
                            closeModal={() => setIsCreateMcqDialogOpen(false)}
                            setStoreQuizData={setStoreQuizData}
                            getAllQuizQuesiton={filteredQuizQuestions}
                        />
                    </div>
                )
        }
    }
   
    return (
        <>
         {loading ? (
                    <McqSkeleton/>
                    ) : (
                <>
            {/* Edit Modal */}

            <Dialog open={isEditQuizModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent preventOutsideClose={true} className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit MCQ Question</DialogTitle>
                    </DialogHeader>
                    <EditMcqForm
                        tags={tags}
                        closeModal={() => setIsEditModalOpen(false)}
                        setStoreQuizData={setStoreQuizData}
                        getAllQuizQuesiton={filteredQuizQuestions}
                    />
                </DialogContent>
            </Dialog>

            {/* Create MCQ Modal with Tabs */}
            <Dialog open={isCreateMcqDialogOpen} onOpenChange={setIsCreateMcqDialogOpen}>
                <DialogContent preventOutsideClose={true} className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New MCQ</DialogTitle>
                    </DialogHeader>
                    
                    <Tabs 
                        value={mcqType} 
                        onValueChange={setMcqType}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger 
                                value="oneatatime" 
                                className="text-sm font-medium"
                            >
                                One At A Time
                            </TabsTrigger>
                            <TabsTrigger 
                                value="bulk" 
                                className="text-sm font-medium"
                            >
                                Bulk Upload
                            </TabsTrigger>
                            <TabsTrigger 
                                value="ai" 
                                className="text-sm font-medium"
                            >
                                Generate with AI
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="oneatatime" className="mt-0">
                            {renderTabContent('oneatatime')}
                        </TabsContent>

                        <TabsContent value="bulk" className="mt-0">
                            {renderTabContent('bulk')}
                        </TabsContent>

                        <TabsContent value="ai" className="mt-0">
                            {renderTabContent('ai')}
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Remove the old edit page logic and keep only the main content */}
            {!isMcqModalOpen && (
                <MaxWidthWrapper className="h-screen">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-left font-heading font-bold text-3xl text-foreground">
                                Content Bank - MCQ Questions
                            </h1>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <Button
                                variant="outline"
                                className="lg:max-w-[150px] w-full shadow-4dp mt-5"
                                onClick={() => setIsManageTopicsOpen(true)}
                            >
                                <p>Manage Topics</p>
                            </Button>                            
                            <Dialog open={isCreateMcqDialogOpen} onOpenChange={setIsCreateMcqDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="mt-5 bg-primary hover:bg-primary-dark shadow-4dp">
                                        + Create MCQ
                                    </Button>
                                </DialogTrigger>
                            </Dialog>
                        </div>
                    </div>
                 
                    <div className="flex items-center gap-4 mb-6">
                        
                         <div className="relative [&_input]:pl-10">
                            <SearchBox
                                placeholder="Search for Question"
                                fetchSuggestionsApi={fetchSuggestionsApi}
                                fetchSearchResultsApi={fetchSearchResultsApi}
                                defaultFetchApi={defaultFetchApi}
                                getSuggestionLabel={(suggestion) => suggestion.question}
                                getSuggestionValue={(suggestion) => suggestion.question}
                                inputWidth="w-[350px]"
                                onSearchChange={handleSearchChange}
                            /> 
                        </div>

                        <div className="w-[180px] flex-shrink-0">
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
                        <div className="w-[180px] flex-shrink-0">
                            <MultiSelector
                                selectedCount={selectedTagCount}
                                options={options}
                                selectedOptions={selectedOptions}
                                handleOptionClick={handleTagOption}
                                type={selectedTagCount > 1 ? 'Topics' : 'Topic'}
                            />
                        </div>   
                        <div className="ml-auto">
                            {logSelectedRowsFunction && tableInstance && (
                                <McqDeleteVaiarntComp
                                    table={tableInstance}
                                    logSelectedRows={logSelectedRowsFunction}
                                />
                            )}
                        </div> 
                    </div>
                    

                    <DataTable
                        data={quizData || []} // Ensure data is never undefined
                        columns={columns}
                        mcqSide={true}
                        getSelectedRowsFunction={handleGetSelectedRowsFunction}
                    />


                    {totalMCQQuestion > 0 && (
                        <div className='py-4 flex justify-end'>
                            <DataTablePagination
                                totalStudents={totalMCQQuestion}
                                lastPage={lastPage}
                                pages={totalPages}
                                fetchStudentData={fetchCodingQuestions}
                            />
                        </div>
                    )}
                </MaxWidthWrapper>
            )}
      </>
    )}
        {/* Manage Topics Dialog */}
        <ManageTopics
            isOpen={isManageTopicsOpen}
            onClose={() => setIsManageTopicsOpen(false)}
            onTopicCreated={() => {
                getAllTags() // Refresh the topics list
                setIsManageTopicsOpen(false)
            }}
        />
    </>
    )
}
export default Mcqs