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

const batchData = [
    {
        value: 'next.js',
        label: 'Next.js',
    },
    {
        value: 'sveltekit',
        label: 'SvelteKit',
    },
    {
        value: 'nuxt.js',
        label: 'Nuxt.js',
    },
    {
        value: 'remix',
        label: 'Remix',
    },
    {
        value: 'astro',
        label: 'Astro',
    },
]

export function ComboboxStudent({
    batchData,
    batchName,
    userId,
}: {
    batchData: any
    batchName: any
    userId: any
}) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState('')
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
                    `/batch/reassign/student_id=${userId}/new_batch_id=${selectedValue}?bootcamp_id=9`
                )
                .then((res) => {
                    toast({
                        title: res.data.status,
                        description: res.data.messasge,
                    })
                })
        } catch (e) {
        } finally {
        }

        // /batch/reassign/student_id=${student.userId}/new_batch_id=${selectedvalue} //
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {batchName ? batchName : 'Unassigned'}
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
                                        value === batch.value
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
