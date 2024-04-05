'use client'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import React, { useState, useEffect } from 'react'
import api from '@/utils/axios.config'
import { useLazyLoadedStudentData } from '@/store/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UpcomingClasses from './_components/UpcomingClasses'
import BreadcrumbCmponent from '@/app/_components/breadcrumbCmponent'

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

function Page({
    params,
}: {
    params: { viewcourses: string; moduleID: string }
}) {
    const [upcomingClasses, setUpcomingClasses] = useState([])
    const [ongoingClasses, setOngoingClasses] = useState([])
    const [completedClasses, setCompletedClasses] = useState([])
    const { studentData } = useLazyLoadedStudentData()
    const [bootcampData, setBootcampData] = useState({} as BootcampData)
    const userID = studentData?.id && studentData?.id
    const crumbs = [
        { crumb: 'My Courses', href: '/student/courses', isLast: false },
        {
            crumb: `${bootcampData?.bootcamp?.name}` || `Course`,
            href: `/student/courses/${params.viewcourses}`,
            isLast: false,
        },
        {
            crumb: 'Upcoming Classes',
            // href: `/student/courses/${params.viewcourses}/recordings`,
            isLast: true,
        },
    ]

    useEffect(() => {
        if (userID) {
            api.get(`/bootcamp/studentClasses/${params.viewcourses}`, {
                params: {
                    userId: userID,
                },
            })
                .then((response) => {
                    const {
                        upcomingClasses,
                        ongoingClasses,
                        completedClasses,
                    } = response.data
                    setUpcomingClasses(upcomingClasses)
                    setOngoingClasses(ongoingClasses)
                    setCompletedClasses(completedClasses)
                })
                .catch((error) => {
                    console.log('Error fetching classes:', error)
                })
        }
    }, [userID])

    useEffect(() => {
        api.get(`/bootcamp/${params.viewcourses}`)
            .then((response) => {
                setBootcampData(response.data)
            })
            .catch((error) => {
                console.log('Error fetching bootcamp data:', error)
            })
    }, [])

    return (
        <>
            <BreadcrumbCmponent crumbs={crumbs} />

            <div className="mt-10">
                <UpcomingClasses
                    ongoingClasses={ongoingClasses}
                    upcomingClasses={upcomingClasses}
                />
            </div>
        </>
    )
}

export default Page
