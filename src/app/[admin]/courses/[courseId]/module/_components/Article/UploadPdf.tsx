'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Trash, Trash2, Upload } from 'lucide-react'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'
import { DialogClose } from '@/components/ui/dialog'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { UploadProps } from '@/app/[admin]/courses/[courseId]/module/_components/Article/courseModuleArticleType'

const Dropzone = ({
    className = '',
    file,
    setFile,
    isPdfUploaded,
    pdfLink,
    loading,
    setIsPdfUploaded,
    onDeletePdfhandler,
    setDisableButton,
}: UploadProps) => {
    const [previewPdfLink, setPreviewPdfLink] = useState<string | null>(null)
    const [open, setIsOpen] = useState(false)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const pdfFile = acceptedFiles[0]
        if (pdfFile && pdfFile.type === 'application/pdf') {
            setFile(pdfFile)
            const tempUrl = URL.createObjectURL(pdfFile)
            setPreviewPdfLink(tempUrl)
            setIsPdfUploaded(false)
            setDisableButton(true)
        } else {
            return toast.error({
                title: 'Error',
                description: 'Only PDF files can be uploaded',
            })
        }
    }, [])

    const removeFile = () => {
        setFile(null)
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/pdf': ['.pdf'],
        },
        onDrop,
    })

    function onConfirm() {
        onDeletePdfhandler()
        removeFile()
    }

    function getCleanFileNameFromUrl(url: string) {
        try {
            const decodedUrl = decodeURIComponent(url)
            const fileName = decodedUrl.split('/').pop()?.split('?')[0] ?? ''
            // Remove leading numbers (with or without dash)
            return fileName.replace(/^\d+[-_]?/, '')
        } catch {
            return 'PDF'
        }
    }

    return (
        <>
            <div
                {...getRootProps({
                    className: `border-2 border-dashed border-gray-300 rounded-lg cursor-pointer w-full h-[150px] flex justify-center items-center transition-colors hover:border-gray-500 ${className}`,
                })}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p className="text-center">Drop the PDF here ...</p>
                ) : (
                    <div className="p-2 gap-y-4 flex flex-col justify-center items-center w-full h-full">
                        <Upload className="mb-[20px]" />
                        <p className="mx-3 font-semibold">
                            Upload or Drag PDF File
                        </p>
                        <p className="text-gray-400 text-sm">
                            Only .pdf files allowed
                        </p>
                    </div>
                )}
            </div>

            {
                <div>
                    <div className="w-full flex items-center justify-between">
                        {/* <h2 className="font-bold">{file.name}</h2> */}
                    </div>
                    <div className="text-start">
                        {isPdfUploaded ? (
                            <div className="flex flex-col items-start mt-5 w-full gap-y-5 border border-gray-300 p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <h3 className=" font-semibold text-base">
                                        Upload Status
                                    </h3>
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-black">
                                        PDF is uploaded
                                    </span>
                                    <span className="flex space-x-2 ">
                                        <Link
                                            href={pdfLink}
                                            target="_blank"
                                            className="text-blue-700"
                                        >
                                            {file?.name ??
                                                getCleanFileNameFromUrl(
                                                    pdfLink
                                                )}
                                        </Link>
                                        <Dialog>
                                            <DialogTrigger>
                                                <Trash2 className="text-red-500 w-4 cursor-pointer " />
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md [&>button.absolute.right-4.top-4]:hidden">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Are you absolutely sure?
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        This action cannot be
                                                        undone. This will
                                                        permanently delete the
                                                        PDF .
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter className="flex justify-end gap-2">
                                                    <DialogClose asChild>
                                                        <Button variant="outline">
                                                            Cancel
                                                        </Button>
                                                    </DialogClose>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={onConfirm}
                                                    >
                                                        Delete
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {file && (
                                    <div className="flex flex-col items-start mt-5 w-full gap-y-5 border border-gray-300 p-3 rounded-lg">
                                        <div className="flex flex-col items-center space-x-2">
                                            <div className="flex items-center justify-start w-full gap-x-2 ml-3">
                                                <h3 className=" font-semibold text-base">
                                                    Upload Status{' '}
                                                </h3>
                                                <div className="w-2 h-2 rounded-full bg-green-500 " />
                                                <span>
                                                    {loading && (
                                                        <Spinner className="w-4" />
                                                    )}
                                                </span>
                                            </div>
                                            <span className="text-black ">
                                                {previewPdfLink && (
                                                    <div>
                                                        <Link
                                                            href={
                                                                previewPdfLink
                                                            }
                                                            target="_blank"
                                                            className="text-blue-700"
                                                        >
                                                            {file.name}
                                                        </Link>
                                                    </div>
                                                )}

                                                <span>
                                                    PDF is ready to upload
                                                </span>
                                                <span className="italic text-gray-500 text-sm">
                                                    (Click on Upload PDF)
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            }
        </>
    )
}

export default Dropzone
