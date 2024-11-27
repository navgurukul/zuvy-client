// components/DeleteConfirmationModal.tsx
'use client'
import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

interface DeleteConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    modalText?: string
    buttonText?: string
    input: boolean
    modalText2?: string
    instructorInfo?: any
    loading?: boolean
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    modalText,
    buttonText,
    input,
    modalText2,
    instructorInfo,
    loading,
}) => {
    const [inputValue, setInputValue] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
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
                className="fixed z-10 inset-0 overflow-y-auto "
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
                                        className="text-lg leading-6 my-3 font-medium text-gray-900"
                                    >
                                        {input
                                            ? 'Delete Batch'
                                            : 'Permanent Deletion'}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-700 my-2 ">
                                            {modalText}
                                        </p>
                                        <div className="text-sm flex gap-x-2 text-black font-semibold my-2 mb-2">
                                            <p className="text-black font-normal">
                                                {modalText2}
                                            </p>
                                            {instructorInfo?.name}
                                        </div>
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
                            </div>
                            <div className="mt-5 sm:mt-6 flex justify-end gap-2">
                                <Button
                                    variant={'outline'}
                                    type="button"
                                    className=" p-2 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4  bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                    onClick={onClose}
                                >
                                    {input ? 'Cancel' : 'Cancel'}
                                </Button>
                                {loading ? (
                                    <Button variant={'destructive'} disabled>
                                        <Spinner className="mr-2 text-black h-12  animate-spin w-1/3" />
                                        Deleting Session
                                    </Button>
                                ) : (
                                    <Button
                                        variant={'destructive'}
                                        type="button"
                                        className=" p-2 inline-flex justify-center  rounded-md border border-transparent shadow-sm px-4  bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                                        onClick={handleConfirm}
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
