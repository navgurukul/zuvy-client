// components/SessionModalWrapper.tsx
'use client'

import { useSessionModalStore } from '@/store/store'
import { SessionExpiredModal } from '@/components/SessionExpiredModal'

export default function SessionModalWrapper() {
    const showModal = useSessionModalStore((state) => state.showModal)
    return showModal ? <SessionExpiredModal /> : null
}
