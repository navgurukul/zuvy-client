'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Task } from '@/utils/data/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Eye, RefreshCw } from 'lucide-react'
import { DataTableColumnHeader } from '@/app/_components/datatable/data-table-column-header'
import { calculateTimeTaken, getSubmissionDate } from '@/utils/admin'
import DownloadReport from '@/app/[admin]/courses/[courseId]/submissionAssesments/[assessment_Id]/_components/DownloadReport'
import ApproveReattempt from '@/app/[admin]/courses/[courseId]/submissionAssesments/[assessment_Id]/ApproveReattempt'
import Link from 'next/link'

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: 'student',
        header: 'Student',
        cell: ({ row }) => {
            const { name, email } = row.original
            return (
                <div className="flex gap-3">
                    <div>
                        <div className="text-left font-medium text-black">
                            {name}
                        </div>
                        <div className="text-left text-sm text-muted-foreground">
                            {email}
                        </div>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: 'batchName',
        header: 'Batch',
        cell: ({ row }) => {
            const batchName = row.original.batchName || 'N/A'
            return (
                <Badge variant="outline" className="text-black border-black-200">
                    {batchName}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'startedAt',
        cell: ({ row }) => {
            const startedAt = row.original.startedAt
            return (
                <div className="flex">
                    <span className="max-w-[500px] truncate font-medium text-black">
                        {startedAt
                            ? (() => {
                                  const date = new Date(startedAt)
                                  const year = date
                                      .getFullYear()
                                      .toString()
                                      .slice(-2)
                                  const day = date
                                      .getDate()
                                      .toString()
                                      .padStart(2, '0')
                                  const month = (date.getMonth() + 1)
                                      .toString()
                                      .padStart(2, '0')
                                  const hour = date
                                      .getHours()
                                      .toString()
                                      .padStart(2, '0')
                                  const minute = date
                                      .getMinutes()
                                      .toString()
                                      .padStart(2, '0')

                                  return `${day}/${month}/${year}, ${hour}:${minute}`
                              })()
                            : 'N/A'}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'submitedAt',
        header: ({ column, onSort }: any) => (
            <DataTableColumnHeader 
                column={column} 
                title="Submitted At" 
                onSort={onSort}
                sortField="submittedDate"
            />
        ),
        id: 'submittedDate',
        cell: ({ row }) => {
            const submitedAt = row.original.submitedAt
            return (
                <div className="flex">
                    <span className="max-w-[500px] truncate font-medium text-black">
                        {/* {submitedAt ? new Date(submitedAt).toLocaleString() : 'N/A'} */}
                        {submitedAt
                            ? (() => {
                                  const date = new Date(submitedAt)
                                  const year = date
                                      .getFullYear()
                                      .toString()
                                      .slice(-2)
                                  const day = date
                                      .getDate()
                                      .toString()
                                      .padStart(2, '0')
                                  const month = (date.getMonth() + 1)
                                      .toString()
                                      .padStart(2, '0')
                                  const hour = date
                                      .getHours()
                                      .toString()
                                      .padStart(2, '0')
                                  const minute = date
                                      .getMinutes()
                                      .toString()
                                      .padStart(2, '0')

                                  return `${day}/${month}/${year}, ${hour}:${minute}`
                              })()
                            : 'N/A'}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'time taken',
        cell: ({ row }) => {
            const startedAt = row.original.startedAt
            const submitedAt = row.original.submitedAt

            let timeTaken

            if (!submitedAt) {
                timeTaken = 'N/A'
            } else {
                timeTaken = calculateTimeTaken(startedAt, submitedAt)
            }

            return (
                <div className="flex items-center gap-2 text-sm text-black">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {timeTaken}
                </div>
            )
        },
    },
    {
        accessorKey: 'percentage',
        header: ({ column, onSort }: any) => (
            <DataTableColumnHeader 
                column={column} 
                title="Score" 
                onSort={onSort}
                sortField="percentage"
            />
        ),
        cell: ({ row }) => {
            const score = row.original.percentage?.toFixed(2) || '0.00'
            const isPassed = row.original.isPassed
            return (
                <span
                    className={`font-semibold ${
                        isPassed ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                    {score}%
                </span>
            )
        },
    },
    {
        accessorKey: 'isPassed',
        header: 'Qualified',
        cell: ({ row }) => {
            const isPassed = row.original.isPassed
            return (
                <div className="flex items-center gap-2">
                    <div
                        className={`h-2 w-2 rounded-full ${
                            isPassed ? 'bg-green-500' : 'bg-red-500'
                        }`}
                    />
                    <Badge
                        variant="outline"
                        className={
                            isPassed
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                        }
                    >
                        {isPassed ? 'Yes' : 'No'}
                    </Badge>
                </div>
            )
        },
    },
    {
        accessorKey: 'reattemptCount',
        header: 'Attempts',
        cell: ({ row }) => {
            const attempts = (row.original.reattemptCount ?? 0) + 1
            return <span className="font-medium">{attempts}</span>
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const { bootcampId, assessment_Id, userId, id, title, submitedAt } = row.original;

            const handleDownload = () => {
                DownloadReport({
                    userInfo: {
                        userId: String(userId),
                        id: String(id),
                        title: title ?? '',
                    },
                    submitedAt,
                });
            };

            return (
                <div className="flex items-center gap-3">
                    {/* Eye Icon */}
                    <Link
                        href={
                            submitedAt
                                ? `/admin/courses/${bootcampId}/submissionAssesments/${assessment_Id}/IndividualReport/${userId}/Report/${id}`
                                : '#'
                        }
                        className={
                            submitedAt
                                ? 'text-black hover:text-blue-600'
                                : 'opacity-50 cursor-not-allowed'
                        }
                    >
                        <Eye className="h-4 w-4" />
                    </Link>

                    {/* Download Icon */}
                    <DownloadReport
                        userInfo={{
                            userId: String(row.original.userId),
                            id: String(row.original.id),
                            title: row.original.title ?? ''
                        }}
                        submitedAt={submitedAt}
                    />
                    
                    {/* Re-attempt Icon */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => {
                            // Optional: handle re-attempt logic or open a modal
                        }}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>

                    {/* Approve Re-Attempt Button */}
                    <ApproveReattempt data={row.original} />
                </div>
            );
        },
    },
]
