'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Plus, RefreshCcw, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/utils/axios.config'
import { Input } from '@/components/ui/input'
import { getBatchData, getCourseData, getStoreStudentData } from '@/store/store'
import useDebounce from '@/hooks/useDebounce'

import { OFFSET, POSITION } from '@/utils/constant'
import { DataTable } from '@/app/_components/datatable/data-table'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { columns } from './columns'
import { toast } from '@/components/ui/use-toast'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
export type StudentData = {
    email: string
    name: string
    userId: number
    bootcampId: number
    batchName: string
    batchId: number
    progress: number
    profilePicture: string
}

const Page = ({ params }: { params: any }) => {
    const [position, setPosition] = useState(POSITION)
    const { studentsData, setStoreStudentData } = getStoreStudentData()
    const [isLoading, setLoading] = useState<boolean>(false)
    const [pages, setPages] = useState<number>()
    const [offset, setOffset] = useState<number>(OFFSET)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [search, setSearch] = useState<string | null>(null)
    const [attendenceIds, setAttendenceIds] = useState<string[]>()
    const debouncedSearch = useDebounce(search, 1000)
    const [lastPage, setLastPage] = useState<number>(0)
    const { fetchBatches, batchData } = getBatchData()

    const handleSetsearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const handleClick = async () => {
        await handleRefreshAttendence()
    }

    const fetchClassesData = useCallback(async (bootcampId: number) => {
        try {
            const res = await api.get(
                `/classes/meetings/${bootcampId}?bootcampId=${bootcampId}`
            )
            setAttendenceIds(res.data.unattendedClassIds)
        } catch (error: any) {
            console.log(error.message)
        }
    }, [])

    const handleRefreshAttendence = async () => {
        setLoading(true)
        const requestBody = { meetingIds: attendenceIds }
        try {
            const res = await api.post(`/classes/analytics/reload`, requestBody)
            toast({ title: res.data.title, description: res.data.message })
        } catch (error: any) {
            toast({ title: 'Error', description: 'Could not refresh' })
        } finally {
            setLoading(false)
        }
    }

    const fetchStudentData = useCallback(
        async (offset: number, searchTerm: string | null = null) => {
            if (params.courseId) {
                try {
                    const searchParam = searchTerm
                        ? `&searchTerm=${encodeURIComponent(searchTerm)}`
                        : ''
                    const response = await api.get(
                        `/bootcamp/students/${params.courseId}?limit=${position}&offset=${offset}${searchParam}`
                    )
                    setStoreStudentData(response.data.studentsEmails)
                    setPages(response.data.totalPages)
                    setLastPage(response.data.totalPages)
                    setTotalStudents(response.data.totalStudents)
                } catch (error) {
                    console.error('Error fetching student data:', error)
                }
            }
        },
        [params.courseId, position, setStoreStudentData]
    )

    useEffect(() => {
        if (params.courseId) {
            fetchClassesData(params.courseId)
        }
    }, [params.courseId, fetchClassesData])

    useEffect(() => {
        fetchBatches(params.courseId)
    }, [params.courseId, fetchBatches])

    useEffect(() => {
        fetchStudentData(offset, debouncedSearch)
    }, [offset, position, debouncedSearch, fetchStudentData])

    return (
        <div>
            {
                <div className="py-2 my-2 flex items-center justify-between w-full">
                    <Input
                        type="search"
                        placeholder="search"
                        className="w-1/3"
                        onChange={handleSetsearch}
                    />
                    <div className="flex items-center gap-x-3">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={handleClick}
                                        className={`relative flex items-center justify-center   bg-white text-white rounded-md ${
                                            isLoading
                                                ? 'opacity-50 pointer-events-none'
                                                : ''
                                        }`}
                                    >
                                        {isLoading ? (
                                            <svg
                                                className="absolute animate-spin h-5 w-5 mr-5 text-secondary"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V2.5A1.5 1.5 0 0113.5 1h-3A1.5 1.5 0 019 2.5V4a8 8 0 014 6.93L13.93 11A2 2 0 0112 8V5"
                                                ></path>
                                            </svg>
                                        ) : (
                                            <RotateCcw className="text-secondary" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p> Update Attendence</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className=" gap-x-2 ">
                                    <Plus /> Add Students
                                </Button>
                            </DialogTrigger>
                            <DialogOverlay />
                            <AddStudentsModal
                                message={false}
                                id={params.courseId || 0}
                            />
                        </Dialog>
                    </div>
                </div>
            }
            {batchData && (
                <>
                    <DataTable data={studentsData} columns={columns} />
                    <DataTablePagination
                        totalStudents={totalStudents}
                        position={position}
                        setPosition={setPosition}
                        pages={pages}
                        lastPage={lastPage}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        fetchStudentData={fetchStudentData}
                        setOffset={setOffset}
                    />
                </>
            )}
        </div>
    )
}

export default Page
