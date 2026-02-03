// components/DeleteConfirmationModal.tsx
'use client'
import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { AlertTriangle, X } from 'lucide-react'
import { DeleteConfirmationModalProps } from '@/app/[admin]/courses/[courseId]/_components/adminCourseCourseIdComponentType'

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    topicId,
    isOpen,
    onClose,
    onConfirm,
    onDeleteChapterWithSession,
    modalTitle,
    modalText,
    buttonText,
    input,
    modalText2,
    instructorInfo,
    loading,
}) => {
    const [inputValue, setInputValue] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [deleteWithSession, setDeleteWithSession] = useState<boolean>(false)
    useEffect(() => {
        if (!isOpen) {
            setInputValue('')
            setError(null)
            setDeleteWithSession(false)
        }
    }, [isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInputValue(value)
        setError(null)
    }

    const handleConfirm = () => {
        if (input) {
            if (
                inputValue.replace(/\s/g, '') ===
                    instructorInfo?.name.replace(/\s/g, '') &&
                input
            ) {
                setError(null)
                onConfirm?.()
            } else if (!input) {
                onConfirm?.()
            } else {
                setError('Batch name does not match')
            }
        } else {
            onConfirm?.()
        }
    }

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-50"
                onClose={() => onClose?.()}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm transition-opacity" />

                </Transition.Child>

                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left   shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.05)] transition-all">
                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"

                                    disabled={loading}
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </button>

                                {/* Dialog Header */}
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-shrink-0">
                                            <AlertTriangle className="h-6 w-6 text-destructive" />
                                        </div>
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-semibold text-gray-900"
                                        >
                                            {input ? 'Delete Batch' : modalTitle || 'Permanent Deletion'}
                                        </Dialog.Title>
                                    </div>
                                    
                                    <p className="text-sm text-muted-foreground">
                                        {modalText}
                                    </p>

                                    {(modalText2 || instructorInfo?.name) && (
                                        <div className="text-sm flex gap-x-2 text-black font-semibold mt-3">
                                            <p className="text-gray-600 font-normal">
                                                {modalText2}
                                            </p>
                                            {instructorInfo?.name}
                                        </div>
                                    )}

                                    {input && (
                                        <div className="mt-4">
                                            <Input
                                                placeholder="Type Batch Name"
                                                className="p-3"
                                                onChange={handleInputChange}
                                                value={inputValue}
                                            />
                                            {error && (
                                                <p className="text-red-600 text-sm mt-2">
                                                    {error}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Live Class System Deletion Checkbox */}
                                    {topicId === 8 && (
                                        <div className="mt-2 pt-4 border-t">
                                            <label className="flex items-start space-x-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={deleteWithSession}
                                                    onChange={(e) => setDeleteWithSession(e.target.checked)}
                                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                />
                                                <div>
                                                    <span className="text-sm font-medium text-foreground block">
                                                        Delete live class from system
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        It will not be available anymore
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex justify-end gap-2 sm:gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1 sm:flex-initial"
                                        disabled={loading}
                                    >
                                        {modalTitle ? 'Keep the Question' : 'Cancel'}
                                    </Button>
                                    {loading ? (
                                        <Button 
                                            variant="destructive" 
                                            disabled 
                                            className="flex-1 sm:flex-initial"
                                        >
                                            <Spinner className="mr-2 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                if (topicId === 8 && deleteWithSession) {
                                                    onDeleteChapterWithSession?.()
                                                } else {
                                                    handleConfirm()
                                                }
                                            }}
                                            className="flex-1 sm:flex-initial"
                                        >
                                            {buttonText || 'Delete'}
                                        </Button>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default DeleteConfirmationModal


