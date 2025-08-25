'use client'
import React, { useCallback, useEffect, useState, useRef, KeyboardEvent, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { Spinner } from '@/components/ui/spinner'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { api } from '@/utils/axios.config'
import { getBatchData, getCourseData, getStoreStudentData } from '@/store/store'
import useDebounce from '@/hooks/useDebounce'
import { fetchStudentData } from '@/utils/students'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DataTable } from '@/app/_components/datatable/data-table'
import { useStudentData } from '@/app/admin/courses/[courseId]/(courseTabs)/students/components/useStudentData'
import { createColumns } from './columns'
// import { DataTable } from './dataTable'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import{StudentData,BatchSuggestion,StudentDataState,ParamsType} from "@/app/admin/courses/[courseId]/(courseTabs)/batches/courseBatchesType"

const Page = ({ params }: { params: ParamsType}) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { students } = useStudentData(params.courseId)
    const { courseData, fetchCourseDetails } = getCourseData()
    const { fetchBatches, batchData, setBatchData } = getBatchData()
    const { setStoreStudentData } = getStoreStudentData()

    // Search related states
    const [searchQuery, setSearchQuery] = useState('')
    const [suggestions, setSuggestions] = useState<BatchSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [isInitialized, setIsInitialized] = useState(false)
    const [hasFetchedOnce, setHasFetchedOnce] = useState(false)

    // Other states
    const [loading, setLoading] = useState(true)
    const [assignStudents, setAssignStudents] = useState('')
    const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
    const [totalStudents, setTotalStudents] = useState([...students])
    const [searchStudent, setSearchStudent] = useState('')

    // const assignLearners = form.watch('assignLearners')
    const inputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Debounced values - ONLY for suggestions, not for page search
    const debouncedSuggestionQuery = useDebounce(searchQuery, 200)
    const debouncedSearchStudent = useDebounce(searchStudent, 1000)
    const [studentData, setStudentData] = useState<StudentDataState | any>({})

    const formSchema = z.object({
        name: z.string().min(2, {
            message: 'Batch name must be at least 2 characters.',
        }),
        instructorEmail: z.string().email(),
        bootcampId: z
            .string()
            .refine((bootcampId) => !isNaN(parseInt(bootcampId))),
        capEnrollment: z.string().refine(
            (capEnrollment) => {
                const parsedValue = parseInt(capEnrollment)
                return (
                    !isNaN(parsedValue) &&
                    parsedValue > 0 &&
                    parsedValue <= 100000
                )
            },
            {
                message:
                    'Cap Enrollment must be a positive number between 1 and 100,000',
            }
        ),
        assignLearners: z.string(),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            instructorEmail: '',
            bootcampId: courseData?.id.toString() ?? '',
            capEnrollment: '',
            assignLearners: 'all',
        },
        values: {
            name: '',
            instructorEmail: '',
            bootcampId: courseData?.id.toString() ?? '',
            capEnrollment: '',
            assignLearners: 'all',
        },
        mode: 'onChange',
    })

    // Update URL when query changes
    const updateURL = (query: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (query.trim()) {
            params.set('search', query.trim())
        } else {
            params.delete('search')
        }

        const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname
        router.push(newURL, { scroll: false })
    }

    // Handle search with better error handling and logging
    const handleSearch = useCallback(async (query: string) => {
        try {
            if (query.trim()) {
                const response = await api.get(
                    `/bootcamp/searchBatch/${params.courseId}?searchTerm=${query.trim()}`
                )
                setBatchData(response.data || [])
            } else {
                // When query is empty, fetch all batches
                fetchBatches(params.courseId)
            }
        } catch (error) {
            console.error('Error searching batches:', error)
            setBatchData([])
        }
    }, [params.courseId, setBatchData, fetchBatches])

    // Fetch suggestions for dropdown
    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSuggestions([])
            return
        }
        try {
            const response = await api.get(
                `/bootcamp/searchBatch/${params.courseId}?searchTerm=${query}`
            )
            setSuggestions(response.data || [])
        } catch (error) {
            console.error('Error fetching batch suggestions:', error)
            setSuggestions([])
        }
    }, [params.courseId])
  
    // SIMPLIFIED: Single initialization effect
    useEffect(() => {
        if (!isInitialized) {
            const urlQuery = searchParams.get('search')?.trim() || ''
            // Set states
            setIsInitialized(true)
            setSearchQuery(urlQuery)

            // Add a small delay to ensure all states are set
            setTimeout(() => {
                if (urlQuery) {
                    handleSearch(urlQuery)
                } else {
                    fetchBatches(params.courseId)
                }
            }, 100)
        }
    }, [isInitialized, searchParams, params.courseId, handleSearch, fetchBatches])

    // Handle URL changes (for browser back/forward)
    useEffect(() => {
        if (isInitialized) {
            const urlQuery = searchParams.get('search')?.trim() || ''

            // Only handle if URL changed and input is not focused
            if (urlQuery !== searchQuery && document.activeElement !== inputRef.current) {
                setSearchQuery(urlQuery)

                if (urlQuery) {
                    handleSearch(urlQuery)
                } else {
                    fetchBatches(params.courseId)
                }
            }
        }
    }, [searchParams, isInitialized, searchQuery, handleSearch, fetchBatches, params.courseId])

    // Fetch suggestions for dropdown - ONLY debounced for suggestions
    useEffect(() => {
        fetchSuggestions(debouncedSuggestionQuery)
    }, [debouncedSuggestionQuery, fetchSuggestions])

    // Filter and limit suggestions
    const filteredSuggestions = useMemo(() => {
        if (!searchQuery.trim()) return [];

        return suggestions
            .filter(suggestion =>
                suggestion.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                suggestion.name.toLowerCase() !== searchQuery.toLowerCase()
            )
            .slice(0, 6);
    }, [suggestions, searchQuery]);

    
    // Clear input function to show all batches
    const clearSearch = () => {
        setSearchQuery('')
        setShowSuggestions(false)
        setSelectedIndex(-1)
        updateURL('') // Clear URL parameter
        fetchBatches(params.courseId) // Fetch all batches
    }

    // Input change handler - NO debouncing for page search
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Force update the search query state
        setSearchQuery(value)
        setSelectedIndex(-1)

        if (value.trim()) {
            setShowSuggestions(true)
            // DO NOT update URL while typing - only update when user selects or presses Enter
        } else {
            setShowSuggestions(false)
            // When input is cleared, update URL and fetch all batches immediately
            updateURL('')
            fetchBatches(params.courseId)
        }
    }

    // REMOVED: Debounced search effect - no longer needed

    const handleSuggestionClick = async (suggestion: BatchSuggestion) => {
        setSearchQuery(suggestion.name)
        setShowSuggestions(false)
        setSelectedIndex(-1)
        updateURL(suggestion.name)
        inputRef.current?.blur()

        await handleSearch(suggestion.name) // Trigger search when suggestion is selected
    }

    const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || filteredSuggestions.length === 0) {
            if (e.key === 'Escape') {
                setShowSuggestions(false)
                setSelectedIndex(-1)
            }
            // Handle Enter key even when no suggestions are shown
            if (e.key === 'Enter') {
                e.preventDefault()
                await handleSearch(searchQuery) // Search when user presses Enter
            }
            return
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                )
                break

            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                )
                break

            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
                    handleSuggestionClick(filteredSuggestions[selectedIndex])
                }
                else {
                    updateURL(searchQuery)
                    await handleSearch(searchQuery) // Search when user presses Enter directly
                }
                break

            case 'Escape':
                e.preventDefault()
                setShowSuggestions(false)
                setSelectedIndex(-1)
                inputRef.current?.blur()
                break
        }
    }

    const handleInputFocus = () => {
        if (searchQuery && filteredSuggestions.length > 0) {
            setShowSuggestions(true)
        }
    }

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setTimeout(() => {
            if (!suggestionsRef.current?.contains(document.activeElement)) {
                setShowSuggestions(false)
                setSelectedIndex(-1)
            }
        }, 200)
    }

    // Scroll selected suggestion into view
    useEffect(() => {
        if (selectedIndex >= 0 && suggestionsRef.current) {
            const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                })
            }
        }
    }, [selectedIndex])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const studentIds = selectedRows.map((student) => student.id)

            const convertedData = {
                name: values.name,
                instructorEmail: values.instructorEmail,
                bootcampId: +values.bootcampId,
                capEnrollment: +values.capEnrollment,
                assignAll: studentIds.length > 0 ? false : true,
                studentIds: studentIds,
            }
            const convertedName: string = convertedData.name
                .replace(/\s+/g, '') // Remove all whitespace characters
                .toLowerCase()
            const matchedBatchData = batchData?.find(
                (batchDataItem) =>
                    convertedName === batchDataItem.name.toLowerCase()
            )

            if (matchedBatchData) {
                toast.error({
                    title: 'Cannot Create New Batch',
                    description: 'This Batch Name Already Exists',
                })
            } else {
                const res = await api.post(`/batch`, convertedData)
                setAssignStudents('')
                if (params.courseId) {
                    fetchBatches(params.courseId)
                    fetchStudentData(params.courseId, setStoreStudentData)
                    fetchCourseDetails(params.courseId)
                }
                toast.success({
                    title: res.data.status,
                    description: res.data.message,
                })
                getUnAssignedStudents()
                return true
            }
        } catch (error: any) {
            setAssignStudents('')
            toast.error({
                title: 'Failed',
                description:
                    error.response?.data?.message || 'An error occurred.',
            })
            console.error('Error creating batch:', error)
            return false
        }
    }

    // Remove conflicting effects and add proper course details fetch
    useEffect(() => {
        if (params.courseId) {
            fetchCourseDetails(params.courseId)
        }
    }, [params.courseId, fetchCourseDetails])

    // Handle loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const getUnAssignedStudents = useCallback(async () => {
    
        try {
            const res = await api.get(
                `/batch/allUnassignStudent/${params.courseId}?searchTerm=${debouncedSearchStudent}`
            )
            setTotalStudents(res.data.data)
        } catch (err) {
            console.error("Failed to fetch unassigned students:", err)
        }
    }, [debouncedSearchStudent, params.courseId])
    

    useEffect(() => {
        getUnAssignedStudents()
    }, [getUnAssignedStudents, debouncedSearchStudent, params.courseId])

    const handleSearchStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchStudent(e.target.value)
    }

    const assignLearners = form.watch('assignLearners')
    const capEnrollmentValue = form.watch("capEnrollment");

    const columns = useMemo(() => createColumns(Number(capEnrollmentValue)), [capEnrollmentValue])

    const handleModal = (isOpen: boolean) => {
        isOpen && form.reset()
        setAssignStudents('')
    }

    const renderModal = (emptyState: boolean) => {
        if (courseData?.unassigned_students === 0) {
            return (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="lg:max-w-[150px] w-full mt-5">
                            {emptyState ? '+ Create Batch' : 'New Batch'}
                        </Button>
                    </DialogTrigger>
                    <DialogOverlay />
                    <AddStudentsModal
                        message={true}
                        id={courseData?.id || 0}
                        batch={false}
                        batchData={batchData ? batchData?.length > 0 : false}
                        batchId={0}
                        setStudentData={setStudentData}
                        studentData={studentData}
                    />
                </Dialog>
            )
        } else {
            return (
                <Dialog onOpenChange={(isOpen) => handleModal(isOpen)}>
                    <DialogTrigger asChild>
                        <Button className="lg:max-w-[150px] w-full mt-5">
                            {emptyState ? '+ Create Batch' : 'New Batch'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>New Batch</DialogTitle>
                            Unassigned Students in Records:{' '}
                            {courseData?.unassigned_students}
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    onError={(e) =>
                                        toast.error({
                                            title: 'Failed',
                                            description:
                                                'Entered Corect values',
                                        })
                                    }
                                    className="space-y-8"
                                >
                                    {assignStudents === 'manually' ? (
                                        <>
                                            <Input
                                                type="search"
                                                placeholder="Search"
                                                className="w-full"
                                                value={searchStudent}
                                                onChange={handleSearchStudents}
                                            />
                                            <DataTable
                                                data={totalStudents}
                                                columns={columns}
                                                setSelectedRows={
                                                    setSelectedRows
                                                }
                                                assignStudents={assignStudents}
                                            />
                                            <h1 className="pt-2 text-[1rem]">
                                                Total Learners Selected:{' '}
                                                {selectedRows.length}/{capEnrollmentValue}
                                            </h1>
                                            <div className="flex justify-between w-full pt-2">
                                                <Button
                                                    className="w-3/2 bg-muted text-muted-foreground"
                                                    onClick={() =>
                                                        setAssignStudents('')
                                                    }
                                                >
                                                    Back
                                                </Button>
                                                <DialogClose asChild>
                                                    <Button
                                                        className="w-3/2"
                                                        type="submit"
                                                        disabled={
                                                            !form.formState
                                                                .isValid
                                                        }
                                                    >
                                                        Create batch
                                                    </Button>
                                                </DialogClose>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Batch Name
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Batch Name"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="instructorEmail"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Instructor Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="instructor@navgurukul.org"
                                                                type="name"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="capEnrollment"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Cap Enrollment
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Cap Enrollment (max: 100,000)"
                                                                type="name"
                                                                {...field}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    // Prevent entering more than 6 digits
                                                                    const value =
                                                                        e.target
                                                                            .value
                                                                    if (
                                                                        value.length <=
                                                                        6
                                                                    ) {
                                                                        field.onChange(
                                                                            e
                                                                        )
                                                                    }
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                // name="capEnrollment"
                                                name="assignLearners" // Changed name to make it unique
                                                render={({ field }) => (
                                                    <FormItem className="text-start">
                                                        <FormLabel>
                                                            Assign Learners to
                                                            Batch
                                                        </FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={
                                                                    field.onChange
                                                                }
                                                                value={
                                                                    field.value ||
                                                                    ''
                                                                } // Correct use of value
                                                                className="flex gap-4"
                                                            >
                                                                {/* Option: All learners */}
                                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value="all" />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        All
                                                                        learners
                                                                    </FormLabel>
                                                                </FormItem>

                                                                {/* Option: Assign manually */}
                                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value="manually" />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">
                                                                        Assign
                                                                        manually
                                                                    </FormLabel>
                                                                </FormItem>
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {assignLearners === 'all' && (
                                                <FormDescription>
                                                     {`${courseData?.unassigned_students} ${courseData?.unassigned_students === 1 ? ' student' : ' students'} will be added to
                                                    this batch (Maximum current availability)`}
                                                </FormDescription>
                                            )}
                                            <div className="w-full flex flex-col items-end gap-y-5 ">
                                                {assignLearners === 'all' ? (
                                                    <DialogClose asChild>
                                                        <Button
                                                            className="w-1/2"
                                                            type="submit"
                                                            disabled={
                                                                !form.formState
                                                                    .isValid
                                                            }
                                                        >
                                                            Create batch
                                                        </Button>
                                                    </DialogClose>
                                                ) : (
                                                    <Button
                                                        className="w-1/2"
                                                        onClick={() =>
                                                            setAssignStudents(
                                                                'manually'
                                                            )
                                                        }
                                                        disabled={
                                                            !form.formState
                                                                .isValid
                                                        }
                                                    >
                                                        Next: Assign Learners to
                                                        Batch
                                                    </Button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </form>
                            </Form>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            )
        }
    }
    if (courseData?.id) {
        return (
            <div>
                <div className="relative flex flex-col lg:flex-row items-center justify-between mb-6">
                    {batchData ? (
                        <div className="relative lg:w-[400px] w-full">
                            <Input
                                ref={inputRef}
                                // type="search"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                className="lg:w-[400px] w-full"
                                autoComplete="off"
                            />
                            {/* clearSearch */}
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1">
                                    <div className="bg-white border border-border rounded-md shadow-lg overflow-hidden">
                                        {filteredSuggestions.map((suggestion, index) => (
                                            <div
                                                key={suggestion.id}
                                                className={cn(
                                                    "px-3 py-2.5 cursor-pointer text-sm transition-colors",
                                                    "hover:bg-muted/50",
                                                    index === selectedIndex && "bg-muted"

                                                )}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                            >
                                                <div className="capitalize font-medium text-foreground text-left">
                                                    {suggestion.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                    {renderModal(false)}
                </div>

                {loading ? (
                    <div className="my-5 flex justify-center items-center">
                        <div className="absolute h-screen">
                            <div className="relative top-[70%]">
                                <Spinner className="text-secondary" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 mt-2">
                        {batchData?.length ?? 0 > 0 ? (
                            batchData?.map((batch: any, index: number) => (
                                <Link
                                    key={batch.name}
                                    href={`/admin/courses/${courseData?.id}/batch/${batch.id}`}
                                >
                                    <Card
                                        key={batch.id}
                                        className="text-gray-900 text-base"
                                    >
                                        <div className="bg-white rounded-lg border p-4">
                                            <div className="px-1 py-4 flex flex-col items-start">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <CardTitle className="font-semibold capitalize cursor-pointer">
                                                                {batch.name
                                                                    .length > 25
                                                                    ? batch.name.substring(
                                                                          0,
                                                                          25
                                                                      ) + '...'
                                                                    : batch.name}
                                                            </CardTitle>
                                                        </TooltipTrigger>
                                                        {batch.name.length >
                                                            25 && (
                                                            <TooltipContent>
                                                                {batch.name}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <CardDescription className="capitalize">
                                                    {batch.students_enrolled}{' '}
                                                    <span>Learners</span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))
                        ) : searchQuery ? (
                            <div className="w-full flex flex-col items-center justify-center gap-y-3 absolute">
                                <div className="text-center">
                                    <p className="text-lg font-medium text-gray-600">
                                        No batches found for {searchQuery}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Try adjusting your search or create a new batch
                                    </p>
                                </div>
                                {renderModal(true)}
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center justify-center gap-y-3 absolute">
                                <Image
                                    src="/batches.svg"
                                    alt="create batch"
                                    width={100}
                                    height={100}
                                />
                                <p>
                                    Start by creating the first batch for the
                                    course. Learners will get added
                                    automatically based on enrollment cap
                                </p>
                                {renderModal(true)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }
}

export default Page