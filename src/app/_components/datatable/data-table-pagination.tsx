'use client'
import React, { useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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

import { ROWS_PER_PAGE, POSITION } from '@/utils/constant'
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'
import {DataTablePaginationProps} from "@/app/_components/datatable/componentDatatable"

export function DataTablePagination<TData>({
    totalStudents,
    lastPage,
    pages,
    fetchStudentData,
}: DataTablePaginationProps<TData>) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentPage = useMemo(() => parseInt(searchParams.get('page') || '1'), [searchParams])
    const position = useMemo(() => searchParams.get('limit') || POSITION, [searchParams])
    const offset = useMemo(() => (currentPage - 1) * +position, [currentPage, position])

    const updateURLParams = (page: number, limit: string = position) => {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.set('page', String(page))
        newParams.set('limit', String(limit))
        router.push(`?${newParams.toString()}`)
    }

    const prevPageHandler = () => updateURLParams(currentPage - 1)
    const nextPageHandler = () => updateURLParams(currentPage + 1)
    const firstPageHandler = () => updateURLParams(1)
    const lastPageHandler = () => updateURLParams(lastPage)

    const previousDisabledHandler = () => currentPage === 1
    const nextDisabledHandler = () => currentPage === pages

    useEffect(() => {
        const totalPages = Math.ceil(totalStudents / +position)
        if (totalPages > 0 && currentPage > totalPages) {
            updateURLParams(totalPages)
        } else {
            fetchStudentData(offset)
        }
    }, [currentPage, position, totalStudents])

    return (
        <div className="flex items-center justify-end mt-2 px-2 gap-x-2">
            <p className="text-sm text-gray-600 font-medium">Items Per Page</p>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className='border border-input bg-background text-gray-600 hover:border-[rgb(81,134,114)]'>
                        {position} <ChevronDown className="ml-2" size={15} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                    <DropdownMenuLabel>Rows</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                        value={position}
                        onValueChange={(newLimit) => {
                            updateURLParams(1, newLimit) // reset to page 1 on page size change
                        }}
                    >
                        {ROWS_PER_PAGE.map((rows) => (
                            <DropdownMenuRadioItem key={rows} value={rows}>
                                {rows}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[100px] items-center text-gray-600 justify-center text-sm font-medium">
                    Page {currentPage} of {pages}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={firstPageHandler}
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