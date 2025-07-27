import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export function ConfirmationModal({ isOpen, onClose, onConfirm, loading }: ConfirmationModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Submit Solution</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to submit your solution? Once submitted, you cannot make changes to your code.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className='bg-muted hover:bg-muted-dark text-foreground border-border'>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        className='bg-primary hover:bg-primary-dark text-primary-foreground' 
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className='flex items-center gap-2'>
                                Submitting...
                            </span>
                        ) : (
                            'Submit'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 