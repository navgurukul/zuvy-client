import React from 'react'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'

interface PermissionAlertProps {
    alertOpen: boolean
    setAlertOpen: (open: boolean) => void
    message?: string // Optional custom message
}

const PermissionAlert: React.FC<PermissionAlertProps> = ({
    alertOpen,
    setAlertOpen,
    message = "You don&apos;t have permission to edit this chapter. Please contact an admin to request access.",
}) => {
    return (
        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
            <AlertDialogContent className="max-w-md text-center">
                <div className="flex flex-col items-center justify-center gap-2 py-2">
                    <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <AlertTriangle className="h-8 w-8" />
                    </span>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold text-gray-700">
                            Note: Edit Permission Denied
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription className="text-sm text-gray-800">
                        {message}
                    </AlertDialogDescription>
                </div>
                <AlertDialogAction
                    className="w-full mt-4 rounded-md font-medium text-base bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setAlertOpen(false)}
                >
                    Ok
                </AlertDialogAction>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default PermissionAlert