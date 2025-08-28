import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from '@/components/ui/tooltip'

export interface ComboboxProps {
    data: any
    title: string
    onChange: (selectedValue: string) => void
    initialValue?: string
    isDisabled?: boolean
    batch: boolean
    batchChangeData: any
}

export function Combobox({
    data,
    title,
    onChange,
    initialValue,
    isDisabled = false,
    batch,
    batchChangeData,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(initialValue)

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
                    {/* {batch
                        ? batchChangeData?.label
                        : value
                        ? data.find((item: any) => item.value === value)
                              ?.label ?? 'No Batch is Assigned'
                        : 'No Batch is Assigned'} */}

                <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <div className="truncate max-w-[150px] text-left cursor-pointer">
                          {batch
                           ? batchChangeData?.label
                           : value
                           ? data.find((item: any) => item.value === value)
                           ?.label ?? 'No Batch is Assigned'
                           : 'No Batch is Assigned'}
                        </div>
                    </TooltipTrigger>
                   <TooltipContent>
                       <p>
                        {batch
                        ? batchChangeData?.label
                        : value
                        ? data.find((item: any) => item.value === value)
                              ?.label ?? 'No Batch is Assigned'
                        : 'No Batch is Assigned'}
                      </p>
                  </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

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
                                disabled={item.value === batchChangeData.value}
                                onSelect={(currentValue) => {
                                    setValue(currentValue === value ? '' : currentValue)
                                    setOpen(false)
                                    onChange(currentValue)
                                }}
                                aria-selected={value === item.value}
                                className={cn('cursor-pointer',
                                    value === item.value && 'bg-orange-500 text-accent-foreground',
                                    // 'data-[selected]:bg-gray-100 data-[selected]:text-black'
                                    `data-[selected]:${value === item.value ? 'bg-orange-500' : 'bg-gray-100'} data-[selected]:${value === item.value ? 'text-accent-foreground' : 'text-black'}`,

                                )}
                                >
                                <div className="flex items-center text-start gap-2">
                                <Check
                                    className={value === item.value ? 'opacity-100' : 'opacity-0'}
                                    aria-hidden={value !== item.value}
                                />
                                {item.label}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
