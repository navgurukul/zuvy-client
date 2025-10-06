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
    const [open, setOpen] = useState(false)

    const isActive =
        pathname === '/admin/resource/' ||
        pathname.startsWith('/admin/resource/')

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
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
                                ? 'bg-blue-600 text-white shadow-sm cursor-default hover:bg-blue-600 hover:text-white'
                                : open
                                ? 'bg-gray-100 text-black hover:bg-gray-100 hover:text-black'
                                : 'text-black hover:text-black hover:bg-gray-100'
                        )}
                    >
                        <Database className="h-4 w-4" />
                        <span>Question Bank</span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-40">
                    <Link
                        href="/admin/resource/coding"
                        className={cn(
                            'block w-full px-3 py-2 rounded text-sm text-left',
                            pathname === '/admin/resource/coding'
                                ? 'bg-gray-300 text-black'
                                : 'text-black hover:bg-gray-100'
                        )}
                    >
                        Coding Problems
                    </Link>
                    <Link
                        href="/admin/resource/mcq"
                        className={cn(
                            'block w-full px-3 py-2 rounded text-sm text-left',
                            pathname === '/admin/resource/mcq'
                                ? 'bg-gray-300 text-black'
                                : 'text-black hover:bg-gray-100'
                        )}
                    >
                        MCQ
                    </Link>
                    <Link
                        href="/admin/resource/open-ended"
                        className={cn(
                            'block w-full px-3 py-2 rounded text-sm text-left',
                            pathname === '/admin/resource/open-ended'
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
