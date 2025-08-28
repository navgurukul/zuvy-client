import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronDown } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

function Selector({
    options,
    selectedOptions,
    handleOptionClick,
}: {
    options: any[]
    selectedOptions: any[]
    handleOptionClick: (option: any) => void
}) {
    return (
        <div className="space-y-2">
            {options.map((option: any) => (
                <div
                    key={option.value}
                    className={`flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer rounded-md
                        ${
                            selectedOptions.some(
                                (selected: any) =>
                                    selected.value === option.value
                            ) && 'text-[rgb(81,134,114)]'
                        }`}
                    onClick={() => handleOptionClick(option)}
                >
                    <Check
                        className={`h-5 w-5 ${
                            selectedOptions.some(
                                (selected: any) =>
                                    selected.value === option.value
                            )
                                ? 'opacity-100'
                                : 'opacity-0'
                        }`}
                    />
                    <span>{option.label}</span>
                </div>
            ))}
        </div>
    )
}

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
                    <button className="flex w-full items-center text-lg justify-between rounded-md border border-[rgb(81,134,114)] px-4 py-2 text-left focus:outline-none">
                        <span className="truncate text-[rgb(81,134,114)]">
                            {selectedCount > 0
                                ? selectedCount === 1
                                    ? selectedOptions[0].label
                                    : `${selectedCount} ${type} Selected`
                                : type === 'Topic' || type === 'Topics'
                                ? 'All Topics'
                                : 'All Difficulty'}
                        </span>
                        <ChevronDown className="ml-2 h-5 w-5 text-[rgb(81,134,114)]" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className={`w-full lg:w-[250px] p-2 border border-[rgb(81,134,114)]`}
                >
                    {type === 'Topic' || type === 'Topics' ? (
                        <ScrollArea
                            className={`h-[300px] pr-4`}
                            type="hover"
                            style={{
                                scrollbarWidth: 'none', // Firefox
                                msOverflowStyle: 'none', // IE and Edge
                            }}
                        >
                            <Selector
                                options={options}
                                selectedOptions={selectedOptions}
                                handleOptionClick={handleOptionClick}
                            />
                        </ScrollArea>
                    ) : (
                        <Selector
                            options={options}
                            selectedOptions={selectedOptions}
                            handleOptionClick={handleOptionClick}
                        />
                    )}
                </PopoverContent>
            </Popover>
        </>
    )
}
