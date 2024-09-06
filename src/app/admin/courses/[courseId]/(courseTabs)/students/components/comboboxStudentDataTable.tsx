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

export function ComboboxStudent({
    batchData,
    batchName,
    userId,
    bootcampId,
    batchId,
}: {
    batchData: any
    batchName: any
    userId: any
    bootcampId: any
    batchId: any
}) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState('')
    const [displaybatchName, setDisplayBatchName] = React.useState(
        batchName || 'Unassigned'
    )

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
            toast({
                title: 'Error',
                description: error.response.data.message,
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        } finally {
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
                                disabled={value == batch.value}
                                value={`${batch.value}-${batch.label}`}
                                onSelect={(currentValue) =>
                                    handleSelectBatchChange(
                                        currentValue,
                                        value,
                                        setValue,
                                        setOpen
                                    )
                                }
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value == batch.value
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
