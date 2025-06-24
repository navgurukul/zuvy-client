'use client'

import React, { useEffect } from 'react'
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'

import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getBatchData, getIsRowSelected } from '@/store/store'
import McqDeleteVaiarntComp from '@/app/admin/resource/_components/McqDeleteComponent'
import AddLiveClasstoChapter from '@/app/admin/courses/[courseId]/module/_components/AddLiveClasstoChapter'

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    setSelectedRows?: any
    mcqSide?: boolean
    assignStudents?: string
    adminMcqSide?: boolean
    customTopBar?: React.ReactNode
}

type StudentData = {
    email: string
    name: string
    userId: number
    bootcampId: number
    batchName: string
    batchId: number
    progress: number
    profilePicture: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    setSelectedRows,
    mcqSide,
    assignStudents,
    adminMcqSide,
    customTopBar,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({})
    const { isRowUnSelected, setIsRowUnSelected } = getIsRowSelected()

    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const table = useReactTable({
        data: data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })
    const logSelectedRows = () => {
        const selectedRows = table.getSelectedRowModel().rows
        return selectedRows
    }
    useEffect(() => {
        const selectedRows = table
            .getSelectedRowModel()
            .rows.map((row) => row.original)
        setSelectedRows && setSelectedRows(selectedRows)
    }, [table.getSelectedRowModel().rows])
    useEffect(() => {
        table.toggleAllRowsSelected(false)
        setIsRowUnSelected(false) // Reset the state after unselecting
    }, [isRowUnSelected])
    return (
        <div className="space-y-4 relative">
            {!assignStudents && (
                <div className="flex flex-col justify-end items-end absolute top-[-111px] right-[250px] ">
                    {mcqSide && (
                        <McqDeleteVaiarntComp
                            table={table}
                            logSelectedRows={logSelectedRows}
                        />
                    )}
                </div>
            )}
        
            {!assignStudents && (
                <div className="flex items-center justify-between mb-2">
                    <div>{customTopBar}</div>
                    <div className="ml-auto">
                        <DataTableToolbar table={table} />
                    </div>
                </div>
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader className={assignStudents && 'hidden'}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table?.getRowModel().rows?.length ? (
                            table?.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* <DataTablePagination /> */}
        </div>
    )
}
