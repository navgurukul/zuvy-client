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
                    className={`flex items-center justify-between gap-2 p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-md
                        ${
                            selectedOptions.some(
                                (selected: any) =>
                                    selected.value === option.value
                            ) && 'bg-accent text-accent-foreground'
                        }`}
                    onClick={() => handleOptionClick(option)}
                >
                    <span>{option.label}</span>
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
                    <button className="flex w-full items-center text-lg justify-between rounded-md border border-border px-4 py-1 mt-2 text-left focus:outline-none">
                        <span className="truncate text-foreground">
                            {selectedCount > 0
                                ? selectedCount === 1
                                    ? selectedOptions[0].label
                                    : `${selectedCount} ${type} Selected`
                                : type === 'Topic' || type === 'Topics'
                                ? 'All Topics'
                                : 'All Difficulty'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className={`w-full lg:w-[180px] p-2 shadow-4bp`}
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
