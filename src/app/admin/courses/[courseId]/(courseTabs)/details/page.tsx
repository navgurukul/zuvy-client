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
import { api, apiMeraki } from '@/utils/axios.config'

const FormSchema = z.object({
    name: z.string().min(1, 'Please enter the course name.'),
    bootcampTopic: z.string().min(1, 'Please specify the course topic.'),
    description: z.string().min(1, 'Please add a course description.'),
    duration: z.string().min(1, 'Please enter the course duration.'),
    language: z.string().min(1, 'Please select the language.'),
    startTime: z.date({
        required_error: 'Please choose a start date for the course.',
    }),
    coverImage: z.string().min(1, 'Please upload a cover image.'),
    collaborator: z.string().optional(),
})

interface CourseData {
    id: number
    name: string
    bootcampTopic: string
    description?: string
    coverImage?: string
    collaborator?: string
    duration?: number
    language: string
    startTime?: string
    unassigned_students?: number
}

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

    useEffect(() => {
        if (courseData) {
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

            // Set preview image if it's a URL
            if (isImageUrl(courseData.collaborator)) {
                setCroppedCollaboratorImage(courseData.collaborator)
            } else {
                setCroppedCollaboratorImage(null)
            }

            setCollaboratorImage(null)
            setIsCollaboratorCropping(false)
        }
    }, [courseData, form])

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            let coverImage = data.coverImage || ''
            let collaborator = data.collaborator || ''

            // Handle cover image upload
            if (croppedImage) {
                const response = await fetch(croppedImage)
                const blob = await response.blob()
                const file = new File([blob], 'cropped-cover-image.png', {
                    type: 'image/png',
                })

                const formData = new FormData()
                formData.append('image', file)

                const res = await apiMeraki.post(
                    '/courseEditor/ImageUploadS3',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                )
                coverImage = res.data.file.url
            }

            if (
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
                formData.append('image', file)

                const res = await apiMeraki.post(
                    '/courseEditor/ImageUploadS3',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                )
                collaborator = res.data.file.url
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
            // toast.success({
            //     title: 'Success',
            //     description:
            //         'Cover image cropped successfully. You can now upload it.',
            // })
        }
    }

    const handleCollaboratorCrop = () => {
        if (collaboratorCropper) {
            const croppedCanvas = collaboratorCropper.getCroppedCanvas({
                width: 200,
                height: 200,
            })
            setCroppedCollaboratorImage(croppedCanvas.toDataURL())
            setIsCollaboratorCropping(false)
            // toast.success({
            //     title: 'Success',
            //     description:
            //         'Collaborator image cropped successfully. You can now upload it.',
            // })
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
                        {!isCropping && croppedImage ? (
                            <img src={croppedImage} alt="Cropped Preview" />
                        ) : image ? (
                            <Cropper
                                src={image}
                                style={{ height: 200, width: '100%' }}
                                aspectRatio={16 / 9}
                                onInitialized={(instance) =>
                                    setCropper(instance)
                                }
                            />
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
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <Button
                        className="text-gray-600 border border-input bg-background hover:border-[rgb(81,134,114)]"
                        type="button"
                        onClick={handleButtonClick}
                    >
                        Upload Course Image
                    </Button>
                    {image && (
                        <Button
                            onClick={handleCrop}
                            variant={'outline'}
                            type="button"
                        >
                            Crop Image
                        </Button>
                    )}

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

                    {/* Updated Collaborator Section */}

                    <FormField
                        control={form.control}
                        name="collaborator"
                        render={({ field }) => {
                            const isUrl = isImageUrl(field.value || '')

                            return (
                                <FormItem className="text-start">
                                    <FormLabel>Collaborator</FormLabel>

                                    {/* ✅ CASE 1: Image (URL or Cropped) */}
                                    {isUrl ? (
                                        <>
                                            <div className="mb-3">
                                                <div className="w-full h-[200px] overflow-hidden border rounded-md">
                                                    {croppedCollaboratorImage ? (
                                                        <img
                                                            src={
                                                                croppedCollaboratorImage
                                                            }
                                                            alt="Collaborator"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full object-cover">
                                                            <OptimizedImageWithFallback
                                                                src={
                                                                    field.value ||
                                                                    ''
                                                                }
                                                                alt="Collaborator"
                                                                fallBackSrc="/default-avatar.png"
                                                            />
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

                                            {/* Cropper */}
                                            {collaboratorImage &&
                                            isCollaboratorCropping ? (
                                                <div className="my-3">
                                                    <Cropper
                                                        src={collaboratorImage}
                                                        style={{
                                                            height: 150,
                                                            width: 150,
                                                        }}
                                                        aspectRatio={1}
                                                        onInitialized={(
                                                            instance
                                                        ) =>
                                                            setCollaboratorCropper(
                                                                instance
                                                            )
                                                        }
                                                    />
                                                    <Button
                                                        onClick={
                                                            handleCollaboratorCrop
                                                        }
                                                        type="button"
                                                        variant="outline"
                                                        className="mt-2"
                                                        size="sm"
                                                    >
                                                        Crop Image
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={
                                                        handleCollaboratorButtonClick
                                                    }
                                                    size="sm"
                                                >
                                                    Change Image
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        // ✅ CASE 2: Text value
                                        <FormControl>
                                            <Input
                                                placeholder="Enter a text"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                    )}

                                    <FormMessage />
                                </FormItem>
                            )
                        }}
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
