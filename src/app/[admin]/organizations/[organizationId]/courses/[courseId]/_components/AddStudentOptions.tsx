'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DataTable } from '@/app/_components/datatable/data-table'
import { createColumns } from '../(courseTabs)/batches/columns'
import Dropzone from './dropzone'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'

import { StudentData } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/batch/[batchId]/CourseBatchesType'

type AssignmentMethod = 'unassigned' | 'single' | 'csv'

export type AddStudentOptionsProps = {
    context: 'create' | 'batch'
    courseId: string | number
    batchId?: string | number
    capEnrollment?: number | string
    initialMethod?: AssignmentMethod
    // callbacks for parent (used in create flow)
    onUnassignedChange?: (rows: StudentData[]) => void
    onSingleChange?: (data: { name: string; email: string }) => void
    onCsvChange?: (data: any[]) => void
    onValidityChange?: (valid: boolean) => void
    onSuccess?: () => void
    // ui
    className?: string
}

const AddStudentOptions: React.FC<AddStudentOptionsProps> = ({
    context,
    courseId,
    batchId,
    capEnrollment,
    initialMethod = 'unassigned',
    onUnassignedChange,
    onSingleChange,
    onCsvChange,
    onValidityChange,
    onSuccess,
    className,
}) => {
    const [method, setMethod] = useState<AssignmentMethod>(initialMethod)
    const [searchTerm, setSearchTerm] = useState('')
    const [loadingUnassigned, setLoadingUnassigned] = useState(false)
    const [unassignedStudents, setUnassignedStudents] = useState<StudentData[]>([])
    const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
    const [singleStudent, setSingleStudent] = useState({ name: '', email: '' })
    const [csvStudents, setCsvStudents] = useState<any[]>([])
    const [submitting, setSubmitting] = useState(false)

    const columns = useMemo(() => createColumns(Number(capEnrollment || 0)), [capEnrollment])

    const fetchUnassigned = useCallback(async () => {
        if (!courseId) return
        try {
            setLoadingUnassigned(true)
            const res = await api.get(`/batch/allUnassignStudent/${courseId}?searchTerm=${encodeURIComponent(searchTerm)}`)
            setUnassignedStudents(res.data.data || [])
        } catch (err: any) {
            toast.error({ title: 'Failed', description: err?.response?.data?.message || 'Failed to load unassigned students' })
        } finally {
            setLoadingUnassigned(false)
        }
    }, [courseId, searchTerm])

    useEffect(() => {
        if (method === 'unassigned') {
            const t = setTimeout(() => {
                fetchUnassigned()
            }, 500)
            return () => clearTimeout(t)
        }
    }, [method, searchTerm, fetchUnassigned])

    useEffect(() => {
        let valid = false
        if (method === 'unassigned') valid = selectedRows.length > 0
        if (method === 'single') valid = singleStudent.name.trim() !== '' && /^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(singleStudent.email)
        if (method === 'csv') valid = Array.isArray(csvStudents) && csvStudents.length > 0
        onValidityChange && onValidityChange(valid)
    }, [method, selectedRows, singleStudent, csvStudents, onValidityChange])

    useEffect(() => {
        if (method === 'unassigned') onUnassignedChange && onUnassignedChange(selectedRows)
    }, [method, selectedRows, onUnassignedChange])

    useEffect(() => {
        if (method === 'single') onSingleChange && onSingleChange(singleStudent)
    }, [method, singleStudent, onSingleChange])

    useEffect(() => {
        if (method === 'csv') onCsvChange && onCsvChange(csvStudents)
    }, [method, csvStudents, onCsvChange])

    const handleSubmitBatchContext = async () => {
        if (context !== 'batch') return
        if (!courseId || !batchId) {
            toast.error({ title: 'Missing data', description: 'Course or Batch not provided' })
            return
        }

        try {
            setSubmitting(true)
            if (method === 'unassigned') {
                const studentsPayload = selectedRows.map(s => ({ name: (s as any).name, email: (s as any).email }))
                if (studentsPayload.length === 0) {
                    toast.error({ title: 'No Students Selected', description: 'Please select at least one student' })
                    return
                }
                await api.post(`/bootcamp/students/${courseId}?batch_id=${batchId}`, { students: studentsPayload })
            } else if (method === 'single') {
                if (!singleStudent.name.trim() || !singleStudent.email.trim()) {
                    toast.error({ title: 'Incomplete Student Data', description: 'Provide both name and email' })
                    return
                }
                await api.post(`/bootcamp/students/${courseId}?batch_id=${batchId}`, { students: [{ name: singleStudent.name.trim(), email: singleStudent.email.trim() }] })
            } else if (method === 'csv') {
                if (!Array.isArray(csvStudents) || csvStudents.length === 0) {
                    toast.error({ title: 'No CSV Data', description: 'Please upload a valid CSV' })
                    return
                }
                await api.post(`/bootcamp/students/${courseId}?batch_id=${batchId}`, { students: csvStudents })
            }
            toast.success({ title: 'Success', description: 'Students added successfully' })
            // reset
            setSelectedRows([])
            setSingleStudent({ name: '', email: '' })
            setCsvStudents([])
            if (typeof onSuccess === 'function') {
                onSuccess()
            }
        } catch (err: any) {
            toast.error({ title: 'Error', description: err?.response?.data?.message || 'Failed to add students' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <div className="space-y-2">
                <RadioGroup value={method} onValueChange={(v) => setMethod(v as AssignmentMethod)} className="flex gap-6">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unassigned" id="opt-unassigned" />
                        <Label htmlFor="opt-unassigned" className="font-medium cursor-pointer mt-5">Unassigned</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="opt-single" />
                        <Label htmlFor="opt-single" className="font-medium cursor-pointer mt-5">Single</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="csv" id="opt-csv" />
                        <Label htmlFor="opt-csv" className="font-medium cursor-pointer mt-5">Bulk</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="border-t pt-6">
                {method === 'unassigned' && (
                    <>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Unassigned Students: {unassignedStudents.length}</p>
                            <Input type="search" placeholder="Search students" className="w-[280px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="mt-3">
                            <DataTable data={unassignedStudents} columns={columns} setSelectedRows={setSelectedRows} assignStudents={'manually'} />
                            <p className="pt-2 text-sm">Selected: {selectedRows.length}{capEnrollment ? ` / ${capEnrollment}` : ''}</p>
                        </div>
                    </>
                )}

                {method === 'single' && (
                    <div className="space-y-4 text-left">
                        <div className="space-y-2">
                            <Label className="text-left" htmlFor="studentName">Student Name *</Label>
                            <Input id="studentName" value={singleStudent.name} onChange={(e) => setSingleStudent({ ...singleStudent, name: e.target.value })} placeholder="Enter student name" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-left" htmlFor="studentEmail">Student Email *</Label>
                            <Input id="studentEmail" type="email" value={singleStudent.email} onChange={(e) => setSingleStudent({ ...singleStudent, email: e.target.value })} placeholder="Enter student email" />
                        </div>
                    </div>
                )}

                {method === 'csv' && (
                    <div className="space-y-4">
                        <Dropzone studentData={csvStudents} setStudentData={setCsvStudents} className="px-5 py-2 border-dashed border-2 rounded-[10px] block" />
                        {/* <div className="text-center">
                            <Button variant="ghost" size="sm" onClick={() => {
                                const csvContent = 'name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com'
                                const blob = new Blob([csvContent], { type: 'text/csv' })
                                const url = window.URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = 'sample_students.csv'
                                a.click()
                                window.URL.revokeObjectURL(url)
                            }}>Download Sample CSV</Button>
                        </div> */}
                    </div>
                )}
            </div>

            {context === 'batch' && (
                <div className="flex justify-end pt-6 gap-2">
                    <Button disabled={submitting} onClick={handleSubmitBatchContext}>{submitting ? 'Adding...' : 'Add Students'}</Button>
                </div>
            )}
        </div>
    )
}

export default AddStudentOptions