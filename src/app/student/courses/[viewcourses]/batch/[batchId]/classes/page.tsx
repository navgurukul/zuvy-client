'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { useLazyLoadedStudentData } from '@/store/store'
import UpcomingClasses from './_components/UpcomingClasses'
import BreadcrumbCmponent from '@/app/_components/breadcrumbCmponent'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { OFFSET, CLASS_CARD_POSITION } from '@/utils/constant'
import useDebounce from '@/hooks/useDebounce'

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
    params: { viewcourses: string; batchId: string }
}) {
    const [upcomingClasses, setUpcomingClasses] = useState([])
    const [ongoingClasses, setOngoingClasses] = useState([])
    const [search, setSearch] = useState('')
    const [position, setPosition] = useState(CLASS_CARD_POSITION)
    const [pages, setPages] = useState<number>()
    const [offset, setOffset] = useState<number>(OFFSET)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [lastPage, setLastPage] = useState<number>(0)
    const { studentData } = useLazyLoadedStudentData()
    const [bootcampData, setBootcampData] = useState({} as BootcampData)
    const userID = studentData?.id && studentData?.id
    const debouncedSearch = useDebounce(search, 1000)

    const crumbs = [
        { crumb: 'My Courses', href: '/student/courses', isLast: false },
        {
            crumb: `${bootcampData?.bootcamp?.name}` || `Course`,
            href: `/student/courses/${params.viewcourses}/batch/${params.batchId}`,
            isLast: false,
        },
        {
            crumb: 'Upcoming Classes',
            href: '',
            isLast: true,
        },
    ]

    const fetchRecordings = useCallback(
        async (offset: number) => {
            try {
                let baseUrl = `/student/Dashboard/classes/?batch_id=${params.batchId}&limit=${position}&offset=${offset}`

                if (debouncedSearch) {
                    baseUrl += `&searchTerm=${encodeURIComponent(
                        debouncedSearch
                    )}`
                }

                const response = await api.get(baseUrl)
                setUpcomingClasses(response.data.data.filterClasses?.upcoming)
                setOngoingClasses(response.data.data.filterClasses?.ongoing)
                setTotalStudents(response.data.data.totalClasses)
                setPages(response.data.data.totalPages)
                setLastPage(response.data.data.totalPages)
            } catch (error) {
                console.error('Error getting completed classes:', error)
            }
        },
        [userID, params.batchId, debouncedSearch, position]
    )

    useEffect(() => {
        if (userID) {
            fetchRecordings(offset)
        }
    }, [userID, params.batchId, fetchRecordings, offset])

    useEffect(() => {
        api.get(`/bootcamp/${params.viewcourses}`)
            .then((response) => {
                setBootcampData(response.data)
            })
            .catch((error) => {
                console.error('Error fetching bootcamp data:', error)
            })
    }, [params.viewcourses])

    return (
        <>
            <BreadcrumbCmponent crumbs={crumbs} />
            <div className="w-full md:p-10 p-3 mt-10">
                <UpcomingClasses
                    ongoingClasses={ongoingClasses}
                    upcomingClasses={upcomingClasses}
                />
            </div>
            {totalStudents && (
                <DataTablePagination
                    totalStudents={totalStudents}
                    lastPage={lastPage}
                    pages={pages}
                    fetchStudentData={fetchRecordings}
                />
            )}
        </>
    )
}

export default Page
