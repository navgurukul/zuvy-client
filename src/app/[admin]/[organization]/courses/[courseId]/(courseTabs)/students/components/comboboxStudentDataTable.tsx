'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import{ComboboxStudentProps,CourseStudentBatchItem} from "@/app/[admin]/[organization]/courses/[courseId]/(courseTabs)/students/components/courseStudentComponentType"
export function ComboboxStudent({
    batchData,
    batchName,
    userId,
    bootcampId,
    batchId,
    selectedRows,
    fetchStudentData,
}:ComboboxStudentProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState('')
    const [displaybatchName, setDisplayBatchName] = React.useState(
        batchName || 'Unassigned'
    )
    const [batchisFull, setBatchisFull] = React.useState(false)

    React.useEffect(() => {
        setDisplayBatchName(batchName || 'Unassigned')
        setValue(batchId?.toString() || '')
    }, [batchName, batchId])

    const handleSelectBatchChange = async (
     currentValue: string,
    value: string,
    setValue: (val: string) => void,
    setOpen: (open: boolean) => void
) => {
    setValue(value);
    setOpen(false)
        const [selectedValue] = currentValue.split('-')
        const selectedBatch = batchData.find(
            (batch: CourseStudentBatchItem) => batch.value == selectedValue
        )
        const label = selectedBatch ? selectedBatch.label : ''
        
        if (selectedValue !== value) {
            setValue(selectedValue)
        }
        setOpen(false)
        try {
            await api
                .patch(
                    `/batch/reassign/student_id=${userId}/new_batch_id=${selectedValue}?bootcamp_id=${bootcampId}`
                )
                .then((res) => {
                    toast.success({
                        title: res.data.status,
                        description: res.data.message,
                    })
                    setDisplayBatchName(label)
                })
        } catch (error: any) {
            if (error.response.data.message === 'Batch is full')
                setBatchisFull(true)
            toast.error({
                title: 'Error',
                description: error.response.data.message,
            })
        } finally {
        }
    }

    const selected = selectedRows?.map((item:any) => {
        return {
            name: item.name,
            email: item.email,
        }
    })

    const handleAssignBatch = async (currentValue: any) => {
        const [batchId, label] = currentValue.split('-')
        const courseId = bootcampId
        try {
            await api
                .post(`/bootcamp/students/${bootcampId}?batch_id=${batchId}`, {
                    students: selected,
                })
                .then((res) => {
                    toast.success({
                        title: res.data.status,
                        description: res.data.message,
                    })
                    fetchStudentData && fetchStudentData()
                })
        } catch (error: any) {
            if (error.response.data.message === 'Batch is full')
                setBatchisFull(true)
            toast.error({
                title: 'Error',
                description: error.response.data.message,
            })
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between text-muted-foreground border border-input bg-background hover:bg-background"
                >
                    <span className="truncate max-w-[200px] text-left">
                        {userId ? displaybatchName : 'Select a Batch'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search batch..." />
                    <CommandEmpty>No batch found.</CommandEmpty>
                    <CommandGroup>
                        {batchData.map((batch: CourseStudentBatchItem) => {
                            return (
                            <CommandItem
                                key={batch.value}
                                disabled={value == batch.value && !batchisFull}
                                value={`${batch.value}-${batch.label}`}
                                onSelect={(currentValue) => {
                                    selectedRows
                                        ? handleAssignBatch(currentValue)
                                        : handleSelectBatchChange(
                                              currentValue,
                                              value,
                                              setValue,
                                              setOpen
                                          )
                                }}
                                className={cn('cursor-pointer',
                                    value == (batch.value) && 'bg-orange-500 text-accent-foreground',
                                    `data-[selected]:${value == (batch.value) ? 'bg-orange-500' : 'bg-gray-100'} data-[selected]:${value == (batch.value) ? 'text-accent-foreground' : 'text-black'}`,
                                )}
                            >
                                <div className="flex items-center text-start gap-2">
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value == batch.value && !batchisFull
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                    )}
                                />
                                {batch.label}
                                </div>
                            </CommandItem>
                        )})}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
