'use client'
import React, { useCallback, useEffect, useState } from 'react'
import {
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    Plus,
    RefreshCcw,
    RotateCcw,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { api } from '@/utils/axios.config'
import { Input } from '@/components/ui/input'
import { getBatchData, getCourseData, getStoreStudentData } from '@/store/store'
import useDebounce from '@/hooks/useDebounce'

import { OFFSET, POSITION, ROWS_PER_PAGE } from '@/utils/constant'
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
import { off } from 'process'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
    // const [position, setPosition] = useState(POSITION)
    // const { studentsData, setStoreStudentData } = getStoreStudentData()
    // const [isLoading, setLoading] = useState<boolean>(false)
    // const [pages, setPages] = useState<number>()
    // const [offset, setOffset] = useState<number>(OFFSET)
    // const [currentPage, setCurrentPage] = useState<number>(1)
    // const [totalStudents, setTotalStudents] = useState<number>(0)
    // const [search, setSearch] = useState<string | null>(null)
    // const [attendanceIds, setAttendanceIds] = useState<string[]>()
    // const debouncedSearch = useDebounce(search, 1000)
    // const [lastPage, setLastPage] = useState<number>(0)
    // const { fetchBatches, batchData } = getBatchData()

    // const handleSetsearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setSearch(e.target.value)
    // }

    // const handleClick = async () => {
    //     await handleRefreshAttendance()
    // }

    // const fetchClassesData = useCallback(async (bootcampId: number) => {
    //     try {
    //         const res = await api.get(
    //             `/classes/meetings/${bootcampId}?bootcampId=${bootcampId}`
    //         )
    //         setAttendanceIds(res.data.unattendedClassIds)
    //     } catch (error: any) {
    //         console.log(error.message)
    //     }
    // }, [])

    // const handleRefreshAttendance = async () => {
    //     setLoading(true)
    //     const requestBody = { meetingIds: attendanceIds }
    //     try {
    //         const res = await api.post(`/classes/analytics/reload`, requestBody)
    //         toast({
    //             title: res.data.title,
    //             description: res.data.message,
    //             className: 'text-start capitalize border border-secondary',
    //         })
    //     } catch (error: any) {
    //         toast({
    //             title: 'Error',
    //             description: 'Could not refresh',
    //             className: 'text-start capitalize border border-destructive',
    //         })
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    // const fetchStudentData = useCallback(
    //     async (offset: number, searchTerm: string | null = null) => {
    //         if (params.courseId) {
    //             try {
    //                 const searchParam = searchTerm
    //                     ? `&searchTerm=${encodeURIComponent(searchTerm)}`
    //                     : ''
    //                 const response = await api.get(
    //                     `/bootcamp/students/${params.courseId}?limit=${position}&offset=${offset}${searchParam}`
    //                 )
    //                 setStoreStudentData(response.data.totalStudents)
    //                 setPages(response.data.totalPages)
    //                 setLastPage(response.data.totalPages)
    //                 setTotalStudents(response.data.totalStudentsCount)
    //             } catch (error) {
    //                 console.error('Error fetching student data:', error)
    //             }
    //         }
    //     },
    //     [params.courseId, position, setStoreStudentData]
    // )
    // useEffect(() => {
    //     if (params.courseId) {
    //         fetchClassesData(params.courseId)
    //     }
    // }, [params.courseId, fetchClassesData])

    // useEffect(() => {
    //     fetchBatches(params.courseId)
    // }, [params.courseId, fetchBatches])

    // useEffect(() => {
    //     fetchStudentData(offset, debouncedSearch)
    // }, [offset, position, debouncedSearch, fetchStudentData])

    const [students, setStudents] = useState<any[]>([])
    const [totalPages, setTotalPages] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [offset, setOffset] = useState<number>(0)
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [limit, setLimit] = useState<number>(10)
    const [search, setSearch] = useState<string>('')
    const debouncedSearch = useDebounce(search, 1000)
    const fetchStudentsHandler = useCallback(async () => {
        setLoading(true)

        const endpoint = debouncedSearch
            ? `/bootcamp/students/${params.courseId}?searchTerm=${debouncedSearch}`
            : `/bootcamp/students/${params.courseId}?limit=${limit}&offset=${offset}`

        try {
            const res = await api.get(endpoint)
            setStudents(res.data.totalStudents || [])
            setTotalPages(res.data.totalPages || 0)
            setTotalStudents(res.data.totalStudentsCount || 0)
            setCurrentPage(res.data.currentPage || 1)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch the data',
            })
        } finally {
            setLoading(false)
        }
    }, [params.courseId, limit, offset, debouncedSearch])

    useEffect(() => {
        fetchStudentsHandler()
    }, [fetchStudentsHandler])

    const nextPageHandler = useCallback(() => {
        if (currentPage < totalPages) {
            setOffset((prevValue) => prevValue + limit)
        }
    }, [currentPage, totalPages, limit])

    const previousPageHandler = useCallback(() => {
        if (currentPage > 1) {
            setOffset((prevValue) => prevValue - limit)
        }
    }, [currentPage, limit])

    const firstPageHandler = useCallback(() => {
        setOffset(0)
    }, [])

    const lastPageHandler = useCallback(() => {
        setOffset((totalPages - 1) * limit)
    }, [totalPages, limit])

    const onLimitChange = useCallback((newLimit: any) => {
        setLimit(Number(newLimit))
        setOffset(0)
    }, [])

    const handleSetSearch = useCallback((e: any) => {
        setSearch(e.target.value)
    }, [])
    console.log(students)

    return (
        <div>
            {
                // <div className="py-2 my-2 flex items-center justify-between w-full">
                //     <Input
                //         type="search"
                //         placeholder="search"
                //         className="w-1/3"
                //         onChange={handleSetsearch}
                //     />
                //     <div className="flex items-center gap-x-3">
                //         <TooltipProvider>
                //             <Tooltip>
                //                 <TooltipTrigger asChild>
                //                     <Button
                //                         onClick={handleClick}
                //                         className={`relative flex items-center justify-center   bg-white text-white rounded-md ${
                //                             isLoading
                //                                 ? 'opacity-50 pointer-events-none'
                //                                 : ''
                //                         }`}
                //                     >
                //                         {isLoading ? (
                //                             <svg
                //                                 className="absolute animate-spin h-5 w-5 mr-5 text-secondary"
                //                                 xmlns="http://www.w3.org/2000/svg"
                //                                 fill="none"
                //                                 viewBox="0 0 24 24"
                //                             >
                //                                 <circle
                //                                     className="opacity-25"
                //                                     cx="12"
                //                                     cy="12"
                //                                     r="10"
                //                                     stroke="currentColor"
                //                                     strokeWidth="4"
                //                                 ></circle>
                //                                 <path
                //                                     className="opacity-75"
                //                                     fill="currentColor"
                //                                     d="M4 12a8 8 0 018-8V2.5A1.5 1.5 0 0113.5 1h-3A1.5 1.5 0 019 2.5V4a8 8 0 014 6.93L13.93 11A2 2 0 0112 8V5"
                //                                 ></path>
                //                             </svg>
                //                         ) : (
                //                             <RotateCcw className="text-secondary" />
                //                         )}
                //                     </Button>
                //                 </TooltipTrigger>
                //                 <TooltipContent>
                //                     <p> Update Attendance</p>
                //                 </TooltipContent>
                //             </Tooltip>
                //         </TooltipProvider>
                //         <Dialog>
                //             <DialogTrigger asChild>
                //                 <Button className=" gap-x-2 ">
                //                     <Plus /> Add Students
                //                 </Button>
                //             </DialogTrigger>
                //             <DialogOverlay />
                //             <AddStudentsModal
                //                 message={false}
                //                 id={params.courseId || 0}
                //             />
                //         </Dialog>
                //     </div>
                // </div>
            }
            <div>
                <Input
                    type="search"
                    placeholder="search"
                    className="w-1/3"
                    onChange={handleSetSearch}
                />

                <div>
                    <ul>
                        <DataTable data={students} columns={columns} />
                    </ul>
                    <div className="flex items-center justify-end mt-2 px-2 gap-x-2">
                        <p className="text-sm font-medium">Rows Per Page</p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    {limit}{' '}
                                    <ChevronDown className="ml-2" size={15} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                                <DropdownMenuLabel>Rows</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                    value={limit.toString()}
                                    onValueChange={onLimitChange}
                                >
                                    {ROWS_PER_PAGE.map((rows) => (
                                        <DropdownMenuRadioItem
                                            key={rows}
                                            value={rows}
                                        >
                                            {rows}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="flex items-center space-x-6 lg:space-x-8">
                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={firstPageHandler}
                                    disabled={currentPage === 1}
                                >
                                    <span className="sr-only">
                                        Go to first page
                                    </span>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={previousPageHandler}
                                    disabled={currentPage === 1}
                                >
                                    <span className="sr-only">
                                        Go to previous page
                                    </span>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={nextPageHandler}
                                    disabled={currentPage === totalPages}
                                >
                                    <span className="sr-only">
                                        Go to next page
                                    </span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex"
                                    onClick={lastPageHandler}
                                    disabled={currentPage === totalPages}
                                >
                                    <span className="sr-only">
                                        Go to last page
                                    </span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page
