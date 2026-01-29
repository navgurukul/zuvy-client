'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Cloud } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

export default function AdminSettingPage() {
    const router = useRouter()
    const [orgName, setOrgName] = useState('Amazon Future Engineer')
    const [displayName, setDisplayName] = useState('Jane Doe')
    const [email] = useState('jane.doe@amazon.com')
    const [role] = useState('Org Admin')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

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
                description: 'Display name is required',
                variant: 'destructive',
            })
            return
        }

        setIsSubmitting(true)

        try {
            toast({
                title: 'Success',
                description: 'Workspace setup completed successfully!',
            })
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

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 flex">
                <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 w-full">
                    {/* Left Side - Dark Branding Section (33%) */}
                    <div className="hidden lg:flex bg-[#1A1A1A] text-white flex-col justify-start p-12 pt-20">
                        <div className="space-y-8">
                            <div className="space-y-3 text-left">
                                <h1 className="text-5xl font-semibold leading-tight">
                                  You&apos;ve been invited to set up the workspace for
                                </h1>
                                <h2 className="text-5xl font-bold leading-tight">
                                    <span className='text-5xl font-bold text-emerald-500'>Amazon Future Engineer </span>
                                    on <span className='text-5xl font-bold text-emerald-500'>Zuvy</span>
                                </h2>
                                 
                                <p className="text-lg text-slate-300">
                                    Manage your student&apos;s  learning journey.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form Section (67%) */}
                    <div className="flex flex-col bg-background lg:col-span-2">
                        <div className="flex-1 flex flex-col py-8 px-6 lg:px-12 xl:px-16">
                            <div className="flex flex-col items-start w-full max-w-4xl mx-auto">
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
                                                className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer gap-4 ${
                                                    logoPreview
                                                        ? 'border-border bg-background'
                                                        : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                                                }`}
                                            >
                                                {logoPreview ? (
                                                    <img
                                                        src={logoPreview}
                                                        alt="Logo preview"
                                                        className="w-full h-full object-contain rounded-lg p-6"
                                                    />
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
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleRemoveLogo}
                                                        className="text-destructive flex-1"
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
                                                    <div className="px-3 py-3 bg-[#E8E7DC] text-base text-slate-600 rounded-lg border border-[#E8E7DC] h-11 flex items-center">
                                                        {email}
                                                    </div>
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
                                            {isSubmitting ? 'Saving...' : 'Complete Profile and Proceed'}
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

                    {/* Mobile - Left Side Content */}
                    <div className="lg:hidden bg-[#1A1A1A] text-white p-8 order-first space-y-8">
                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold leading-tight">
                                You&apos;ve been invited to set up the workspace
                            </h1>
                            <p className="text-base text-slate-300">
                                For <span className="font-semibold text-emerald-400">Amazon Future Engineer</span> on{' '}
                                <span className="font-semibold text-emerald-400">Zuvy</span>
                            </p>
                            <p className="text-base text-slate-300">
                                Manage your student&apos;s  learning journey.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}