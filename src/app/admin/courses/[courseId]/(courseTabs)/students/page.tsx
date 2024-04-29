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
    const [pages, setPages] = useState<number>()
    const [offset, setOffset] = useState<number>(OFFSET)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [search, setSearch] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [attendenceIds, setAttendenceIds] = useState<string[]>()
    const debouncedSearch = useDebounce(search, 1000)
    const [lastPage, setLastPage] = useState<number>(0)
    const { courseData } = getCourseData()
    const { fetchBatches, batchData } = getBatchData()

    const fetchClassesData = async (bootcampId: number) => {
        try {
            await api
                .get(`/classes/meetings/{bootcampId}?bootcampId=${bootcampId}`)
                .then((res) => {
                    setAttendenceIds(res.data.unattendedClassIds)
                })
        } catch (error: any) {
            console.log(error.message)
        }
    }
    const handleRefreshAttendence = async () => {
        const requestBody = {
            meetingIds: attendenceIds,
        }

        try {
            api.post(`/classes/analytics/reload`, requestBody).then((res) => {
                toast({ title: res.data.title, description: res.data.message })
            })
        } catch (error: any) {
            toast({ title: 'Error', description: 'Couldnot refresh' })
        }
    }

    const fetchStudentData = useCallback(
        async (offset: number) => {
            if (params.courseId) {
                try {
                    const response = await api.get(
                        `/bootcamp/students/${params.courseId}?limit=${position}&offset=${offset}`
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
        [position, setStoreStudentData, params.courseId]
    )
    useEffect(() => {
        fetchClassesData(params.courseId)
    }, [params.courseId])

    useEffect(() => {
        fetchStudentData(offset)
        fetchBatches(params.courseId)
    }, [offset, fetchStudentData, fetchBatches, params.courseId])

    useEffect(() => {
        fetchStudentData(offset)
    }, [offset, position, courseData, fetchStudentData])

    useEffect(() => {
        const searchStudentsDataHandler = async () => {
            setLoading(true)
            try {
                const response = await api.get(
                    `/bootcamp/studentSearch/${params.courseId}?searchTerm=${debouncedSearch}`
                )
                setStoreStudentData(response.data.data[1].studentsEmails)
            } catch (error) {
                console.error('Error searching students:', error)
            } finally {
                setLoading(false)
            }
        }

        if (debouncedSearch) {
            searchStudentsDataHandler()
        } else {
            fetchStudentData(0)
        }
    }, [
        debouncedSearch,
        params.courseId,
        setStoreStudentData,
        fetchStudentData,
    ])

    const handleSetsearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

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
                                    <RotateCcw
                                        className="text-secondary"
                                        onClick={handleRefreshAttendence}
                                    />
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
