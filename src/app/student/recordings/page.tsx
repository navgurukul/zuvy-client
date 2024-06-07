'use client'
import React, { useState, useEffect } from 'react'
import { api } from '@/utils/axios.config'
import { useLazyLoadedStudentData } from '@/store/store'
import Recordings from '../courses/[viewcourses]/[recordings]/_components/Recordings'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

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
function Page() {
    // states:-
    const [completedClasses, setCompletedClasses] = useState([])
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const [enrolledCourse, setEnrolledCourse] = useState<EnrolledCourse[]>([])
    const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(
        enrolledCourse[0]
    )

    // functions:-
    const fetchRecordings = async (courseId: any) => {
        if (userID) {
            try {
                const response = await api.get(
                    `/bootcamp/studentClasses/${courseId}`,
                    { params: { userId: userID } }
                )
                setCompletedClasses(response.data.completedClasses)
            } catch (error) {
                console.error('Error getting completed classes:', error)
            }
        }
    }

    const getEnrolledCourses = async () => {
        try {
            const response = await api.get(`/student/${userID}`)
            setEnrolledCourse(response.data)
            setSelectedCourse(response.data[0]) // Preselect the first course
        } catch (error) {
            console.error('Error getting enrolled courses:', error)
        }
    }

    const handleCourseChange = (selectedCourseId: any) => {
        const newSelectedCourse: any = enrolledCourse.find(
            (course) => course.id === selectedCourseId
        )
        setSelectedCourse(newSelectedCourse)
        fetchRecordings(selectedCourseId)
    }

    // use effects:-
    useEffect(() => {
        if (userID) {
            getEnrolledCourses()
        }
    }, [userID])

    useEffect(() => {
        if (selectedCourse?.id) {
            fetchRecordings(selectedCourse.id)
        }
    }, [selectedCourse?.id, userID])

    // JSX render:-
    return (
        <>
            <div className="flex text-start">
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
            </div>

            <div className=" mt-10 ">
                <Recordings completedClasses={completedClasses} />
            </div>
        </>
    )
}

export default Page
