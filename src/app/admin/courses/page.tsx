'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, ChevronDown, GraduationCap, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import Heading from '../_components/header'
import NewCourseDialog from './_components/newCourseDialog'
import { api, apiMeraki } from '@/utils/axios.config'
import OptimizedImageWithFallback from '@/components/ImageWithFallback'

import styles from './_components/cources.module.css'
import { COURSE_FILTER } from '@/utils/constant'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from '@/components/ui/use-toast'
import useDebounce from '@/hooks/useDebounce'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useStudentData } from '@/store/store'
import { Separator } from '@/components/ui/separator'

interface Course {
    name: string
    learnersCount: number
    date: string
    coverImage: string // URL for the course image
    id: number
    students_in_bootcamp: number
}

const Courses: React.FC = () => {
    // misc
    const router = useRouter()
    const { studentData } = useStudentData()

    // state and variables
    const [activeFilter, setActiveFilter] = useState<
        'all' | 'active' | 'completed'
    >('all')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const debouncedSearch = useDebounce(searchQuery, 1000)

    const [courses, setCourses] = useState<Course[]>([])

    const [newCourseName, setNewCourseName] = useState<string>('')

    const [hasAccess, setHasAccess] = useState<boolean>(true)

    // func
    // const handleFilterClick = (filter: 'all' | 'active' | 'completed') => {
    //     setActiveFilter(filter)
    // }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
    }

    const getBootcamp = () => {
        try {
            api.get('/bootcamp').then((response) =>
                setCourses(response.data.data)
            )
        } catch (error) {
            console.error('Error fetching courses:', error)
        }
    }
    const handleNewCourseNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setNewCourseName(event.target.value)
    }

    const handleCreateCourse = async () => {
        const repeatedCourseName = newCourseName
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .trim()

        const matchedCourseName = courses?.find(
            (courseName) => courseName.name.toLowerCase() === repeatedCourseName
        )
        if (matchedCourseName) {
            toast({
                title: 'Cannot Create A New Course',
                description: 'Course Name Already Exists',
            })
        } else {
            try {
                const response = await api
                    .post('/bootcamp', { name: newCourseName })
                    .then((response) => {
                        toast({
                            title: response.data.status,
                            description: response.data.message,
                            className: 'text-start capitalize',
                        })
                    })
                getBootcamp()
            } catch (error: any) {
                toast({
                    title: error.data.status,
                    description: error.data.message,
                    className: 'text-start capitalize',
                })
                console.error('Error creating course:', error)
            }
        }
    }

    const handleCardClick = (id: number) => {
        router.push(`courses/${id}/details`)
        localStorage.setItem('courseId', id.toString())
    }
    // async
    useEffect(() => {
        const searchBootcampHandler = async () => {
            await api
                .get(`/bootcamp/searchBootcamps?searchTerm=${debouncedSearch}`)
                .then((res) => {
                    setCourses(res.data)
                })
        }
        if (debouncedSearch) searchBootcampHandler()
        if (debouncedSearch.trim()?.length === 0) getBootcamp()
    }, [debouncedSearch])

    // useEffect(() => {
    //     getBootcamp()
    // }, [])

    useEffect(() => {
        const getToken = async () => {
            const response = await apiMeraki.get('/users/calendar/tokens')

            if (!response.data.success) {
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
            // console.log(response.data.url)
            router.push(response.data.url)
        })
    }

    return (
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
                            Your calendar access has expired. Please log in
                            again to gain access to the courses
                        </AlertDescription>
                        <Button onClick={calendarAccess}>Give access</Button>
                    </Alert>
                ) : null}
                <div className={styles.searchContainer}>
                    <Input
                        type="text"
                        placeholder="Search"
                        // className={styles.searchInput}
                        className="max-w-[500px]"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="text-white bg-secondary">
                                <Plus className="w-5 mr-2" />
                                <p>New Course</p>
                            </Button>
                        </DialogTrigger>
                        <DialogOverlay />
                        <NewCourseDialog
                            newCourseName={newCourseName}
                            handleNewCourseNameChange={
                                handleNewCourseNameChange
                            }
                            handleCreateCourse={handleCreateCourse}
                        />
                    </Dialog>
                </div>
                <div className="my-5 flex justify-center items-center">
                    {courses.length === 0 ? (
                        <div className="mt-24 ">
                            <div>
                                <h4 className={styles.firstCourseText}>
                                    Create your first course and share with
                                    students
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
                                        newCourseName={newCourseName}
                                        handleNewCourseNameChange={
                                            handleNewCourseNameChange
                                        }
                                        handleCreateCourse={handleCreateCourse}
                                    />
                                </Dialog>
                            </div>
                            <div className="flex justify-center my-10">
                                <Separator className="w-1/2" />
                            </div>
                            <p className={styles.needHelpText}>
                                Need help getting started? Checkout the
                                tutorials below
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
                                            How to create a new course
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
                                            Adding students in a course
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
                                            Check attendance of the classes
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-3">
                            {courses.map((course, index) => (
                                <Card
                                    key={index}
                                    className={`h-max w-[400px] ${
                                        hasAccess ? 'cursor-pointer' : ''
                                    }`}
                                    onClick={() =>
                                        hasAccess
                                            ? handleCardClick(course.id)
                                            : null
                                    }
                                >
                                    <div className="bg-muted flex justify-center h-[200px] relative overflow-hidden rounded-sm">
                                        <OptimizedImageWithFallback
                                            src={course.coverImage}
                                            alt={course.name}
                                            fallBackSrc={'/logo_white.png'}
                                        />
                                    </div>
                                    <div className="text-start px-4 py-3 bg-muted">
                                        <p className="capitalize mb-2 font-semibold">
                                            {course.name}
                                        </p>
                                        <div className="flex gap-2 items-center">
                                            <GraduationCap width={20} />
                                            <span className="text-sm font-semibold">
                                                {course.students_in_bootcamp}{' '}
                                                Learners
                                            </span>
                                            {/* <span>{course.date}</span> */}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Courses
