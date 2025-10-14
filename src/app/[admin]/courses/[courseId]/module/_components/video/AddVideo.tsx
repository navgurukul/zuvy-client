// 'use client'
// import React, { useCallback, useEffect, useRef, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { z } from 'zod'
// import { zodResolver } from '@hookform/resolvers/zod'
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from '@/components/ui/form'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import { api } from '@/utils/axios.config'
// import { toast } from '@/components/ui/use-toast'
// import VideoEmbed from '@/app/[admin]/courses/[courseId]/module/_components/video/VideoEmbed'
// import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
// import { ArrowUpRightSquare, X, Pencil } from 'lucide-react'
// import PreviewVideo from '@/app/[admin]/courses/[courseId]/module/_components/video/PreviewVideo'
// import { getChapterUpdateStatus, getVideoPreviewStore } from '@/store/store'
// import { Eye } from 'lucide-react'
// import { useRouter } from 'next/navigation'
// import {AddVideoProps,EditChapterResponse} from "@/app/[admin]/courses/[courseId]/module/_components/video/ModuleVideoType"
// import { getEmbedLink, isLinkValid } from '@/utils/admin'

// // import useResponsiveHeight from '@/hooks/useResponsiveHeight'

// // Helper function to convert links to embed-friendly format

// const formSchema = z.object({
//     videoTitle: z.string().min(2, {
//         message: 'Video Title must be at least 2 characters.',
//     }),

//     description: z.string().min(4, {
//         message: 'Description must be at least 4 characters.',
//     }),
//     links: z.string().refine(
//         (value) => {
//             const links = value.split(',').map((link) => link.trim())
//             return links.every((link) => isLinkValid(link))
//         },
//         {
//             message: 'Only YouTube and Google Drive links are allowed.',
//         }
//     ),
// })
// const AddVideo: React.FC<AddVideoProps> = ({
//   moduleId,
//   courseId,
//   content,
//   fetchChapterContent,
// }) => {
//     // const heightClass = useResponsiveHeight()
//     const router = useRouter()
//     const fileInputRef = useRef<HTMLInputElement>(null)
//     const [showPreview, setShowPreview] = useState<boolean>(false)
//     const [showVideoBox, setShowVideoBox] = useState<boolean>(true)
//     const [videoTitle, setVideoTitle] = useState('')
//     const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
//     const { setVideoPreviewContent } = getVideoPreviewStore()
//     const [isDataLoading, setIsDataLoading] = useState(true)
//     const hasLoaded = useRef(false)

//     const form = useForm<z.infer<typeof formSchema>>({
//         resolver: zodResolver(formSchema),
//         mode: 'onChange',
//         defaultValues: {
//             videoTitle: '',
//             description: '',
//             links: '',
//         },
//         values: {
//             videoTitle: content?.contentDetails?.[0]?.title ?? '',
//             description: content?.contentDetails?.[0]?.description ?? '',
//             links: content?.contentDetails?.[0]?.links?.[0] ?? '',
//         },
//     })

//     const {
//         formState: { isDirty },
//     } = form

//     async function onSubmit(values: z.infer<typeof formSchema>) {
//         const modifiedLink = getEmbedLink(values.links)

//         const convertedObj = {
//             title: values.videoTitle,
//             description: values.description,
//             links: [modifiedLink],
//         }

//         try {
//             await api
//                 .put<EditChapterResponse>(
//                     `/Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
//                     convertedObj
//                 )
//                 .then((res) => {
//                     toast.success({
//                         title: res.data.status,
//                         description: res.data.message,
//                     })
//                     form.reset(values) // to reset the dirty state
//                     setShowVideoBox(true)
//                     fetchChapterContent(content.id, content.topicId)
//                     setIsChapterUpdated(!isChapterUpdated)
//                 })
//         } catch (error) {
//             toast.error({
//                 title: 'Error',
//                 description: "Couldn't Update the Chapter Module",
//             })
//         }
//     }

//     useEffect(() => {
//         if (hasLoaded.current) return
//         hasLoaded.current = true
//         setIsDataLoading(true)

//         if (content?.contentDetails?.[0]?.links?.[0]) {
//             form.reset({
//                 videoTitle: content?.contentDetails?.[0]?.title ?? '',
//                 description: content?.contentDetails?.[0]?.description ?? '',
//                 links: content?.contentDetails?.[0]?.links?.[0] ?? '',
//             })
//         } else {
//             setShowVideoBox(false)
//         }
//         setVideoTitle(content?.contentDetails?.[0]?.title ?? '')
//         setIsDataLoading(false)
//     }, [content?.contentDetails, form])

//     const handleClose = async () => {
//         setShowVideoBox(false)
//         form.setValue('links', '')
//         form.setValue('description', '')

//         try {
//             await api.put(
//                 `/Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
//                 {
//                     description: '',
//                     links: [''],
//                 }
//             )
//         } catch (error) {
//             console.error('Error updating chapter:', error)
//         }
//     }
//     const handlePreviewClick = () => {
//         // Check if title is empty or invalid
//         if (
//             !form.watch('videoTitle') ||
//             form.watch('videoTitle').trim().length === 0
//         ) {
//             toast.info({
//                 title: 'No Title',
//                 description: 'Please provide a title for the video to preview.',
//             })
//             return
//         }

//         // Check if links are empty or invalid
//         const links = form.watch('links').trim()
//         if (!links || !isLinkValid(links)) {
//             toast.info({
//                 title: 'Invalid Link',
//                 description: 'Please provide a valid video link to preview.',
//             })
//             return
//         }

//         setShowPreview(true)
//     }

//     function previewVideo() {
//         if (isDirty) {
//             toast.info({
//                 title: 'Unsaved Changes',
//                 description: 'Please Save the chapter to preview.',
//             })
//             return
//         }

//         if (content?.contentDetails[0]?.links) {
//             setVideoPreviewContent(content)
//             router.push(
//                 `/admin/courses/${courseId}/module/${moduleId}/chapter/${content.id}/video/${content.topicId}/preview`
//             )
//         }
//         else {
//             toast.info({
//                 title: 'No Video Uploaded',
//                 description: 'Please Save the chapter to preview.',
//             })
//         }
//     }

//     if (isDataLoading) {
//         return (
//             <div className="px-5">
//                 <div className="w-full flex justify-center items-center py-8">
//                     <div className="animate-pulse">Loading Quiz details...</div>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <ScrollArea className="h-dvh pr-4 pb-24" type="hover">
//             <ScrollBar className="h-dvh " orientation="vertical" />
//             <div className="flex flex-col gap-y-8 mx-auto items-center justify-left w-full bg-red-500 max-w-3xl">
//                 {/* {showPreview ? (
//                     <PreviewVideo
//                         content={content}
//                         setShowPreview={setShowPreview}
//                     />
//                 ) : ( */}
//                 <h1>Hi</h1>
//                 <>
//                     <Form {...form}>
//                         <form
//                             onSubmit={form.handleSubmit(onSubmit)}
//                             className=" w-full items-center justify-center flex flex-col space-y-8"
//                         >
//                             <FormField
//                                 control={form.control}
//                                 name="videoTitle"
//                                 render={({ field }) => (
//                                     <FormItem className="flex flex-col">
//                                         <FormControl>
//                                             <div className="w-[450px] gap-[40%] flex justify-center items-center relative">
//                                                 <Input
//                                                     required
//                                                     {...field} // Spread the field props (e.g., value, name, etc.)
//                                                     onChange={(e) => {
//                                                         setVideoTitle(
//                                                             e.target.value
//                                                         ) // Update the local state
//                                                         field.onChange(e) // Update the react-hook-form state
//                                                     }}
//                                                     placeholder={
//                                                         'Untitled Video'
//                                                     }
//                                                     className="pl-1 pr-8 text-xl text-left text-gray-600 font-semibold capitalize  placeholder:text-gray-400 placeholder:font-bold border-x-0 border-t-0 border-b-2 border-gray-400 border-dashed focus:outline-none"
//                                                     autoFocus
//                                                 />
//                                                 {!videoTitle && (
//                                                     <Pencil
//                                                         fill="true"
//                                                         fillOpacity={0.4}
//                                                         size={20}
//                                                         className="absolute text-gray-100 pointer-events-none top-1/2 right-3 -translate-y-1/2"
//                                                     // Adjusted right positioning
//                                                     />
//                                                 )}

//                                                     <Button
//                                                       type="submit"
//                                                       className="w-3/3 bg-success-dark opacity-75"
//                                                        >
//                                                            Save
//                                                     </Button>

//                                             </div>

//                                         </FormControl>
//                                         <div
//                                             id="previewVideo"
//                                             onClick={previewVideo}
//                                             className="flex w-[80px] hover:bg-gray-300 rounded-md p-1 cursor-pointer text-gray-600"
//                                         >
//                                             <Eye size={18} />
//                                             <h6 className="ml-1 text-sm">
//                                                 Preview
//                                             </h6>
//                                         </div>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             <div className="flex justify-start items-start">
//                                 {showVideoBox && (
//                                     <div className="flex items-start justify-start w-full">
//                                         <VideoEmbed
//                                             title={
//                                                 content?.contentDetails?.[0]
//                                                     ?.title || ''
//                                             }
//                                             src={getEmbedLink(
//                                                 content?.contentDetails?.[0]
//                                                     ?.links?.[0] || ''
//                                             )}
//                                         />
//                                     </div>
//                                 )}
//                             </div>

//                             <FormField
//                                 control={form.control}
//                                 name="description"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel className="flex text-left text-xl font-semibold">
//                                             Description
//                                         </FormLabel>
//                                         <FormControl>
//                                             <Textarea
//                                                 {...field}
//                                                 className="w-[450px] px-3 py-2 border rounded-md "
//                                                 placeholder="Type your Description here."
//                                             />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                             <FormField
//                                 control={form.control}
//                                 name="links"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel className=" flex items-center gap-1 text-left text-xl font-semibold w-full">
//                                             Embed Link
//                                             <span className="text-sm font-normal text-muted-foreground ml-2">
//                                                  (Accepted: YouTube and Google Drive links only.)
//                                            </span>
//                                         </FormLabel>
//                                         <FormControl>
//                                             <Input
//                                                 {...field}
//                                                 className="w-[450px] px-3 py-2 border rounded-md "
//                                                 placeholder="Paste your link here "
//                                             />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                         </form>
//                     </Form>
//                 </>
//                 {/* )} */}
//             </div>
//         </ScrollArea>
//     )
// }
// export default AddVideo

// 'use client'
// import React, { useCallback, useEffect, useRef, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { z } from 'zod'
// import { zodResolver } from '@hookform/resolvers/zod'
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from '@/components/ui/form'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
// import { api } from '@/utils/axios.config'
// import { toast } from '@/components/ui/use-toast'
// import VideoEmbed from '@/app/[admin]/courses/[courseId]/module/_components/video/VideoEmbed'
// import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
// import { ArrowUpRightSquare, X, Pencil, Video, Eye } from 'lucide-react'
// import PreviewVideo from '@/app/[admin]/courses/[courseId]/module/_components/video/PreviewVideo'
// import { getChapterUpdateStatus, getVideoPreviewStore } from '@/store/store'
// import { useRouter } from 'next/navigation'
// import {AddVideoProps,EditChapterResponse} from "@/app/[admin]/courses/[courseId]/module/_components/video/ModuleVideoType"
// import { getEmbedLink, isLinkValid } from '@/utils/admin'

// const formSchema = z.object({
//     videoTitle: z.string().min(2, {
//         message: 'Video Title must be at least 2 characters.',
//     }),

//     description: z.string().min(4, {
//         message: 'Description must be at least 4 characters.',
//     }),
//     links: z.string().refine(
//         (value) => {
//             const links = value.split(',').map((link) => link.trim())
//             return links.every((link) => isLinkValid(link))
//         },
//         {
//             message: 'Only YouTube and Google Drive links are allowed.',
//         }
//     ),
// })

// const AddVideo: React.FC<AddVideoProps> = ({
//   moduleId,
//   courseId,
//   content,
//   fetchChapterContent,
// }) => {
//     const router = useRouter()
//     const fileInputRef = useRef<HTMLInputElement>(null)
//     const [showPreview, setShowPreview] = useState<boolean>(false)
//     const [showVideoBox, setShowVideoBox] = useState<boolean>(true)
//     const [videoTitle, setVideoTitle] = useState('')
//     const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
//     const { setVideoPreviewContent } = getVideoPreviewStore()
//     const [isDataLoading, setIsDataLoading] = useState(true)
//     const hasLoaded = useRef(false)

//     const form = useForm<z.infer<typeof formSchema>>({
//         resolver: zodResolver(formSchema),
//         mode: 'onChange',
//         defaultValues: {
//             videoTitle: '',
//             description: '',
//             links: '',
//         },
//         values: {
//             videoTitle: content?.contentDetails?.[0]?.title ?? '',
//             description: content?.contentDetails?.[0]?.description ?? '',
//             links: content?.contentDetails?.[0]?.links?.[0] ?? '',
//         },
//     })

//     const {
//         formState: { isDirty },
//     } = form

//     async function onSubmit(values: z.infer<typeof formSchema>) {
//         const modifiedLink = getEmbedLink(values.links)

//         const convertedObj = {
//             title: values.videoTitle,
//             description: values.description,
//             links: [modifiedLink],
//         }

//         try {
//             await api
//                 .put<EditChapterResponse>(
//                     `/Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
//                     convertedObj
//                 )
//                 .then((res) => {
//                     toast.success({
//                         title: res.data.status,
//                         description: res.data.message,
//                     })
//                     form.reset(values)
//                     setShowVideoBox(true)
//                     fetchChapterContent(content.id, content.topicId)
//                     setIsChapterUpdated(!isChapterUpdated)
//                 })
//         } catch (error) {
//             toast.error({
//                 title: 'Error',
//                 description: "Couldn't Update the Chapter Module",
//             })
//         }
//     }

//     useEffect(() => {
//         if (hasLoaded.current) return
//         hasLoaded.current = true
//         setIsDataLoading(true)

//         if (content?.contentDetails?.[0]?.links?.[0]) {
//             form.reset({
//                 videoTitle: content?.contentDetails?.[0]?.title ?? '',
//                 description: content?.contentDetails?.[0]?.description ?? '',
//                 links: content?.contentDetails?.[0]?.links?.[0] ?? '',
//             })
//         } else {
//             setShowVideoBox(false)
//         }
//         setVideoTitle(content?.contentDetails?.[0]?.title ?? '')
//         setIsDataLoading(false)
//     }, [content?.contentDetails, form])

//     const handleClose = async () => {
//         setShowVideoBox(false)
//         form.setValue('links', '')
//         form.setValue('description', '')

//         try {
//             await api.put(
//                 `/Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
//                 {
//                     description: '',
//                     links: [''],
//                 }
//             )
//         } catch (error) {
//             console.error('Error updating chapter:', error)
//         }
//     }

//     const handlePreviewClick = () => {
//         if (
//             !form.watch('videoTitle') ||
//             form.watch('videoTitle').trim().length === 0
//         ) {
//             toast.info({
//                 title: 'No Title',
//                 description: 'Please provide a title for the video to preview.',
//             })
//             return
//         }

//         const links = form.watch('links').trim()
//         if (!links || !isLinkValid(links)) {
//             toast.info({
//                 title: 'Invalid Link',
//                 description: 'Please provide a valid video link to preview.',
//             })
//             return
//         }

//         setShowPreview(true)
//     }

//     function previewVideo() {
//         if (isDirty) {
//             toast.info({
//                 title: 'Unsaved Changes',
//                 description: 'Please Save the chapter to preview.',
//             })
//             return
//         }

//         if (content?.contentDetails[0]?.links) {
//             setVideoPreviewContent(content)
//             router.push(
//                 `/admin/courses/${courseId}/module/${moduleId}/chapter/${content.id}/video/${content.topicId}/preview`
//             )
//         } else {
//             toast.info({
//                 title: 'No Video Uploaded',
//                 description: 'Please Save the chapter to preview.',
//             })
//         }
//     }

//     if (isDataLoading) {
//         return (
//             <div className="px-5">
//                 <div className="w-full flex justify-center items-center py-8">
//                     <div className="animate-pulse">Loading Video details...</div>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 p-6">
//             <div className="max-w-4xl mx-auto">
//                 {/* Header Section */}
//                 <div className="mb-8">
//                     <div className="flex items-center gap-2 mb-4">
//                         <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
//                             Video
//                         </span>
//                         <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
//                             completed
//                         </span>
//                     </div>

//                     <Form {...form}>
//                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                             <FormField
//                                 control={form.control}
//                                 name="videoTitle"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormControl>
//                                             <div className="flex items-center gap-4">
//                                                 <Input
//                                                     {...field}
//                                                     onChange={(e) => {
//                                                         setVideoTitle(e.target.value)
//                                                         field.onChange(e)
//                                                     }}
//                                                     placeholder="Advanced DOM Manipulation Techniques"
//                                                     className="text-2xl font-bold border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-gray-900"
//                                                 />
//                                                 {!videoTitle && (
//                                                     <Pencil size={20} className="text-gray-400" />
//                                                 )}
//                                             </div>
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             {/* Video Content Section */}
//                             <div className="bg-white rounded-lg shadow-sm border">
//                                 <div className="p-6">
//                                     <h3 className="text-lg font-semibold mb-4 text-gray-700">Video Content</h3>

//                                     {/* Video Player Area */}
//                                     <div className="relative">
//                                         {showVideoBox && content?.contentDetails?.[0]?.links?.[0] ? (
//                                             <VideoEmbed
//                                                 title={content?.contentDetails?.[0]?.title || ''}
//                                                 src={getEmbedLink(content?.contentDetails?.[0]?.links?.[0] || '')}
//                                             />
//                                         ) : (
//                                             <div className="w-full h-64 bg-black rounded-lg flex flex-col items-center justify-center text-white">
//                                                 <Video size={48} className="mb-3" />
//                                                 <div className="text-center">
//                                                     <p className="text-sm mb-1">Class Recording</p>
//                                                     <p className="text-xs opacity-75">90 min</p>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Video Description */}
//                                     <div className="mt-6">
//                                         <h4 className="font-medium text-gray-900 mb-2">
//                                             Recording available for the live class
//                                         </h4>
//                                         <FormField
//                                             control={form.control}
//                                             name="description"
//                                             render={({ field }) => (
//                                                 <FormItem>
//                                                     <FormControl>
//                                                         <p className="text-sm text-gray-600 bg-transparent border-none p-0">
//                                                             <Textarea
//                                                                 {...field}
//                                                                 placeholder="Deep dive into DOM manipulation methods and best practices"
//                                                                 className="border-none bg-transparent p-0 resize-none focus-visible:ring-0 text-gray-600"
//                                                                 rows={2}
//                                                             />
//                                                         </p>
//                                                     </FormControl>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Video Link Input */}
//                             <div className="bg-white rounded-lg shadow-sm border p-6">
//                                 <FormField
//                                     control={form.control}
//                                     name="links"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-lg font-semibold text-gray-700 mb-2 block">
//                                                 Video Link
//                                             </FormLabel>
//                                             <div className="space-y-2">
//                                                 <FormControl>
//                                                     <Input
//                                                         {...field}
//                                                         placeholder="Paste your YouTube or Google Drive link here"
//                                                         className="w-full"
//                                                     />
//                                                 </FormControl>
//                                                 <p className="text-sm text-gray-500">
//                                                     Accepted: YouTube and Google Drive links only.
//                                                 </p>
//                                             </div>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>

//                             {/* Action Buttons */}
//                             <div className="flex justify-between items-center pt-6">
//                                 <div className="flex items-center gap-4">
//                                     <button
//                                         type="button"
//                                         onClick={previewVideo}
//                                         className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
//                                     >
//                                         <Eye size={18} />
//                                         <span className="text-sm">Preview</span>
//                                     </button>
//                                 </div>

//                                 <div className="flex gap-3">
//                                     <Button
//                                         type="button"
//                                         variant="outline"
//                                         onClick={() => {
//                                             form.reset()
//                                             setVideoTitle('')
//                                         }}
//                                     >
//                                         Cancel
//                                     </Button>
//                                     <Button
//                                         type="submit"
//                                         className="bg-blue-600 hover:bg-blue-700"
//                                     >
//                                         Save Changes
//                                     </Button>
//                                 </div>
//                             </div>
//                         </form>
//                     </Form>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default AddVideo

'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import VideoEmbed from '@/app/[admin]/courses/[courseId]/module/_components/video/VideoEmbed'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ArrowUpRightSquare, X, Pencil } from 'lucide-react'
import PreviewVideo from '@/app/[admin]/courses/[courseId]/module/_components/video/PreviewVideo'
import { getChapterUpdateStatus, getVideoPreviewStore } from '@/store/store'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    AddVideoProps,
    EditChapterResponse,
} from '@/app/[admin]/courses/[courseId]/module/_components/video/ModuleVideoType'
import { getEmbedLink, isLinkValid } from '@/utils/admin'
import { Video } from 'lucide-react'

// import useResponsiveHeight from '@/hooks/useResponsiveHeight'

// Helper function to convert links to embed-friendly format

const formSchema = z.object({
    videoTitle: z.string().min(2, {
        message: 'Video Title must be at least 2 characters.',
    }),

    description: z.string().min(4, {
        message: 'Description must be at least 4 characters.',
    }),
    links: z.string().refine(
        (value) => {
            const links = value.split(',').map((link) => link.trim())
            return links.every((link) => isLinkValid(link))
        },
        {
            message: 'Only YouTube and Google Drive links are allowed.',
        }
    ),
})
const AddVideo: React.FC<AddVideoProps> = ({
    moduleId,
    courseId,
    content,
    fetchChapterContent,
}) => {
    // const heightClass = useResponsiveHeight()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showPreview, setShowPreview] = useState<boolean>(false)
    const [showVideoBox, setShowVideoBox] = useState<boolean>(true)
    const [videoTitle, setVideoTitle] = useState('')
    const { isChapterUpdated, setIsChapterUpdated } = getChapterUpdateStatus()
    const { setVideoPreviewContent } = getVideoPreviewStore()
    const [isDataLoading, setIsDataLoading] = useState(true)
    const hasLoaded = useRef(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            videoTitle: '',
            description: '',
            links: '',
        },
        values: {
            videoTitle: content?.contentDetails?.[0]?.title ?? '',
            description: content?.contentDetails?.[0]?.description ?? '',
            links: content?.contentDetails?.[0]?.links?.[0] ?? '',
        },
    })

    const {
        formState: { isDirty },
    } = form

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const modifiedLink = getEmbedLink(values.links)

        const convertedObj = {
            title: values.videoTitle,
            description: values.description,
            links: [modifiedLink],
        }

        try {
            await api
                .put<EditChapterResponse>(
                    `/Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
                    convertedObj
                )
                .then((res) => {
                    toast.success({
                        title: res.data.status,
                        description: res.data.message,
                    })
                    form.reset(values) // to reset the dirty state
                    setShowVideoBox(true)
                    fetchChapterContent(content.id, content.topicId)
                    setIsChapterUpdated(!isChapterUpdated)
                })
        } catch (error) {
            toast.error({
                title: 'Error',
                description: "Couldn't Update the Chapter Module",
            })
        }
    }

    useEffect(() => {
        if (hasLoaded.current) return
        hasLoaded.current = true
        setIsDataLoading(true)

        if (content?.contentDetails?.[0]?.links?.[0]) {
            form.reset({
                videoTitle: content?.contentDetails?.[0]?.title ?? '',
                description: content?.contentDetails?.[0]?.description ?? '',
                links: content?.contentDetails?.[0]?.links?.[0] ?? '',
            })
        } else {
            setShowVideoBox(false)
        }
        setVideoTitle(content?.contentDetails?.[0]?.title ?? '')
        setIsDataLoading(false)
    }, [content?.contentDetails, form])

    const handleClose = async () => {
        setShowVideoBox(false)
        form.setValue('links', '')
        form.setValue('description', '')

        try {
            await api.put(
                `/Content/editChapterOfModule/${moduleId}?chapterId=${content.id}`,
                {
                    description: '',
                    links: [''],
                }
            )
        } catch (error) {
            console.error('Error updating chapter:', error)
        }
    }
    const handlePreviewClick = () => {
        // Check if title is empty or invalid
        if (
            !form.watch('videoTitle') ||
            form.watch('videoTitle').trim().length === 0
        ) {
            toast.info({
                title: 'No Title',
                description: 'Please provide a title for the video to preview.',
            })
            return
        }

        // Check if links are empty or invalid
        const links = form.watch('links').trim()
        if (!links || !isLinkValid(links)) {
            toast.info({
                title: 'Invalid Link',
                description: 'Please provide a valid video link to preview.',
            })
            return
        }

        setShowPreview(true)
    }

    function previewVideo() {
        if (isDirty) {
            toast.info({
                title: 'Unsaved Changes',
                description: 'Please Save the chapter to preview.',
            })
            return
        }

        if (content?.contentDetails[0]?.links) {
            setVideoPreviewContent(content)
            router.push(
                `/admin/courses/${courseId}/module/${moduleId}/chapter/${content.id}/video/${content.topicId}/preview`
            )
        } else {
            toast.info({
                title: 'No Video Uploaded',
                description: 'Please Save the chapter to preview.',
            })
        }
    }

    if (isDataLoading) {
        return (
            <div className="px-5">
                <div className="w-full flex justify-center items-center py-8">
                    <div className="animate-pulse">Loading Quiz details...</div>
                </div>
            </div>
        )
    }

    return (
        <ScrollArea className="h-dvh pr-4 pb-24" type="hover">
            <ScrollBar className="h-dvh" orientation="vertical" />
            <div className="mx-auto w-full max-w-[52rem]">
                {/* {showPreview ? (
                    <PreviewVideo
                        content={content}
                        setShowPreview={setShowPreview}
                    />
                ) : ( */}
                <>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="videoTitle"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormControl>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    required
                                                    {...field} // Spread the field props (e.g., value, name, etc.)
                                                    onChange={(e) => {
                                                        setVideoTitle(
                                                            e.target.value
                                                        ) // Update the local state
                                                        field.onChange(e) // Update the react-hook-form state
                                                    }}
                                                    placeholder={
                                                        'Untitled Video'
                                                    }
                                                    className="text-2xl font-bold border px-2 focus-visible:ring-0 placeholder:text-foreground"
                                                />
                                                {/* {!videoTitle && (
                                                    <Pencil
                                                        fill="true"
                                                        fillOpacity={0.4}
                                                        size={20}
                                                        className="absolute text-gray-100 pointer-events-none top-1/2 right-3 -translate-y-1/2"
                                                    />
                                                )} */}
                                            </div>
                                        </FormControl>

                                        {/* Preview section */}
                                        {/* <div
                                            id="previewVideo"
                                            onClick={previewVideo}
                                            className="flex w-[80px] hover:bg-gray-300 rounded-md p-1 cursor-pointer text-gray-600"
                                        >
                                            <Eye size={18} />
                                            <h6 className="ml-1 text-sm">
                                                Preview
                                            </h6>
                                        </div> */}
                                        <div className="flex items-center gap-2">
                                            <Video
                                                size={20}
                                                className="transition-colors"
                                            />
                                            <p className="text-muted-foreground">
                                                Video
                                            </p>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Video Content Section */}
                            <div className="bg-card rounded-lg shadow-sm border">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-start text-foreground">
                                        Video Content
                                    </h3>

                                    <div className="relative">
                                        {showVideoBox && (
                                            <VideoEmbed
                                                title={
                                                    content?.contentDetails?.[0]
                                                        ?.title || ''
                                                }
                                                src={getEmbedLink(
                                                    content?.contentDetails?.[0]
                                                        ?.links?.[0] || ''
                                                )}
                                            />
                                        )}
                                    </div>

                                    {/* <div className="mt-6">
                                        <p className="font-medium text-start text-2xl mb-2">
                                            Recording available for the live
                                            class
                                        </p>
                                    </div> */}
                                </div>
                            </div>

                            {/* <div className="flex justify-start items-start">
                                {showVideoBox && (
                                    <div className="flex items-start justify-start w-full">
                                        <VideoEmbed
                                            title={
                                                content?.contentDetails?.[0]
                                                    ?.title || ''
                                            }
                                            src={getEmbedLink(
                                                content?.contentDetails?.[0]
                                                    ?.links?.[0] || ''
                                            )}
                                        />
                                    </div>
                                )}
                            </div> */}

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex text-left text-xl font-semibold">
                                            Description
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                className="px-3 py-2 border rounded-md "
                                                placeholder="Type your Description here."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="links"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className=" flex items-center gap-1 text-left text-xl font-semibold w-full">
                                            Embed Link
                                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                                (Accepted: YouTube and Google
                                                Drive links only.)
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="px-3 py-2 border rounded-md "
                                                placeholder="Paste your link here "
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end items-center gap-4 pt-6">
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-3/3 bg-white hover:bg-red-500 opacity-75"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-3/3 bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </>
                {/* )} */}
            </div>
        </ScrollArea>
    )
}
export default AddVideo
