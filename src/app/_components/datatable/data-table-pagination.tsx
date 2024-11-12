import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { ROWS_PER_PAGE } from '@/utils/constant'
import { Table } from '@tanstack/react-table'
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'

interface DataTablePaginationProps<TData> {
    totalStudents: number
    position: string
    setPosition: (value: string) => void
    lastPage: number
    pages: number | undefined
    currentPage: number
    setCurrentPage: (pageNumber: any) => void
    fetchStudentData: (offset: number) => void
    setOffset: (offset: any) => void
}

export function DataTablePagination<TData>({
    totalStudents,
    position,
    setPosition,
    lastPage,
    pages,
    currentPage,
    setCurrentPage,
    fetchStudentData,
    setOffset,
}: DataTablePaginationProps<TData>) {
    const lastPageOffset = () => {
        const totalPages = Math.ceil(totalStudents / +position)
        const lastPageOffset = (totalPages - 1) * +position
        return lastPageOffset
    }

    const lastPageHandler = () => {
        setCurrentPage(lastPage)
        fetchStudentData(lastPageOffset())
        setOffset(lastPageOffset())
    }
    const firstPagehandler = () => {
        setCurrentPage(1)
        fetchStudentData(0)
        setOffset(0)
    }
    const nextPageHandler = () => {
        const newOffset = (currentPage) * +position;  
        setCurrentPage((prevState: number) => prevState + 1)
        setOffset(newOffset);
    }

    const prevPageHandler = () => {
        const newOffset = Math.max(0, (currentPage - 2) * +position);
        setCurrentPage((prevState: number) => prevState - 1)
        // setOffset((prevState: number) => Math.max(0, prevState - +position))
        setOffset(newOffset);
    }

    const previousDisabledHandler = () => {
        if (currentPage === 1) {
            return true
        } else {
            return false
        }
    }
    const nextDisabledHandler = () => {
        if (currentPage === pages) {
            return true
        } else {
            return false
        }
    }

    useEffect(() => {
        const totalPages = Math.ceil(totalStudents / +position)
        if (currentPage > totalPages) {
            setCurrentPage(totalPages) // Reset current page to last valid page if it exceeds total pages
            setOffset((totalPages - 1) * +position)
            fetchStudentData((totalPages - 1) * +position)
        } else {
            fetchStudentData((currentPage - 1) * +position)
        }
    }, [position])

    return (
        <div className="flex items-center justify-end mt-2 px-2 gap-x-2">
            <p className="text-sm font-medium">Items Per Page</p>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        {position} <ChevronDown className="ml-2" size={15} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                    <DropdownMenuLabel>Rows</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                        value={position}
                        // onValueChange={setPosition}
                        onValueChange={(newPosition) => {
                            setPosition(newPosition)
                            // setCurrentPage(1) // Optional: Reset to first page on changing position
                        }}
                    >
                        {ROWS_PER_PAGE.map((rows) => {
                            return (
                                <DropdownMenuRadioItem key={rows} value={rows}>
                                    {rows}
                                </DropdownMenuRadioItem>
                            )
                        })}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {currentPage} of {pages}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={firstPagehandler}
                        disabled={previousDisabledHandler()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={prevPageHandler}
                        disabled={previousDisabledHandler()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={nextPageHandler}
                        disabled={nextDisabledHandler()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={lastPageHandler}
                        disabled={nextDisabledHandler()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
