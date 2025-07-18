'use client'

import React, { useState } from 'react'

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
import {newCourseDialogProps, CourseData,UploadImagesResponse } from "@/app/admin/courses/_components/type"

// interface newCourseDialogProps {
//     newCourseName: string
//     newCourseDescription: string
//     handleNewCourseNameChange: (
//         event: React.ChangeEvent<HTMLInputElement>
//     ) => void
//     handleNewCourseDescriptionChange: (
//         event: React.ChangeEvent<HTMLTextAreaElement>
//     ) => void
//     handleCreateCourse: (courseData: CourseData) => void
// }

// interface CourseData {
//     name: string
//     description?: string
//     collaborator?: string
// }

const NewCourseDialog: React.FC<newCourseDialogProps> = ({
    newCourseName,
    newCourseDescription,
    handleNewCourseNameChange,
    handleNewCourseDescriptionChange,
    handleCreateCourse,
}) => {
    const [collaborator, setCollaborator] = useState('')
    const [collaboratorInputType, setCollaboratorInputType] = useState<'text' | 'file'>('text')
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])

    const resetForm = () => {
        setCollaborator('')
        setCollaboratorInputType('text')
        setSelectedFiles(null)
        setUploadedImageUrls([])
        // const pdfInput = document.getElementById('collaborator-file-input') as HTMLInputElement
        // if (pdfInput) pdfInput.value = ''
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

            if (collaboratorInputType === 'file' && selectedFiles && selectedFiles.length > 0) {
                const formData = new FormData()
                Array.from(selectedFiles).forEach((file) => {
                    formData.append('images', file)
                })

                setIsUploading(true)

                try {
                    const { data } = await api.post<UploadImagesResponse>(
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

                    collaboratorValue = uploadedUrls[0]
                    setUploadedImageUrls(uploadedUrls)

                } catch (error) {
                    console.error('File upload failed:', error)
                    toast.error({
                        title: 'error',
                        description: 'Failed to upload file. Please try again.',
                    })
                    return
                } finally {
                    setIsUploading(false)
                }
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
            console.error('Error creating bootcamp:', error?.response?.data || error)
        }
    }
    const handleCollaboratorFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        setSelectedFiles(files)

        if (files && files.length > 0) {
            const formData = new FormData()
            Array.from(files).forEach((file) => {
                formData.append('images', file)
            })

            setIsUploading(true)

            try {
                const { data } = await api.post<UploadImagesResponse>(
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
        <DialogContent className="max-w-md">
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
                            const hasFiles = selectedFiles && selectedFiles.length > 0

                            if (value === 'file' && hasText) return
                            if (value === 'text' && hasFiles) return

                            setCollaboratorInputType(value)
                        }}
                        className="flex gap-3 mt-2 mb-1"
                    >
                        <Label htmlFor="text" className="flex items-center gap-1 cursor-pointer">
                            <RadioGroupItem
                                value="text"
                                id="text"
                                className="m-0 p-0 scale-95"
                                disabled={!!(selectedFiles && selectedFiles.length > 0)}
                            />
                            Text Input
                        </Label>

                        <Label htmlFor="file" className="flex items-center gap-1 cursor-pointer">
                            <RadioGroupItem
                                value="file"
                                id="file"
                                className="m-0 p-0 scale-95"
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-sm font-medium text-gray-900">Upload Images</h3>
                                        <p className="text-xs text-gray-500">Image files allowed</p>
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
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('collaborator-file-input')?.click()}
                                    >
                                        Choose Image
                                    </Button>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
                {uploadedImageUrls.length > 0 && (
                    <div className="text-left border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50 w-fit">
                        <Label className="text-left">Uploaded Files:</Label>
                        <div className="flex flex-col gap-1 mt-2">
                            {uploadedImageUrls.map((url, index) => {
                                const fileName = decodeURIComponent(url.split('/').pop() || `File-${index + 1}`)
                                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)
                                // const isPDF = /\.pdf$/i.test(fileName)

                                return (
                                    <a
                                        key={index}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()

                                            if (isImage) {
                                                const imgTab = window.open()
                                                if (imgTab) {
                                                    imgTab.document.write(`<img src="${url}" style="max-width:100%;height:auto;" />`)
                                                    imgTab.document.title = fileName
                                                } else {
                                                    toast.error({
                                                        title: 'Popup Blocked',
                                                        description: 'Please allow popups in your browser.',
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
                                        className="text-blue-600 text-sm"
                                    >
                                        {fileName}
                                    </a>
                                )
                            })}
                        </div>
                    </div>
                )}

            </div>

            <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button
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
