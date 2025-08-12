'use client'

import React, { useState, useEffect, useRef } from 'react'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'

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
    const [isUploading, setIsUploading] = useState(false)

    // Image cropping states
    const [collaboratorImage, setCollaboratorImage] = useState<string | null>(null)
    const [collaboratorCropper, setCollaboratorCropper] = useState<Cropper | null>(null)
    const [isCollaboratorCropping, setIsCollaboratorCropping] = useState(false)
    const [croppedCollaboratorImage, setCroppedCollaboratorImage] = useState<string | null>(null)
    
    const collaboratorFileInputRef = useRef<HTMLInputElement>(null)

    const resetForm = () => {
        setCollaborator('')
        setCollaboratorInputType('text')
        setIsUploading(false)
        
        // Reset image cropping states
        setCollaboratorImage(null)
        setCollaboratorCropper(null)
        setIsCollaboratorCropping(false)
        setCroppedCollaboratorImage(null)
        
        // Reset file input
        if (collaboratorFileInputRef.current) {
            collaboratorFileInputRef.current.value = ''
        }
    }

    useEffect(() => {
        if (!isDialogOpen) {
            resetForm()
        }
    }, [isDialogOpen])

    const handleCollaboratorFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setCollaboratorImage(reader.result as string)
                setIsCollaboratorCropping(true)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCollaboratorCrop = () => {
        if (collaboratorCropper) {
            // Get the crop box data to maintain the exact crop dimensions
            const cropBoxData = collaboratorCropper.getCropBoxData()
            const canvasData = collaboratorCropper.getCanvasData()
            
            // Calculate proper dimensions maintaining quality
            const scaleX = canvasData.naturalWidth / canvasData.width
            const scaleY = canvasData.naturalHeight / canvasData.height
            
            const croppedCanvas = collaboratorCropper.getCroppedCanvas({
                width: Math.max(200, Math.round(cropBoxData.width * scaleX)),
                height: Math.max(120, Math.round(cropBoxData.height * scaleY)),
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            })
            
            setCroppedCollaboratorImage(croppedCanvas.toDataURL('image/png', 0.9))
            setIsCollaboratorCropping(false)
        }
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

            if (collaboratorInputType === 'file' && croppedCollaboratorImage) {
                setIsUploading(true)
                
                try {
                    // Upload cropped image
                    const response = await fetch(croppedCollaboratorImage)
                    const blob = await response.blob()
                    const file = new File([blob], 'cropped-collaborator-image.png', {
                        type: 'image/png',
                    })

                    const formData = new FormData()
                    formData.append('images', file)

                    const res = await api.post(
                        '/Content/curriculum/upload-images',
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    )
                    
                    const uploadedUrls = Array.isArray(res.data?.urls) ? res.data.urls : []
                    if (uploadedUrls.length === 0) {
                        toast.error({
                            title: 'error',
                            description: 'File uploaded but no URLs returned',
                        })
                        setIsUploading(false)
                        return
                    }
                    collaboratorValue = uploadedUrls[0]
                } catch (error) {
                    console.error('Image upload failed:', error)
                    toast.error({
                        title: 'Error',
                        description: 'Failed to upload collaborator image',
                    })
                    setIsUploading(false)
                    return
                } finally {
                    setIsUploading(false)
                }
            } else if (collaboratorInputType === 'text') {
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
            setIsUploading(false)
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
                            const hasImage = croppedCollaboratorImage !== null

                            if (value === 'file' && hasText) return
                            if (value === 'text' && hasImage) return

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
                                disabled={croppedCollaboratorImage !== null}
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
                            maxLength={80}
                            value={collaborator}
                            onChange={(e) => setCollaborator(e.target.value)}
                            className="mt-1"
                        />
                    ) : (
                        <div>
                            {/* Image preview section */}
                            {croppedCollaboratorImage && !isCollaboratorCropping && (
                                <div className="mb-3">
                                    <div className="w-full border rounded-md overflow-hidden">
                                        <img
                                            src={croppedCollaboratorImage}
                                            alt="Collaborator"
                                            className="w-full h-auto object-contain"
                                            style={{ minHeight: '120px', maxHeight: '250px' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Cropper section */}
                            {collaboratorImage && isCollaboratorCropping ? (
                                <div className="my-3">
                                    <div className="w-full max-w-[360px] mx-auto border rounded-md overflow-hidden">
                                        <Cropper
                                            src={collaboratorImage}
                                            style={{
                                                height: 250,
                                                width: '100%',
                                            }}
                                            // Set rectangle aspect ratio (16:9 or 4:3)
                                            aspectRatio={16/9}
                                            viewMode={1}
                                            dragMode="crop"
                                            scalable={true}
                                            zoomable={true}
                                            cropBoxMovable={true}
                                            cropBoxResizable={true}
                                            responsive={true}
                                            restore={false}
                                            guides={true}
                                            center={true}
                                            highlight={true}
                                            background={true}
                                            onInitialized={(instance) =>
                                                setCollaboratorCropper(instance)
                                            }
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2 justify-center">
                                        <Button
                                            onClick={handleCollaboratorCrop}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                        >
                                            Crop Image
                                        </Button>
                                    </div>
                                    
                                </div>
                            ) : (
                                // Upload section
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
                                                Upload Image
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
                                            ref={collaboratorFileInputRef}
                                        />
                                        <Button
                                            type="button"
                                            className='text-gray-600 border border-input bg-background hover:border-[rgb(81,134,114)]'
                                            size="sm"
                                            onClick={() => 
                                                collaboratorFileInputRef.current?.click()}
                                        >
                                            {croppedCollaboratorImage ? 'Change Image' : 'Choose Image'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Show uploaded image with remove icon */}
                            {croppedCollaboratorImage && !isCollaboratorCropping && (
                                <div className="mt-2 border border-gray-300 rounded-md hover:bg-gray-50 relative">
                                    <button
                                        onClick={() => {
                                            setCroppedCollaboratorImage(null)
                                            setCollaboratorImage(null)
                                            setIsCollaboratorCropping(false)
                                            if (collaboratorFileInputRef.current) {
                                                collaboratorFileInputRef.current.value = ''
                                            }
                                            toast.success({
                                                title: 'Removed',
                                                description: 'Image removed successfully',
                                            })
                                        }}
                                        className="absolute -top-2 -right-2 z-10 text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50 bg-white border border-gray-200 shadow-sm"
                                        title="Remove image"
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
                                             <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    const imgTab = window.open()
                                                    if (imgTab) {
                                                        imgTab.document.write(
                                                            `<img src="${croppedCollaboratorImage}" style="max-width:100%;height:auto;" />`
                                                        )
                                                        imgTab.document.title = 'cropped-collaborator-image.png'
                                                    } else {
                                                        toast.error({
                                                            title: 'Popup Blocked',
                                                            description: 'Please allow popups in your browser.',
                                                        })
                                                    }
                                                }}
                                                className="text-blue-600 text-sm truncate overflow-hidden whitespace-nowrap block max-w-[20rem]"
                                            >
                                                cropped-collaborator-image.png
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
