'use client'

import React, { useEffect, useMemo } from 'react'
import {
    ColumnDef,
    ColumnFiltersState,
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

import { DataTableToolbar } from './data-table-toolbar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getIsRowSelected } from '@/store/store'
import AddLiveClasstoChapter from '@/app/[admin]/courses/[courseId]/module/_components/AddLiveClasstoChapter'
import {
    DataTableProps,
    StudentData,
} from '@/app/_components/datatable/componentDatatable'

export function DataTable<TData, TValue>({
    columns,
    data,
    setSelectedRows,
    mcqSide,
    assignStudents,
    adminMcqSide,
    customTopBar,
    onSortingChange,
    getSelectedRowsFunction,
}: DataTableProps<TData, TValue> & {
    onSortingChange?: (field: string, direction: 'asc' | 'desc') => void;
    getSelectedRowsFunction?: (fn: () => any[]) => void;
}) {
    const [rowSelection, setRowSelection] = React.useState({})
    const { isRowUnSelected, setIsRowUnSelected } = getIsRowSelected()

    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([])

    // SAFE UPDATE: Only add meta if onSortingChange is provided
    const columnsWithMeta = useMemo(() => {
        // If onSortingChange is not provided, return columns as-is (backward compatible)
        if (!onSortingChange) {
            return columns
        }
        // If onSortingChange is provided, add it to meta
        return columns.map((col) => ({
            ...col,
            meta: {
                ...col.meta,
                onSort: onSortingChange,
            },
        }))
    }, [columns, onSortingChange])

    const table = useReactTable({
        data: data,
        columns: columnsWithMeta,
        state: {
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualSorting: onSortingChange ? true : undefined, // Only enable manual sorting if callback provided
    })

    const logSelectedRows = () => {
        const selectedRows = table.getSelectedRowModel().rows
        return selectedRows
    }

    // Pass the logSelectedRows function to parent
    useEffect(() => {
    if (getSelectedRowsFunction) {
        getSelectedRowsFunction(logSelectedRows, table)
    }
}, [getSelectedRowsFunction, table, rowSelection])

    useEffect(() => {
        // Multiple safety checks
        try {
            const selectedRowModel = table?.getSelectedRowModel?.()
            if (selectedRowModel?.rows?.length !== undefined) {
                const selectedRows = selectedRowModel.rows.map((row) => row.original)
                setSelectedRows && setSelectedRows(selectedRows)
            }
        } catch (error) {
            console.warn('Error accessing selected row model:', error)
            // Reset selected rows on error
            setSelectedRows && setSelectedRows([])
        }
    }, [table?.getSelectedRowModel?.()?.rows?.length]) // More specific dependency

    useEffect(() => {
        table.toggleAllRowsSelected(false)
        setIsRowUnSelected(false)
    }, [isRowUnSelected])

    return (
        <div className="space-y-4 relative">
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
                                                      {
                                                          ...header.getContext(),
                                                          onSort: onSortingChange,
                                                      }
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
