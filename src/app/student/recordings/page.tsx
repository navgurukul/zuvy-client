'use client'
import React, { useState, useEffect } from 'react'
import api from '@/utils/axios.config'
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

function Page({
    params,
}: {
    params: { viewcourses: string; moduleID: string }
}) {
    const [completedClasses, setCompletedClasses] = useState([])
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const [enrolledCourse, setEnrolledCourse] = useState<EnrolledCourse[]>([])
    const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>(
        null
    )

    useEffect(() => {
        const getEnrolledCourses = async () => {
            try {
                const response = await api.get(`/student/${userID}`)
                setEnrolledCourse(response.data)
                setSelectedCourse(response.data[0]) // Preselect the first course
            } catch (error) {
                console.error('Error getting enrolled courses:', error)
            }
        }
        if (userID) getEnrolledCourses()
    }, [userID])

    const handleCourseChange = (event: any) => {
        const selectedCourseId = Number(event.target.value)
        const newSelectedCourse: any = enrolledCourse.find(
            (course) => course.id === selectedCourseId
        )
        setSelectedCourse(newSelectedCourse)
    }

    useEffect(() => {
        if (userID) {
            api.get(`/bootcamp/studentClasses/${selectedCourse?.id}`, {
                params: {
                    userId: userID,
                },
            })
                .then((response) => {
                    const { completedClasses } = response.data
                    setCompletedClasses(completedClasses)
                })
                .catch((error) => {
                    console.log('Error fetching classes:', error)
                })
        }
    }, [userID, selectedCourse?.id])

    return (
        <>
            <div className="flex text-start">
                <Select>
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Courses</SelectLabel>
                            {enrolledCourse.map((course) => (
                                <SelectItem
                                    key={course.id}
                                    value={String(course.id)}
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
