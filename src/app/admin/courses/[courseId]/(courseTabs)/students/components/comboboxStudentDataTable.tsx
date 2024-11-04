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
// import { fetchStudentsHandler } from '@/utils/admin'
// import { useStudentData } from './useStudentData'

export function ComboboxStudent({
    batchData,
    batchName,
    userId,
    bootcampId,
    batchId,
    selectedRows,
}: {
    batchData: any
    batchName?: any
    userId?: any
    bootcampId: any
    batchId?: any
    selectedRows?: any[]
}) {
    // const {
    //     setStudents,
    //     limit,
    //     offset,
    //     search,
    //     setLoading,
    //     setTotalPages,
    //     setTotalStudents,
    //     setCurrentPage,
    // } = useStudentData(bootcampId)
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState('')
    const [displaybatchName, setDisplayBatchName] = React.useState(
        batchName || 'Unassigned'
    )
    const [batchisFull, setBatchisFull] = React.useState(false)

    React.useEffect(() => {
        setDisplayBatchName(batchName || 'Unassigned')
        setValue(batchId)
    }, [batchName, batchId])
    const handleSelectBatchChange = async (
        currentValue: any,
        value: any,
        setValue: any,
        setOpen: any
    ) => {
        const [selectedValue, label] = currentValue.split('-')
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
                    toast({
                        title: res.data.status,
                        description: res.data.message,
                        className:
                            'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                    })
                    setDisplayBatchName(label)
                })
        } catch (error: any) {
            if (error.response.data.message === 'Batch is full')
                setBatchisFull(true)
            toast({
                title: 'Error',
                description: error.response.data.message,
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        } finally {
        }
    }

    const selected = selectedRows?.map((item) => {
        return {
            name: item.name,
            email: item.email,
        }
    })

    console.log('selected', selected)

    const handleAssignBatch = async (currentValue: any) => {
        const [batchId, label] = currentValue.split('-')
        const courseId = bootcampId
        try {
            await api
                .post(`/bootcamp/students/${bootcampId}?batch_id=${batchId}`, {
                    students: selected,
                })
                .then((res) => {
                    toast({
                        title: res.data.status,
                        description: res.data.message,
                        className:
                            'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                    })
                    // fetchStudentsHandler({
                    //     courseId,
                    //     limit,
                    //     offset,
                    //     searchTerm: search,
                    //     setLoading,
                    //     setStudents,
                    //     setTotalPages,
                    //     setTotalStudents,
                    //     setCurrentPage,
                    // })
                })
        } catch (error: any) {
            if (error.response.data.message === 'Batch is full')
                setBatchisFull(true)
            toast({
                title: 'Error',
                description: error.response.data.message,
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between capitalize"
                >
                    {displaybatchName}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search batch..." />
                    <CommandEmpty>No batch found.</CommandEmpty>
                    <CommandGroup>
                        {batchData.map((batch: any) => (
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
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value == batch.value && !batchisFull
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                    )}
                                />
                                {batch.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
