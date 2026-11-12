'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, Upload, Award } from 'lucide-react'
import { AlertCircle, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react'
import { getUser } from '@/store/store'
import { api } from '@/utils/axios.config'
import CourseDeleteModal from '../../_components/CourseDeleteModal'
import { getCourseData } from '@/store/store'
// import { Spinner } from '@/components/ui/spinner'
import useBootcampSettings from '@/app/[admin]/hooks/useBootcampSettings'
import useBootcampDelete from '@/app/[admin]/hooks/useBootcampDelete'
import { PageProps } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/(courseTabs)/settings/courseSettingType'
import {SettingsSkeleton} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton'
import { useParams } from 'next/navigation'

const Page = ({ params }: { params: PageProps }) => {
    const router = useRouter()
    const { organizationId } = useParams()
    const { courseData } = getCourseData()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin'
    const isAdmin = userRole === 'admin'
    const orgId = Number(organizationId) || user?.orgId; 

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
        isChapterLocked: false,
        mentorshipEnabled: false,
        leaderboardEnabled: false,
        certificateEnabled: false,
        certificateTitle: 'Certificate of Completion',
        partnerName: '',
        signatoryName: '',
        signatoryTitle: '',
        partnerLogoUrl: '',
        signatureUrl: '',
    })
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    // Refs for file inputs
    const partnerLogoRef = useRef<HTMLInputElement>(null)
    const signatureRef = useRef<HTMLInputElement>(null)

    // Local preview states for uploaded images (before persisting)
    const [partnerLogoPreview, setPartnerLogoPreview] = useState<string>('')
    const [signaturePreview, setSignaturePreview] = useState<string>('')
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [isUploadingSignature, setIsUploadingSignature] = useState(false)

    // Update local state when bootcamp settings load
    React.useEffect(() => {
        if (bootcampSettings) {
            setLocalSettings({
                type: bootcampSettings.type,
                isModuleLocked: bootcampSettings.isModuleLocked,
                isChapterLocked: bootcampSettings.isChapterLocked,
                mentorshipEnabled: bootcampSettings.mentorshipEnabled,
                leaderboardEnabled: bootcampSettings.leaderboardEnabled,
                certificateEnabled: bootcampSettings.certificateEnabled ?? false,
                certificateTitle: bootcampSettings.certificateTitle ?? 'Certificate of Completion',
                partnerName: bootcampSettings.partnerName ?? '',
                signatoryName: bootcampSettings.signatoryName ?? '',
                signatoryTitle: bootcampSettings.signatoryTitle ?? '',
                partnerLogoUrl: bootcampSettings.partnerLogoUrl ?? '',
                signatureUrl: bootcampSettings.signatureUrl ?? '',
            })
            if (bootcampSettings.partnerLogoUrl) setPartnerLogoPreview(bootcampSettings.partnerLogoUrl)
            if (bootcampSettings.signatureUrl) setSignaturePreview(bootcampSettings.signatureUrl)
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

    const handleChapterLockToggle = () => {
        setLocalSettings((prev) => ({
            ...prev,
            isChapterLocked: !prev.isChapterLocked,
        }))
    }

    const handleMentorshipToggle = () => {
        setLocalSettings((prev) => ({
            ...prev,
            mentorshipEnabled: !prev.mentorshipEnabled,
        }))
    }

    const handleLeaderboardToggle = () => {
        setLocalSettings((prev) => ({
            ...prev,
            leaderboardEnabled: !prev.leaderboardEnabled,
        }))
    }

    const handleCertificateToggle = () => {
        setLocalSettings((prev) => ({
            ...prev,
            certificateEnabled: !prev.certificateEnabled,
        }))
    }

    const handleCertificateFieldChange = (field: string, value: string) => {
        setLocalSettings((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleImageUpload = async (
        file: File,
        type: 'partnerLogo' | 'signature'
    ) => {
        const isLogo = type === 'partnerLogo'
        if (isLogo) setIsUploadingLogo(true)
        else setIsUploadingSignature(true)

        try {
            // Create local preview immediately
            const objectUrl = URL.createObjectURL(file)
            if (isLogo) {
                setPartnerLogoPreview(objectUrl)
            } else {
                setSignaturePreview(objectUrl)
            }

            // Upload to server
            const formData = new FormData()
            formData.append('file', file)
            const response = await api.post('/bootcamp/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            const uploadedUrl = response.data?.url || response.data?.fileUrl || objectUrl

            setLocalSettings((prev) => ({
                ...prev,
                [isLogo ? 'partnerLogoUrl' : 'signatureUrl']: uploadedUrl,
            }))
            if (isLogo) setPartnerLogoPreview(uploadedUrl)
            else setSignaturePreview(uploadedUrl)

            toast.success({ title: 'Uploaded', description: `${isLogo ? 'Partner logo' : 'Signature'} uploaded successfully.` })
        } catch (err: any) {
            // Keep the local preview even if upload failed — will retry on save
            toast.error({ title: 'Upload failed', description: `Could not upload the image. Please try again.` })
        } finally {
            if (isLogo) setIsUploadingLogo(false)
            else setIsUploadingSignature(false)
        }
    }

    const handleFileInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'partnerLogo' | 'signature'
    ) => {
        const file = e.target.files?.[0]
        if (!file) return
        handleImageUpload(file, type)
        // Reset input so same file can be re-selected
        e.target.value = ''
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

    if (loading) {
       return<SettingsSkeleton/>
    }

    // Error state
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={() => router.push(`/${userRole}/organizations/${orgId}/courses`)}>
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
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Course Type Section */}
            <div className="rounded-lg p-2 text-start">
                <h1 className="font-heading text-xl font-semibold mb-6">
                    Course Settings
                </h1>

                <div className="space-y-3">
                    <h2 className="text-base font-medium text-foreground">
                        Course Type - <span className='font-light'>{localSettings.type}</span>
                    </h2>
                    {!isSuperAdmin && (
                        <h2 className="text-base font-medium text-foreground">
                            One-on-One Sessions -{' '}
                            <span className="font-light">
                                {localSettings.mentorshipEnabled
                                    ? 'Enabled'
                                    : 'Disabled'}
                            </span>
                        </h2>
                    )}
                    {!isSuperAdmin && !isAdmin && (
                        <h2 className="text-base font-medium text-foreground">
                            Leaderboard -{' '}
                            <span className="font-light">
                                {localSettings.leaderboardEnabled
                                    ? 'Enabled'
                                    : 'Disabled'}
                            </span>
                        </h2>
                    )}
                    <RadioGroup
                        value={localSettings.type.toLowerCase()}
                        onValueChange={(value) =>
                            handleRadioChange(
                                value === 'public' ? 'Public' : 'Private'
                            )
                        }
                        className="flex flex-col gap-0 hidden"
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
                
                {/* Chapter Lock Toggle Switch */}
                <div className="mt-4 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-medium text-foreground mb-1">
                                Chapter Lock
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                If enabled, students must complete chapters
                                within a module in sequential order
                            </p>
                        </div>
                        <div className="flex flex-col justify-left items-start">
                            <div
                                className={`relative w-11 h-6 rounded-full bg-gray-300 p-0.5 cursor-pointer ${
                                    localSettings.isChapterLocked
                                        ? 'bg-primary'
                                        : ''
                                }`}
                                onClick={handleChapterLockToggle}
                            >
                                <div
                                    className={`absolute ml-0.5 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                        localSettings.isChapterLocked
                                            ? 'translate-x-full'
                                            : ''
                                    }`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Leaderboard Toggle Switch */}
                {(isSuperAdmin || isAdmin) && (
                    <div className="mt-4 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-medium text-foreground mb-1">
                                    Leaderboard
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    If enabled, leaderboard data will be visible in learner, leader views.
                                </p>
                            </div>
                            <div className="flex flex-col justify-left items-start">
                                <div
                                    className={`relative w-11 h-6 rounded-full bg-gray-300 p-0.5 cursor-pointer ${
                                        localSettings.leaderboardEnabled
                                            ? 'bg-primary'
                                            : ''
                                    }`}
                                    onClick={handleLeaderboardToggle}
                                >
                                    <div
                                        className={`absolute ml-0.5 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                            localSettings.leaderboardEnabled
                                                ? 'translate-x-full'
                                                : ''
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* One-on-One Sessions Toggle Switch */}
                {isSuperAdmin && (
                    <div className="mt-4 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-medium text-foreground mb-1">
                                    One-on-One Sessions
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Enable this to allow students to book individual sessions with mentors for personalized guidance
                                </p>
                            </div>
                            <div className="flex flex-col justify-left items-start">
                                <div
                                    className={`relative w-11 h-6 rounded-full bg-gray-300 p-0.5 cursor-pointer ${
                                        localSettings.mentorshipEnabled
                                            ? 'bg-primary'
                                            : ''
                                    }`}
                                    onClick={handleMentorshipToggle}
                                >
                                    <div
                                        className={`absolute ml-0.5 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                            localSettings.mentorshipEnabled
                                                ? 'translate-x-full'
                                                : ''
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Certificate Toggle Switch */}
                <div className="mt-4 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-base font-medium text-foreground">
                                    Certificate
                                </h2>
                                <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                                    New
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                If enabled, students automatically receive a shareable certificate when they complete the course
                            </p>
                        </div>
                        <div
                            className={`relative w-11 h-6 rounded-full bg-gray-300 p-0.5 cursor-pointer flex-shrink-0 ${
                                localSettings.certificateEnabled ? 'bg-primary' : ''
                            }`}
                            onClick={handleCertificateToggle}
                        >
                            <div
                                className={`absolute ml-0.5 left-0 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                    localSettings.certificateEnabled ? 'translate-x-full' : ''
                                }`}
                            />
                        </div>
                    </div>

                    {/* Certificate configuration form — shown only when enabled */}
                    {localSettings.certificateEnabled && (
                        <div className="mt-5 space-y-5">
                            {/* Row 1: Certificate title | Partner name | Signatory name */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="cert-title"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Certificate title
                                    </Label>
                                    <Input
                                        id="cert-title"
                                        placeholder="Certificate of Completion"
                                        value={localSettings.certificateTitle}
                                        onChange={(e) =>
                                            handleCertificateFieldChange(
                                                'certificateTitle',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="partner-name"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Partner name{' '}
                                        <span className="text-muted-foreground font-normal">
                                            (optional)
                                        </span>
                                    </Label>
                                    <Input
                                        id="partner-name"
                                        placeholder="e.g. Amazon Future Engineer"
                                        value={localSettings.partnerName}
                                        onChange={(e) =>
                                            handleCertificateFieldChange(
                                                'partnerName',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="signatory-name"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Signatory name{' '}
                                        <span className="text-muted-foreground font-normal">
                                            (optional)
                                        </span>
                                    </Label>
                                    <Input
                                        id="signatory-name"
                                        placeholder="Defaults to Zuvy Team"
                                        value={localSettings.signatoryName}
                                        onChange={(e) =>
                                            handleCertificateFieldChange(
                                                'signatoryName',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Row 2: Signatory title | Partner logo | Signature */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="signatory-title"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Signatory title{' '}
                                        <span className="text-muted-foreground font-normal">
                                            (optional)
                                        </span>
                                    </Label>
                                    <Input
                                        id="signatory-title"
                                        placeholder="e.g. Programme Director"
                                        value={localSettings.signatoryTitle}
                                        onChange={(e) =>
                                            handleCertificateFieldChange(
                                                'signatoryTitle',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                {/* Partner logo upload */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-foreground">
                                        Partner logo
                                    </Label>
                                    <div className="flex items-center gap-3 border border-border rounded-md px-3 py-2 bg-background">
                                        {partnerLogoPreview ? (
                                            <img
                                                src={partnerLogoPreview}
                                                alt="Partner logo"
                                                className="h-8 w-auto max-w-[80px] object-contain rounded"
                                            />
                                        ) : (
                                            <div className="h-8 w-16 bg-muted rounded flex items-center justify-center">
                                                <span className="text-xs text-muted-foreground">No logo</span>
                                            </div>
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isUploadingLogo}
                                            onClick={() => partnerLogoRef.current?.click()}
                                            className="ml-auto flex items-center gap-1.5"
                                        >
                                            <Upload className="h-3.5 w-3.5" />
                                            {isUploadingLogo ? 'Uploading...' : 'Upload'}
                                        </Button>
                                        <input
                                            ref={partnerLogoRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            className="hidden"
                                            onChange={(e) => handleFileInputChange(e, 'partnerLogo')}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        PNG or JPG under 2 MB. Transparent PNG works best.
                                    </p>
                                </div>

                                {/* Signature upload */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium text-foreground">
                                        Signature
                                    </Label>
                                    <div className="flex items-center gap-3 border border-border rounded-md px-3 py-2 bg-background">
                                        {signaturePreview ? (
                                            <img
                                                src={signaturePreview}
                                                alt="Signature"
                                                className="h-8 w-auto max-w-[80px] object-contain rounded"
                                            />
                                        ) : (
                                            <div className="h-8 w-16 bg-muted rounded flex items-center justify-center">
                                                <span className="text-xs text-muted-foreground">No signature</span>
                                            </div>
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isUploadingSignature}
                                            onClick={() => signatureRef.current?.click()}
                                            className="ml-auto flex items-center gap-1.5"
                                        >
                                            <Upload className="h-3.5 w-3.5" />
                                            {isUploadingSignature ? 'Uploading...' : 'Upload'}
                                        </Button>
                                        <input
                                            ref={signatureRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            className="hidden"
                                            onChange={(e) => handleFileInputChange(e, 'signature')}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Shown above the signatory name.
                                    </p>
                                </div>
                            </div>

                            {/* Certificate Preview */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-foreground">Preview</Label>
                                <div className="border-2 border-primary/60 rounded-lg p-6 bg-gradient-to-br from-white to-green-50 dark:from-background dark:to-green-950/20 relative overflow-hidden min-h-[180px]">
                                    {/* Decorative border lines */}
                                    <div className="absolute inset-2 border border-primary/20 rounded pointer-events-none" />

                                    <div className="relative flex flex-col items-center text-center gap-2">
                                        {/* Zuvy / partner logo row */}
                                        <div className="flex items-center justify-center gap-4 mb-1">
                                            <Award className="h-7 w-7 text-primary" aria-hidden />
                                            {partnerLogoPreview && (
                                                <>
                                                    <span className="text-muted-foreground text-xs">×</span>
                                                    <img
                                                        src={partnerLogoPreview}
                                                        alt="Partner"
                                                        className="h-7 w-auto max-w-[80px] object-contain"
                                                    />
                                                </>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground uppercase tracking-widest">
                                            This is to certify that
                                        </p>
                                        <p className="text-lg font-semibold text-foreground italic">
                                            Student Name
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            has successfully completed
                                        </p>
                                        <p className="text-base font-bold text-foreground">
                                            {localSettings.certificateTitle || 'Certificate of Completion'}
                                        </p>
                                        {localSettings.partnerName && (
                                            <p className="text-xs text-muted-foreground">
                                                in partnership with{' '}
                                                <span className="font-medium">{localSettings.partnerName}</span>
                                            </p>
                                        )}

                                        {/* Signatory row */}
                                        <div className="mt-3 flex flex-col items-center">
                                            {signaturePreview ? (
                                                <img
                                                    src={signaturePreview}
                                                    alt="Signature"
                                                    className="h-10 w-auto max-w-[100px] object-contain mb-1"
                                                />
                                            ) : (
                                                <div className="h-8 w-24 border-b border-foreground/40 mb-1" />
                                            )}
                                            <p className="text-xs font-medium text-foreground">
                                                {localSettings.signatoryName || 'Zuvy Team'}
                                            </p>
                                            {localSettings.signatoryTitle && (
                                                <p className="text-xs text-muted-foreground">
                                                    {localSettings.signatoryTitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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

                    <div className="flex items-center justify-end  border-b border-border pb-8">
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
                            className="bg-primary hover:bg-primary-dark text-primary-foreground px-6  rounded-md font-medium"
                        >
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </div>
            <div className=" rounded-lg py-6  ">
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
            </div>

            {/* Delete Course Section */}

            {/* Course Delete Modal */}
            <CourseDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={isDeleting}
                courseName={courseData?.name || ''}
            />
        </div>
    )
}

export default Page
