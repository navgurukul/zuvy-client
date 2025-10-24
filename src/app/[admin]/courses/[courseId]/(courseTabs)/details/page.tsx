'use client'
import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Upload, Trash2 } from 'lucide-react'
import Cropper from 'react-cropper'
// import 'cropperjs/dist/cropper.css'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import OptimizedImageWithFallback from '@/components/ImageWithFallback'
import { LANGUAGES } from '@/utils/constant'
import { useCourseDetails } from '@/hooks/useCourseDetails'
import { PageParams } from '@/app/[admin]/courses/[courseId]/(courseTabs)/details/courseDetailType'
import {GeneralDetailsSkeleton} from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'



const FormSchema = z.object({
    name: z
        .string()
        .min(3, 'Please enter a course name (minimum 3 characters).')
        .max(100, 'Course name cannot exceed 100 characters.'),
    bootcampTopic: z.string().optional(),
    description: z
        .string()
        .min(10, 'Please add a course description (minimum 10 characters).'),
    duration: z.coerce.number().min(1, 'Please enter the course duration.'),
    language: z.string().min(1, 'Please select the language.'),
    startTime: z.date({
        required_error: 'Please choose a start date for the course.',
    }),
    coverImage: z.string().optional(),
    collaborator: z.string().optional(),
})

function GeneralDetailsPage({ params }: { params: PageParams }) {
    const [image, setImage] = useState<string | null>(null)
    const [cropper, setCropper] = useState<Cropper | null>(null)
    const [isCropping, setIsCropping] = useState(false)
    const [croppedImage, setCroppedImage] = useState<string | null>(null)
    const [isCalendarOpen, setCalendarOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Collaborator image states
    const [collaboratorImage, setCollaboratorImage] = useState<string | null>(
        null
    )
    const [collaboratorCropper, setCollaboratorCropper] =
        useState<Cropper | null>(null)
    const [isCollaboratorCropping, setIsCollaboratorCropping] = useState(false)
    const [croppedCollaboratorImage, setCroppedCollaboratorImage] = useState<
        string | null
    >(null)
    const [collaboratorType, setCollaboratorType] = useState<'text' | 'image'>(
        'text'
    )
    const collaboratorFileInputRef = useRef<HTMLInputElement>(null)

    // Hook se sab kuch get kar rahe hain - API logic hook mein hai
    const {
        isLoading,
        isImageUploading,
        courseData,
        Permissions,
        updateCourseDetails,
        validateImageFile,
    } = useCourseDetails()

    console.log('Permissions in details', Permissions)

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: '',
            bootcampTopic: '',
            description: '',
            coverImage: '',
            collaborator: '',
            duration: 0,
            language: '',
            startTime: undefined,
        },
    })

    // Helper function to check if URL is image
    const isImageUrl = (url: string | undefined) => {
        if (!url) return false
        const imageExtensions = [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.webp',
            '.svg',
        ]
        return (
            imageExtensions.some((ext) => url.toLowerCase().includes(ext)) ||
            url.startsWith('data:image/')
        )
    }

    // Reset all image states function
    const resetImageStates = () => {
        setImage(null)
        setCropper(null)
        setIsCropping(false)
        setCroppedImage(null)

        // Collaborator image states
        setCollaboratorImage(null)
        setCollaboratorCropper(null)
        setIsCollaboratorCropping(false)
        setCroppedCollaboratorImage(null)
        setCollaboratorType('text')
    }

    // Reset states on component mount/unmount
    useEffect(() => {
        return () => {
            // Cleanup function to reset states when component unmounts
            resetImageStates()
        }
    }, [])

    // Reset states when navigating away from this page
    useEffect(() => {
        const handleRouteChange = () => {
            resetImageStates()
        }

        // Listen for route changes
        window.addEventListener('beforeunload', handleRouteChange)

        return () => {
            window.removeEventListener('beforeunload', handleRouteChange)
            resetImageStates()
        }
    }, [])

    // Populate form when courseData changes
    useEffect(() => {
        if (courseData) {
            // Reset image states first to ensure clean slate
            resetImageStates()

            form.reset({
                name: courseData.name || '',
                bootcampTopic: courseData.bootcampTopic || '',
                description: courseData.description || '',
                coverImage: courseData.coverImage || '',
                collaborator: courseData.collaborator || '',
                duration: Number(courseData.duration)  || 0,
                language: courseData.language || '',
                startTime: courseData.startTime
                    ? new Date(courseData.startTime)
                    : undefined,
            })

            // Set cover image if exists
            if (courseData.coverImage) {
                setCroppedImage(courseData.coverImage)
            }

            // Set collaborator type and preview image based on existing data
            if (isImageUrl(courseData.collaborator)) {
                setCollaboratorType('image')
                setCroppedCollaboratorImage(courseData.collaborator)
            } else {
                setCollaboratorType('text')
                setCroppedCollaboratorImage(null)
            }
        }
    }, [courseData, form])

    // Check if switching should be allowed
    const canSwitchToText = () => {
        return !croppedCollaboratorImage && !form.getValues('collaborator')
    }

    const canSwitchToImage = () => {
        const currentValue = form.getValues('collaborator')
        return !currentValue || currentValue.trim() === ''
    }
    // Handle collaborator type change
    const handleCollaboratorTypeChange = (type: 'text' | 'image') => {
        setCollaboratorType(type)

        // Clear collaborator field when switching types
        form.setValue('collaborator', '')

        // Reset image states when switching away from image
        if (type === 'text') {
            setCroppedCollaboratorImage(null)
            setCollaboratorImage(null)
            setIsCollaboratorCropping(false)
        }
    }

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const success = await updateCourseDetails(data, croppedImage)
        if (!success) {
            return
        }

        // Handle collaborator image upload (only if type is image and there's a cropped image)
        // Note: Ye logic aapko apne updateCourseDetails function mein add karna padega
        // ya separately handle karna padega based on your API structure
    }

    // Image upload handler - validation hook se kar rahe hain
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && validateImageFile(file)) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImage(reader.result as string)
                setIsCropping(true)
                setCroppedImage(null)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCollaboratorFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]
        if (file && validateImageFile(file)) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setCollaboratorImage(reader.result as string)
                setIsCollaboratorCropping(true)
                setCroppedCollaboratorImage(null)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCrop = () => {
        if (cropper) {
            const croppedCanvas = cropper.getCroppedCanvas({
                width: 800,
                height: 400,
            })
            const croppedImageData = croppedCanvas.toDataURL()
            setCroppedImage(croppedImageData)
            setIsCropping(false)
            setImage(null)
        }
    }

    const handleRemoveImage = () => {
        setCroppedImage(null)
        setImage(null)
        setIsCropping(false)
        form.setValue('coverImage', '')
    }

    const handleCollaboratorButtonClick = () => {
        collaboratorFileInputRef.current?.click()
    }

    const handleCollaboratorCrop = () => {
        if (collaboratorCropper) {
            const croppedCanvas = collaboratorCropper.getCroppedCanvas({
                width: 800,
                height: 400,
            })
            setCroppedCollaboratorImage(croppedCanvas.toDataURL())
            setIsCollaboratorCropping(false)
            setCollaboratorImage(null)
        }
    }

    // Duration validation function
    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '') {
            return ''
        }

        const numValue = parseInt(value, 10)
        if (isNaN(numValue)) {
        toast({
            title: 'Invalid Input',
            description: 'Please enter a valid numeric duration.',
            variant: 'destructive',
        })
        return '' // Previous value return karo
    }
    
    if (numValue <= 0) {
        toast({
            title: 'Invalid Value',
            description: 'Duration must be greater than 0',
            variant: 'destructive',
        })
        return '' // Previous value return karo
    }
    
    return numValue
    }

    return (
         <>
            {isLoading ?(
            <GeneralDetailsSkeleton/>
                      
        ) : (
        // <div className="w-full max-w-none space-y-6">
        <div className='container mx-auto px-2 pt-2 pb-2 max-w-5xl'>
            <h2 className="font-heading text-xl font-semibold text-left ml-1">
                General Details
            </h2>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Images Section - Course Image and Collaborator Image */}
                        <div className="space-y-4">
                            {/* Course Image */}
                            <div>
                                <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted relative group">
                                    {isCropping && image ? (
                                        <Cropper
                                            src={image}
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                            }}
                                            aspectRatio={16 / 9}
                                            onInitialized={(instance) =>
                                                setCropper(instance)
                                            }
                                        />
                                    ) : croppedImage ? (
                                        <img
                                            src={croppedImage}
                                            alt="Course preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary-light to-primary">
                                            <OptimizedImageWithFallback
                                                src={'/logo_white.png'}
                                                alt={'Course Image'}
                                                fallBackSrc={'/logo_white.png'}
                                            />
                                        </div>
                                    )}

                                    {!isCropping && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                type="button"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                disabled={!Permissions?.editCourse || isImageUploading}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                {isImageUploading
                                                    ? 'Uploading...'
                                                    : 'Upload New Image'}
                                            </Button>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="sr-only"
                                                ref={fileInputRef}
                                            />
                                            {croppedImage && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={handleRemoveImage}
                                                    type="button"
                                                    disabled={!Permissions.editCourse || isImageUploading}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Remove Image
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {isCropping && image && (
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            onClick={handleCrop}
                                            variant="outline"
                                            type="button"
                                        >
                                            Crop Image
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setIsCropping(false)
                                                setImage(null)
                                            }}
                                            variant="ghost"
                                            type="button"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Collaborator Section */}
                            <FormField
                                control={form.control}
                                name="collaborator"
                                render={({ field }) => (
                                    <FormItem className="text-start">
                                        <FormLabel className="font-semibold">
                                            Collaborator
                                        </FormLabel>
                                        <div className="mb-3">
                                            <RadioGroup
                                                value={collaboratorType}
                                                onValueChange={(
                                                    value: 'text' | 'image'
                                                ) =>
                                                    handleCollaboratorTypeChange(
                                                        value
                                                    )
                                                }
                                                disabled={!Permissions?.editCourse}
                                                className="flex gap-4"
                                            >
                                                <div className="flex flex-row items-center space-x-2 space-y-0">
                                                    <RadioGroupItem
                                                        value="text"
                                                        disabled={
                                                            !canSwitchToText() &&
                                                            collaboratorType !==
                                                                'text'
                                                        }
                                                    />
                                                    <Label
                                                        className={`text-sm font-medium cursor-pointer ${
                                                            !canSwitchToText() &&
                                                            collaboratorType !==
                                                                'text'
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : ''
                                                        }`}
                                                    >
                                                        Text
                                                    </Label>
                                                </div>
                                                <div className="flex flex-row items-center space-x-2 space-y-0">
                                                    <RadioGroupItem
                                                        value="image"
                                                        disabled={
                                                            !canSwitchToImage() &&
                                                            collaboratorType !==
                                                                'image'
                                                        }
                                                    />
                                                    <Label className="text-sm font-medium cursor-pointer">
                                                        Image
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {collaboratorType === 'image' ? (
                                            <>
                                                <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted relative group">
                                                    {isCollaboratorCropping &&
                                                    collaboratorImage ? (
                                                        <Cropper
                                                            src={
                                                                collaboratorImage
                                                            }
                                                            style={{
                                                                height: '100%',
                                                                width: '100%',
                                                            }}
                                                            aspectRatio={16 / 9}
                                                            onInitialized={(
                                                                instance
                                                            ) =>
                                                                setCollaboratorCropper(
                                                                    instance
                                                                )
                                                            }
                                                        />
                                                    ) : croppedCollaboratorImage ? (
                                                        <img
                                                            src={
                                                                croppedCollaboratorImage
                                                            }
                                                            alt="Collaborator Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary-light to-primary">
                                                            <OptimizedImageWithFallback
                                                                src={
                                                                    '/logo_white.png'
                                                                }
                                                                alt={
                                                                    'Collaborator Image'
                                                                }
                                                                fallBackSrc={
                                                                    '/logo_white.png'
                                                                }
                                                            />
                                                        </div>
                                                    )}

                                                    {!isCollaboratorCropping && (
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                type="button"
                                                                onClick={
                                                                    handleCollaboratorButtonClick
                                                                }
                                                                disabled={
                                                                    !Permissions?.editCourse ||
                                                                    isImageUploading
                                                                }
                                                            >
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                {croppedCollaboratorImage
                                                                    ? 'Change Image'
                                                                    : 'Upload Image'}
                                                            </Button>
                                                            {croppedCollaboratorImage && (
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setCroppedCollaboratorImage(
                                                                            null
                                                                        )
                                                                        setCollaboratorImage(
                                                                            null
                                                                        )
                                                                        setIsCollaboratorCropping(
                                                                            false
                                                                        )
                                                                        form.setValue(
                                                                            'collaborator',
                                                                            ''
                                                                        )
                                                                    }}
                                                                    type="button"
                                                                    disabled={
                                                                        isImageUploading
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Remove Image
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <Input
                                                    id="collaborator-picture"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={
                                                        handleCollaboratorFileChange
                                                    }
                                                    disabled={!Permissions?.editCourse}
                                                    className="hidden"
                                                    ref={
                                                        collaboratorFileInputRef
                                                    }
                                                />

                                                {isCollaboratorCropping &&
                                                    collaboratorImage && (
                                                        <div className="flex gap-2 mt-2">
                                                            <Button
                                                                onClick={
                                                                    handleCollaboratorCrop
                                                                }
                                                                variant="outline"
                                                                type="button"
                                                            >
                                                                Crop Image
                                                            </Button>
                                                            <Button
                                                                onClick={() => {
                                                                    setIsCollaboratorCropping(
                                                                        false
                                                                    )
                                                                    setCollaboratorImage(
                                                                        null
                                                                    )
                                                                }}
                                                                variant="ghost"
                                                                type="button"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    )}
                                            </>
                                        ) : (
                                            <div className="space-y-2">
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter collaborator text"
                                                        maxLength={80}
                                                        {...field}
                                                        disabled={!Permissions?.editCourse}
                                                        value={
                                                            field.value || ''
                                                        }
                                                    />
                                                </FormControl>
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Form Fields Section */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Course Title */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="text-start">
                                        <Label
                                            htmlFor="name"
                                            className="font-semibold"
                                        >
                                            Course Title
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="name"
                                                placeholder="Enter course title"
                                                {...field}
                                                disabled={!Permissions?.editCourse}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="text-start">
                                        <Label
                                            htmlFor="description"
                                            className="font-semibold"
                                        >
                                            Description
                                        </Label>
                                        <FormControl>
                                            <Textarea
                                                id="description"
                                                placeholder="Enter course description"
                                                className="min-h-[120px]"
                                                {...field}
                                                disabled={!Permissions?.editCourse}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Duration and Start Date Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Duration */}
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem className="text-start">
                                            <Label
                                                htmlFor="duration"
                                                className="font-semibold"
                                            >
                                                Duration (weeks)
                                            </Label>
                                            <FormControl>
                                                <Input
                                                    id="duration"
                                                    type="text"
                                                    min="1"
                                                    placeholder="Duration in weeks"
                                                    value={field.value}
                                                    disabled={!Permissions?.editCourse}
                                                    onChange={(e) => {
                                                        const validatedValue =
                                                            handleDurationChange(
                                                                e
                                                            )
                                                        if (
                                                            validatedValue !==
                                                            undefined
                                                        ) {
                                                            field.onChange(
                                                                validatedValue
                                                            )
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Start Date */}
                                <FormField
                                    control={form.control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <FormItem className="text-start">
                                            <Label
                                                htmlFor="startTime"
                                                className="font-semibold"
                                            >
                                                Course Start Date
                                            </Label>
                                            <Popover
                                                open={isCalendarOpen}
                                                onOpenChange={setCalendarOpen}
                                            >
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                id="startTime"
                                                                value={
                                                                    field.value
                                                                        ? format(
                                                                              field.value,
                                                                              'dd-MM-yyyy'
                                                                          )
                                                                        : ''
                                                                }
                                                                disabled={!Permissions?.editCourse}
                                                                placeholder="Select start date"
                                                                className="cursor-pointer"
                                                                readOnly
                                                            />
                                                            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                        </div>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                field.onChange(
                                                                    date
                                                                )
                                                                setCalendarOpen(
                                                                    false
                                                                )
                                                            }
                                                        }}
                                                        disabled={(date) => {
                                                            const today =
                                                                new Date()
                                                            today.setHours(
                                                                0,
                                                                0,
                                                                0,
                                                                0
                                                            )
                                                            return date < today
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Language Selection */}
                            <FormField
                                control={form.control}
                                name="language"
                                render={({ field }) => (
                                    <FormItem className="text-start">
                                        <Label className="text-sm font-semibold">
                                            Course Language
                                        </Label>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                                className="flex gap-6"
                                            >
                                                {LANGUAGES.map(
                                                    (language, index) => (
                                                        <FormItem
                                                            key={index}
                                                            className="flex flex-row items-center space-x-2 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <RadioGroupItem
                                                                    value={
                                                                        language
                                                                    }
                                                                    id={language.toLowerCase()}
                                                                    disabled={!Permissions?.editCourse}
                                                                />
                                                            </FormControl>
                                                            <Label
                                                                htmlFor={language.toLowerCase()}
                                                                className="font-normal cursor-pointer"
                                                            >
                                                                {language}
                                                            </Label>
                                                        </FormItem>
                                                    )
                                                )}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t">
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary-dark mb-5"
                            disabled={!Permissions?.editCourse || isLoading || isImageUploading}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )}
    </>
    )
}

export default GeneralDetailsPage
