'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Users } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type MentorsDropdownProps = {
    role: string
    orgId?: string
}

const mentorOptions = [
    { label: 'Dashboard', path: 'dashboard' },
    { label: 'Availability', path: 'availability' },
    { label: 'Calendar', path: 'calendar' },
    { label: 'Sessions', path: 'sessions' },
    { label: 'Performance', path: 'performance' },
]

const MentorsDropdown = ({ role, orgId }: MentorsDropdownProps) => {
    const pathname = usePathname()
    const isActive = pathname.startsWith(`/${role}/mentorsDashboard`)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className='gap-2'
                >
                    <Users className="h-4 w-4" />
                    <span>Mentors</span>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-44">
                {mentorOptions.map((item) => {
                    const basePath = `/${role}/mentorsDashboard/${item.path}`
                    const href = orgId ? `${basePath}?orgId=${orgId}` : basePath

                    return (
                        <DropdownMenuItem asChild key={item.path}>
                            <Link
                                href={href}
                                className={cn(
                                    'w-full',
                                    pathname === basePath ? 'bg-gray-100' : ''
                                )}
                            >
                                {item.label}
                            </Link>
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default MentorsDropdown