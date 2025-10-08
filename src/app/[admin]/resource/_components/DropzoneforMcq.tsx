'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Upload } from 'lucide-react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { removeNulls, transformQuizzes } from '@/utils/admin'
// import {DropzoneforMcqProps} from "@/app/[admin]/resource/_components/adminResourceComponentType"

// export interface DropzoneforMcqProps {
//   className?: string
// acceptedFiles?: string
//   mcqSide: boolean
//   mcqData: any // replace with actual type if known
//   setMcqData: React.Dispatch<React.SetStateAction<any>>
// }
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
        <div
            {...getRootProps({
                className: `${className} w-full border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors`,
            })}
        >
            <input {...getInputProps()} />
            {isDragActive ? (
                <div className="min-h-[300px] flex items-center justify-center">
                    <p className="text-primary font-medium">
                        Drop the files here ...
                    </p>
                </div>
            ) : (
                <div className="min-h-[300px] gap-y-4 flex flex-col justify-center items-center  w-full h-full text-primary">
                    <Upload className="mb-[20px]" size={38} />
                    <p className="mx-3 font-semibold text-lg">
                        Upload Or Drag File
                    </p>
                    <p className="text-muted-foreground">
                        .csv files are supported
                    </p>
                </div>
            )}

            {fileName && (
                <div className="flex flex-col items-start mt-5 w-full gap-y-5 border border-border p-3 rounded-lg bg-background">
                    <div className="w-full flex items-center justify-between">
                        <h2 className="font-bold">{fileName}</h2>
                        <X
                            size={20}
                            className="text-gray-400 cursor-pointer hover:text-destructive"
                            onClick={removeFile}
                        />
                    </div>
                    {mcqSide && (
                        <div className="text-start">
                            <h3 className="mb-2 font-semibold">
                                Upload Status
                            </h3>
                            <div className="flex items-center justify-start space-x-2">
                                <div className="w-2 h-2 rounded-full bg-success" />
                                <span className="text-foreground">
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
