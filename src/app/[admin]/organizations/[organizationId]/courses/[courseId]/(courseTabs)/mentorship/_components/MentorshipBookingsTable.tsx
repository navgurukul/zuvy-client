'use client'

import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { createMentorshipColumns, type MentorshipBooking } from './columns'

type Props = {
  bookings: MentorshipBooking[]
  onCancel: (booking: MentorshipBooking) => void
  loading?: boolean
  error?: string | null
}

export function MentorshipBookingsTable({ bookings, onCancel, loading = false, error }: Props) {
  const columns = useMemo(() => createMentorshipColumns(onCancel), [onCancel])
  const table = useReactTable({ data: bookings, columns, getCoreRowModel: getCoreRowModel() })

  return <div className="overflow-x-auto">
    <table className="w-full min-w-[1160px] border-collapse text-left text-[11px]">
      <thead><tr className="border-b border-[#e9e3dd] text-slate-600">{table.getHeaderGroups().flatMap((group) => group.headers).map((header) => <th key={header.id} className="whitespace-nowrap px-3 py-3 font-medium">{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr></thead>
      <tbody>
        {loading ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-xs text-slate-500">Loading bookings…</td></tr>
          : error ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-xs text-red-600">{error}</td></tr>
            : table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <tr key={row.id} className="border-b border-[#eee9e3] last:border-0 hover:bg-[#fbfaf8]">{row.getVisibleCells().map((cell) => <td key={cell.id} className="px-3 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)
              : <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-xs text-slate-500">No bookings match these filters.</td></tr>}
      </tbody>
    </table>
  </div>
}
