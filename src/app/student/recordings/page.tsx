'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { useLazyLoadedStudentData } from '@/store/store'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import useDebounce from '@/hooks/useDebounce'
import { OFFSET, POSITION } from '@/utils/constant'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import Recordings from '../courses/[viewcourses]/[recordings]/_components/Recordings'
// Interfaces:-
interface Bootcamp {
    id: number
    name: string
    coverImage: string
    bootcampTopic: string
    startTime: string
    duration: string
    language: string
    createdAt: string
    updatedAt: string
    students_in_bootcamp: number
    unassigned_students: number
}

interface BootcampData {
    status: string
    message: string
    code: number
    bootcamp: Bootcamp
}

interface EnrolledCourse {
    id: number
    name: string
    coverImage: string
    bootcampTopic: string
    startTime: string
    duration: string
    language: string
    createdAt: string
    updatedAt: string
    progress: number
}

// Component:-
function Page({}: any) {
    // states:-
    const [completedClasses, setCompletedClasses] = useState([])
    const [enrolledCourse, setEnrolledCourse] = useState<EnrolledCourse[]>([])
    const [search, setSearch] = useState('')
    const [selectedCourse, setSelectedCourse] =
        useState<EnrolledCourse | null>()
    const [position, setPosition] = useState(POSITION)
    const [pages, setPages] = useState<number>()
    const [offset, setOffset] = useState<number>(OFFSET)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [lastPage, setLastPage] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id
    const debouncedSearch = useDebounce(search, 1000)

    // Functions

    const fetchRecordings = useCallback(
        async (offset: number) => {
            if (userID && selectedCourse?.id) {
                try {
                    let baseUrl = `/classes/all/${selectedCourse.id}/?status=completed&limit=${position}&offset=${offset}`

                    if (debouncedSearch) {
                        baseUrl += `&searchTerm=${encodeURIComponent(
                            debouncedSearch
                        )}`
                    }

                    const response = await api.get(baseUrl)
                    setCompletedClasses(response.data.classes)
                    setLoading(false)
                    setTotalStudents(response.data.total_items)
                    setPages(response.data.total_pages)
                    setLastPage(response.data.total_pages)
                } catch (error) {
                    console.error('Error getting completed classes:', error)
                }
            }
        },
        [userID, selectedCourse?.id, debouncedSearch, position]
    )

    const getEnrolledCourses = useCallback(async () => {
        try {
            const response = await api.get(`/student`)
            setEnrolledCourse(response.data)
            setSelectedCourse(response.data[0]) // Preselect the first course
        } catch (error) {
            console.error('Error getting enrolled courses:', error)
        }
    }, [userID])

    const handleCourseChange = (selectedCourseId: any) => {
        const newSelectedCourse: any = enrolledCourse.find(
            (course) => course.id === +selectedCourseId
        )
        setSelectedCourse(newSelectedCourse)
    }

    // useEffects
    useEffect(() => {
        if (userID) {
            getEnrolledCourses()
        }
    }, [userID, getEnrolledCourses])

    useEffect(() => {
        setLoading(true)
        if (selectedCourse?.id) {
            fetchRecordings(offset)
        }
    }, [selectedCourse?.id, userID, fetchRecordings, offset])

    const handleSetSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    // JSX render:-\
    return (
        <div className="px-10">
            <div className="flex items-center justify-start w-full pt-4 ">
                <h1 className="text-2xl font-semibold mb-5">
                    Class Recordings
                </h1>
            </div>
            <div className="flex flex-col gap-3 text-start">
                <Select
                    onValueChange={(e) => {
                        handleCourseChange(e)
                    }}
                >
                    <SelectTrigger className="w-[300px]">
                        <SelectValue
                            placeholder={
                                selectedCourse?.name || 'Select a course'
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {/* <SelectLabel>Courses</SelectLabel> */}
                            {enrolledCourse.map((course) => (
                                <SelectItem
                                    key={course.id}
                                    value={course.id.toString()}
                                >
                                    {course.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Input
                    value={search}
                    onChange={handleSetSearch}
                    className="lg:w-1/5 w-full"
                    placeholder="Search Class Recordings"
                />
            </div>

            <div className=" mt-10 ">
                <Recordings
                    completedClasses={completedClasses}
                    loading={loading}
                />
            </div>
            {!loading && completedClasses.length > 0 && (
                <DataTablePagination
                    totalStudents={totalStudents}
                    position={position}
                    setPosition={setPosition}
                    pages={pages}
                    lastPage={lastPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    fetchStudentData={fetchRecordings}
                    setOffset={setOffset}
                />
            )}
        </div>
    )
}

export default Page
