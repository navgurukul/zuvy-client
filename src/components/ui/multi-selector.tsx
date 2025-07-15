import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronDown } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function MultiSelector({
    selectedCount,
    options,
    selectedOptions,
    handleOptionClick,
    type,
}: {
    selectedCount: any
    options: any[]
    selectedOptions: any
    handleOptionClick: (option: any) => void
    type: string
}) {
    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <button className="flex w-full items-center justify-between rounded-md border border-secondary px-4 py-2 text-left focus:outline-none">
                        <span className="truncate text-secondary">
                            {/* {selectedOptions.length === 1 &&
                            (selectedOptions[0].value == -1 ||
                                selectedOptions[0].value == 'None')
                                ? selectedOptions[0].label
                                : selectedCount > 0
                                ? `${selectedCount} ${type} Selected`
                                : 'Select options'} */}
                            {selectedCount > 0
                                ? selectedCount === 1
                                    ? selectedOptions[0].label
                                    : `${selectedCount} ${type} Selected`
                                : type === 'Topic' || type === 'Topics'
                                    ? 'All Topics'
                                    : 'All Difficulty'}

                        </span>
                        <ChevronDown className="ml-2 h-5 w-5 text-secondary" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-full lg:w-[250px] p-4 border border-secondary text-secondary">
                    <ScrollArea
                        className={`${(type === 'Topic' || type === 'Topics') &&
                            'h-[300px]'
                            } pr-4`}
                        type="hover"
                        style={{
                            scrollbarWidth: 'none', // Firefox
                            msOverflowStyle: 'none', // IE and Edge
                        }}
                    >
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
                    </ScrollArea>
                </PopoverContent>
            </Popover>
        </>
    )
}
