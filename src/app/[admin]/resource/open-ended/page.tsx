'use client'

// External imports
import React, { useCallback, useEffect, useState, useMemo } from 'react'
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
import NewOpenEndedQuestionForm from '@/app/[admin]/resource/_components/NewOpenEndedQuestionForm'
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
import MultiSelector from '@/components/ui/multi-selector'
import difficultyOptions from '@/app/utils'
import { POSITION, OFFSET } from '@/utils/constant'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import ManageTopics from '../_components/ManageTopics'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import {
    OpenEndedQuestionType,
    OpenPageTag,
    OpenOption,
} from '@/app/[admin]/resource/open-ended/adminResourceOpenType'
import { SearchBox } from '@/utils/searchBox'
import {OpenEndedQuestionsSkeleton} from '@/app/[admin]/[organization]/courses/[courseId]/_components/adminSkeleton'

type Props = {}

const OpenEndedQuestions = (props: Props) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [selectedTag, setSelectedTag] = useState<OpenPageTag>({
        tagName: "All Topics",
        id: -1,
    });
    

    const { selectedOptions, setSelectedOptions } =
        getSelectedOpenEndedOptions()
    const [options, setOptions] = useState<OpenOption[]>([
        { value: '-1', label: 'All Topics' },
    ])
    const { tags, setTags } = getCodingQuestionTags()
    const { difficulty, setDifficulty } = getOpenEndedDifficulty()
    const [allOpenEndedQuestions, setAllOpenEndedQuestions] = useState<
        OpenEndedQuestionType[]
    >([])
    const { openEndedQuestions, setOpenEndedQuestions } =
        getopenEndedQuestionstate()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isManageTopicsOpen, setIsManageTopicsOpen] = useState(false) // NEW STATE
    const [newTopic, setNewTopic] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalOpenEndedQuestion, setTotalOpenEndedQuestion] = useState<any>(0)
    const [totalPages, setTotalPages] = useState(0)
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const position = useMemo(
        () => searchParams.get('limit') || POSITION,
        [searchParams]
    )
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
    const [loading, setLoading] = useState(true)
    const selectedLanguage = ''
    const [filtersInitialized, setFiltersInitialized] = useState(false)
    const [hasSetInitialTopicsFromURL, setHasSetInitialTopicsFromURL] =
        useState(false)

    const fetchSuggestionsApi = useCallback(async (query: string) => {
        const response = await api.get(
            `/content/openEndedQuestions?searchTerm=${encodeURIComponent(
                query
            )}&limit=5&offset=0`
        )
        return response.data.data || []
    }, [])

    const fetchSearchResultsApi = useCallback(
        async (query: string) => {
            if (query.trim()) {
                // For search results, use the same API endpoint
                const response = await api.get(
                    `/content/openEndedQuestions?searchTerm=${encodeURIComponent(
                        query
                    )}&limit=${position}&offset=${offset}`
                )
                setOpenEndedQuestions(response.data.data || [])
                setTotalOpenEndedQuestion(response.data.totalRows || 0)
                setTotalPages(response.data.totalPages || 0)
                setLastPage(response.data.totalPages || 0)
            }
        },
        [offset, position, difficulty, selectedOptions, setOpenEndedQuestions]
    )

    const defaultFetchApi = useCallback(async () => {
        await filteredOpenEndedQuestions(
            setOpenEndedQuestions,
            offset,
            position,
            difficulty,
            selectedOptions,
            setTotalOpenEndedQuestion,
            setLastPage,
            setTotalPages,
            ''
        )
    }, [offset, position, difficulty, selectedOptions, setOpenEndedQuestions])

    useEffect(() => {
        if (!options || options.length <= 1 || hasSetInitialTopicsFromURL)
            return

        const params = new URLSearchParams(window.location.search)

        // Topics
        const topicsParam = params.get('topics')
        if (topicsParam) {
            const topicValues = topicsParam.split(',')
            const selectedTopics = topicValues
                .map((value) => options.find((opt) => opt.value === value))
                .filter(Boolean) as OpenOption[]
            setSelectedOptions(
                selectedTopics.length > 0
                    ? selectedTopics
                    : [{ value: '-1', label: 'All Topics' }]
            )
        }

        // Difficulty
        const difficultyParam = params.get('difficulty')
        if (difficultyParam) {
            const difficultyValues = difficultyParam.split(',')
            const selectedDifficulties = difficultyValues
                .map((value) =>
                    difficultyOptions.find((opt) => opt.value === value)
                )
                .filter(Boolean) as OpenOption[]
            setDifficulty(
                selectedDifficulties.length > 0
                    ? selectedDifficulties
                    : [{ value: 'None', label: 'All Difficulty' }]
            )
        }

        setHasSetInitialTopicsFromURL(true)
        setFiltersInitialized(true)
    }, [options, hasSetInitialTopicsFromURL])

    // Update URL when filters change
    useEffect(() => {
        if (!filtersInitialized) return

        const params = new URLSearchParams(window.location.search)

        // Update topics
        if (
            !(selectedOptions.length === 1 && selectedOptions[0].value === '-1')
        ) {
            const topicValues = selectedOptions
                .map((option) => option.value)
                .join(',')
            params.set('topics', topicValues)
        } else {
            params.delete('topics')
        }

        // Update difficulty
        if (!(difficulty.length === 1 && difficulty[0].value === 'None')) {
            const difficultyValues = difficulty
                .map((option) => option.value)
                .join(',')
            params.set('difficulty', difficultyValues)
        } else {
            params.delete('difficulty')
        }

        // Keep existing search param from SearchBox
        const searchParam = searchParams.get('search')
        if (searchParam) {
            params.set('search', searchParam)
        }

        const newUrl = `?${params.toString()}`
        router.replace(newUrl)
    }, [selectedOptions, difficulty, filtersInitialized, router, searchParams])

    const fetchCodingQuestions = useCallback(
        async (offset: number) => {
            const searchParam = searchParams.get('search') || ''

            const selectedTopicIds = selectedOptions
                .filter((option) => option.value !== '-1')
                .map((option) => Number(option.value)) // Convert to numbers

            const selectedDifficultyLevels = difficulty
                .filter((option) => option.value !== 'None')
                .map((option) => option.value)

            try {
                const response = await api.get(`/content/openEndedQuestions`, {
                    params: {
                        searchTerm: searchParam,
                        limit: position,
                        offset: offset,
                        tagId: selectedTopicIds, // ✅ Change 'topics' to 'tagId'
                        difficulty: selectedDifficultyLevels,
                    },
                })

                const { data, totalRows, totalPages } = response.data

                setOpenEndedQuestions(data || [])
                setTotalOpenEndedQuestion(totalRows || 0)
                setTotalPages(totalPages || 0)
                setLastPage(totalPages || 0)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching open-ended questions:', error)
            }
        },
        [
            difficulty,
            selectedOptions,
            position,
            searchParams,
            setOpenEndedQuestions,
        ]
    )

    // Fetch questions when filters change
    useEffect(() => {
        if (!filtersInitialized) return
        fetchCodingQuestions(offset)
    }, [
        difficulty,
        selectedOptions,
        // offset,
        filtersInitialized,
        // fetchCodingQuestions,
    ])

    useEffect(() => {
        getAllOpenEndedQuestions((data: OpenEndedQuestionType[]) => {
            setAllOpenEndedQuestions(data)
        })
    }, [])

    // Add this refresh function
    const refreshQuestions = useCallback(async () => {
        await fetchCodingQuestions(offset)
    }, [fetchCodingQuestions, offset])

    const handleTopicClick = (value: string) => {
        const tag = tags.find((t) => t.tagName === value) || {
            tagName: 'All Topics',
            id: -1,
        }
        setSelectedTag(tag)
    }

    const selectedTagCount = selectedOptions.length
    const difficultyCount = difficulty.length

    const handleTagOption = (option: OpenOption) => {
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

    const handleDifficulty = (option: OpenOption) => {
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

    useEffect(() => {
        const handleRouteChange = () => {
            // Reset filters on route change
            setSelectedOptions([{ value: '-1', label: 'All Topics' }])
            setDifficulty([{ value: 'None', label: 'All Difficulty' }])
        }
        window.addEventListener('beforeunload', handleRouteChange)
        return () => {
            handleRouteChange() // manually call on unmount
            window.removeEventListener('beforeunload', handleRouteChange)
        }
    }, [])

    return (
        <>
            {loading ? (
                 <OpenEndedQuestionsSkeleton />
            ) : (
                <div>
                    {allOpenEndedQuestions?.length > 0 ? (
                        <MaxWidthWrapper>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-left font-heading font-bold text-3xl text-foreground">
                                        Content Bank - Open-Ended Questions
                                    </h1>
                                </div>

                                <div className="flex flex-row items-center gap-2">
                                    {/* UPDATED: Replace Create Topic Dialog with Manage Topics Button */}
                                    <Button
                                        variant={'outline'}
                                        className="lg:max-w-[150px] w-full shadow-4dp"
                                        onClick={() => setIsManageTopicsOpen(true)}
                                    >
                                        <p>Manage Topics</p>
                                    </Button>
                                    
                                    <Dialog
                                        onOpenChange={setIsDialogOpen}
                                        open={isDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button className="bg-primary hover:bg-primary-dark shadow-4dp">
                                                {' '}
                                                Create Question
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent preventOutsideClose={true} className="sm:max-w-[500px]">
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
                                                    filteredOpenEndedQuestions={
                                                        filteredOpenEndedQuestions
                                                    }
                                                    setOpenEndedQuestions={
                                                        setOpenEndedQuestions
                                                    }
                                                    selectedOptions={
                                                        selectedOptions
                                                    }
                                                    // difficulty={difficulty}
                                                    offset={offset}
                                                    position={position}
                                                    onQuestionCreated={
                                                        refreshQuestions
                                                    }
                                                />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div>
                                    <SearchBox
                                        placeholder="Search Question"
                                        fetchSuggestionsApi={
                                            fetchSuggestionsApi
                                        }
                                        fetchSearchResultsApi={
                                            fetchSearchResultsApi
                                        }
                                        defaultFetchApi={defaultFetchApi}
                                        getSuggestionLabel={(suggestion) =>
                                            suggestion.question
                                        }
                                        getSuggestionValue={(suggestion) =>
                                            suggestion.question
                                        }
                                        inputWidth="w-[350px]"
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
                            <h1 className="text-left font-semibold text-2xl text-foreground">
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
                                    <DialogContent preventOutsideClose={true} className="sm:max-w-[500px]">
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
                                                filteredOpenEndedQuestions={
                                                    filteredOpenEndedQuestions
                                                }
                                                setOpenEndedQuestions={
                                                    setOpenEndedQuestions
                                                }
                                                selectedOptions={
                                                    selectedOptions
                                                }
                                                // difficulty={difficulty}
                                                offset={offset}
                                                position={position}
                                                onQuestionCreated={
                                                    refreshQuestions
                                                }
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </MaxWidthWrapper>
                        </>
                    )}
                    <div className='pb-4 flex justify-end'>
                        <DataTablePagination
                            totalStudents={totalOpenEndedQuestion}
                            lastPage={lastPage}
                            pages={totalPages}
                            fetchStudentData={fetchCodingQuestions}
                        />
                    </div>
                </div>
            )}

            {/* NEW: Manage Topics Dialog */}
            <ManageTopics
                isOpen={isManageTopicsOpen}
                onClose={() => setIsManageTopicsOpen(false)}
                onTopicCreated={() => {
                    getAllTags(setTags, setOptions)
                    setIsManageTopicsOpen(false)
                }}
            />
        </>
    )
}

export default OpenEndedQuestions
