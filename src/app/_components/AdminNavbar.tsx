'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Layers, Database, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminNavbarProps {
    children?: ReactNode
}

const AdminNavbar = ({ children }: AdminNavbarProps) => {
    const pathname = usePathname()

    const navigationItems = [
        {
            name: 'Course Studio',
            href: '/admin/courses',
            icon: Layers,
            active:
                pathname.startsWith('/admin/courses') ||
                pathname.startsWith('/admin'),
        },
        {
            name: 'Content Bank',
            href: '/admin/content-bank',
            icon: Database,
            active: pathname.startsWith('/admin/content-bank'),
        },
        {
            name: 'Roles and Permissions',
            href: '/admin/settings',
            icon: Settings,
            active: pathname.startsWith('/admin/settings'),
        },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Header Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
                <div className="flex h-16 items-center justify-between w-full px-6">
                    <div className="flex items-center gap-8">
                        {/* Logo and Brand */}
                        <Link
                            href="/admin"
                            className="flex items-center space-x-3"
                        >
                            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-xl">
                                    Z
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 text-lg">
                                    Zuvy
                                </span>
                                <span className="font-medium text-gray-700 text-sm -mt-1">
                                    Admin
                                </span>
                            </div>
                        </Link>

                        {/* Navigation Items */}
                        <nav className="flex items-center space-x-1">
                            {navigationItems.map((item) => {
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                            item.active
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Logout Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200"
                        title="Logout"
                        aria-label="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>
        </div>
    )
}

export default AdminNavbar
