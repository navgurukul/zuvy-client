'use client'
import { useState } from 'react'
import { Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { DataTableColumnHeaderProps } from "@/app/_components/datatable/componentDatatable"

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
    onSort,
    sortField,
}: DataTableColumnHeaderProps<TData, TValue> & { 
    onSort?: (field: string, direction: 'asc' | 'desc') => void;
    sortField?: string;
}) {
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [hasClicked, setHasClicked] = useState(false)

    if (!column.getCanSort() || !onSort) {
        return <div className={cn(className)}>{title}</div>
    }

    const handleSort = () => {
        const newDirection = hasClicked
            ? (sortDirection === 'asc' ? 'desc' : 'asc')
            : 'asc'  // first click always sets to 'asc'

        setSortDirection(newDirection)
        setHasClicked(true)
        onSort(sortField || column.id, newDirection)
    }

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent focus-visible:ring-0 p-0 m-0 h-8"
                onClick={handleSort}
            >
                <div className="flex items-center space-x-2">
                    <span>{title}</span>
                    {/* Show icon only after user clicks */}
                    {hasClicked && (
                        sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )
                    )}
                </div>
            </Button>
        </div>
    )
}
