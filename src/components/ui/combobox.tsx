import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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
    isDisabled?: boolean
}

export function Combobox({
    data,
    title,
    onChange,
    initialValue,
    isDisabled = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(initialValue)
    const length = data.length
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    aria-labelledby={`${title.toLowerCase()}-combobox-label`}
                    className="w-full justify-between"
                    disabled={isDisabled}
                >
                    {length === 1
                        ? data[0]?.label ?? 'No Batch is Assigned'
                        : value
                        ? data.find((item: any) => item.value === value)
                              ?.label ?? 'No Batch is Assigned'
                        : `No Batch is Assigned`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        placeholder={`Search ${title}...`}
                        aria-labelledby={`${title.toLowerCase()}-combobox-label`}
                    />
                    <CommandEmpty>No {title} found.</CommandEmpty>
                    <CommandGroup>
                        {data.map((item: any) => (
                            <CommandItem
                                key={item.value}
                                value={item.value}
                                disabled={item.value === value}
                                onSelect={(currentValue) => {
                                    setValue(
                                        currentValue === value
                                            ? ''
                                            : currentValue
                                    )
                                    setOpen(false)
                                    onChange(currentValue)
                                }}
                                aria-selected={value === item.value}
                            >
                                <Check
                                    className={
                                        value === item.value
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                    }
                                    aria-hidden={!value === item.value}
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
