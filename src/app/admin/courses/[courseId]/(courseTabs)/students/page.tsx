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
import { useStudentData } from './components/useStudentData'
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

    return (
        <div>
            <div>
                <div className="flex flex-col lg:flex-row justify-between">
                    <Input
                        type="search"
                        placeholder="search"
                        className="lg:w-1/4 w-full"
                        onChange={handleSetSearch}
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-x-2 mt-5">
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
                </div>

                <div>
                    <div className="mt-5">
                        <DataTable data={students} columns={columns} />
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
