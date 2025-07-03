'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { useLazyLoadedStudentData } from '@/store/store'
import BreadcrumbCmponent from '@/app/_components/breadcrumbCmponent'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { OFFSET, CLASS_CARD_POSITION } from '@/utils/constant'
import useDebounce from '@/hooks/useDebounce'
import UpcomingClasses from '../courses/[viewcourses]/batch/[batchId]/classes/_components/UpcomingClasses'
// import {ClassesResponse,ClassItem} from "@/app/student/classes/type";

function Page() {
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
    const userID = studentData?.id && studentData?.id
    const debouncedSearch = useDebounce(search, 1000)

    const crumbs = [
        { crumb: 'Dashboard', href: '/student', isLast: false },
        {
            crumb: 'Upcoming Classes',
            href: '',
            isLast: true,
        },
    ]

    const fetchRecordings = useCallback(
        async (offset: number) => {
            const offSet = Math.max(0, offset)
            try {
                let baseUrl = `/student/Dashboard/classes?limit=${position}&offset=${offSet}`

                if (debouncedSearch) {
                    baseUrl += `&searchTerm=${encodeURIComponent(
                        debouncedSearch
                    )}`
                }

                const response = await api.get(baseUrl)
                setUpcomingClasses(response.data.data.filterClasses.upcoming)
                setOngoingClasses(response.data.data.filterClasses.ongoing)
                setTotalStudents(response.data.data.totalClasses)
                setPages(response.data.data.totalPages)
                setLastPage(response.data.data.totalPages)
            } catch (error) {
                console.error('Error getting completed classes:', error)
            }
        },
        [userID, debouncedSearch, position]
    )

    useEffect(() => {
        if (userID) {
            fetchRecordings(offset)
        }
    }, [userID, fetchRecordings, offset])

    return (
        <>
            <BreadcrumbCmponent crumbs={crumbs} />
            <div className="w-full md:p-10 p-3 mt-10">
                <UpcomingClasses
                    ongoingClasses={ongoingClasses}
                    upcomingClasses={upcomingClasses}
                />
            </div>
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
        </>
    )
}

export default Page
