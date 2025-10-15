'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
    AlertCircle,
    ChevronDown,
    GraduationCap,
    Plus,
    Search,
    X,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import NewCourseDialog from './_components/newCourseDialog'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { OFFSET, POSITION } from '@/utils/constant'
import styles from './_components/cources.module.css'
import { COURSE_FILTER } from '@/utils/constant'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from '@/components/ui/use-toast'
import useDebounce from '@/hooks/useDebounce'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useStudentData } from '@/store/store'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { getPermissions } from '@/lib/GetPermissions'
import {
    Course,
    CourseData,
    CoursesResponse,
} from '@/app/[admin]/courses/[courseId]/submissionVideo/submissionVideoIdPageType'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import CourseCard from './_components/CourseCard'
import { useAllCourses } from '@/hooks/useAllCourses'
import { useBootcamps } from '@/hooks/useBootcamps'
import { useCreateBootcamp } from '@/hooks/useCreateBootcamp'

const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'draft', label: 'Draft' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
]

const Courses: React.FC = () => {
    // misc
    const router = useRouter()
    const searchParams = useSearchParams()
    const { studentData } = useStudentData()
    const [permissions, setPermissions] = useState<Record<string, boolean>>({})

    // search state
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [searchQuery, setSearchQuery] = useState<string>(
        searchParams.get('search') || ''
    )
    const [activeSearchTerm, setActiveSearchTerm] = useState<string>(
        searchParams.get('search') || ''
    )
    const debouncedSearchForSuggestions = useDebounce(searchQuery, 100)

    // pagination & layout
    // const position = useMemo(
    //     () => searchParams.get('limit') || POSITION,
    //     [searchParams]
    // )
    // ✅ derive once per render from a primitive, not the whole object
    const limitParam = searchParams.get('limit')
    const position: number = Number(limitParam ?? POSITION) || Number(POSITION)

    const [currentPage, setCurrentPage] = useState(1)
    const [offset, setOffset] = useState<number>(OFFSET)

    // new course form
    const [newCourseName, setNewCourseName] = useState<string>('')
    const [newCourseDuration, setNewCourseDuration] = useState<string>('')

    const [newCourseDescription, setNewCourseDescription] = useState<string>('')

    // suggestions UI
    const [filteredSuggestions, setFilteredSuggestions] = useState<Course[]>([])
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
        useState<number>(-1)

    // === Hooks ===
    const { allCourses, refetchAllCourses } = useAllCourses(true)
    const { courses, loading, totalBootcamps, totalPages, refetchBootcamps } =
        useBootcamps({
            limit: position,
            searchTerm: activeSearchTerm,
            offset,
            auto: true,
        })
    const { createBootcamp, creating } = useCreateBootcamp()

    const dropdownRef = useRef<HTMLDivElement>(null)
    const searchContainerRef = useRef<HTMLDivElement>(null)
    const [statusFilter, setStatusFilter] = useState('all')

    // state and variables
    // const [activeFilter, setActiveFilter] = useState<
    //     'all' | 'active' | 'completed'
    // >('all')

    // const [pages, setPages] = useState(0)
    // const [lastPage, setLastPage] = useState(0)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Improved search filtering function for suggestions
    const filterCoursesByRelevance = (
        courses: Course[],
        searchTerm: string
    ): Course[] => {
        const lowerSearchTerm = searchTerm.toLowerCase().trim()

        if (!lowerSearchTerm) return []

        const scoredCourses = courses.map((course) => {
            const courseName = course.name.toLowerCase()
            let score = 0

            // Exact match gets highest score
            if (courseName === lowerSearchTerm) {
                score = 100
            }
            // Starts with search term gets high score
            else if (courseName.startsWith(lowerSearchTerm)) {
                score = 80
            }
            // Word boundary match gets medium score
            else if (
                courseName.includes(` ${lowerSearchTerm} `) ||
                courseName.includes(` ${lowerSearchTerm}`) ||
                courseName.includes(`${lowerSearchTerm} `)
            ) {
                score = 60
            }
            // Contains search term gets lower score
            else if (courseName.includes(lowerSearchTerm)) {
                score = 40
            }
            // No match
            else {
                score = 0
            }

            return { course, score }
        })

        // Filter out courses with no match and sort by score (descending)
        return scoredCourses
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map((item) => item.course)
            .slice(0, 6) // Limit to 6 suggestions to avoid scrolling
    }

    // Update URL when search query changes
    const updateURL = useCallback(
        (searchTerm: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (searchTerm) {
                params.set('search', searchTerm)
            } else {
                params.delete('search')
            }

            const newURL = `${window.location.pathname}?${params.toString()}`
            router.replace(newURL, { scroll: false })
        },
        [router, searchParams]
    )

    // Handle search input change - only affects suggestions, not course display
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchQuery(value)
        setSelectedSuggestionIndex(-1)

        // Show/hide suggestions based on input
        if (value.trim() && value.length > 0) {
            setShowSuggestions(true)
        } else {
            setShowSuggestions(false)
            setFilteredSuggestions([])
        }
    }

    // Handle suggestion click - this triggers course fetching
    const handleSuggestionClick = (course: Course) => {
        setSearchQuery(course.name)
        setActiveSearchTerm(course.name) // This will trigger course fetching
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        setOffset(0) // Reset to first page
        setCurrentPage(1)

        // Update URL immediately
        updateURL(course.name)
    }

    // Handle manual search (Enter key) - this triggers course fetching
    const handleManualSearch = (searchTerm: string) => {
        setActiveSearchTerm(searchTerm) // This will trigger course fetching
        setShowSuggestions(false)
        setOffset(0)
        setCurrentPage(1)
        updateURL(searchTerm)
    }

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || filteredSuggestions.length === 0) {
            if (event.key === 'Enter' && searchQuery.trim()) {
                // Manual search - trigger course fetching
                handleManualSearch(searchQuery.trim())
            }
            return
        }

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault()
                setSelectedSuggestionIndex((prev) =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                event.preventDefault()
                setSelectedSuggestionIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                )
                break
            case 'Enter':
                event.preventDefault()
                if (selectedSuggestionIndex >= 0) {
                    handleSuggestionClick(
                        filteredSuggestions[selectedSuggestionIndex]
                    )
                } else if (searchQuery.trim()) {
                    // Manual search - trigger course fetching
                    handleManualSearch(searchQuery.trim())
                }
                break
            case 'Escape':
                setShowSuggestions(false)
                setSelectedSuggestionIndex(-1)
                break
        }
    }

    // Clear search
    const clearSearch = () => {
        if (!activeSearchTerm) return // already cleared, avoid unnecessary reset
        setSearchQuery('')
        setActiveSearchTerm('') // This will trigger fetching all courses
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        setOffset(0)
        setCurrentPage(1)
        updateURL('')
        searchInputRef.current?.focus()
    }

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false)
                setSelectedSuggestionIndex(-1)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Update suggestions based on debounced search (only for suggestions)
    useEffect(() => {
        if (
            debouncedSearchForSuggestions.trim() &&
            debouncedSearchForSuggestions.length > 0
        ) {
            const filtered = filterCoursesByRelevance(
                allCourses,
                debouncedSearchForSuggestions
                
            )
            setFilteredSuggestions(filtered)
        } else {
            setFilteredSuggestions([])
        }
    }, [debouncedSearchForSuggestions, allCourses])

    useEffect(() => {
        if (searchQuery.trim() === '') {
            // If user manually clears input, reset everything
            clearSearch()
        }
    }, [searchQuery])

    const handleNewCourseNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setNewCourseName(event.target.value)
    }

    const handleNewCourseDurationChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setNewCourseDuration(event.target.value)
    }

    const handleNewCourseDescriptionChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setNewCourseDescription(event.target.value)
    }

    const handleCreateCourse = async (courseData: CourseData) => {
        const repeatedCourseName = newCourseName
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .trim()

        const matchedCourseName = courses?.find(
            (courseName) => courseName.name.toLowerCase() === repeatedCourseName
        )
        if (matchedCourseName) {
            toast.error({
                title: 'Cannot Create A New Course',
                description: 'Course Name Already Exists',
            })
            return
        }
        try {
            const data = await createBootcamp(courseData)
            toast.success({
                title: data.status,
                description: data.message,
            })
            // Reset form after successful creation
            setNewCourseName('')
            setNewCourseDescription('')
            await refetchBootcamps(offset) // same page refresh
            await refetchAllCourses() // refresh suggestions
            router.push(`/admin/courses/${data.bootcamp.id}/details`)
        } catch (error: any) {
            toast.error({
                title: error?.data?.status || 'Error',
                description: error?.data?.message || 'Failed to create course',
            })
        }
    }

    const handleCardClick = (id: number) => {
        router.push(`courses/${id}/details`)
        localStorage.setItem('courseId', id.toString())
    }

    function getValidImageUrl(url: string): string | null {
        if (typeof url !== 'string' || url.trim() === '') {
            return null
        }

        const trimmedUrl = url.trim()

        // Check if it starts with valid protocol or relative path
        const isValidStart =
            trimmedUrl.startsWith('/') ||
            trimmedUrl.startsWith('http://') ||
            trimmedUrl.startsWith('https://')

        // Check for common image extensions
        const imageExtensions = [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.webp',
            '.svg',
            '.bmp',
            '.tiff',
        ]
        const hasValidExtension = imageExtensions.some((ext) =>
            trimmedUrl.toLowerCase().includes(ext)
        )

        if (isValidStart && hasValidExtension) {
            return trimmedUrl
        }

        return ''
    }

    useEffect(() => {
        (async () => {
            const perms = await getPermissions();
            setPermissions(perms);
        })()
    }, [permissions]);

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-[rgb(81,134,114)]" />
                </div>
            ) : (
                <div className="w-full font-manrope">
                    {/* <div className="container mx-auto px-1 pt-2 pb-2 max-w-7xl"> */}
                    <div className="px-1 pt-2 pb-2">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 w-full">
                            {/* Left: Title and Subtitle */}
                            <div className="flex-1 min-w-[220px] text-start">
                                <h1 className="text-3xl font-bold text-foreground mb-1">
                                    Course Studio
                                </h1>
                                <p className="text-muted-foreground text-lg font-normal">
                                    Create, manage, and monitor your educational
                                    courses
                                </p>
                            </div>

                            {/* Right: Create New Course Button */}
                            <div className="flex-1 flex justify-end min-w-[220px]">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className={`text-white bg-primary font-semibold px-5 py-2 flex gap-2 ${!permissions.createCourse && 'invisible'}`}>
                                            <Plus className="w-5" />
                                            Create New Course
                                        </Button>
                                    </DialogTrigger>
                                    <DialogOverlay />
                                    <NewCourseDialog
                                        newCourseName={newCourseName}
                                        newCourseDuration={newCourseDuration}
                                        newCourseDescription={
                                            newCourseDescription
                                        }
                                        handleNewCourseNameChange={
                                            handleNewCourseNameChange
                                        }
                                        handleNewCourseDurationChange={
                                            handleNewCourseDurationChange
                                        }
                                        handleNewCourseDescriptionChange={
                                            handleNewCourseDescriptionChange
                                        }
                                        handleCreateCourse={handleCreateCourse}
                                        isDialogOpen={isDialogOpen}
                                    />
                                </Dialog>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-start mt-5">
                            {/* Search Bar */}
                            <div className="relative w-full sm:w-[500px] lg:w-[450px]">
                                {/* Search Icon */}
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 mt-1 text-muted-foreground" />
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search courses..."
                                    className="lg:max-w-[800px] bg-card w-full pl-10 pr-10" // pl-10 for left padding (space for icon)
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => {
                                        if (
                                            searchQuery.trim() &&
                                            filteredSuggestions.length > 0
                                        ) {
                                            setShowSuggestions(true)
                                        }
                                    }}
                                />

                                {/* Clear Button */}
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted hover:text-foreground mt-1"
                                        onClick={clearSearch}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}

                                {/* Suggestions Dropdown */}
                                {showSuggestions &&
                                    filteredSuggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-50 mt-1">
                                            <div className="bg-white border border-border rounded-md shadow-lg overflow-hidden">
                                                {filteredSuggestions.map(
                                                    (course, index) => (
                                                        <div
                                                            key={course.id}
                                                            className={cn(
                                                                'px-3 py-2.5 cursor-pointer text-sm transition-colors',
                                                                'hover:bg-muted/50',
                                                                index ===
                                                                    selectedSuggestionIndex &&
                                                                    'bg-muted'
                                                            )}
                                                            onClick={() =>
                                                                handleSuggestionClick(
                                                                    course
                                                                )
                                                            }
                                                            onMouseEnter={() =>
                                                                setSelectedSuggestionIndex(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <div className="capitalize font-medium text-foreground text-left">
                                                                {course.name}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>

                            {/* Filter Dropdown */}
                            {/* <div className="mt-2">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(val) => {
                                        setStatusFilter(val)
                                        setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div> */}
                        </div>
                    </div>
                    <div className="">
                        <div className="mb-5 flex justify-center items-center">
                            {courses.length === 0 ? (
                                <>
                                    {activeSearchTerm.length > 0 ? (
                                        <div className="absolute h-screen">
                                            <div className="relative top-[70%]">
                                                <Alert
                                                    variant="destructive"
                                                    className="flex flex-col items-center gap-3"
                                                >
                                                    <AlertTitle>
                                                        No Course Found
                                                    </AlertTitle>
                                                    <AlertDescription>
                                                        No course found with the
                                                        name{' '}
                                                        <span className="font-semibold">
                                                            {activeSearchTerm}
                                                        </span>
                                                    </AlertDescription>
                                                    <Button
                                                        variant="outline"
                                                        onClick={clearSearch}
                                                        className="mt-2"
                                                    >
                                                        Clear Search
                                                    </Button>
                                                </Alert>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-24">
                                            <div>
                                                <h4
                                                    className={
                                                        styles.firstCourseText
                                                    }
                                                >
                                                    Create your first course and
                                                    share with students
                                                </h4>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button className="text-white bg-secondary">
                                                            <Plus className="w-5 mr-2" />
                                                            <p>New Course</p>
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogOverlay />
                                                    <NewCourseDialog
                                                        newCourseName={
                                                            newCourseName
                                                        }
                                                        newCourseDuration={
                                                            newCourseDuration
                                                        }
                                                        newCourseDescription={
                                                            newCourseDescription
                                                        }
                                                        handleNewCourseNameChange={
                                                            handleNewCourseNameChange
                                                        }
                                                        handleNewCourseDurationChange={
                                                            handleNewCourseDurationChange
                                                        }
                                                        handleNewCourseDescriptionChange={
                                                            handleNewCourseDescriptionChange
                                                        }
                                                        handleCreateCourse={
                                                            handleCreateCourse
                                                        }
                                                        isDialogOpen={
                                                            isDialogOpen
                                                        }
                                                    />
                                                </Dialog>
                                            </div>
                                            <div className="flex justify-center my-10">
                                                <Separator className="w-1/2" />
                                            </div>
                                            <p className={styles.needHelpText}>
                                                Need help getting started?
                                                Checkout the tutorials below
                                            </p>
                                            <div className=" m-0 flex items-center justify-center space-x-4">
                                                <Link href={''}>
                                                    <Image
                                                        src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym9va3N8ZW58MHx8MHx8fDA%3D"
                                                        alt="Placeholder Image"
                                                        className=" object-contain rounded-md"
                                                        height={48}
                                                        width={300}
                                                    />
                                                    <div className="px-1 py-4">
                                                        <div className="text-start mb-2">
                                                            {' '}
                                                            How to create a new
                                                            course
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href={''}>
                                                    <Image
                                                        src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym9va3N8ZW58MHx8MHx8fDA%3D"
                                                        alt="Placeholder Image"
                                                        className=" object-contain rounded-md"
                                                        height={48}
                                                        width={300}
                                                    />
                                                    <div className="px-1 py-4">
                                                        <div className="text-start mb-2">
                                                            {' '}
                                                            Adding students in a
                                                            course
                                                        </div>
                                                    </div>
                                                </Link>
                                                <Link href={''}>
                                                    <Image
                                                        src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym9va3N8ZW58MHx8MHx8fDA%3D"
                                                        alt="Placeholder Image"
                                                        className=" object-contain rounded-md"
                                                        height={48}
                                                        width={300}
                                                    />
                                                    <div className="px-1 py-4">
                                                        <div className="text-start mb-2">
                                                            {' '}
                                                            Check attendance of
                                                            the classes
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div>
                                    {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 md:px-0 mt-5 mb-8 items-start"> */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2 md:px-0 mt-5 mb-8 items-start w-full">
                                        {courses.map((course, index) => {
                                            const validImageUrl =
                                                getValidImageUrl(
                                                    course.coverImage
                                                )
                                            return (
                                                <CourseCard
                                                    key={course.id}
                                                    course={course}
                                                    validImageUrl={
                                                        validImageUrl ?? ''
                                                    }
                                                    onClick={() =>
                                                        handleCardClick(
                                                            course.id
                                                        )
                                                    }
                                                    statusOptions={
                                                        statusOptions
                                                    }
                                                />
                                            )
                                        })}
                                    </div>
                                    {/* <DataTablePagination
                                        totalStudents={totalBootcamps}
                                        lastPage={lastPage}
                                        pages={pages}
                                        fetchStudentData={getBootcamp}
                                    /> */}
                                    <DataTablePagination
                                        totalStudents={totalBootcamps}
                                        lastPage={totalPages}
                                        pages={totalPages}
                                        fetchStudentData={(
                                            newOffset: number
                                        ) => {
                                            setOffset(newOffset)
                                            refetchBootcamps(newOffset) // instead of getBootcamp(newOffset)
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
        
    )
}
export default Courses
