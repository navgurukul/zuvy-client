import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';
import { CodeResult } from '@/utils/types/coding-challenge';

interface SubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalType: 'success' | 'error';
    questionTitle: string;
    codeResult: CodeResult[];
    onViewSolution: () => void;
    onReturnToCourse: () => void;
}

export function SubmissionModal({
    isOpen,
    onClose,
    modalType,
    questionTitle,
    codeResult,
    onViewSolution,
    onReturnToCourse,
}: SubmissionModalProps) {
    const passedTests = codeResult.filter((result: CodeResult) => result.status === 'Accepted').length;
    const totalTests = codeResult.length;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <DialogContent className="max-w-md">
                {modalType === 'success' ? (
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl">
                            Submission Successful!
                        </DialogTitle>
                    </DialogHeader>
                ) : (
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-destructive-light rounded-full flex items-center justify-center">
                                <X className="w-8 h-8 text-destructive" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl">
                            Test Cases Failed
                        </DialogTitle>
                    </DialogHeader>
                )}

                <div className="text-center space-y-4 font-manrope">
                    <p className="text-muted-foreground">
                        Your solution for <span className="font-semibold">{questionTitle}</span> has been submitted successfully.
                    </p>

                    {codeResult && codeResult.length > 0 && (
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="font-semibold text-sm">
                                Your Score: {passedTests}/{totalTests} test cases passed
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 pt-4">
                        <Button 
                            onClick={onViewSolution} 
                            size="lg" 
                            className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold"
                        >
                            View Solution
                        </Button>
                        <Button 
                            onClick={onReturnToCourse} 
                            variant="outline" 
                            size="lg" 
                            className="w-full bg-muted hover:bg-muted-dark text-foreground border-border font-semibold"
                        >
                            Return to Module
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 