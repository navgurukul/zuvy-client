"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface UnsavedChangesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedRole?: string
    onDiscard: () => void
    onKeep: () => void
}

const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({ open, onOpenChange, selectedRole, onDiscard, onKeep }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Unsaved Changes</DialogTitle>
                    <DialogDescription>
                        You have unsaved changes for <strong>{selectedRole}</strong>. Please save configuration before switching to any other role
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onKeep}>Keep Changes</Button>
                    <Button variant="destructive" onClick={onDiscard}>Discard Changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UnsavedChangesDialog
