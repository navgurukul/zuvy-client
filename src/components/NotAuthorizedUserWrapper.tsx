'use client'

import NotAuthorizedUser from '@/components/NotAuthorizedUser'
import { useUnauthorizedModalStore } from '@/store/session.store'

export default function NotAuthorizedUserWrapper() {
    const showModal = useUnauthorizedModalStore((state) => state.showModal)

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
            <NotAuthorizedUser />
        </div>
    )
}
