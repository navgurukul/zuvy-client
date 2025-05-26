'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'
import Link from 'next/link'

type Props = {
    className?: string
    file: File
    setFile: any
    isPdfUploaded: boolean
    pdfLink: any
}

const Dropzone = ({
    className = '',
    file,
    setFile,
    isPdfUploaded,
    pdfLink,
}: Props) => {
    const [previewPdfLink, setPreviewPdfLink] = useState<string | null>(null)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const pdfFile = acceptedFiles[0]
        if (pdfFile && pdfFile.type === 'application/pdf') {
            setFile(pdfFile)
            const tempUrl = URL.createObjectURL(pdfFile)
            setPreviewPdfLink(tempUrl)
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
                                    <h3 className=" font-semibold">
                                        Upload Status
                                    </h3>
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-black">
                                        PDF is uploaded
                                    </span>
                                    <span>
                                        <Link
                                            href={pdfLink}
                                            target="_blank"
                                            className="text-blue-700"
                                        >
                                            View PDF
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {file && (
                                    <div className="flex flex-col items-start mt-5 w-full gap-y-5 border border-gray-300 p-3 rounded-lg">
                                        <div className="flex flex-col items-center space-x-2">
                                            <div className="flex items-center justify-start w-full gap-x-2 ml-3">
                                                <h3 className=" font-semibold">
                                                    Upload Status
                                                </h3>
                                                <div className="w-2 h-2 rounded-full bg-green-500 " />
                                            </div>
                                            <span className="text-black space-x-3 ">
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
                                                <span className="italic text-gray-500 mx-1 text-sm">
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
