'use client'
import { useCourseExistenceCheck } from '@/hooks/useCourseExistenceCheck'
import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, ChevronDown, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/app/_components/datatable/data-table'
import { ROWS_PER_PAGE } from '@/utils/constant'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { columns } from './columns'
import { getBatchData } from '@/store/store'
import { useRouter } from 'next/navigation'
import { useStudentData } from './components/useStudentData'
import { ComboboxStudent } from './components/comboboxStudentDataTable'
import { api } from '@/utils/axios.config'
import AlertDialogDemo from './components/deleteModalNew'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'

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

interface Student {
    email: string
    name: string
}

type StudentDataState = Student[]

const Page = ({ params }: { params: any }) => {
    const router = useRouter()
    // const { isCourseDeleted, loadingCourseCheck } = useCourseExistenceCheck(params.courseId)
    const {
        students,
        totalPages,
        currentPage,
        limit,
        offset,
        search,
        totalStudents,
        suggestions, // Use suggestions instead of students for autocomplete
        setStudents,
        handleSetSearch,
        commitSearch,
        internalSearch,
        debouncedInternalSearch,
        fetchStudentData,
    } = useStudentData(params.courseId)

    const { batchData } = getBatchData()
    const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
    const [studentData, setStudentData] = useState<StudentDataState | any>({})
    const [isOpen, setIsOpen] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)

    const filteredSuggestions = suggestions.slice(0, 6)

    // Reset selectedRows when course changes
    useEffect(() => {
        setSelectedRows([])
    }, [params.courseId])

    const newBatchData = batchData?.map((data) => {
        return {
            value: data.id,
            label: data.name,
        }
    })

    const fetchStudentDataForBatch = useCallback(
        async (offsetValue: number) => {
            try {
                const res = await api.get(
                    `/bootcamp/students/${params.courseId}?limit=${limit}&offset=${offset}`
                )
                setSelectedRows([])
                setStudents(res.data.modifiedStudentInfo)
            } catch (error: any) {
                if (axios.isAxiosError(error)) {
                    if (
                        error?.response?.data.message === 'Bootcamp not found!'
                    ) {
                        router.push(`/admin/courses`)
                        toast.info({
                            title: 'Caution',
                            description:
                                'The Course has been deleted by another Admin',
                        })
                    }
                }
                console.error(error)
            }
        },
        [params.courseId, limit, setStudents]
    )

    const userIds = selectedRows.map((item: any) => item.userId)

    //     if (loadingCourseCheck) {
    //       return (
    //       <div className="flex justify-center items-center h-full mt-20">
    //        <Spinner className="text-secondary" />
    //      </div>
    //      )
    //    }

    //    if (isCourseDeleted) {
    //     return (
    //      <div className="flex flex-col justify-center items-center h-full mt-20">
    //        <Image src="/images/undraw_select-option_6wly.svg" width={350} height={350} alt="Deleted" />
    //       <p className="text-lg text-red-600 mt-4">This course has been deleted.</p>
    //       <Button onClick={() => router.push('/admin/courses')} className="mt-6 bg-secondary">
    //         Back to Courses
    //       </Button>
    //      </div>
    //    )
    //   }

    return (
        <div className="text-gray-600">
            <div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-y-4">
                    <div className="relative w-full md:w-1/2 lg:w-1/4">
                        <Input
                            type="search"
                            placeholder="Search"
                            className="w-full"
                            value={internalSearch}
                            onChange={(e) => {
                                handleSetSearch(e)
                                setShowSuggestions(true)

                                // If cleared, commit search but don't reset pagination
                                if (e.target.value.trim() === '') {
                                    commitSearch('')
                                    setShowSuggestions(false)
                                }
                            }}
                            onKeyDown={(e) => {
                                if (
                                    e.key === 'Enter' &&
                                    internalSearch.trim()
                                ) {
                                    commitSearch(internalSearch.trim())
                                    setShowSuggestions(false)
                                }
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() =>
                                setTimeout(() => setShowSuggestions(false), 200)
                            }
                        />

                        {showSuggestions && filteredSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full bg-white border border-border rounded-md mt-1 shadow-lg">
                                {/* {filteredSuggestions.map(
                                    (student: StudentData, i: number) => (
                                        <div
                                            key={i}
                                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-left"
                                            onClick={() => {
                                                handleSetSearch(student.name)
                                                commitSearch(student.name)
                                                setShowSuggestions(false)
                                            }}
                                        >
                                            {student.name}
                                        </div>
                                    )
                                )} */}
                                {filteredSuggestions.map((student: StudentData, i: number) => (
                                    <div
                                        key={i}
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-left"
                                        onClick={() => {
                                            handleSetSearch(student.name)
                                            commitSearch(student.name)
                                            setShowSuggestions(false)
                                        }}
                                    >
                                        <div className="font-medium">{student.name}</div>
                                        <div className="text-sm text-gray-500">{student.email}</div>
                                    </div>
                                ))}

                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-x-2 gap-y-4">
                        {selectedRows.length > 0 && (
                            <>
                                <AlertDialogDemo
                                    setSelectedRows={setSelectedRows}
                                    userId={userIds}
                                    bootcampId={batchData && params.courseId}
                                    title="Are you absolutely sure?"
                                    description={`This action cannot be undone. This will permanently remove the ${selectedRows.length > 1 ? 'students' : 'student'} from the bootcamp`}
                                />
                                <ComboboxStudent
                                    batchData={newBatchData || []}
                                    bootcampId={batchData && params.courseId}
                                    selectedRows={selectedRows}
                                    fetchStudentData={fetchStudentDataForBatch}
                                />
                            </>
                        )}
                        <Dialog
                            open={isOpen}
                            onOpenChange={(open) => {
                                setIsOpen(open)
                                if (!open) {
                                    // Modal is closing → reset studentData
                                    setStudentData({ name: '', email: '' })
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button className="gap-x-2 bg-success-dark opacity-75">
                                    <Plus /> Add Students
                                </Button>
                            </DialogTrigger>
                            <DialogOverlay />
                            <AddStudentsModal
                                message={false}
                                id={params.courseId || 0}
                                batch={false}
                                batchId={0}
                                setStudentData={setStudentData}
                                studentData={studentData}
                            />
                        </Dialog>
                    </div>
                </div>

                <div>
                    <div className="mt-5">
                        <DataTable
                            data={students}
                            columns={columns}
                            setSelectedRows={setSelectedRows}
                        />
                    </div>

                    {/* Use the imported DataTablePagination component */}
                    <DataTablePagination
                        totalStudents={totalStudents}
                        lastPage={totalPages}
                        pages={totalPages}
                        fetchStudentData={fetchStudentData}
                    />
                </div>
            </div>
        </div>
    )
}
export default Page
