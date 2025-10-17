'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useRoles } from '@/hooks/useRoles'
import { SearchBox } from '@/utils/searchBox'
import { api } from '@/utils/axios.config'
import type { User } from '../columns'

interface UserManagementTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onSearchChange?: (isSearching: boolean) => void
}

export function UserManagementTable<TData extends User, TValue>({
    columns,
    data: propData, // Rename to propData
    onSearchChange,
}: UserManagementTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [searchData, setSearchData] = useState<TData[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [loading, setLoading] = useState(false)
    
    // Fetch roles from API
    const { roles, loading: rolesLoading } = useRoles()

    // Use search data if searching, otherwise use prop data
    const displayData = isSearching ? searchData : propData

    const fetchSuggestionsApi = useCallback(async (query: string) => {
        try {
            const response = await api.get(
                `/users/get/all/users?searchTerm=${encodeURIComponent(query)}`
            )
            const suggestions = (response.data.data || []).map((user: User) => ({
                ...user,
                id: user.userId, // Use userId as id for SearchBox
            }))

            return suggestions
        } catch (error) {
            console.error('Error fetching suggestions:', error)
            return []
        }
    }, [])

    // Fetch search results with filters applied
    const fetchSearchResultsApi = useCallback(async (query: string) => {
        setLoading(true)
        setIsSearching(true)
        onSearchChange?.(true)
        
        try {
            const response = await api.get(
                `/users/get/all/users?searchTerm=${encodeURIComponent(query)}`
            )

            setSearchData(response.data.data || [])
            return response.data
        } catch (error) {
            console.error('Error fetching search results:', error)
            setSearchData([])
        } finally {
            setLoading(false)
        }
    }, [onSearchChange])

    // Default fetch - clear search and show parent data
    const defaultFetchApi = useCallback(async () => {
        setIsSearching(false)
        setSearchData([])
        onSearchChange?.(false)
        return { data: propData }
    }, [propData, onSearchChange])

    // Load data on component mount - check if search exists in URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const searchQuery = urlParams.get('search')

        if (searchQuery && searchQuery.trim()) {
            fetchSearchResultsApi(searchQuery.trim())
        } else {
            // Clear search state to show parent data
            setIsSearching(false)
            setSearchData([])
        }
    }, []) // Run only once on mount

    const table = useReactTable({
        data: displayData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex gap-4 mb-6">
                <SearchBox
                    placeholder="Search by name or email..."
                    fetchSuggestionsApi={fetchSuggestionsApi}
                    fetchSearchResultsApi={fetchSearchResultsApi}
                    defaultFetchApi={defaultFetchApi}
                    getSuggestionLabel={(user) => (
                        <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                    )}
                    inputWidth="w-80"
                />

                <div className="mt-2">
                    <Select
                        value={
                            (table
                                .getColumn('roleName')
                                ?.getFilterValue() as string) ?? 'all'
                        }
                        onValueChange={(value) =>
                            table
                                .getColumn('roleName')
                                ?.setFilterValue(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="w-48 bg-white">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {rolesLoading ? (
                                <SelectItem value="loading" disabled>
                                    Loading roles...
                                </SelectItem>
                            ) : (
                                roles.map((role) => (
                                    <SelectItem key={role.id} value={role.name} className='capitalize'>
                                        {role.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="bg-gray-50 border-b border-gray-200"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="py-3 px-4 font-medium text-muted-foreground text-[1rem] text-left"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="py-3 px-4 text-[1rem] text-left"
                                        >
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
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
