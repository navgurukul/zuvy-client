'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { AlertCircle, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react'

import { api } from '@/utils/axios.config'
import CourseDeleteModal from '../../_components/CourseDeleteModal'
import { getCourseData } from '@/store/store'
import { Spinner } from '@/components/ui/spinner'
import useBootcampSettings from '@/hooks/useBootcampSettings'
import useBootcampDelete from '@/hooks/useBootcampDelete'
import { PageProps } from '@/app/[admin]/courses/[courseId]/(courseTabs)/settings/courseSettingType'

const Page = ({ params }: { params: PageProps }) => {
    const router = useRouter()
    const { courseData } = getCourseData()

    // Use the custom hooks
    const { bootcampSettings, loading, error, updateError, updateSettings } =
        useBootcampSettings(params.courseId)

    const {
        deleteBootcamp,
        isDeleting,
        error: deleteError,
    } = useBootcampDelete()

    // Local state for form
    const [localSettings, setLocalSettings] = useState({
        type: '',
        isModuleLocked: false,
    })
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    // Update local state when bootcamp settings load
    React.useEffect(() => {
        if (bootcampSettings) {
            setLocalSettings({
                type: bootcampSettings.type,
                isModuleLocked: bootcampSettings.isModuleLocked,
            })
        }
    }, [bootcampSettings])

    const handleRadioChange = (type: 'Public' | 'Private') => {
        setLocalSettings((prev) => ({
            ...prev,
            type,
        }))
    }

    const handleModuleLockToggle = () => {
        setLocalSettings((prev) => ({
            ...prev,
            isModuleLocked: !prev.isModuleLocked,
        }))
    }

    const handleSaveSettings = async () => {
        if (!bootcampSettings) return

        setIsSaving(true)
        setIsSaved(false)
        try {
            await updateSettings(localSettings)
            setIsSaved(true)

            // Hide success message after 3 seconds
            setTimeout(() => {
                setIsSaved(false)
            }, 3000)
        } catch (error) {
            // Error is handled in the hook and shown via updateError
        } finally {
            setIsSaving(false)
        }
    }

    const handleRetry = () => {
        handleSaveSettings()
    }

    const handleDelete = async () => {
        if (!courseData?.id) {
            toast.error({
                title: 'Error',
                description: 'Course ID not found',
            })
            return
        }

        try {
            await deleteBootcamp(courseData.id.toString())
            setDeleteModalOpen(false)
        } catch (error) {
            // Error is already handled in the hook
            console.error('Delete failed:', error)
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="my-5 flex justify-center items-center">
                    <div className="absolute h-screen">
                        <div className="relative top-[25%]">
                            <Spinner className="text-[rgb(81,134,114)]" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={() => router.push('/admin/courses')}>
                        Back to Courses
                    </Button>
                </div>
            </div>
        )
    }

    // No data state
    if (!bootcampSettings) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>No settings found</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Course Type Section */}
            <div className="bg-card rounded-lg p-6 shadow-4dp border border-border text-start">
                <h1 className="font-heading text-lg font-semibold leading-none tracking-tight text-foreground mb-6">
                    Course Settings
                </h1>

                <div className="space-y-3">
                    <h2 className="text-base font-medium text-foreground">
                        Course Type
                    </h2>
                    <RadioGroup
                        value={localSettings.type.toLowerCase()}
                        onValueChange={(value) =>
                            handleRadioChange(
                                value === 'public' ? 'Public' : 'Private'
                            )
                        }
                        className="flex flex-col gap-0"
                    >
                        <div className="flex items-start space-x-3 !pb-0 !mb-0">
                            <RadioGroupItem
                                value="private"
                                id="private"
                                className="mt-0.5"
                            />
                            <Label
                                htmlFor="private"
                                className="font-normal text-sm leading-relaxed"
                            >
                                Private - Only invited students can access this
                                course
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3 !pt-0 !mt-0">
                            <RadioGroupItem
                                value="public"
                                id="public"
                                className="mt-0.5"
                            />
                            <Label
                                htmlFor="public"
                                className="font-normal text-sm leading-relaxed"
                            >
                                Public - Anyone with the link can access this
                                course
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Module Lock Toggle Switch */}
                <div className="mt-4 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-medium text-foreground mb-1">
                                Module Lock
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                If enabled, students must complete modules and
                                projects in sequential order
                            </p>
                        </div>
                        <div className="flex flex-col justify-left items-start">
                            <div
                                className={`relative w-11 h-6 rounded-full bg-gray-300 p-0.5 cursor-pointer ${
                                    localSettings.isModuleLocked
                                        ? 'bg-primary'
                                        : ''
                                }`}
                                onClick={handleModuleLockToggle}
                            >
                                <div
                                    className={`absolute ml-0.5 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                        localSettings.isModuleLocked
                                            ? 'translate-x-full'
                                            : ''
                                    }`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-8 border-t border-border">
                    {/* Error Banner */}
                    {updateError && (
                        <div className="mb-4">
                            <Alert
                                variant="destructive"
                                className="border-red-200 bg-red-50"
                            >
                                <AlertCircle className="h-4 w-4 mt-1" />
                                <AlertDescription className="flex items-center justify-between">
                                    <span className="flex-1">
                                        {updateError}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRetry}
                                        disabled={isSaving}
                                        className="ml-3 h-8 px-3 text-sm border-red-300 hover:bg-red-100 flex items-center"
                                    >
                                        <RefreshCw
                                            className={`h-3 w-3 mr-1 ${
                                                isSaving ? 'animate-spin' : ''
                                            }`}
                                        />
                                        Retry
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    <div className="flex items-center justify-end pt-4">
                        {isSaved && (
                            <Alert
                                variant="default"
                                className="bg-green-50 text-green-800 border-green-200 mr-4 py-2 h-10"
                            >
                                <div className="flex items-center">
                                    <Info className="h-4 w-4" />
                                    <AlertDescription className="text-sm ml-2">
                                        Settings saved successfully
                                    </AlertDescription>
                                </div>
                            </Alert>
                        )}
                        <Button
                            onClick={handleSaveSettings}
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary-dark text-primary-foreground px-6 py-2 rounded-md font-medium"
                        >
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete Course Section */}
            <div className="bg-card rounded-lg p-6 shadow-4dp border border-border">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="text-destructive" />
                            <h2 className="text-xl font-semibold text-destructive">
                                Delete Course
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground text-start">
                            Once you delete a course, there is no going back.
                            This will permanently delete the course, all its
                            content, student enrollments, and submission data.
                        </p>
                        {/* Show delete error if any */}
                        {deleteError && (
                            <Alert variant="destructive" className="mt-3">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {deleteError}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <Button
                        variant="destructive"
                        onClick={() => setDeleteModalOpen(true)}
                        disabled={isDeleting}
                        className="ml-4 mt-5 bg-destructive hover:bg-destructive-dark text-destructive-foreground"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting ? 'Deleting...' : 'Delete Course'}
                    </Button>
                </div>
            </div>

            {/* Course Delete Modal */}
            <CourseDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={isDeleting}
            />
        </div>
    )
}

export default Page
