'use client'
import { ArrowLeft, ArrowRight, ChevronDown, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/app/_components/datatable/data-table'

import { ROWS_PER_PAGE } from '@/utils/constant'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { columns } from './columns'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStudentData } from './useStudentData'
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

    const {
        students,
        totalPages,
        currentPage,
        limit,
        nextPageHandler,
        previousPageHandler,
        firstPageHandler,
        lastPageHandler,
        onLimitChange,
        handleSetSearch,
    } = useStudentData(params.courseId)

    return (
        <div>
            <div>
                <div className="flex justify-between">
                    <Input
                        type="search"
                        placeholder="search"
                        className="w-1/4"
                        onChange={handleSetSearch}
                    />
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
