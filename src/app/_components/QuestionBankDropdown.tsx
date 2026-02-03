'use client'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from '@/components/ui/dropdown-menu'
import { Database } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const QuestionBankDropdown = () => {
    const pathname = usePathname()
        const role = pathname.split('/')[1]
    const [open, setOpen] = useState(false)

    const isActive =
        pathname === `/${role}/resource/` ||
        pathname.startsWith(`/${role}/resource/`)

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
            <div
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(
                            'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none',
                            isActive
                                ? 'bg-primary text-primary-foreground shadow-sm cursor-default hover:bg-primary hover:text-primary-foreground'
                                : open
                                ? 'bg-gray-100 text-foreground hover:bg-gray-100 hover:text-foreground'
                                : 'text-muted-foreground hover:text-foreground hover:bg-gray-100'
                        )}
                    >
                        <Database className="h-4 w-4" />
                        <span>Question Bank</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-40">
                    <Link
                        href={`/${role}/resource/coding`}
                        className={cn(
                            'block w-full px-3 py-2 rounded text-sm text-left',
                            pathname === `/${role}/resource/coding`
                                ? 'bg-gray-300 text-black'
                                : 'text-black hover:bg-gray-100'
                        )}
                    >
                        Coding Problems
                    </Link>
                    <Link
                        href={`/${role}/resource/mcq`}
                        className={cn(
                            'block w-full px-3 py-2 rounded text-sm text-left',
                            pathname === `/${role}/resource/mcq`
                                ? 'bg-gray-300 text-black'
                                : 'text-black hover:bg-gray-100'
                        )}
                    >
                        MCQ
                    </Link>
                    <Link
                        href={`/${role}/resource/open-ended`}
                        className={cn(
                            'block w-full px-3 py-2 rounded text-sm text-left',
                            pathname === `/${role}/resource/open-ended`
                                ? 'bg-gray-300 text-black'
                                : 'text-black hover:bg-gray-100'
                        )}
                    >
                        Open Ended
                    </Link>
                </DropdownMenuContent>
            </div>
        </DropdownMenu>
    )
}

export default QuestionBankDropdown
