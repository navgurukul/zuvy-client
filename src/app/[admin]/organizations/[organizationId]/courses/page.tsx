'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
    Plus,
} from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/utils/axios.config'
import NewCourseDialog from './_components/newCourseDialog'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { OFFSET, POSITION } from '@/utils/constant'
import styles from './_components/cources.module.css'
import { COURSE_FILTER } from '@/utils/constant'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from '@/components/ui/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useStudentData } from '@/store/store'
import { Separator } from '@/components/ui/separator'
// import { Spinner } from '@/components/ui/spinner'
import { getPermissions } from '@/lib/GetPermissions'
import {
    Course,
    CourseData,
    CoursesResponse,
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/submissionVideo/submissionVideoIdPageType'
import CourseCard from './_components/CourseCard'
import { useAllCourses } from '@/hooks/useAllCourses'
import { useBootcamps } from '@/hooks/useBootcamps'
import { useCreateBootcamp } from '@/hooks/useCreateBootcamp'
import { SearchBox } from '@/utils/searchBox'
import { useSearchWithSuggestions } from '@/utils/useUniversalSearchDynamic'
import {CoursesSkeleton} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton'
import { useParams } from 'next/navigation'

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
    const { organizationId } = useParams()
    const { studentData } = useStudentData()
    const userRole = studentData?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin';
    const orgId = isSuperAdmin ? organizationId : studentData?.orgId 
    const [permissions, setPermissions] = useState<Record<string, boolean>>({})

    // pagination & layout
    const limitParam = searchParams.get('limit')
    const position: number = Number(limitParam ?? POSITION) || Number(POSITION)

    const [offset, setOffset] = useState<number>(OFFSET)
    const [currentSearchQuery, setCurrentSearchQuery] = useState<string>('')
    const [previousLimit, setPreviousLimit] = useState<number>(position)

    // new course form
    const [newCourseName, setNewCourseName] = useState<string>('')
    const [newCourseDuration, setNewCourseDuration] = useState<string>('')
    const [newCourseDescription, setNewCourseDescription] = useState<string>('')

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // === Hooks ===
    const { allCourses, refetchAllCourses } = useAllCourses(true)
    const { courses, loading, totalBootcamps, totalPages, refetchBootcamps } =
        useBootcamps({
            limit: position,
            searchTerm: currentSearchQuery,
            offset,
            auto: true,
        })
    const { createBootcamp, creating } = useCreateBootcamp()

    const fetchSuggestionsApi = useCallback(async (query: string) => {
        const response = await api.get(
            `/bootcamp/all/${orgId}?limit=10&offset=0&searchTerm=${encodeURIComponent(query)}`
        );
        return response.data.data;
    }, []);

const fetchSearchResultsApi = useCallback(
    async (query: string, pageOffset: number = 0) => {
        console.log("SEARCH API CALLED", { query, pageOffset });

        setCurrentSearchQuery(query);
        setOffset(0);   

        await refetchBootcamps(0);  
        return [];
    },
    [refetchBootcamps]
);



const defaultFetchApi = useCallback(
        async (offsetParam = offset) => {
            setCurrentSearchQuery('');
            setOffset(offsetParam);
            await refetchBootcamps(offsetParam);
            return [];
        },
        [offset, refetchBootcamps]
    );


// Use the search hook
    const {
        clearSearch,
    } = useSearchWithSuggestions({
        fetchSuggestionsApi,
        fetchSearchResultsApi,
        defaultFetchApi,
    })

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
        } else {
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
                router.push(`/${userRole}/organizations/${orgId}/courses/${data.bootcamp.id}/details`)
            } catch (error: any) {
                toast.error({
                    title: error?.data?.status || 'Error',
                    description: error?.data?.message || 'Failed to create course',
                })
            }
        }
    }
    const handleCardClick = (id: number) => {
        if(permissions.editCourse) {
            router.push(`courses/${id}/details`)
        }else {
            router.push(`courses/${id}/curriculum`)
        }
        // localStorage.setItem('courseId', id.toString())
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
        ; (async () => {
            const perms = await getPermissions()
            setPermissions(perms)
        })()
    }, [])

    return (
        <>
            {loading ? (
                <CoursesSkeleton/>
            ) : (
                <div className="w-full px-6 py-8 font-manrope">
                    {/* <div className="container mx-auto px-1 pt-2 pb-2 max-w-7xl"> */}
                    <div className="px-1 pt-2 pb-2">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 w-full">
                            {/* <div className="flex flex-col lg:flex-row justify-between items-center gap-6 w-full"> */}
                            {/* Left: Title and Subtitle */}
                            <div className="flex-1 min-w-[220px] text-start">
                                <h1 className="font-heading  font-extrabold text-3xl text-foreground mb-2">
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
                                        <Button
                                            className={`text-white bg-primary font-semibold px-5 py-2 flex gap-2 ${!permissions.createCourse &&
                                                'invisible'
                                                }`}
                                        >
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
                            {/* Search Box with Custom Hook */}
                            <div className="relative w-full sm:w-[500px] lg:w-[450px] mb-8">
                                <SearchBox
                                    placeholder="Search courses..."
                                    fetchSuggestionsApi={fetchSuggestionsApi}
                                    fetchSearchResultsApi={fetchSearchResultsApi}
                                    defaultFetchApi={defaultFetchApi}
                                    getSuggestionLabel={(s) => (
                                        <div className="capitalize font-medium text-foreground">
                                            {s.name}
                                        </div>
                                    )}
                                    getSuggestionValue={(s) => s.name}
                                    inputWidth="w-full"
                                />
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
                        <div className="">
                            {courses.length === 0 ? (
                                <>
                                    {currentSearchQuery.length > 0 ? (
                                        <div className="flex justify-center items-center min-h-[60vh]">
                                            <Alert
                                                variant="destructive"
                                                className="flex flex-col items-center gap-3 text-center max-w-md w-full"
                                            >
                                                <AlertTitle>
                                                    No Course Found
                                                </AlertTitle>
                                                <AlertDescription>
                                                    No course found with the
                                                    name{' '}
                                                    <span className="font-semibold">
                                                        {currentSearchQuery}
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                    <DataTablePagination
                                        totalStudents={totalBootcamps}
                                        lastPage={totalPages}
                                        pages={totalPages}
                                        fetchStudentData={(
                                            newOffset: number
                                        ) => {
                                            setOffset(newOffset)
                                            // Use currentSearchQuery for pagination
                                            // if (currentSearchQuery.trim()) {
                                            //     fetchSearchResultsApi(
                                            //         currentSearchQuery,
                                            //         newOffset
                                            //     )
                                            // } else {
                                            //     defaultFetchApi(newOffset)
                                            // }

                                            if (currentSearchQuery.trim()) {
                                                fetchSearchResultsApi(currentSearchQuery) 
                                            } else {
                                                defaultFetchApi(newOffset)
                                           }
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
