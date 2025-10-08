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
import { columns } from '@/app/[admin]/resource/coding/column'
import NewCodingProblemForm from '@/app/[admin]/resource/_components/NewCodingProblemForm'
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
import { getAllCodingQuestions, filteredCodingQuestions } from '@/utils/admin'
import Image from 'next/image'
import { Spinner } from '@/components/ui/spinner'
import EditCodingQuestionForm from '../_components/EditCodingQuestionForm'
import MultiSelector from '@/components/ui/multi-selector'
import difficultyOptions from '@/app/utils'
import CreatTag from '../_components/creatTag'
import { toast } from '@/components/ui/use-toast'
import { useSearchParams, useRouter } from 'next/navigation'
import { ROWS_PER_PAGE } from '@/utils/constant'
import {
    Tag,
    SearchSuggestion,
    Option,
} from '@/app/[admin]/resource/coding/adminResourceCodinType'
import { useSearchWithSuggestions } from '@/utils/useUniversalSearchDynamic'
import { SearchBox } from '@/utils/searchBox'

const CodingProblems = () => {
    const router = useRouter()
    const { codingQuestions, setCodingQuestions } = getcodingQuestionState()
    const [allCodingQuestions, setAllCodingQuestions] = useState([])
    const [areOptionsLoaded, setAreOptionsLoaded] = useState(false)

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

    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCodingQuestion, setTotalCodingQuestion] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const position = useMemo(
        () => searchParams.get('limit') || POSITION,
        [searchParams]
    )
    const offset = useMemo(() => {
        const page = searchParams.get('page')
        return page ? parseInt(page) : OFFSET
    }, [searchParams])
    const [newTopic, setNewTopic] = useState<string>('')
    const [urlInitialized, setUrlInitialized] = useState(false)
    const [isSearchActive, setIsSearchActive] = useState(false)
    const [lastSearchQuery, setLastSearchQuery] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    // const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    // Custom hook for search with suggestions
    const fetchSuggestionsApi = useCallback(async (query: string) => {
        const response = await api.get('/Content/allCodingQuestions', {
            params: {
                searchTerm: query,
            },
        })
        let questionsData = response.data
        if (response.data.data) questionsData = response.data.data
        if (response.data.questions) questionsData = response.data.questions

        if (!Array.isArray(questionsData)) {
            console.error('Expected array but got:', typeof questionsData)
            return []
        }

        const suggestions = questionsData.map((question: SearchSuggestion) => ({
            id: question.id,
            title: question.title,
            difficulty: question.difficulty || 'N/A',
        }))
        return suggestions
    }, [])

    const fetchSearchResultsApi = useCallback(
        async (query: string) => {
            setIsSearchActive(!!query)
            setLastSearchQuery(query)

            await filteredCodingQuestions(
                setCodingQuestions,
                offset,
                position,
                difficulty,
                selectedOptions,
                setTotalCodingQuestion,
                setLastPage,
                setTotalPages,
                query,
                ''
            )
        },
        [offset, position, difficulty, selectedOptions]
    )

    // Modified defaultFetchApi - no automatic calls
    const defaultFetchApi = useCallback(async () => {
        setIsSearchActive(false)
        setLastSearchQuery('')

        await filteredCodingQuestions(
            setCodingQuestions,
            offset,
            position,
            difficulty,
            selectedOptions,
            setTotalCodingQuestion,
            setLastPage,
            setTotalPages,
            '',
            ''
        )
    }, [offset, position, difficulty, selectedOptions])

    // First, load all tags and options
    async function getAllTags() {
        try {
            const response = await api.get('Content/allTags')
            const tagArr = [
                { id: -1, tagName: 'All Topics' },
                ...response.data.allTags,
            ]

            const transformedData = tagArr.map(
                (item: { id: any; tagName: any }) => ({
                    value: item.id.toString(),
                    label: item.tagName,
                })
            )

            setTags(
                tagArr.map((item) => ({ id: item.id, tagName: item.tagName }))
            )
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

        // Initialize search query from URL
        const urlSearch = urlParams.get('search')
        if (urlSearch) {
            setIsSearchActive(true)
            setLastSearchQuery(urlSearch)
        } else {
            setIsSearchActive(false)
            setLastSearchQuery('')
        }

        // Initialize topics
        const urlTopics = urlParams.get('topics')
        if (urlTopics) {
            const topicIds = urlTopics.split(',')
            const matchedOptions = topicIds
                .map((id) => options.find((opt) => opt.value === id))
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
                .map((val) =>
                    difficultyOptions.find((opt) => opt.value === val)
                )
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

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

    const toggleOption = (
        option: Option,
        current: Option[],
        setFn: (opts: Option[]) => void,
        allValue: string
    ) => {
        if (option.value === allValue) {
            setFn([option])
        } else {
            if (current.some((item) => item.value === allValue)) {
                setFn([option])
            } else if (current.some((item) => item.value === option.value)) {
                setFn(current.filter((item) => item.value !== option.value))
            } else {
                setFn([...current, option])
            }
        }
    }

    // usage:
    const handleTagOption = (opt: Option) =>
        toggleOption(opt, selectedOptions, setSelectedOptions, '-1')
    const handleDifficulty = (opt: Option) =>
        toggleOption(opt, difficulty, setDifficulty, 'None')

    const fetchCodingQuestions = useCallback(
        async (offset: number) => {
            // Don't fetch if search is active
            if (isSearchActive) return

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
                    '', // Always empty for filter-based fetch
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
        [selectedOptions, difficulty, position, isSearchActive]
    )

    // Fetch data only after URL is initialized
    useEffect(() => {
        if (!urlInitialized) return

        const fetchData = async () => {
            await getAllCodingQuestions(setAllCodingQuestions)
        }
        fetchData()
    }, [urlInitialized])

    // Modified: Only fetch when filters change and search is not active
    useEffect(() => {
        if (!urlInitialized || isSearchActive) return

        const fetchData = async () => {
            await fetchCodingQuestions(offset)
        }
        fetchData()
    }, [
        urlInitialized,
        selectedOptions,
        difficulty,
        offset,
        fetchCodingQuestions,
        isSearchActive,
    ])

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

        // Update topics
        if (
            selectedOptions.length > 0 &&
            !selectedOptions.some((opt) => opt.value === '-1')
        ) {
            const topicValues = selectedOptions
                .map((opt) => opt.value)
                .join(',')
            params.set('topics', topicValues)
        } else {
            params.delete('topics')
        }

        // Update difficulty
        if (
            difficulty.length > 0 &&
            !difficulty.some((opt) => opt.value === 'None')
        ) {
            const difficultyValues = difficulty
                .map((opt) => opt.value)
                .join(',')
            params.set('difficulty', difficultyValues)
        } else {
            params.delete('difficulty')
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`
        const currentUrl = `${window.location.pathname}${window.location.search}`

        if (newUrl !== currentUrl) {
            router.replace(newUrl)
        }
    }, [selectedOptions, difficulty, router, urlInitialized])

    const getActiveFiltersCount = () => {
        let count = 0
        if (
            selectedOptions.length > 0 &&
            !selectedOptions.some((opt) => opt.value === '-1')
        )
            count++
        if (
            difficulty.length > 0 &&
            !difficulty.some((diff) => diff.value === 'None')
        )
            count++
        if (lastSearchQuery) count++
        return count
    }

    const activeFiltersCount = getActiveFiltersCount()

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-[rgb(81,134,114)]" />
                </div>
            ) : (
                <div>
                    {allCodingQuestions.length > 0 && !isCodingDialogOpen ? (
                        <MaxWidthWrapper>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-left font-heading font-bold text-3xl text-foreground">
                                        Content Bank - Coding Problems
                                    </h1>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="lg:max-w-[150px] w-full shadow-4dp"
                                            >
                                                <p>Create Topic</p>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogOverlay />
                                        <CreatTag
                                            newTopic={newTopic}
                                            handleNewTopicChange={(e) =>
                                                setNewTopic(e.target.value)
                                            }
                                            handleCreateTopic={() => {
                                                api.post(`/Content/createTag`, {
                                                    tagName: newTopic,
                                                })
                                                    .then(() => {
                                                        toast({
                                                            title: 'Success',
                                                            description: `${newTopic} topic created`,
                                                        })
                                                        getAllTags()
                                                        setNewTopic('')
                                                    })
                                                    .catch(() => {
                                                        toast({
                                                            title: 'Error',
                                                            description:
                                                                'Unable to create topic',
                                                            variant:
                                                                'destructive',
                                                        })
                                                    })
                                            }}
                                        />
                                    </Dialog>

                                    <Dialog
                                        open={isDialogOpen}
                                        onOpenChange={setIsDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button className="bg-primary hover:bg-primary-dark shadow-4dp">
                                                + Create Problems
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Create New Coding Problem
                                                </DialogTitle>
                                            </DialogHeader>
                                            <NewCodingProblemForm
                                                tags={tags}
                                                setIsDialogOpen={
                                                    setIsDialogOpen
                                                }
                                                filteredCodingQuestions={
                                                    filteredCodingQuestions
                                                }
                                                setCodingQuestions={
                                                    setCodingQuestions
                                                }
                                                selectedOptions={
                                                    selectedOptions
                                                }
                                                difficulty={difficulty}
                                                offset={offset}
                                                position={position}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div>
                                    <SearchBox
                                        placeholder="Search..."
                                        fetchSuggestionsApi={
                                            fetchSuggestionsApi
                                        }
                                        fetchSearchResultsApi={
                                            fetchSearchResultsApi
                                        }
                                        defaultFetchApi={defaultFetchApi}
                                        getSuggestionLabel={(suggestion) => (
                                            <div>
                                                <div className="font-medium">
                                                    {suggestion.title}
                                                </div>
                                            </div>
                                        )}
                                        getSuggestionValue={(suggestion) =>
                                            suggestion.title
                                        }
                                        inputWidth="w-[350px]"
                                    />
                                </div>

                                <div className="w-[180px] flex-shrink-0">
                                    <MultiSelector
                                        selectedCount={
                                            difficulty.filter(
                                                (d) => d.value !== 'None'
                                            ).length
                                        }
                                        options={difficultyOptions}
                                        selectedOptions={difficulty}
                                        handleOptionClick={handleDifficulty}
                                        type="Difficulty"
                                    />
                                </div>

                                <div className="w-[180px] flex-shrink-0">
                                    <MultiSelector
                                        selectedCount={
                                            selectedOptions.filter(
                                                (o) => o.value !== '-1'
                                            ).length
                                        }
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
                            {!isCodingDialogOpen &&
                                !isCodingEditDialogOpen &&
                                codingQuestions.length === 0 && (
                                    <>
                                        <h1 className="text-left font-semibold text-2xl text-foreground">
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
                                                No coding problems have been
                                                created yet. Start by adding the
                                                first one
                                            </h2>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button className="bg-primary hover:bg-primary-dark shadow-4dp">
                                                        + Create Problems
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Create New Coding
                                                            Problem
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <NewCodingProblemForm
                                                        tags={tags}
                                                        setIsDialogOpen={(
                                                            open: boolean
                                                        ) => {
                                                            // Dialog will close automatically when open is false
                                                            if (!open) {
                                                                // Refresh the data after creating
                                                                fetchCodingQuestions(
                                                                    offset
                                                                )
                                                            }
                                                        }}
                                                        filteredCodingQuestions={
                                                            filteredCodingQuestions
                                                        }
                                                        setCodingQuestions={
                                                            setCodingQuestions
                                                        }
                                                        selectedOptions={
                                                            selectedOptions
                                                        }
                                                        difficulty={difficulty}
                                                        offset={offset}
                                                        position={position}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        </MaxWidthWrapper>
                                    </>
                                )}
                        </>
                    )}

                    {/* Edit Dialog */}
                    <Dialog
                        open={isCodingEditDialogOpen}
                        onOpenChange={setIsCodingEditDialogOpen}
                    >
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Coding Problem</DialogTitle>
                            </DialogHeader>
                            <EditCodingQuestionForm />
                        </DialogContent>
                    </Dialog>

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
