'use client'

import { useUnauthorizedModalStore } from '@/store/unauthorized.store'
import NotAuthorizedUser from '@/components/NotAuthorizedUser'

export default function NotAuthorizedUserWrapper() {
    const showModal = useUnauthorizedModalStore((state) => state.showModal)
    console.log('NotAuthorizedUserWrapper showModal:', showModal)

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
            <NotAuthorizedUser />
        </div>
    )
}
