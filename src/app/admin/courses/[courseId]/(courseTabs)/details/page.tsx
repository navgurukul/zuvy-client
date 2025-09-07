'use client'
import { useCourseExistenceCheck } from '@/hooks/useCourseExistenceCheck'
import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Upload, Trash2 } from 'lucide-react'
import axios from 'axios'
import { Spinner } from '@/components/ui/spinner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

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
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import OptimizedImageWithFallback from '@/components/ImageWithFallback'
import { cn } from '@/lib/utils'
import { LANGUAGES } from '@/utils/constant'
import { getCourseData, getStoreStudentData } from '@/store/store'
import { api} from '@/utils/axios.config'
import {CourseData,PageParams } from "@/app/admin/courses/[courseId]/(courseTabs)/details/courseDetailType"

const FormSchema = z.object({
    name: z.string().min(3, 'Please enter a course name (minimum 3 characters).').max(100, 'Course name cannot exceed 100 characters.'),
    // bootcampTopic: z.string().min(1, 'Please specify the course topic.'),
    bootcampTopic: z.string().optional(),
    description: z.string().min(10, 'Please add a course description (minimum 10 characters).'),
    duration: z.string().min(1, 'Please enter the course duration.'),
    language: z.string().min(1, 'Please select the language.'),
    startTime: z.date({
        required_error: 'Please choose a start date for the course.',
    }),
    coverImage: z.string().optional(),
    collaborator: z.string().optional(),
})

function GeneralDetailsPage({ params }: { params: PageParams }) {
    const router = useRouter()
    const [image, setImage] = useState<string | null>(null)
    const [cropper, setCropper] = useState<Cropper | null>(null)
    const [isCropping, setIsCropping] = useState(false)
    const [croppedImage, setCroppedImage] = useState<string | null>(null)
    const [isCalendarOpen, setCalendarOpen] = useState(false)

    // COMMENTED OUT: Collaborator functionality for future use
    /*
    // Collaborator image states
    const [collaboratorImage, setCollaboratorImage] = useState<string | null>(null)
    const [collaboratorCropper, setCollaboratorCropper] = useState<Cropper | null>(null)
    const [isCollaboratorCropping, setIsCollaboratorCropping] = useState(false)
    const [croppedCollaboratorImage, setCroppedCollaboratorImage] = useState<string | null>(null)
    const [collaboratorType, setCollaboratorType] = useState<'text' | 'image'>('text')
    */

    const { courseData, setCourseData } = getCourseData()
    const { setStoreStudentData } = getStoreStudentData()
    // const { isCourseDeleted, loadingCourseCheck } = useCourseExistenceCheck(
    //     params.courseId
    // )
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: '',
            bootcampTopic: '',
            description: '',
            coverImage: '',
            collaborator: '',
            duration: '',
            language: '',
            startTime: undefined,
        },
    })

    // Helper function to check if string is an image URL
    const isImageUrl = (str: string) => {
        if (!str) return false
        // Check if string contains image file extensions or is a URL
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i
        const isUrl = str.startsWith('http') || str.startsWith('https') || str.startsWith('data:image')
        return imageExtensions.test(str) || isUrl
    }

    // Reset all image states function
    const resetImageStates = () => {
        // Cover image states
        setImage(null)
        setCropper(null)
        setIsCropping(false)
        setCroppedImage(null)
        
        // Collaborator image states
        // setCollaboratorImage(null)
        // setCollaboratorCropper(null)
        // setIsCollaboratorCropping(false)
        // setCroppedCollaboratorImage(null)
        // setCollaboratorType('text')
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
                duration: courseData.duration || '',
                language: courseData.language || '',
                startTime: courseData.startTime ? new Date(courseData.startTime) : undefined,
            })

            // Set cover image if exists
            if (courseData.coverImage) {
                setCroppedImage(courseData.coverImage)
            }

            // Set collaborator type and preview image based on existing data
            // if (isImageUrl(courseData.collaborator)) {
            //     setCollaboratorType('image')
            //     setCroppedCollaboratorImage(courseData.collaborator)
            // } else {
            //     setCollaboratorType('text')
            //     setCroppedCollaboratorImage(null)
            // }
        }
    }, [courseData, form])

    // Handle collaborator type change
    /*const handleCollaboratorTypeChange = (type: 'text' | 'image') => {
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

    // Check if switching should be allowed
    const canSwitchToText = () => {
        return !croppedCollaboratorImage && !form.getValues('collaborator')
    }

    const canSwitchToImage = () => {
        const currentValue = form.getValues('collaborator')
        return !currentValue || currentValue.trim() === ''
    }*/

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            let coverImage = data.coverImage || ''
            // let collaborator = data.collaborator || ''

            // Handle cover image upload
            if (croppedImage && croppedImage !== courseData?.coverImage) {
                const response = await fetch(croppedImage)
                const blob = await response.blob()
                const file = new File([blob], 'cropped-cover-image.png', {
                    type: 'image/png',
                })

                const formData = new FormData()
                formData.append('images', file) // Changed from 'image' to 'images' to match first file

                const res = await api.post('/Content/curriculum/upload-images', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                
                // Updated to match response structure from first file
                const uploadedUrls = Array.isArray(res.data?.urls) ? res.data.urls : []
                if (uploadedUrls.length === 0) {
                    toast.error({
                        title: 'Error',
                        description: 'File uploaded but no URLs returned',
                    })
                    return
                }
                coverImage = uploadedUrls[0]
            } else if (croppedImage) {
                coverImage = croppedImage
            }

            
            // Handle collaborator image upload (only if type is image and there's a cropped image)
           /* if (
                collaboratorType === 'image' &&
                croppedCollaboratorImage &&
                croppedCollaboratorImage !== courseData?.collaborator
            ) {
                const response = await fetch(croppedCollaboratorImage)
                const blob = await response.blob()
                const file = new File(
                    [blob],
                    'cropped-collaborator-image.png',
                    {
                        type: 'image/png',
                    }
                )

                const formData = new FormData()
                formData.append('images', file) // Changed from 'image' to 'images' to match first file

                const res = await api.post(
                    '/Content/curriculum/upload-images',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                )
                
                // Updated to match response structure from first file
                const uploadedUrls = Array.isArray(res.data?.urls) ? res.data.urls : []
                if (uploadedUrls.length === 0) {
                    toast.error({
                        title: 'error',
                        description: 'File uploaded but no URLs returned',
                    })
                    return
                }
                collaborator = uploadedUrls[0]
            } else if (collaboratorType === 'image' && croppedCollaboratorImage) {
                collaborator = croppedCollaboratorImage
            }*/

            await api.patch(`/bootcamp/${courseData?.id}`, {
                ...data,
                coverImage,
                collaborator: data.collaborator || '',
            }, {
                headers: { 'Content-Type': 'application/json' },
            }).then((res) => {
                const {
                    id, name, bootcampTopic, description, coverImage,
                    collaborator, startTime, duration, language, unassigned_students,
                } = res.data.updatedBootcamp[0]
                
                setCourseData({
                    id, name, bootcampTopic, description, coverImage,
                    collaborator, startTime, duration, language, unassigned_students,
                })
                
                toast.success({
                    title: res.data.status,
                    description: res.data.message || 'Changes saved successfully',
                })
            })
        } catch (error) {
            toast.error({
                title: 'Failed',
                description: 'Failed to save changes. Please try again.',
            })
        }
    }

    const fileInputRef = useRef<HTMLInputElement>(null)
  /* const collaboratorFileInputRef = useRef<HTMLInputElement>(null)

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleCollaboratorButtonClick = () => {
        collaboratorFileInputRef.current?.click()
    }*/

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                toast.error({
                    title: 'File too large',
                    description: 'Please upload an image smaller than 2MB',
                })
                return
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error({
                    title: 'Invalid file type',
                    description: 'Please upload an image file (JPG, PNG, SVG)',
                })
                return
            }

            const reader = new FileReader()
            reader.onloadend = () => {
                setImage(reader.result as string)
                setIsCropping(true)
                setCroppedImage(null) // Reset cropped image when new image is selected
           }
           reader.readAsDataURL(file)
        }
     }

    // const handleCollaboratorFileChange = async (
    //     event: React.ChangeEvent<HTMLInputElement>
    // ) => {
    //     const file = event.target.files?.[0]
    //     if (file) {
    //         const reader = new FileReader()
    //         reader.onloadend = () => {
    //             setCollaboratorImage(reader.result as string)
    //             setIsCollaboratorCropping(true)
    //             setCroppedCollaboratorImage(null) // Reset cropped image when new image is selected
    

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

    /*
    const collaboratorFileInputRef = useRef<HTMLInputElement>(null)
    
    const handleCollaboratorButtonClick = () => {
        collaboratorFileInputRef.current?.click()
    }

    const handleCollaboratorFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setCollaboratorImage(reader.result as string)
                setIsCollaboratorCropping(true)
                setCroppedCollaboratorImage(null)
            }
            reader.readAsDataURL(file)
        }
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

    const handleCollaboratorTypeChange = (type: 'text' | 'image') => {
        setCollaboratorType(type)
        form.setValue('collaborator', '')
        if (type === 'text') {
            setCroppedCollaboratorImage(null)
            setCollaboratorImage(null)
            setIsCollaboratorCropping(false)
        }
    }
    */

     // if (loadingCourseCheck) {
    //   return (
    //     <div className="flex justify-center items-center h-full mt-20">
    //       <Spinner className="text-secondary" />
    //     </div>
    //   )
    // }

    // if (isCourseDeleted) {
    //   return (
    //     <div className="flex flex-col justify-center items-center h-full mt-20">
    //       <Image src="/images/undraw_select-option_6wly.svg" width={350} height={350} alt="Deleted" />
    //       <p className="text-lg text-red-600 mt-4">This course has been deleted !</p>
    //       <Button onClick={() => router.push('/admin/courses')} className="mt-6 bg-secondary">
    //         Back to Courses
    //       </Button>
    //     </div>
    //   )
    // }

    return (
        <div className="w-full max-w-none space-y-6">
            <h2 className="font-heading text-xl font-semibold text-left ml-1">General Details</h2>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Course Image */}
                        <div className="space-y-4">
                            <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted relative group">
                                {isCropping && image ? (
                                    <Cropper
                                        src={image}
                                        style={{ height: '100%', width: '100%' }}
                                        aspectRatio={16 / 9}
                                        onInitialized={(instance) => setCropper(instance)}
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
                                            // src={courseData?.coverImage || '/logo_white.png'}
                                            // alt={courseData?.name || 'Course Image'}
                                            src={'/logo_white.png'}
                                            alt={'Course Image'}
                                            fallBackSrc={'/logo_white.png'}
                                        />
                                    </div>
                                )}
                                
                                {!isCropping && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        {/* <label className="cursor-pointer"> */}
                                            {/* <Button variant="secondary" size="sm" className="pointer-events-none">
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload New Image
                                            </Button> */}

                                             <Button 
                                               variant="secondary" 
                                               size="sm" 
                                               type="button"
                                               onClick={() => fileInputRef.current?.click()}
                                            >
                                             <Upload className="h-4 w-4 mr-2" />
                                                Upload New Image
                                            </Button>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="sr-only"
                                                ref={fileInputRef}
                                            />
                                        {/* </label> */}
                                        {croppedImage && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleRemoveImage}
                                                type="button"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove Image
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {isCropping && image && (
                                <div className="flex gap-2">
                                    <Button onClick={handleCrop} variant="outline" type="button">
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

                        {/* Form Fields */}
                        <div className="lg:col-span-2 space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="text-start">
                                        <Label htmlFor="name" className="font-semibold">Course Title</Label>
                                        <FormControl>
                                            <Input
                                                id="name"
                                                placeholder="Enter course title"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="text-start">
                                        <Label htmlFor="description" className="font-semibold">Description</Label>
                                        <FormControl>
                                            <Textarea
                                                id="description"
                                                placeholder="Enter course description"
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem className="text-start">
                                            <Label htmlFor="duration" className="font-semibold">Duration (weeks)</Label>
                                            <FormControl>
                                                <Input
                                                    id="duration"
                                                    type="number"
                                                    min="1"
                                                    placeholder="Duration in weeks"
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        if (value === '') {
                                                            field.onChange(value)
                                                            return
                                                        }
                                                        const isValidInteger = /^\d+$/.test(value)
                                                        if (!isValidInteger) {
                                                            toast.error({
                                                                title: 'Invalid Integer',
                                                                description: 'Please enter a valid integer value',
                                                            })
                                                            return
                                                        }
                                                        if (parseInt(value, 10) <= 0) {
                                                            toast.error({
                                                                title: 'Invalid Value',
                                                                description: 'Duration must be greater than 0',
                                                            })
                                                            return
                                                        }
                                                        field.onChange(value)
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <FormItem className="text-start">
                                            <Label htmlFor="startTime" className="font-semibold">Course Start Date</Label>
                                            <Popover open={isCalendarOpen} onOpenChange={setCalendarOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                id="startTime"
                                                                value={field.value ? format(field.value, 'dd-MM-yyyy') : ''}
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
                                                                field.onChange(date)
                                                                setCalendarOpen(false)
                                                            }
                                                        }}
                                                        disabled={(date) => {
                                                            const today = new Date()
                                                            today.setHours(0, 0, 0, 0)
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

                            {/* COMMENTED OUT: Topic field for potential future use */}
                            {/*
                            <FormField
                                control={form.control}
                                name="bootcampTopic"
                                render={({ field }) => (
                                    <FormItem className="text-start">
                                        <Label>Topic</Label>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter Bootcamp Topic"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            */}

                            {/* Language Selection */}
                            <FormField
                                control={form.control}
                                name="language"
                                render={({ field }) => (
                                    <FormItem className="text-start">
                                        <Label className="text-sm font-semibold">Course Language</Label>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                                className="flex gap-6"
                                            >
                                                {LANGUAGES.map((language, index) => (
                                                    <FormItem
                                                        key={index}
                                                        className="flex flex-row items-center space-x-2 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value={language}
                                                                id={language.toLowerCase()}
                                                            />
                                                        </FormControl>
                                                        <Label 
                                                            htmlFor={language.toLowerCase()}
                                                            className="font-normal cursor-pointer"
                                                        >
                                                            {language}
                                                        </Label>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* COMMENTED OUT: Collaborator Section for future use */}
                    {/*
                    <FormField
                        control={form.control}
                        name="collaborator"
                        render={({ field }) => (
                            <FormItem className="text-start">
                                <FormLabel>Collaborator</FormLabel>
                                <div className="mb-3">
                                    <RadioGroup
                                        value={collaboratorType}
                                        onValueChange={(value: 'text' | 'image') =>
                                            handleCollaboratorTypeChange(value)
                                        }
                                        className="flex gap-4"
                                    >
                                        <div className="flex flex-row items-center space-x-2">
                                            <RadioGroupItem value="text" className="text-black border-black" />
                                            <label className="text-sm font-medium cursor-pointer">Text</label>
                                        </div>
                                        <div className="flex flex-row items-center space-x-2">
                                            <RadioGroupItem value="image" className="text-black border-black" />
                                            <label className="text-sm font-medium cursor-pointer">Image</label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {collaboratorType === 'image' ? (
                                    <>
                                        <div className="mb-3">
                                            <div className="image-container bg-muted flex justify-center items-center rounded-sm overflow-hidden"
                                                style={{ height: '200px', width: '400px' }}>
                                                {isCollaboratorCropping && collaboratorImage ? (
                                                    <Cropper
                                                        src={collaboratorImage}
                                                        style={{ height: 200, width: '100%' }}
                                                        aspectRatio={16 / 9}
                                                        onInitialized={(instance) => setCollaboratorCropper(instance)}
                                                    />
                                                ) : croppedCollaboratorImage ? (
                                                    <img src={croppedCollaboratorImage} alt="Collaborator Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <OptimizedImageWithFallback
                                                        src={courseData?.coverImage || '/logo_white.png'}
                                                        alt={courseData?.name || 'Cover Image'}
                                                        fallBackSrc={'/logo_white.png'}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <Input
                                            id="collaborator-picture"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCollaboratorFileChange}
                                            className="hidden"
                                            ref={collaboratorFileInputRef}
                                        />
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <Button variant="outline" type="button" onClick={handleCollaboratorButtonClick} size="sm">
                                                    {croppedCollaboratorImage ? 'Change Image' : 'Upload Image'}
                                                </Button>
                                                {isCollaboratorCropping && collaboratorImage && (
                                                    <Button onClick={handleCollaboratorCrop} type="button" variant="outline" size="sm">
                                                        Crop Image
                                                    </Button>
                                                )}
                                                {croppedCollaboratorImage && !isCollaboratorCropping && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            setCroppedCollaboratorImage(null)
                                                            setCollaboratorImage(null)
                                                            setIsCollaboratorCropping(false)
                                                            form.setValue('collaborator', '')
                                                        }}
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-300 text-red-600 hover:text-red-700 hover:border-red-400 hover:bg-red-50"
                                                    >
                                                        Remove Image
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <FormControl>
                                            <Input
                                                placeholder="Enter collaborator text"
                                                maxLength={80}
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    */}

                    <div className="flex justify-end pt-2 border-t">
                        <Button 
                            type="submit" 
                            className="bg-primary hover:bg-primary-dark"
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default GeneralDetailsPage