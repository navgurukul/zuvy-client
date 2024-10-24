import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronDown } from 'lucide-react'

export default function MultiSelector({
    selectedCount,
    options,
    selectedOptions,
    handleOptionClick,
}: {
    selectedCount: any
    options: any[]
    selectedOptions: any
    handleOptionClick: (option: any) => void
}) {
    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <button className="flex w-full items-center justify-between rounded-md border border-secondary px-4 py-2 text-left focus:outline-none">
                        <span className="truncate text-secondary">
                            {selectedCount > 0
                                ? `${selectedCount} selected`
                                : 'Select options'}
                        </span>
                        <ChevronDown className="ml-2 h-5 w-5 text-secondary" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-full lg:w-[250px] p-4 border border-secondary text-secondary">
                    <div className="space-y-2">
                        {options.map((option: any) => (
                            <div
                                key={option.value}
                                className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer rounded-md"
                                onClick={() => handleOptionClick(option)}
                            >
                                <span>{option.label}</span>
                                {selectedOptions.some(
                                    (selected: any) =>
                                        selected.value === option.value
                                ) && (
                                    <Check className="h-5 w-5 text-secondary" />
                                )}
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </>
    )
}
