// components/DeleteConfirmationModal.tsx
'use client'
import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
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
                onConfirm()
            } else if (!input) {
                onConfirm()
            } else {
                setError('Batch name does not match')
            }
        } else {
            onConfirm()
        }
    }

    useEffect(() => {
        setInputValue('')
    }, [isOpen])
    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed z-[60] inset-0 overflow-y-auto"
                onClose={onClose}
            >
                <div className="flex items-center justify-start min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-100 bg-opacity-10 transition-opacity" />
                    </Transition.Child>

                    {/* This element is to trick the browser into centering the modal contents. */}
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
                        <div className="w-[500px]  inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle  sm:p-6">
                            <div className="my-7 mx-5 ">
                                <div className="mt-3 text-start m:mt-5">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg leading-6 font-semibold text-gray-900 flex items-center gap-2"
                                    >
                                        {/* {topicId === 8 && (
                                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        )} */}
                                        {input
                                            ? 'Delete Batch'
                                            : modalTitle ||
                                              'Permanent Deletion'}
                                    </Dialog.Title>
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-600 leading-relaxed">
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
                                    </div>
                                </div>
                                {input && (
                                    <div>
                                        <Input
                                            placeholder="Type Batch Name"
                                            className="p-3"
                                            onChange={handleInputChange}
                                            value={inputValue}
                                        />
                                        {
                                            <p style={{ color: 'red' }}>
                                                {error}
                                            </p>
                                        }
                                    </div>
                                )}
                                {topicId === 8 && (
                                    <div className="flex items-start gap-2 mt-6 p-3 rounded-md hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            id="deleteWithSession"
                                            checked={deleteWithSession}
                                            onChange={(e) => setDeleteWithSession(e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded  text-red-600 focus:ring-red-500 cursor-pointer"
                                        />
                                        <label htmlFor="deleteWithSession" className="flex flex-col cursor-pointer">
                                            <span className="text-sm font-semibold text-gray-900">Delete live class from system</span>
                                            <span className="text-xs text-gray-500 mt-0.5">It will not be available anymore</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
                              <Button
                                    variant={'outline'}
                                    type="button"
                                    className="px-6 py-2 text-sm font-medium"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    {modalTitle
                                        ? 'Keep the Question'
                                        : 'Cancel'}
                                </Button>
                                {loading ? (
                                    <Button variant={'destructive'} disabled className="px-6 py-2">
                                        <Spinner className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </Button>
                                ) : (
                                    <Button
                                        variant={'destructive'}
                                        type="button"
                                        className="px-6 py-2 text-sm font-medium bg-red-600 hover:bg-red-700"
                                        onClick={() => {
                                            if (topicId === 8 && deleteWithSession) {
                                                onDeleteChapterWithSession()
                                            } else {
                                                handleConfirm()
                                            }
                                        }}
                                    >
                                        {buttonText}
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

export default DeleteConfirmationModal


