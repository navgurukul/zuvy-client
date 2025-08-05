'use client'

import React, { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import styles from './cources.module.css'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import {newCourseDialogProps,CourseData} from "@/app/admin/courses/_components/courseComponentType"

const NewCourseDialog: React.FC<newCourseDialogProps> = ({
    newCourseName,
    newCourseDescription,
    handleNewCourseNameChange,
    handleNewCourseDescriptionChange,
    handleCreateCourse,
    isDialogOpen,
}) => {
    const [collaborator, setCollaborator] = useState('')
    const [collaboratorInputType, setCollaboratorInputType] = useState<
        'text' | 'file'
    >('text')
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])

    const resetForm = () => {
        setCollaborator('')
        setCollaboratorInputType('text')
        setSelectedFiles(null)
        setUploadedImageUrls([])
        // Reset file input
        const fileInput = document.getElementById('collaborator-file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
    }

    useEffect(() => {
        if (!isDialogOpen) {
            resetForm()
        }
    }, [isDialogOpen])

    const removeUploadedImage = (indexToRemove: number) => {
        const updatedUrls = uploadedImageUrls.filter((_, index) => index !== indexToRemove)
        setUploadedImageUrls(updatedUrls)
        
        // If no images left, reset file input and selected files
        if (updatedUrls.length === 0) {
            setSelectedFiles(null)
            const fileInput = document.getElementById('collaborator-file-input') as HTMLInputElement
            if (fileInput) fileInput.value = ''
        }
        
        toast.success({
            title: 'Removed',
            description: 'Image removed successfully',
        })
    }

    const handleCreateCourseWithUpload = async () => {
        try {
            if (!newCourseName.trim()) {
                toast.info({
                    title: 'info',
                    description: 'Course name is required',
                })
                return
            }

            let collaboratorValue = ''

            if (
                collaboratorInputType === 'file' &&
                uploadedImageUrls.length > 0
            ) {
                collaboratorValue = uploadedImageUrls[0]
            } else {
                collaboratorValue = collaborator.trim()
            }

            const payload: any = {
                name: newCourseName.trim(),
            }

            if (newCourseDescription.trim()) {
                payload.description = newCourseDescription.trim()
            }

            if (collaboratorValue) {
                payload.collaborator = collaboratorValue
            }

            resetForm()
            handleCreateCourse(payload)
        } catch (error: any) {
            console.error(
                'Error creating bootcamp:',
                error?.response?.data || error
            )
        }
    }
    
    const handleCollaboratorFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files
        setSelectedFiles(files)

        if (files && files.length > 0) {
            const formData = new FormData()
            Array.from(files).forEach((file) => {
                formData.append('images', file)
            })

            setIsUploading(true)

            try {
                const { data } = await api.post(
                    '/Content/curriculum/upload-images',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                )

                const uploadedUrls = Array.isArray(data?.urls) ? data.urls : []
                if (uploadedUrls.length === 0) {
                    toast.error({
                        title: 'error',
                        description: 'File uploaded but no URLs returned',
                    })
                    return
                }

                setUploadedImageUrls(uploadedUrls)
                // toast.success({
                //     title: 'Uploaded',
                //     description: 'File uploaded successfully!',
                // })
            } catch (error) {
                console.error('File upload failed:', error)
                toast.error({
                    title: 'error',
                    description: 'Failed to upload file. Please try again.',
                })
            } finally {
                setIsUploading(false)
            }
        }
    }

    return (
        <DialogContent className="max-w-md text-gray-600">
            <DialogHeader className="text-left">
                <DialogTitle className="text-left">New Course</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
                <div className="text-left">
                    <Label htmlFor="name">Course Name:</Label>
                    <Input
                        type="text"
                        id="name"
                        placeholder="Enter course name"
                        value={newCourseName}
                        onChange={handleNewCourseNameChange}
                        required
                    />
                </div>

                <div className="text-left">
                    <Label htmlFor="description">Description:</Label>
                    <Textarea
                        id="description"
                        placeholder="Enter course description"
                        value={newCourseDescription}
                        onChange={handleNewCourseDescriptionChange}
                        rows={3}
                    />
                </div>

                <div className="text-left">
                    <Label>Collaborator:</Label>
                    <RadioGroup
                        value={collaboratorInputType}
                        onValueChange={(value: 'text' | 'file') => {
                            const hasText = collaborator.trim().length > 0
                            const hasFiles = 
                                uploadedImageUrls.length > 0

                            if (value === 'file' && hasText) return
                            if (value === 'text' && hasFiles) return

                            setCollaboratorInputType(value)
                        }}
                        className="flex gap-3 mt-2 mb-1"
                    >
                        <Label
                            htmlFor="text"
                            className="flex items-center gap-1 cursor-pointer"
                        >
                            <RadioGroupItem
                                value="text"
                                id="text"
                                className="m-0 p-0 scale-95 text-black border-black"
                                disabled={uploadedImageUrls.length > 0}
                            />
                            Text Input
                        </Label>

                        <Label
                            htmlFor="file"
                            className="flex items-center gap-1 cursor-pointer"
                        >
                            <RadioGroupItem
                                value="file"
                                id="file"
                                className="m-0 p-0 scale-95 text-black border-black"
                                disabled={!!collaborator.trim()}
                            />
                            Image Upload
                        </Label>
                    </RadioGroup>

                    {collaboratorInputType === 'text' ? (
                        <Input
                            type="text"
                            placeholder="Enter collaborator name"
                            value={collaborator}
                            onChange={(e) => setCollaborator(e.target.value)}
                            className="mt-1"
                        />
                    ) : (
                        <div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                                <div className="flex items-center gap-3">
                                    <svg
                                        className="w-6 h-6 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            Upload Images
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Image files allowed
                                        </p>
                                    </div>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCollaboratorFileChange}
                                        className="hidden"
                                        id="collaborator-file-input"
                                    />
                                    <Button
                                        type="button"
                                        className='text-gray-600 border border-input bg-background hover:border-[rgb(81,134,114)]'
                                        size="sm"
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    'collaborator-file-input'
                                                )
                                                ?.click()
                                        }
                                    >
                                        Choose Image
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {uploadedImageUrls.length > 0 && (
                    <div className="text-left border border-gray-300 rounded-md hover:bg-gray-50 relative">
                        <button
                            onClick={() => {
                                setUploadedImageUrls([])
                                setSelectedFiles(null)
                                const fileInput = document.getElementById('collaborator-file-input') as HTMLInputElement
                                if (fileInput) fileInput.value = ''
                                toast.success({
                                    title: 'Removed',
                                    description: 'All images removed successfully',
                                })
                            }}
                            className="absolute -top-2 -right-2 z-10 text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50 bg-white border border-gray-200 shadow-sm"
                            title="Remove all images"
                            type="button"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                        <div className="px-3 py-2">
                            <Label className="text-left">Uploaded Files:</Label>
                            <div className="flex flex-col gap-1 mt-2">
                                {uploadedImageUrls.map((url, index) => {
                                    const fileName = decodeURIComponent(
                                        url.split('/').pop() || `File-${index + 1}`
                                    )
                                    const isImage =
                                        /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)
                                    return (
                                        <a
                                            key={index}
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()

                                                if (isImage) {
                                                    const imgTab = window.open()
                                                    if (imgTab) {
                                                        imgTab.document.write(
                                                            `<img src="${url}" style="max-width:100%;height:auto;" />`
                                                        )
                                                        imgTab.document.title =
                                                            fileName
                                                    } else {
                                                        toast.error({
                                                            title: 'Popup Blocked',
                                                            description:
                                                                'Please allow popups in your browser.',
                                                        })
                                                    }
                                                // }
                                                // else if (isPDF) {
                                                //     window.open(
                                                //         `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`,
                                                //         '_blank'
                                                //     )
                                                } else {
                                                    toast.error({
                                                        title: 'Unsupported file type',
                                                        description: fileName,
                                                    })
                                                }
                                            }}
                                            className="text-blue-600 text-sm truncate overflow-hidden whitespace-nowrap block max-w-[20rem]"
                                        >
                                            {fileName}
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                    <Button className='text-gray-600 border border-input bg-background hover:border-[rgb(81,134,114)]'>Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
                        className='bg-[rgb(81,134,114)]'
                        onClick={handleCreateCourseWithUpload}
                        disabled={!newCourseName.trim() || isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Create Course'}
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default NewCourseDialog
