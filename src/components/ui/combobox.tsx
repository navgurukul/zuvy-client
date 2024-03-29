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

export interface ComboboxProps {
    data: any
    title: string
    onChange: (selectedValue: string) => void
    initialValue?: string
}

export function Combobox({
    data,
    title,
    onChange,
    initialValue,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(initialValue || '')
    console.log('first', value)

    const found = data.find((item: any) => item.value)
    console.log('first', found)
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? data.find((item: any) => item.value === value)?.label
                        : `Select ${title}...`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandEmpty>No {title} found.</CommandEmpty>
                    <CommandGroup>
                        {data.map((item: any) => (
                            <CommandItem
                                key={item.value}
                                value={item.value}
                                onSelect={(currentValue) => {
                                    setValue(
                                        currentValue === value
                                            ? ''
                                            : currentValue
                                    )
                                    setOpen(false)
                                    onChange(currentValue)
                                }}
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value === item.value
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                    )}
                                />
                                {item.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
