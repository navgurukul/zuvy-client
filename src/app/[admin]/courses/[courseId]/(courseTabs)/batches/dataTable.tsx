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

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getBatchData } from '@/store/store'
import McqDeleteVaiarntComp from '@/app/[admin]/resource/_components/McqDeleteComponent'
import {
    StudentData,
    DataTableProps,
} from '@/app/[admin]/courses/[courseId]/(courseTabs)/batches/courseBatchesType'
export function DataTable<TData, TValue>({
    columns,
    data,
    setSelectedRows,
    mcqSide,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({})

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

    return (
        <div className="space-y-4 relative">
            {/* <div className="flex flex-col justify-end items-end absolute top-[-111px] right-[130px] ">
                {mcqSide && (
                    <McqDeleteVaiarntComp
                        table={table}
                        logSelectedRows={logSelectedRows}
                    />
                )}
            </div> */}
            {/* <DataTableToolbar table={table} /> */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="hidden">
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
