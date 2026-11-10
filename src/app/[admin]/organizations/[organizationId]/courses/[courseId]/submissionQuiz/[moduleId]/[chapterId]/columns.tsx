'use client'

import type { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { getSubmissionDate } from '@/utils/admin'

export type QuizStudentStatus = {
  userId: number
  studentId?: string | null
  name?: string | null
  email?: string | null
  batchName?: string | null
  status?: string | null
  submittedAt?: string | null
}

type QuizSubmissionColumnParams = {
  courseId: string
  moduleId: string
  chapterId: string
  organizationId: string | number
  role: string
}

const isSubmitted = (status?: string | null) => status?.toLowerCase() === 'submitted'

export const createColumns = ({
  courseId,
  moduleId,
  chapterId,
  organizationId,
  role,
}: QuizSubmissionColumnParams): ColumnDef<QuizStudentStatus>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Student Name" />,
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.name || 'N/A'}</span>
    ),
  },
  {
    accessorKey: 'studentId',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Student ID" />,
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.original.studentId || row.original.userId || 'N/A'}
      </span>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => <span>{row.original.email || 'N/A'}</span>,
  },
  {
    accessorKey: 'batchName',
    header: () => <div className="text-left">Batch</div>,
    cell: ({ row }) => (
      <Badge variant="outline" className="border-foreground text-foreground">
        {row.original.batchName || 'N/A'}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const submitted = isSubmitted(row.original.status)

      return (
        <div className="flex items-center gap-x-2 font-medium text-foreground">
          <span
            className={`h-3 w-3 rounded-full ${submitted ? 'bg-green-600' : 'bg-red-600'}`}
          />
          {submitted ? 'Submitted' : 'Not Submitted'}
        </div>
      )
    },
  },
  {
    accessorKey: 'submittedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted At" />,
    cell: ({ row }) => {
      const submittedAt = row.original.submittedAt

      return submittedAt ? (
        <span>{getSubmissionDate(submittedAt)}</span>
      ) : (
        <span className="block w-full text-center text-xs text-muted-foreground">—</span>
      )
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-left">Actions</div>,
    cell: ({ row }) => {
      const canViewReport = isSubmitted(row.original.status)
      const reportHref = `/${role}/organizations/${organizationId}/courses/${courseId}/submissionQuiz/${moduleId}/${chapterId}/report/${row.original.userId}`

      return canViewReport ? (
        <Link href={reportHref} className="flex items-center gap-1 font-medium text-primary">
          <FileText size={16} />
          <span>View Report</span>
        </Link>
      ) : (
        <Button
          variant="ghost"
          disabled
          className="h-auto justify-start gap-1 p-0 text-muted-foreground"
        >
          <FileText size={16} />
          <span>View Report</span>
        </Button>
      )
    },
  },
]
