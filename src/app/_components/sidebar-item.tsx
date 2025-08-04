'use client'

// External imports
import { useState } from 'react'
import { ChevronDown, LucideIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

// Internal imports
import { Logout } from '@/utils/logout'
import { cn } from '@/lib/utils'
import { SheetClose } from '@/components/ui/sheet'
import{SidebarItemProps} from "@/app/_components/componentType"


export const SidebarItem = ({
    icon: Icon,
    label,
    href,
    subtabs,
}: SidebarItemProps) => {
    const pathname = usePathname()
    const router = useRouter()

    const [open, setOpen] = useState(false)
    const isActive = (pathname === '/' && href === '/') || pathname === href
    // || pathname?.startsWith(`${href}/`);

    const onClick = () => {
        if (label === 'Logout') {
            Logout()
        } else if (href) {
            router.push(href)
            if (label !== 'Resource Library') {
                setOpen(false)
            }
        } else if (subtabs) {
            setOpen(!open)
        }
    }

    const content = (
        <div>
            <button
                onClick={onClick}
                type="button"
                className={cn(
                    'flex justify-between items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20 w-full rounded-lg',
                    isActive &&
                        'font-semibold text-[rgb(81,134,114)] bg-slate-200 hover:bg-slate-200 hover:text-[rgb(81,134,114)] ',
                    open && 'font-semibold text-black'
                )}
            >
                <div className="flex items-center gap-x-2 py-4">
                    {Icon && (
                        <Icon
                            size={22}
                            className={cn(
                                'text-slate-500',
                                isActive && 'text-[rgb(81,134,114)]',
                                open && 'text-black'
                            )}
                        />
                    )}
                    <p className={cn('m-0', !Icon && 'pl-8')}>{label}</p>
                </div>
                <div>
                    {subtabs?.length ? (
                        <ChevronDown
                            size={16}
                            className={cn(
                                'text-slate-500 transform transition-transform mr-2',
                                open && 'rotate-180 text-black'
                            )}
                        />
                    ) : null}
                    <div
                        className={cn(
                            'ml-2 opacity-0 border-2 border-secondary h-full transition-all',
                            isActive && 'opacity-100'
                        )}
                    />
                </div>
            </button>
            {open ? (
                <div>
                    {subtabs?.map((subtab) => (
                        <SidebarItem
                            key={subtab.label}
                            // icon={subtab.icon}
                            label={subtab.label}
                            href={subtab.href}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    )

    return label === 'Resource Library' ? content : <SheetClose asChild>{content}</SheetClose>
}
