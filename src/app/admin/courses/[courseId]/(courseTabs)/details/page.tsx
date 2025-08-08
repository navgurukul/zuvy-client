'use client'
import { useCourseExistenceCheck } from '@/hooks/useCourseExistenceCheck'
import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
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
import{CourseData} from "@/app/admin/courses/[courseId]/(courseTabs)/details/courseDetailType"

const FormSchema = z.object({
    name: z.string().min(1, 'Please enter the course name.'),
    bootcampTopic: z.string().min(1, 'Please specify the course topic.'),
    description: z.string().min(1, 'Please add a course description.'),
    duration: z.string().min(1, 'Please enter the course duration.'),
    language: z.string().min(1, 'Please select the language.'),
    startTime: z.date({
        required_error: 'Please choose a start date for the course.',
    }),
    coverImage: z.string().optional(),
    collaborator: z.string().optional(),
})

function Page({ params }: { params: any }) {
    const router = useRouter()
    const [image, setImage] = useState<string | null>(null)
    const [cropper, setCropper] = useState<Cropper | null>(null)
    const [isCropping, setIsCropping] = useState(false)
    const [croppedImage, setCroppedImage] = useState<string | null>(null)
    const [isCalendarOpen, setCalendarOpen] = useState(false)

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
    

    // New state for collaborator type
    const [collaboratorType, setCollaboratorType] = useState<'text' | 'image'>('text')

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
        const isUrl =
            str.startsWith('http') ||
            str.startsWith('https') ||
            str.startsWith('data:image')
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

    // Check if switching should be allowed
    const canSwitchToText = () => {
        return !croppedCollaboratorImage && !form.getValues('collaborator')
    }

    const canSwitchToImage = () => {
        const currentValue = form.getValues('collaborator')
        return !currentValue || currentValue.trim() === ''
    }

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            let coverImage = data.coverImage || ''
            let collaborator = data.collaborator || ''

            // Handle cover image upload
            if (croppedImage && croppedImage !== courseData?.coverImage) {
                const response = await fetch(croppedImage)
                const blob = await response.blob()
                const file = new File([blob], 'cropped-cover-image.png', {
                    type: 'image/png',
                })

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
                coverImage = uploadedUrls[0]
            } else if (croppedImage) {
                coverImage = croppedImage
            }

            // Handle collaborator image upload (only if type is image and there's a cropped image)
            if (
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
            }

            await api
                .patch(
                    `/bootcamp/${courseData?.id}`,
                    {
                        ...data,
                        coverImage,
                        collaborator: collaborator,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )
                .then((res) => {
                    const {
                        id,
                        name,
                        bootcampTopic,
                        description,
                        coverImage,
                        collaborator,
                        startTime,
                        duration,
                        language,
                        unassigned_students,
                    } = res.data.updatedBootcamp[0]
                    setCourseData({
                        id,
                        name,
                        bootcampTopic,
                        description,
                        coverImage,
                        collaborator,
                        startTime,
                        duration,
                        language,
                        unassigned_students,
                    })
                    toast.success({
                        title: res.data.status,
                        description: res.data.message,
                    })
                })
        } catch (error) {
            toast.error({
                title: 'Failed',
            })
        }
    }

    const fileInputRef = useRef<HTMLInputElement>(null)
    const collaboratorFileInputRef = useRef<HTMLInputElement>(null)

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleCollaboratorButtonClick = () => {
        collaboratorFileInputRef.current?.click()
    }

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImage(reader.result as string)
                setIsCropping(true)
                setCroppedImage(null) // Reset cropped image when new image is selected
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCollaboratorFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setCollaboratorImage(reader.result as string)
                setIsCollaboratorCropping(true)
                setCroppedCollaboratorImage(null) // Reset cropped image when new image is selected
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
            setCroppedImage(croppedCanvas.toDataURL())
            setIsCropping(false)
            setImage(null) // Clear the original image after cropping
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
            setCollaboratorImage(null) // Clear the original image after cropping
        }
    }

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
        <div className="max-w-[400px] m-auto text-gray-600">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <div
                        className="image-container bg-muted flex justify-center items-center rounded-sm my-3 overflow-hidden"
                        style={{ height: '200px', width: '400px' }}
                    >
                        {isCropping && image ? (
                            <Cropper
                                src={image}
                                style={{ height: 200, width: '100%' }}
                                aspectRatio={16 / 9}
                                onInitialized={(instance) =>
                                    setCropper(instance)
                                }
                            />
                        ) : croppedImage ? (
                            <img src={croppedImage} alt="Cropped Preview" className="w-full h-full object-cover" />
                        ) : (
                            <OptimizedImageWithFallback
                                src={
                                    courseData?.coverImage || '/logo_white.png'
                                }
                                alt={courseData?.name || 'Cover Image'}
                                fallBackSrc={'/logo_white.png'}
                            />
                        )}
                    </div>
                    <Input
                        id="picture"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <div className="flex gap-2">
                        <Button
                            className="text-gray-600 border border-input bg-background hover:border-[rgb(81,134,114)]"
                            type="button"
                            onClick={handleButtonClick}
                        >
                            {croppedImage ? 'Change Course Image' : 'Upload Course Image'}
                        </Button>
                        {isCropping && image && (
                            <Button
                                onClick={handleCrop}
                                variant={'outline'}
                                type="button"
                            >
                                Crop Image
                            </Button>
                        )}
                    </div>

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="text-start">
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter Bootcamp Name"
                                        {...(field || '')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="bootcampTopic"
                        render={({ field }) => (
                            <FormItem className="text-start">
                                <FormLabel>Topic</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter Bootcamp Topic"
                                        {...(field || '')}
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
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter Course Description"
                                        rows={4}
                                        {...(field || '')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Updated Collaborator Section with Radio Buttons */}
                    <FormField
                        control={form.control}
                        name="collaborator"
                        render={({ field }) => (
                            <FormItem className="text-start">
                                <FormLabel>Collaborator</FormLabel>

                                {/* Radio buttons for collaborator type */}
                                <div className="mb-3">
                                    <RadioGroup
                                        value={collaboratorType}
                                        onValueChange={(value: 'text' | 'image') =>
                                            handleCollaboratorTypeChange(value)
                                        }
                                        className="flex gap-4"
                                    >
                                        <div className="flex flex-row items-center space-x-2">
                                            <RadioGroupItem
                                                value="text"
                                                className="text-black border-black"
                                                disabled={!canSwitchToText() && collaboratorType !== 'text'}
                                            />
                                            <label
                                                className={`text-sm font-medium ${!canSwitchToText() && collaboratorType !== 'text'
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'cursor-pointer'
                                                    }`}
                                            >
                                                Text
                                            </label>
                                        </div>
                                        <div className="flex flex-row items-center space-x-2">
                                            <RadioGroupItem
                                                value="image"
                                                className="text-black border-black"
                                                disabled={!canSwitchToImage() && collaboratorType !== 'image'}
                                            />
                                            <label
                                                className={`text-sm font-medium ${!canSwitchToImage() && collaboratorType !== 'image'
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'cursor-pointer'
                                                    }`}
                                            >
                                                Image
                                            </label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Render based on selected type */}
                                {collaboratorType === 'image' ? (
                                    <>
                                        <div className="mb-3">
                                            <div 
                                                className="image-container bg-muted flex justify-center items-center rounded-sm overflow-hidden"
                                                style={{ height: '200px', width: '400px' }}
                                            >
                                                {isCollaboratorCropping && collaboratorImage ? (
                                                    <Cropper
                                                        src={collaboratorImage}
                                                        style={{ height: 200, width: '100%' }}
                                                        aspectRatio={16 / 9}
                                                        onInitialized={(instance) =>
                                                            setCollaboratorCropper(instance)
                                                        }
                                                    />
                                                ) : croppedCollaboratorImage ? (
                                                    <img
                                                        src={croppedCollaboratorImage}
                                                        alt="Collaborator Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                                                        No image selected
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* File input (hidden) */}
                                        <Input
                                            id="collaborator-picture"
                                            type="file"
                                            accept="image/*"
                                            onChange={
                                                handleCollaboratorFileChange
                                            }
                                            className="hidden"
                                            ref={collaboratorFileInputRef}
                                        />

                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={
                                                        handleCollaboratorButtonClick
                                                    }
                                                    size="sm"
                                                    disabled={isCollaboratorCropping}
                                                >
                                                    {croppedCollaboratorImage ? 'Change Image' : 'Upload Image'}
                                                </Button>

                                                {isCollaboratorCropping && collaboratorImage && (
                                                    <Button
                                                        onClick={
                                                            handleCollaboratorCrop
                                                        }
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Crop Image
                                                    </Button>
                                                )}

                                                {/* Remove Image Button */}
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
                                                        className="border-red-300 text-red-600 hover:text-red-700 hover:border-red-400 hover:bg-red-50 transition-colors"
                                                    >
                                                        Remove Image
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // Text input
                                    <div className="space-y-2">
                                        <FormControl>
                                            <Input
                                                placeholder="Enter collaborator text"
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
                    <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem className="text-start">
                                <FormLabel>Date of Commencement</FormLabel>
                                <Popover
                                    open={isCalendarOpen}
                                    onOpenChange={setCalendarOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                className={cn(
                                                    'pl-3 text-left font-normal w-full text-gray-600 border border-input bg-background hover:border-[rgb(81,134,114)]',
                                                    !field.value &&
                                                    'text-muted-foreground'
                                                )}
                                            >
                                                {field.value
                                                    ? format(field.value, 'PPP')
                                                    : 'Pick a date'}
                                                <CalendarIcon className="h-4 w-4 text-muted-foreground ml-auto" />
                                            </Button>
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
                                            disabled={(date) =>
                                                date < new Date()
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem className="text-start">
                                <FormLabel>Duration</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="Enter Duration in Weeks"
                                        value={field.value}
                                        onChange={(e) => {
                                            const value = e.target.value

                                            // Allow empty string
                                            if (value === '') {
                                                field.onChange(value)
                                                return
                                            }

                                            // Validate integer
                                            const isValidInteger = /^\d+$/.test(
                                                value
                                            )
                                            if (!isValidInteger) {
                                                toast.error({
                                                    title: 'Invalid Integer',
                                                    description:
                                                        'Please enter a valid integer value',
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
                        name="language"
                        render={({ field }) => (
                            <FormItem className="text-start">
                                <FormLabel>Language</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value || ''} // Use value instead of defaultValue
                                        className="flex gap-4"
                                    >
                                        {LANGUAGES.map((language, index) => (
                                            <FormItem
                                                key={index}
                                                className="flex flex-row items-center space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={language}
                                                        className="text-black border-black"
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {language}
                                                </FormLabel>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        className="bg-success-dark opacity-75"
                        type="submit"
                    >
                        Submit
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default Page
