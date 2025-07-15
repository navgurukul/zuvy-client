'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ArrowRight, ChevronDown, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/app/_components/datatable/data-table'
import { Table } from '@tanstack/react-table'
import { ROWS_PER_PAGE } from '@/utils/constant'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { columns } from './columns'
import { getBatchData } from '@/store/store'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStudentData } from './components/useStudentData'
import useAttendanceData from './components/studentAttendanceAnalytics'
import AttandanceRefreshComp from './components/AttandanceRefreshComp'
import { ComboboxStudent } from './components/comboboxStudentDataTable'
import { api } from '@/utils/axios.config'
import AlertDialogDemo from './components/deleteModalNew'
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
import useDebounce from '@/hooks/useDebounce'

const Page = ({ params }: { params: any }) => {
    const {
        students,
        totalPages,
        currentPage,
        limit,
        offset,
        search,
        setStudents,
        setSearch, // Add this from the hook
        nextPageHandler,
        previousPageHandler,
        firstPageHandler,
        lastPageHandler,
        onLimitChange,
        handleSetSearch,
        commitSearch,
        internalSearch,
        debouncedInternalSearch,
    } = useStudentData(params.courseId)
    const { batchData } = getBatchData()
    const { attendanceData } = useAttendanceData(params.courseId)
    const [selectedRows, setSelectedRows] = useState<StudentData[]>([])

    const [showSuggestions, setShowSuggestions] = useState(false)

    const filteredSuggestions = students
        .filter(
            (student: StudentData) =>
                student.name &&
                student.name.toLowerCase().includes(debouncedInternalSearch.toLowerCase()) &&
                debouncedInternalSearch.trim() !== ''
        )
        .slice(0, 5)



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

    const fetchStudentData = useCallback(async (offsetValue: number) => {
        try {
            const res = await api.get(
                `/bootcamp/students/${params.courseId}?limit=${limit}&offset=${offsetValue}`
            )
            setSelectedRows([])
            setStudents(res.data.modifiedStudentInfo)
        } catch (error: any) {
            console.error(error)
        }
    }, [params.courseId, limit, setStudents])
    
    const userIds = selectedRows.map((item: any) => item.userId)

    return (
        <div>
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

                                // 👇 If cleared, reset to show all data
                                if (e.target.value.trim() === '') {
                                    commitSearch('')
                                    setShowSuggestions(false)
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && internalSearch.trim()) {
                                    commitSearch(internalSearch.trim())
                                    setShowSuggestions(false)
                                }
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />

                        {showSuggestions && filteredSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full bg-white border border-border rounded-md mt-1 shadow-lg">
                                {filteredSuggestions.map((student: StudentData, i: number) => (
                                    <div
                                        key={i}
                                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-left"
                                        onClick={() => {
                                            commitSearch(student.name)
                                            setShowSuggestions(false)
                                        }}
                                    >
                                        {student.name}
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
                                    description="This action cannot be undone. This will permanently the student from the bootcamp"
                                />
                                <ComboboxStudent
                                    batchData={newBatchData}
                                    bootcampId={batchData && params.courseId}
                                    selectedRows={selectedRows}
                                    fetchStudentData={fetchStudentData}
                                />
                            </>
                        )}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="gap-x-2">
                                    <Plus /> Add Students
                                </Button>
                            </DialogTrigger>
                            <DialogOverlay />
                            <AddStudentsModal
                                message={false}
                                id={params.courseId || 0}
                                batch={false}
                                batchId={0}
                            />
                        </Dialog>
                        {attendanceData?.length > 0 && (
                            <AttandanceRefreshComp
                                attendanceData={attendanceData}
                            />
                        )}
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