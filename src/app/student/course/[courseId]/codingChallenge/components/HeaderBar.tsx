import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Play, Upload, X } from 'lucide-react';

interface HeaderBarProps {
    isAlreadySubmitted: boolean;
    loading: boolean;
    isSubmitting: boolean;
    isCompleting: boolean;
    onBack: () => void;
    onRunCode: () => void;
    onOpenSubmitModal: () => void;
}

export function HeaderBar({
    isAlreadySubmitted,
    loading,
    isSubmitting,
    isCompleting,
    onBack,
    onRunCode,
    onOpenSubmitModal,
}: HeaderBarProps) {
    return (
        <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-4dp">
            <div className="w-full px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Back Button and Question Title */}
                    <div className="flex items-center space-x-4">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button 
                                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group bg-muted/50 hover:bg-muted px-3 py-2 rounded-lg cursor-pointer"
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    <span className="font-medium"><X className='w-4 h-4' /></span>
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border shadow-32dp">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-foreground">
                                        Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                        This action cannot be undone. If you have not
                                        submitted your solution, it will be lost.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-muted hover:bg-muted-dark text-foreground border-border">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive hover:bg-destructive-dark text-destructive-foreground"
                                        onClick={onBack}
                                    >
                                        Go Back
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <div className="flex items-center space-x-3">
                            {isAlreadySubmitted && (
                                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    Submitted
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={onRunCode}
                            size="sm"
                            variant="outline"
                            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-semibold"
                            disabled={loading || isSubmitting || isAlreadySubmitted}
                        >
                            {loading ? <Spinner className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            <span className="ml-2">Run Code</span>
                        </Button>
                        <Button
                            onClick={onOpenSubmitModal}
                            size="sm"
                            className="bg-primary hover:bg-primary-dark text-primary-foreground font-semibold"
                            disabled={loading || isSubmitting || isAlreadySubmitted || isCompleting}
                        >
                            {loading || isCompleting ? <Spinner className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                            <span className="ml-2">
                                {isAlreadySubmitted ? 'Already Submitted' : 'Submit Code'}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 