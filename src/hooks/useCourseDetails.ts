import { useState } from 'react'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { getCourseData } from '@/store/store'
import {
    CourseDetailsFormData,
    UpdateCourseResponse,
    ImageUploadResponse,
} from '@/app/[admin]/[organizationId]/courses/[courseId]/(courseTabs)/details/courseDetailType'

export const useCourseDetails = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isImageUploading, setIsImageUploading] = useState(false)
    const { Permissions, courseData, setCourseData } = getCourseData()

    const uploadImage = async (
        croppedImage: string
    ): Promise<string | null> => {
        try {
            setIsImageUploading(true)

            const response = await fetch(croppedImage)
            const blob = await response.blob()
            const file = new File([blob], 'cropped-cover-image.png', {
                type: 'image/png',
            })

            const formData = new FormData()
            formData.append('images', file)

            const res = await api.post<ImageUploadResponse>(
                '/Content/curriculum/upload-images',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            )

            const uploadedUrls = Array.isArray(res.data?.urls)
                ? res.data.urls
                : []
            if (uploadedUrls.length === 0) {
                toast.error({
                    title: 'Error',
                    description: 'File uploaded but no URLs returned',
                })
                return null
            }

            return uploadedUrls[0]
        } catch (error) {
            toast.error({
                title: 'Upload Failed',
                description: 'Failed to upload image. Please try again.',
            })
            return null
        } finally {
            setIsImageUploading(false)
        }
    }

    const updateCourseDetails = async (
        data: CourseDetailsFormData,
        croppedImage?: string | null,
        croppedCollaboratorImage?: string | null
    ): Promise<boolean> => {
        try {
            setIsLoading(true)

            let coverImage = data.coverImage || ''
            let collaborator = data.collaborator || ''

            // Handle cover image upload if there's a new cropped image
            if (croppedImage && croppedImage !== courseData?.coverImage) {
                const uploadedImageUrl = await uploadImage(croppedImage)
                if (!uploadedImageUrl) {
                    return false
                }
                coverImage = uploadedImageUrl
            } else if (croppedImage) {
                coverImage = croppedImage
            }

            // Handle collaborator image upload if there's a new cropped collaborator image
            if (croppedCollaboratorImage && croppedCollaboratorImage !== courseData?.collaborator) {
                const uploadedCollaboratorImageUrl = await uploadImage(croppedCollaboratorImage)
                if (!uploadedCollaboratorImageUrl) {
                    return false
                }
                collaborator = uploadedCollaboratorImageUrl
            } else if (croppedCollaboratorImage) {
                collaborator = croppedCollaboratorImage
            }

            const response = await api.patch<UpdateCourseResponse>(
                `/bootcamp/${courseData?.id}`,
                {
                    ...data,
                    coverImage,
                    collaborator,
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            )

            const {
                id,
                name,
                bootcampTopic,
                description,
                coverImage: updatedCoverImage,
                collaborator: updatedCollaborator,
                startTime,
                duration,
                language,
                unassigned_students,
            } = response.data.updatedBootcamp[0]

            // CourseData interface ke according setCourseData call - type conversion properly
            setCourseData({
                id: Number(id),
                name,
                bootcampTopic,
                description,
                coverImage: updatedCoverImage,
                collaborator: updatedCollaborator,
                startTime,
                duration,
                language,
                unassigned_students,
            })

            toast.success({
                title: response.data.status,
                description:
                    response.data.message || 'Changes saved successfully',
            })

            return true
        } catch (error) {
            toast.error({
                title: 'Failed',
                description: 'Failed to save changes. Please try again.',
            })
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const validateImageFile = (file: File): boolean => {
        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            toast.error({
                title: 'File too large',
                description: 'Please upload an image smaller than 2MB',
            })
            return false
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error({
                title: 'Invalid file type',
                description: 'Please upload an image file (JPG, PNG, SVG)',
            })
            return false
        }

        return true
    }

    return {
        isLoading,
        isImageUploading,
        courseData,
        Permissions,
        updateCourseDetails,
        uploadImage,
        validateImageFile,
    }
}
