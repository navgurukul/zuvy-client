import { Column } from '@tanstack/react-table'

import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {DataTableColumnHeaderProps} from "@/app/_components/datatable/componentDatatable"

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>
    }

    const handleSortToggle = () => {
        const currentSort = column.getIsSorted()
        
        if (currentSort === false || currentSort === undefined) {
            // Default to descending first
            column.toggleSorting(true) // true = descending
        } else if (currentSort === 'desc') {
            // Change to ascending
            column.toggleSorting(false) // false = ascending
        } else if (currentSort === 'asc') {
            // Change back to descending
            column.toggleSorting(true) // true = descending
        }
    }

    const getSortIcon = () => {
        const currentSort = column.getIsSorted()
        
        if (currentSort === 'desc') {
            return <ChevronDown className="ml-1 h-4 w-4" />
        } else if (currentSort === 'asc') {
            return <ChevronUp className="ml-1 h-4 w-4" />
        } else {
        }
    }

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <Button
                size="sm"
                className="-ml-3 h-8 bg-background hover:bg-background text-muted-foreground"
                onClick={handleSortToggle}
            >
                <span>{title}</span>
                {getSortIcon()}
            </Button>
        </div>
    )
}
