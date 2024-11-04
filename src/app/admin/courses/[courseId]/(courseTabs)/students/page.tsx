'use client'
import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, ChevronDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/app/_components/datatable/data-table'

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
    const { batchData } = getBatchData()
    const { attendanceData } = useAttendanceData(params.courseId)
    const [selectedRows, setSelectedRows] = useState<StudentData[]>([])

    const newBatchData = batchData?.map((data) => {
        return {
            value: data.id,
            label: data.name,
        }
    })

    console.log('selectedRows', selectedRows)

    return (
        <div>
            <div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-y-4">
                    <Input
                        type="search"
                        placeholder="Search"
                        className="w-full md:w-1/2 lg:w-1/4"
                        onChange={handleSetSearch}
                    />
                    <div className="flex flex-col md:flex-row items-center gap-x-2 gap-y-4">
                        {selectedRows.length > 0 && (
                            <ComboboxStudent
                                batchData={newBatchData}
                                bootcampId={params.courseId}
                                selectedRows={selectedRows}
                            />
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
