import {
    Code,
    FileQuestion,
    PencilLine,
    ScrollText,
    Video,
    BookOpenCheck,
    Newspaper,
} from 'lucide-react'

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import Link from 'next/link'

function ChapterModal({
    open,
    setOpen,
    params,
}: {
    open: boolean
    setOpen: (open: boolean) => void
    params: { moduleId: string; courseId: string }
}) {
    const AddVideoChapterHandler = () => {
        console.log('Hello')
    }

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Chapters">
                    <CommandItem>
                        <ScrollText className="mr-2 h-4 w-4" />
                        <span>Article</span>
                    </CommandItem>
                    <CommandItem>
                        <Video className="mr-2 h-4 w-4" />
                        <span onClick={AddVideoChapterHandler}>Video</span>
                    </CommandItem>
                    <CommandItem>
                        <FileQuestion className="mr-2 h-4 w-4" />
                        <span>Quiz</span>
                    </CommandItem>
                    <CommandItem>
                        <PencilLine className="mr-2 h-4 w-4" />
                        <span>Assignment</span>
                    </CommandItem>
                    <CommandItem>
                        <Code className="mr-2 h-4 w-4" />
                        <span>Coding Problem</span>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                    <CommandItem>
                        <BookOpenCheck className="mr-2 h-4 w-4" />
                        <span>Assessment</span>
                        {/* <CommandShortcut>⌘P</CommandShortcut> */}
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                    <CommandItem>
                        <Newspaper className="mr-2 h-4 w-4" />
                        <span>Form</span>
                        {/* <CommandShortcut>⌘B</CommandShortcut> */}
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}

export default ChapterModal
