// 'use client'

// import { useEffect, useState } from 'react'
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogFooter,
// } from '@/components/ui/dialog'
// import { Button } from '@/components/ui/button'
// import { useRouter } from 'next/navigation'
// // import { useSessionModal } from '@/store/store'

// export function SessionExpiredModal() {
//     const logout = localStorage.getItem('logout')
//     console.log('logout', logout)
//     const [open, setOpen] = useState((logout && JSON.parse(logout)) || false)
//     // const { isOpen, closeModal } = useSessionModal()
//     const router = useRouter()

//     console.log('SessionExpiredModal', SessionExpiredModal)

//     useEffect(() => {
//         // if (logout && JSON.parse(logout)) {
//         setOpen(true)
//         // }
//     }, [logout])

//     console.log('open', open)

//     const handleLogout = () => {
//         // localStorage.clear()
//         setOpen(false)
//         // localStorage.setItem('logout', false.toString())
//         localStorage.clear()
//         document.cookie =
//             'secure_typeuser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
//         router.push('/')
//     }

//     return (
//         <>
//             {logout && (
//                 <Dialog open={open}>
//                     <DialogContent className="max-w-sm">
//                         <DialogHeader>
//                             <DialogTitle>Session Expired</DialogTitle>
//                         </DialogHeader>
//                         <p className="text-sm text-muted-foreground text-start">
//                             Your session has expired. Please log in again to
//                             continue.
//                         </p>
//                         <DialogFooter>
//                             <Button onClick={handleLogout}>Login Again</Button>
//                         </DialogFooter>
//                     </DialogContent>
//                 </Dialog>
//             )}
//         </>
//     )
// }

'use client'

import { useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useSessionModalStore } from '@/store/store'

export function SessionExpiredModal() {
    const { showModal, setShowModal } = useSessionModalStore()
    const router = useRouter()

    const handleLogout = () => {
        setShowModal(false)
        localStorage.clear()
        document.cookie =
            'secure_typeuser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        router.push('/')
    }

    return (
        <Dialog open={showModal}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Session Expired</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground text-start">
                    Your session has expired. Please log in again to continue.
                </p>
                <DialogFooter>
                    <Button onClick={handleLogout}>Login Again</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
