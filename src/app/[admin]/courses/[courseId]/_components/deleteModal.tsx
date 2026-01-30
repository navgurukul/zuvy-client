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

    useEffect(() => {
        setInputValue('')
    }, [isOpen])
    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed z-[60] inset-0 overflow-y-auto"
                onClose={() => onClose?.()}
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
                        <Dialog.Overlay 
                        className="fixed inset-0 bg-gray-900/40  transition-opacity"

                        />
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
                        <div className="w-[500px]  inline-block align-bottom bg-white rounded-lg p-6 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle  sm:p-6">
                            <div className="">
                                <div className="mt-0 text-start m:mt-5">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg leading-6 font-semibold text-gray-900 flex items-center gap-2"
                                    >
                                        
                                        {input
                                            ? 'Delete Batch'
                                            : modalTitle ||
                                              'Permanent Deletion'}
                                    </Dialog.Title>
                                    <div className="mt-3 border-t border-gray-200">
                                        <p className="text-base text-gray-700 leading-relaxed mt-5">
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
                                    <div className="flex items-start gap-2 mt-6 px-0 py-3 rounded-md hover:bg-gray-50 transition-colors">
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
                            <div className="mt-6 pt-4  flex justify-start gap-3">
                            {loading ? (
                                    <Button variant={'destructive'} disabled className="px-6 py-2">
                                        <Spinner className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </Button>
                                ) : (
                                    <Button
                                        variant={'destructive'}
                                        type="button"
                                        disabled={loading || (topicId === 8 && !deleteWithSession)}
                                        className={`
                                          px-6 py-2 text-sm font-medium
                                          transition-colors
                                          ${
                                            loading || (topicId === 8 && !deleteWithSession)
                                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed hover:bg-gray-300'
                                              : 'bg-red-600 text-white hover:bg-red-700'
                                          }
                                        `}
                                        onClick={() => {
                                          if (topicId === 8 && deleteWithSession) {
                                            onDeleteChapterWithSession?.()
                                          } else {
                                            handleConfirm()
                                          }
                                        }}
                                    >
                                        {buttonText}
                                    </Button>
                                )}
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
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default DeleteConfirmationModal


