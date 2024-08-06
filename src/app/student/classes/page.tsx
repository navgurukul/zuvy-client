'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/utils/axios.config'
import { useLazyLoadedStudentData } from '@/store/store'
import BreadcrumbCmponent from '@/app/_components/breadcrumbCmponent'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { OFFSET, CLASS_CARD_POSITION } from '@/utils/constant'
import useDebounce from '@/hooks/useDebounce'
import UpcomingClasses from '../courses/[viewcourses]/batch/[batchId]/classes/_components/UpcomingClasses'

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
            try {
                let baseUrl = `/student/Dashboard/classes?limit=${position}&offset=${offset}`

                if (debouncedSearch) {
                    baseUrl += `&searchTerm=${encodeURIComponent(
                        debouncedSearch
                    )}`
                }

                const response = await api.get(baseUrl)
                console.log('response', response)
                setUpcomingClasses(response.data.upcoming)
                setOngoingClasses(response.data.ongoing)
                // setCompletedClasses(response.data.classes)
                // const classes = [
                //     ...response.data.ongoing,
                //     ...response.data.upcoming,
                // ]
                // setTotalStudents(classes?.length)
                // console.log('classes?.length', classes?.length)
                // console.log('total_pages', classes?.length / Number(position))
                // setPages(Math.ceil(classes?.length / Number(position)))
                // setLastPage(Math.ceil(classes?.length / Number(position)))
                // setTotalStudents(response.data.total_items)
                // setPages(response.data.total_pages)
                // setLastPage(response.data.total_pages)
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
