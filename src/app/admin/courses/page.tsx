'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { AlertCircle, ChevronDown, GraduationCap, Plus, Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card} from '@/components/ui/card'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import Heading from '../_components/header'
import NewCourseDialog from './_components/newCourseDialog'
import { api, apiMeraki } from '@/utils/axios.config'
import OptimizedImageWithFallback from '@/components/ImageWithFallback'
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

interface Course {
    name: string
    learnersCount: number
    date: string
    coverImage: string // URL for the course image
    id: number
    students_in_bootcamp: number
}
interface CourseData {
    name: string
    description?: string
    collaborator?: string
}
const Courses: React.FC = () => {
    // misc
    const router = useRouter()
    const searchParams = useSearchParams()
    const { studentData } = useStudentData()
    const searchInputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const searchContainerRef = useRef<HTMLDivElement>(null)

    // state and variables
    const [activeFilter, setActiveFilter] = useState<
        'all' | 'active' | 'completed'
    >('all')

    // Initialize search query from URL params
    const [searchQuery, setSearchQuery] = useState<string>(
        searchParams.get('search') || ''
    )
    
    // Separate debounced search only for suggestions
    const debouncedSearchForSuggestions = useDebounce(searchQuery, 100)
    
    // Track the actual search term that should trigger course fetching
    const [activeSearchTerm, setActiveSearchTerm] = useState<string>(
        searchParams.get('search') || ''
    )

    const [courses, setCourses] = useState<Course[]>([])
    const [allCourses, setAllCourses] = useState<Course[]>([]) // Store all courses for search suggestions
    const [filteredSuggestions, setFilteredSuggestions] = useState<Course[]>([])
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1)

    const position = useMemo(() => searchParams.get('limit') || POSITION, [searchParams])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalBootcamps, setTotalBootcamps] = useState(0)
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [offset, setOffset] = useState<number>(OFFSET)
    const [loading, setLoading] = useState(true)
    const [newCourseName, setNewCourseName] = useState<string>('')
    const [newCourseDescription, setNewCourseDescription] = useState<string>('')
    const [hasAccess, setHasAccess] = useState<boolean>(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

     // func
    // const handleFilterClick = (filter: 'all' | 'active' | 'completed') => {
    //     setActiveFilter(filter)
    // }

    // Improved search filtering function for suggestions
    const filterCoursesByRelevance = (courses: Course[], searchTerm: string): Course[] => {
        const lowerSearchTerm = searchTerm.toLowerCase().trim()
        
        if (!lowerSearchTerm) return []

        const scoredCourses = courses.map(course => {
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
            else if (courseName.includes(` ${lowerSearchTerm} `) || 
                     courseName.includes(` ${lowerSearchTerm}`) ||
                     courseName.includes(`${lowerSearchTerm} `)) {
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
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.course)
            .slice(0, 6) // Limit to 6 suggestions to avoid scrolling
    }

    // Update URL when search query changes
    const updateURL = useCallback((searchTerm: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (searchTerm) {
            params.set('search', searchTerm)
        } else {
            params.delete('search')
        }

        const newURL = `${window.location.pathname}?${params.toString()}`
        router.replace(newURL, { scroll: false })
    }, [router, searchParams])

    // Fetch all courses for search suggestions
    const getAllCourses = useCallback(async () => {
        try {
            const response = await api.get(`/bootcamp?limit=1000&offset=0`)
            setAllCourses(response.data.data)
        } catch (error) {
            console.error('Error fetching all courses:', error)
        }
    }, [])

    // Main function to fetch courses - only called when activeSearchTerm changes
    const getBootcamp = useCallback(
        async (offset: number) => {
            let url = `/bootcamp?limit=${position}&offset=${offset}`
            
            if (activeSearchTerm) {
                url = `/bootcamp?limit=${position}&searchTerm=${encodeURIComponent(activeSearchTerm)}`
            }
            
            try {
                const response = await api.get(url)
                setCourses(response.data.data)
                setTotalBootcamps(response.data.totalBootcamps)
                setPages(response.data.totalPages)
                setLastPage(response.data.totalPages)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching courses:', error)
                setLoading(false)
            }
        },
        [activeSearchTerm, position]
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
                setSelectedSuggestionIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                event.preventDefault()
                setSelectedSuggestionIndex(prev =>
                    prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                )
                break
            case 'Enter':
                event.preventDefault()
                if (selectedSuggestionIndex >= 0) {
                    handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex])
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
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
                setSelectedSuggestionIndex(-1)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Update suggestions based on debounced search (only for suggestions)
    useEffect(() => {
        if (debouncedSearchForSuggestions.trim() && debouncedSearchForSuggestions.length > 0) {
            const filtered = filterCoursesByRelevance(allCourses, debouncedSearchForSuggestions)
            setFilteredSuggestions(filtered)
        } else {
            setFilteredSuggestions([])
        }
    }, [debouncedSearchForSuggestions, allCourses])

    // Fetch courses only when activeSearchTerm changes
    useEffect(() => {
        getBootcamp(offset)
    }, [getBootcamp, offset])

    // Initialize all courses
    useEffect(() => {
        getAllCourses()
    }, [getAllCourses])

    const handleNewCourseNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setNewCourseName(event.target.value)
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
        } else {
            try {
                const response = await api.post('/bootcamp', courseData)

                toast.success({
                    title: response.data.status,
                    description: response.data.message,
                })
                // Reset form after successful creation
                setNewCourseName('')
                setNewCourseDescription('')
                getBootcamp(offset)
                // Refresh all courses for suggestions
                getAllCourses()
            } catch (error: any) {
                toast.error({
                    title: error?.data?.status || 'Error',
                    description:
                        error?.data?.message || 'Failed to create course',
                })
            }
        }
    }

    const handleCardClick = (id: number) => {
        router.push(`courses/${id}/details`)
        localStorage.setItem('courseId', id.toString())
    }

    useEffect(() => {
        const getToken = async () => {
            const response = await api.get(`/classes/check-calendar-access`)

            if (response.data.status === 'not success') {
                setHasAccess(false)
            } else {
                setHasAccess(true)
            }
        }
        getToken()
    }, [])

    const calendarAccess = () => {
        api.get('/classes', {
            params: {
                userID: studentData?.id,
                email: studentData?.email,
            },
        }).then((response) => {
            router.push(response.data.url)
        })
    }

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <Spinner className="text-[rgb(81,134,114)]" />
                </div>
            ) : (
                <div>
                    <Heading title={'Courses'} />
                    {/* <p className="text-3xl font-bold tracking-tight m-0">Courses</p> */}
                    <div>
                        {!hasAccess ? (
                            <Alert
                                variant="destructive"
                                className="flex justify-between mt-5 items-center"
                            >
                                {/* <AlertCircle className="h-4 w-4" /> */}
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    Your calendar access has expired. Please log
                                    in again to gain access to the courses
                                </AlertDescription>
                                <Button onClick={calendarAccess} className='bg-success-dark opacity-75 font-semibold'>
                                    Give access
                                </Button>
                            </Alert>
                        ) : null}
                        <div className="flex flex-col lg:flex-row justify-between items-center mt-6 gap-4">
                            {/* Enhanced Search Input with Suggestions */}
                            <div className="relative w-full lg:max-w-[500px]" ref={searchContainerRef}>
                                <div className="relative">
                                    <Input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search"
                                        className="lg:max-w-[500px] w-full"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => {
                                            if (searchQuery.trim() && filteredSuggestions.length > 0) {
                                                setShowSuggestions(true)
                                            }
                                        }}
                                    />
                                    {searchQuery && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                                            onClick={clearSearch}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                {/* Clean Search Suggestions Dropdown */}
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-1">
                                        <div className="bg-white border border-border rounded-md shadow-lg overflow-hidden">
                                            {filteredSuggestions.map((course, index) => (
                                                <div
                                                    key={course.id}
                                                    className={cn(
                                                        "px-3 py-2.5 cursor-pointer text-sm transition-colors",
                                                        "hover:bg-muted/50",
                                                        index === selectedSuggestionIndex && "bg-muted",
                                                        index !== filteredSuggestions.length - 1 
                                                    )}
                                                    onClick={() => handleSuggestionClick(course)}
                                                    onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                                >
                                                    <div className="capitalize font-medium text-foreground text-left">
                                                        {course.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="text-white bg-success-dark opacity-75 font-semibold lg:max-w-[150px] w-full mt-5">
                                        <Plus className="w-5 mr-2" />
                                        <p>New Course</p>
                                    </Button>
                                </DialogTrigger>
                                <DialogOverlay />
                                <NewCourseDialog
                                    newCourseName={newCourseName}
                                    newCourseDescription={newCourseDescription}
                                    handleNewCourseNameChange={
                                        handleNewCourseNameChange
                                    }
                                    handleNewCourseDescriptionChange={
                                        handleNewCourseDescriptionChange
                                    }
                                    handleCreateCourse={handleCreateCourse}
                                    isDialogOpen={isDialogOpen}
                                />
                            </Dialog>
                        </div>

                        <div className="my-5 flex justify-center items-center">
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
                                        <div className="mt-24 ">
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
                                                        newCourseDescription={
                                                            newCourseDescription
                                                        }
                                                        handleNewCourseNameChange={
                                                            handleNewCourseNameChange
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
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {courses.map((course, index) => (
                                            <Card
                                                key={index}
                                                className={`h-max w-[400px] cursor-pointer hover:shadow-lg transition-shadow duration-200`}
                                                onClick={() =>
                                                    handleCardClick(course.id)
                                                }
                                            >
                                                <div className="bg-muted flex justify-center h-[200px] relative overflow-hidden rounded-sm">
                                                    <OptimizedImageWithFallback
                                                        src={course.coverImage}
                                                        alt={course.name}
                                                        fallBackSrc={
                                                            '/logo_white.png'
                                                        }
                                                    />
                                                </div>
                                                <div className="text-start px-4 py-3 bg-muted">
                                                    <p className="capitalize mb-2 font-semibold">
                                                        {course.name}
                                                    </p>
                                                    <div className="flex gap-2 items-center">
                                                        <GraduationCap
                                                            width={20}
                                                        />
                                                        <span className="text-sm font-semibold">
                                                            {
                                                                course.students_in_bootcamp
                                                            }{' '}
                                                            Learners
                                                        </span>
                                                        {/* <span>{course.date}</span> */}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                    <DataTablePagination
                                        totalStudents={totalBootcamps}
                                        lastPage={lastPage}
                                        pages={pages}
                                        fetchStudentData={getBootcamp}
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
