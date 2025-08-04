import {LucideIcon } from 'lucide-react'
// navbar-notification
export interface Notification {
    id: number;
    message: string;
    time: string;
    read: boolean;
}

export interface SidebarItemProps {
    icon?: LucideIcon
    label: string
    href?: string
    onClick?: () => void
    subtabs?: SidebarItemProps[]
}