'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Upload } from 'lucide-react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { removeNulls, transformQuizzes } from '@/utils/admin'

const DropzoneforMcq = ({
    className,
    acceptedFiles = 'text/csv',
    mcqSide,
    mcqData,
    setMcqData,
}: any) => {
    const [fileName, setFileName] = useState('')

    const handleDataFormat = useCallback(
        (data: any) => {
            if (mcqSide) {
                const cleanedData = removeNulls(data)
                const transformedData = transformQuizzes(cleanedData)
                setMcqData(transformedData)
            }
        },
        [setMcqData, mcqSide]
    )

    const removeFile = () => {
        setFileName('')
        setMcqData({})
    }

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            acceptedFiles.forEach((file) => {
                const reader = new FileReader()
                setFileName(file.name)

                reader.onload = () => {
                    Papa.parse(reader.result as string, {
                        header: true,
                        dynamicTyping: true,
                        complete: (results: any) => {
                            handleDataFormat(results.data)
                        },
                        error: (error: any) => {
                            console.error('CSV Parsing Error:', error.message)
                        },
                    })
                }

                reader.readAsText(file)
            })
        },
        [handleDataFormat]
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: acceptedFiles,
        onDrop,
    })
    return (
        <div {...getRootProps({ className: className })}>
            <input {...getInputProps()} />
            {isDragActive ? (
                <div className="">
                    <p>Drop the files here ...</p>
                </div>
            ) : (
                <div className="p-2 gap-y-4 flex flex-col justify-center items-center w-full h-full text-secondary ">
                    <Upload className="mb-[20px]" />
                    <p className="mx-3 font-semibold">Upload Or Drag File</p>
                    <p className="text-gray-400">.csv files are supported</p>
                </div>
            )}

            {fileName && (
                <div className="flex flex-col items-start mt-5 w-full gap-y-5 border border-gray-300 p-3 rounded-lg">
                    <div className="w-full flex items-center justify-between">
                        <h2 className="font-bold">{fileName}</h2>
                        <X
                            size={20}
                            className="text-gray-400 cursor-pointer"
                            onClick={removeFile}
                        />
                    </div>
                    {mcqSide && (
                        <div className="text-start">
                            <h3 className="mb-2 font-semibold">
                                Upload Status
                            </h3>
                            <div className="flex items-center justify-start space-x-2">
                                <div className="w-2 h-2 rounded-full bg-secondary" />
                                <span className="text-black">
                                    {mcqData?.quizzes?.length || 0} records
                                    uploaded
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DropzoneforMcq
