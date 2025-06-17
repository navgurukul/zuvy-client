'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
// import { useSessionModal } from '@/store/store'

export function SessionExpiredModal() {
    const logout = localStorage.getItem('logout')
    const [open, setOpen] = useState((logout && JSON.parse(logout)) || false)
    // const { isOpen, closeModal } = useSessionModal()
    const router = useRouter()

    console.log('SessionExpiredModal', SessionExpiredModal)

    // useEffect(() => {
    //     setOpen(true)
    // }, [])

    const handleLogout = () => {
        localStorage.clear()
        setOpen(false)
        router.push('/')
    }

    return (
        <Dialog open={open}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Session Expired</DialogTitle>
                </DialogHeader>
                <div className="text-sm text-muted-foreground">
                    Your session has expired. Please log in again to continue.
                </div>
                <DialogFooter>
                    <Button onClick={handleLogout}>Login Again</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        // <Dialog open={isOpen} onOpenChange={closeModal}>
        //     <DialogContent>
        //         <DialogHeader>
        //             <DialogTitle>Session Expired</DialogTitle>
        //         </DialogHeader>
        //         <p>Please login again to continue.</p>
        //     </DialogContent>
        // </Dialog>
    )
}
