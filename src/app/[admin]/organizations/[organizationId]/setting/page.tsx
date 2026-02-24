'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Cloud } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { getUser } from '@/store/store'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import useOrgSettings, {
    OrgResponse,
    OrgUpdatePayload,
} from '@/hooks/useOrgSettings'


export default function AdminSettingPage() {
    const router = useRouter()
    const { user } = getUser()
    const { fetchOrgById, uploadOrgLogo, completeOrgSetup, updateOrgById } =
        useOrgSettings()
    const [orgName, setOrgName] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('Org Admin')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [orgData, setOrgData] = useState<OrgResponse | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const orgId = useMemo(
        () =>
            user?.orgId ??
            user?.organizationId ??
            user?.org?.id ??
            user?.organization?.id,
        [user]
    )
    const isOrgVerified = orgData?.isVerified ?? false

    useEffect(() => {
        const fetchOrg = async () => {
            setRole((user?.rolesList?.[0] || 'Org Admin').toUpperCase())
            setEmail(user?.email || '')
            setDisplayName(user?.name || '')

            if (!orgId) {
                toast({
                    title: 'Error',
                    description: 'Organization id not found in user data.',
                    variant: 'destructive',
                })
                setIsLoading(false)
                return
            }

            try {
                const data: OrgResponse = await fetchOrgById(orgId)
                setOrgData(data)
                setOrgName(data.title || '')
                setDisplayName(data.pocName || user?.name || '')
                setEmail(data.pocEmail || user?.email || '')
                setLogoPreview(data.logoUrl || null)
            } catch (error: any) {
                console.error('Failed to fetch org details:', error)
                toast({
                    title: 'Error',
                    description:
                        error?.response?.data?.message ||
                        'Failed to fetch organization details.',
                    variant: 'destructive',
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrg()
    }, [fetchOrgById, orgId, user?.email, user?.name, user?.rolesList])

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Error',
                    description: 'Please select an image file',
                    variant: 'destructive',
                })
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'Error',
                    description: 'File size must be less than 5MB',
                    variant: 'destructive',
                })
                return
            }
            setLogoFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveLogo = () => {
        setLogoFile(null)
        setLogoPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const file = e.dataTransfer.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Error',
                    description: 'Please select an image file',
                    variant: 'destructive',
                })
                return
            }
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'Error',
                    description: 'File size must be less than 5MB',
                    variant: 'destructive',
                })
                return
            }
            setLogoFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCompleteSetup = async () => {
        if (!orgName.trim()) {
            toast({
                title: 'Error',
                description: 'Organization name is required',
                variant: 'destructive',
            })
            return
        }
        if (!displayName.trim()) {
            toast({
                title: 'Error',
                description: 'Name is required',
                variant: 'destructive',
            })
            return
        }
        if (!orgId) {
            toast({
                title: 'Error',
                description: 'Organization id not found. Please re-login.',
                variant: 'destructive',
            })
            return
        }
        setIsSubmitting(true)

        try {
            let nextLogoUrl: string | null = orgData?.logoUrl || null

            if (logoFile) {
                const uploadedLogoUrl = await uploadOrgLogo(logoFile)
                if (!uploadedLogoUrl) {
                    toast({
                        title: 'Error',
                        description: 'Logo uploaded but no URL returned.',
                        variant: 'destructive',
                    })
                    setIsSubmitting(false)
                    return
                }

                nextLogoUrl = uploadedLogoUrl
            } else if (!logoPreview) {
                nextLogoUrl = null
            }

            const payload: OrgUpdatePayload = {}

            if (orgName.trim() !== (orgData?.title || '').trim()) {
                payload.title = orgName.trim()
            }
            if (displayName.trim() !== (orgData?.pocName || '').trim()) {
                payload.pocName = displayName.trim()
            }
            if (email.trim() !== (orgData?.pocEmail || '').trim()) {
                payload.pocEmail = email.trim()
            }
            if (nextLogoUrl !== (orgData?.logoUrl || null)) {
                payload.logoUrl = nextLogoUrl
            }

            if (Object.keys(payload).length === 0) {
                toast({
                    title: 'No changes',
                    description: 'Nothing to update.',
                })
                setIsSubmitting(false)
                return
            }

            if (isOrgVerified) {
                await updateOrgById(orgId, payload)
            } else {
                await completeOrgSetup(orgId, payload)
            }

            toast({
                title: 'Success',
                description: 'Workspace setup completed successfully!',
            })
            setLogoFile(null)
            setOrgData((prev) =>
                prev
                    ? {
                        ...prev,
                        title: (payload.title as string) ?? prev.title,
                        pocName: (payload.pocName as string) ?? prev.pocName,
                        pocEmail:
                            (payload.pocEmail as string) ?? prev.pocEmail,
                        logoUrl:
                            payload.logoUrl !== undefined
                                ? payload.logoUrl
                                : prev.logoUrl,
                    }
                    : prev
            )

            if (!isOrgVerified) {
                const userRole = (user?.rolesList?.[0] || 'admin').toLowerCase()
                const targetOrg = (user?.orgName || orgName || '').trim()
                if (targetOrg) {
                    router.push(`/${userRole}/${targetOrg}/courses`)
                } else {
                    router.push(`/${userRole}/courses`)
                }
            }
        } catch (error) {
            console.error('Setup error:', error)
            toast({
                title: 'Error',
                description: 'Failed to complete setup. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading organization details...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 flex">
                <div
                    className={`grid w-full flex-1 ${isOrgVerified ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'
                        }`}
                >
                    {!isOrgVerified && (
                        <>
                            <div className="hidden lg:flex bg-[#1A1A1A] text-white flex-col justify-start p-12 pt-20">
                                <div className="space-y-8">
                                    <div className="space-y-3 text-left">
                                        <h1 className="text-5xl font-semibold leading-tight">
                                            You&apos;ve been invited to set up
                                            the workspace for
                                        </h1>
                                        <h2 className="text-5xl font-bold leading-tight">
                                            <span className="text-5xl font-bold text-emerald-500">
                                                {orgName || 'your organization'}{' '}
                                            </span>
                                            on{' '}
                                            <span className="text-5xl font-bold text-emerald-500">
                                                Zuvy
                                            </span>
                                        </h2>

                                        <p className="text-lg text-slate-300">
                                            Manage your student&apos;s learning
                                            journey.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:hidden bg-[#1A1A1A] text-white p-8 order-first space-y-8">
                                <div className="space-y-3">
                                    <h1 className="text-3xl font-bold leading-tight">
                                        You&apos;ve been invited to set up the
                                        workspace
                                    </h1>
                                    <p className="text-base text-slate-300">
                                        For{' '}
                                        <span className="font-semibold text-emerald-400">
                                            {orgName || 'your organization'}
                                        </span>{' '}
                                        on{' '}
                                        <span className="font-semibold text-emerald-400">
                                            Zuvy
                                        </span>
                                    </p>
                                    <p className="text-base text-slate-300">
                                        Manage your student&apos;s learning
                                        journey.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    <div
                        className={`w-full mx-auto py-8 px-6 lg:px-12 xl:px-16 ${isOrgVerified ? 'max-w-4xl' : 'lg:col-span-2'
                            }`}
                    >
                        <div className="space-y-6 flex flex-col w-full">
                            {/* Organization Section */}
                            <div className="space-y-4">
                                {/* Organization Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="orgName" className="text-sm font-semibold text-foreground text-left block">
                                        Organization Name
                                    </Label>
                                    <Input
                                        id="orgName"
                                        type="text"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        placeholder="Enter your organization name"
                                        className="h-11 text-base"
                                        disabled={!isOrgVerified}
                                    />
                                    <p className="text-sm text-muted-foreground text-left">
                                        This is how your organization will appear in the platform
                                    </p>
                                </div>

                                {/* Logo Upload */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-foreground text-left block">
                                        Organization Logo
                                    </Label>
                                    <div
                                        onClick={() => !logoPreview && fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer gap-4 ${logoPreview
                                            ? 'border-border bg-background'
                                            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                                            }`}
                                    >
                                        {logoPreview ? (
                                            <div className="w-full h-full relative p-6">
                                                <Image
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    fill
                                                    className="object-contain rounded-lg"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <Cloud className="h-12 w-12 text-slate-400" />
                                                <div className="text-center px-4">
                                                    <p className="text-base font-semibold text-slate-700">
                                                        Upload your organization logo
                                                    </p>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        or drag and drop (SVG, PNG, JPG up to 5MB)
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {logoPreview && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    fileInputRef.current?.click()
                                                }}
                                                className="flex-1"
                                            >
                                                Change Logo
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemoveLogo}
                                                className="text-destructive flex-1 hover:bg-destructive/100 hover:text-destructive-foreground"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Profile Section */}
                            <div className="space-y-4 border-t border-border pt-6">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold text-foreground text-left">Your profile</h2>
                                </div>
                                {!isOrgVerified && (
                                    <p className="text-sm text-muted-foreground text-left">
                                        Setup pending verification. Only logo and POC name can be updated.
                                    </p>
                                )}

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    {/* Display Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="displayName" className="text-sm font-semibold text-foreground text-left block">
                                            Name
                                        </Label>
                                        <Input
                                            id="displayName"
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="h-11 text-base"
                                        />
                                    </div>

                                    {/* Two Column Layout for Email and Role */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Email (Non-editable) */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-foreground text-left block">Email</Label>
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter email"
                                                className="h-11 text-base"
                                                disabled={!isOrgVerified}
                                            />
                                        </div>

                                        {/* Role (Non-editable) */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-foreground text-left block">Role</Label>
                                            <div className="px-3 py-3 bg-[#E8E7DC] text-base text-slate-600 rounded-lg border border-[#E8E7DC] h-11 flex items-center">
                                                {role}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="pt-4 flex-shrink-0 flex flex-col items-start gap-4">
                                <Button
                                    onClick={handleCompleteSetup}
                                    disabled={isSubmitting}
                                    className="h-11 px-8 text-base font-semibold"
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : isOrgVerified
                                            ? 'Save Changes'
                                            : 'Complete Profile and Proceed'}
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Need help?{' '}
                                    <a href="#" className="text-foreground hover:underline font-semibold">
                                        Contact Support
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
