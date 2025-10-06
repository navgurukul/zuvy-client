import { Column } from "@tanstack/react-table";
import { Row } from "@tanstack/react-table";
import { Table } from "@tanstack/react-table";
import { ColumnDef } from "@tanstack/react-table";


// DataTableColumnHeader
export interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>
    title: string
}
// DataTableFaceted
export interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}


// DataTablePagination
export interface DataTablePaginationProps<TData> {
    totalStudents: number
    lastPage: number
    pages: number | undefined
    fetchStudentData: (offset: number) => void
}


// DataTableRowActions
export interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}


// DataTableToolbar
export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}


// DataTableViewOptions
export interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: any
    setSelectedRows?: any
    mcqSide?: boolean
    assignStudents?: string
    adminMcqSide?: boolean
    customTopBar?: React.ReactNode
}

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