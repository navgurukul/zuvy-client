'use client'

import React, { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { Upload } from 'lucide-react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { DropzoneProps } from '@/app/[admin]/[organizationId]/courses/[courseId]/_components/adminCourseCourseIdComponentType'
import { Button } from '@/components/ui/button'

const Dropzone = ({
    className,
    studentData,
    setStudentData,
    acceptedFiles = 'text/csv',
}: DropzoneProps) => {
    // misc
    const inputRef = useRef<HTMLInputElement>(null)

    // state and variables
    const [fileName, setFileName] = useState('')

    // func
    const handleDataFormat = useCallback(
        (data: any) => {
            const filteredArray = data?.filter(
                (item: any) => item.email !== null && item.email !== undefined
            )

            acceptedFiles === 'text/csv' && setStudentData(filteredArray)
        },
        [setStudentData]
    )

    const removeFile = () => {
        setFileName('')
        acceptedFiles === 'text/csv' && setStudentData({})
    }

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            acceptedFiles.forEach((file) => {
                const reader = new FileReader()
                setFileName(file.name)

                reader.onload = () => {
                    // Use Papaparse to parse the CSV data
                    Papa.parse(reader.result as string, {
                        header: true,
                        dynamicTyping: true,
                        complete: (results: any) => {
                            // Handle the parsed data (results.data)
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
        noClick: true, // Disable click on the dropzone
    })

    // Function to handle button click
    const handleSelectFile = () => {
        if (inputRef.current) {
            inputRef.current.click()
        }
    }

    return (
        <>
            <div {...getRootProps({ className: className })}>
                <input {...getInputProps()} ref={inputRef} />
                {isDragActive ? (
                    <div className="h-[150px] flex items-center justify-center">
                        <p>Drop the files here ...</p>
                    </div>
                ) : (
                    <div className="p-2 text-muted-foreground gap-y-4 flex flex-col justify-center items-center w-full h-full ">
                        <Upload className="h-8 w-8" />
                        <p className="text-sm">
                            Upload a CSV file with student information
                        </p>
                        <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            size="sm"
                            type="button"
                            onClick={handleSelectFile}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Select CSV File
                        </Button>
                    </div>
                )}
            </div>

            {fileName ? (
                <div className="flex flex-col items-start mt-5  w-full gap-y-5 border border-gray-300 p-3 rounded-lg ">
                    <div className="w-full flex items-center justify-between">
                        <h2 className="font-bold text-[1rem]">{fileName}</h2>
                        <X
                            size={20}
                            className="text-gray-400 cursor-pointer"
                            onClick={removeFile}
                        />
                    </div>
                    {acceptedFiles === 'text/csv' && (
                        <div className="text-start">
                            <h3 className="text-[1rem] font-semibold">
                                Upload Status
                            </h3>
                            <div className="flex items-center justify-start space-x-2">
                                <div className="w-2 h-2 rounded-full bg-secondary" />
                                <span className="text-black">
                                    {studentData?.length} records uploaded
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                acceptedFiles === 'text/csv' && (
                    <div className="flex pt-2 justify-between items-center">
                        <p className="text-gray-400 text-xs">
                            Format for student data:
                            <Link
                                href="https://www.dropbox.com/scl/fi/jmd558u9uvl6ehtwlfdgj/csvformatted-file.csv?rlkey=zb5jzu52m5i5jcyli02kyfien&dl=1"
                                className="mx-2 text-xs font-semibold text-[#2F433A]"
                            >
                                Sample_Student_Data.csv
                            </Link>
                        </p>
                    </div>
                )
            )}
        </>
    )
}

export default Dropzone
