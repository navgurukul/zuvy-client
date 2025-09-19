'use client'
import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { X } from "lucide-react"
import { CourseDeleteModalProps } from './adminCourseCourseIdComponentType'

const CourseDeleteModal: React.FC<CourseDeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading = false,
}) => {
    const [inputValue, setInputValue] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    const confirmationText = "Delete Course"

    useEffect(() => {
        if (!isOpen) {
            setInputValue('')
            setError(null)
        }
    }, [isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInputValue(value)
        setError(null)
    }

    const handleConfirm = () => {
        if (inputValue === confirmationText) {
            setError(null)
            onConfirm()
        } else {
            setError('Please type &quot;Delete Course&quot; exactly as shown') // Yahan bhi escape karo
        }
    }

    const isDeleteEnabled = inputValue === confirmationText

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed z-50 inset-0 overflow-y-auto"
                onClose={onClose}
            >
                <div className="flex items-center justify-center min-h-screen px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
                    </Transition.Child>

                    <span
                        className="hidden sm:inline-block sm:align-middle sm:h-screen"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>

                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="w-[550px] inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:p-6 relative">
                            {/* X Close Button */}
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="absolute top-2 right-4 p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Close dialog"
                            >
                                <X className="h-4 w-4 text-gray-500 hover:text-gray-600" />
                            </button>

                            <div>
                                {/* Header with warning icon */}
                                <div className="flex items-center gap-3 mt-0">
                                    <div>
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-semibold leading-6 text-black"
                                        >
                                            Are you absolutely sure?
                                        </Dialog.Title>
                                    </div>
                                </div>

                                {/* Warning message */}
                                <div className="mt-1 text-start">
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 mb-4">
                                            This action cannot be undone. This will permanently delete the course and remove all associated data including student submissions.
                                        </p>
                                        
                                        {/* Course name confirmation */}
                                        <div className="mt-8 mb-4">
                                            <p className="text-sm font-medium text-gray-900 mb-2">
                                                Type <span>&quot;{confirmationText}&quot;</span> to confirm:
                                            </p>
                                            <Input
                                                placeholder={`${confirmationText}`}
                                                className="w-full"
                                                onChange={handleInputChange}
                                                value={inputValue}
                                                disabled={loading}
                                            />
                                            {error && (
                                                <p className="text-red-500 text-sm mt-2">
                                                    {error}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="mt-5 sm:mt-6 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    // variant="outline"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="p-2 inline-flex justify-center rounded-md text-black border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm px-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                >
                                    Cancel
                                </Button>
                                
                                {loading ? (
                                    <Button variant="destructive" disabled className="px-4 py-2">
                                        <Spinner className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleConfirm}
                                        disabled={!isDeleteEnabled}
                                        className="p-2 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 text-base font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                                    >
                                        Delete Course
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default CourseDeleteModal