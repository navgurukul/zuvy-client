'use client'

import React, { useEffect, useState, useCallback } from 'react'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, RotateCcw } from 'lucide-react'
import FormSection from './FormSection'

type AddFormProps = {
    chapterData: any
    content: any
    fetchChapterContent: (chapterId: number) => void
    moduleId: any
}

interface chapterDetails {
    title: string
    description: string
}

const formSchema = z.object({
    title: z.string().min(2, {
        message: 'Video Title must be at least 2 characters.',
    }),

    description: z.string().min(4, {
        message: 'Description must be at least 4 characters.',
    }),
})

const AddForm: React.FC<AddFormProps> = ({
    chapterData,
    content,
    fetchChapterContent,
    moduleId,
}) => {
    const [newContent, setNewContent] = useState<chapterDetails>({
        title: '',
        description: '',
    })
    // const [section, setSection] = useState([{ name: '', number: '' }])
    const [section, setSection] = useState([
        {
            type: 'Multiple Choice',
            question: 'Question 1',
            options: ['Op1'],
            textField: true,
        },
    ])

    const form = useForm<z.infer<typeof formSchema>>({
        // const form = useForm({
        resolver: zodResolver(formSchema),
        // resolver: zodResolver(),
        defaultValues: {
            title: '',
            description: '',
        },
        values: {
            title: newContent?.title ?? '',
            description: newContent?.description ?? '',
        },
    })

    const addQuestion = () => {
        console.log('Clicked')
        // const newSection = { name: '', number: '' }
        const newSection = {
            type: 'Multiple Choice',
            question: 'Question 1',
            options: ['Op1'],
            textField: true,
        }
        setSection([...section, newSection])
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const payload = {
            ...values,
            section,
        }
        console.log('values', values)
        console.log('payload', payload)
    }

    console.log('section in form', section)

    return (
        <div className="flex flex-col gap-y-8 mx-auto items-center justify-center w-1/2">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className=" w-full items-left justify-left flex flex-col space-y-8"
                >
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Untitled Form"
                                        className="p-0 text-3xl w-full text-left font-semibold outline-none border-none focus:ring-0"
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
                            <FormItem>
                                <FormLabel className="flex text-left text-md font-semibold mb-1">
                                    Description
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="w-[450px] px-3 py-2 border rounded-md"
                                        placeholder="Placeholder"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className=" flex text-left text-xl font-semibold">
                                    Title
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="w-[450px] px-3 py-2 border rounded-md "
                                        placeholder="Placeholder"
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
                            <FormItem>
                                <FormLabel className=" flex text-left text-xl font-semibold">
                                    Description
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        className="w-[450px] px-3 py-2 border rounded-md "
                                        placeholder="Placeholder"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    /> */}
                    {section.map((item: any, index) => (
                        <FormSection
                            index={index}
                            form={form}
                            addQuestion={addQuestion}
                            section={section}
                            setSection={setSection}
                        />
                    ))}
                    {/* <FormSection title={'Hello title section'} /> */}
                    <div className="flex justify-start">
                        <Button
                            variant={'secondary'}
                            type="button"
                            onClick={addQuestion}
                            className="gap-x-2 border-none hover:text-secondary hover:bg-popover"
                        >
                            <Plus /> Add Question
                        </Button>
                    </div>
                    <div className="flex justify-start">
                        <Button
                            // variant={'secondary'}
                            type="submit"
                            className="w-1/3"
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AddForm

// 'use client'

// import React, { useEffect, useState, useCallback } from 'react'
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
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { Plus, X, RotateCcw } from 'lucide-react'
// import FormSection from './FormSection'

// type AddFormProps = {
//     chapterData: any
//     content: any
//     fetchChapterContent: (chapterId: number) => void
//     moduleId: any
// }

// interface Section {
//     type: string
//     question: string
//     options: string[]
// }

// interface chapterDetails {
//     title: string
//     description: string
//     section: Section[]
// }

// // const formSchema = z.object({
// //     title: z.string().min(2, {
// //         message: 'Video Title must be at least 2 characters.',
// //     }),

// //     description: z.string().min(4, {
// //         message: 'Description must be at least 4 characters.',
// //     }),
// // })

// const formSchema = z.object({
//     title: z.string().min(2, {
//         message: 'Video Title must be at least 2 characters.',
//     }),
//     description: z.string().min(4, {
//         message: 'Description must be at least 4 characters.',
//     }),
//     section: z.array(
//         z.object({
//             type: z.string(),
//             question: z.string(),
//             options: z.array(z.string()),
//             // answer: z.union([z.string(), z.array(z.string()), z.date()]), // Include z.date() for date type
//         })
//     ),
// })

// const AddForm: React.FC<AddFormProps> = ({
//     chapterData,
//     content,
//     fetchChapterContent,
//     moduleId,
// }) => {
//     const [newContent, setNewContent] = useState<chapterDetails>({
//         title: 'title',
//         description: 'description',
//         section: [],
//     })
//     // const [section, setSection] = useState([{ name: '', number: '' }])
//     const [section, setSection] = useState([
//         {
//             type: 'Multiple Choice',
//             question: 'Question 1',
//             options: ['Op1'],
//             textField: true,
//         },
//     ])

//     const form = useForm<z.infer<typeof formSchema>>({
//         // const form = useForm({
//         resolver: zodResolver(formSchema),
//         // resolver: zodResolver(),
//         defaultValues: {
//             title: '',
//             description: '',
//             section: newContent?.section ?? '',
//         },
//         values: {
//             title: newContent?.title ?? '',
//             description: newContent?.description ?? '',
//             section: newContent?.section ?? '',
//         },
//     })

//     const addQuestion = () => {
//         console.log('Clicked')
//         // const newSection = { name: '', number: '' }
//         const newSection = {
//             type: 'Multiple Choice',
//             question: 'Question 1',
//             options: ['Op1'],
//             textField: true,
//         }
//         setSection([...section, newSection])
//     }

//     async function onSubmit(values: z.infer<typeof formSchema>) {
//         console.log('values', values)
//     }

//     console.log('section in form', section)

//     return (
//         <div className="flex flex-col gap-y-8 mx-auto items-center justify-center w-full">
//             <Form {...form}>
//                 <form
//                     onSubmit={form.handleSubmit(onSubmit)}
//                     className=" w-full items-center justify-center flex flex-col space-y-8"
//                 >
//                     <Input
//                         placeholder="Untitled Form"
//                         className="p-0 text-3xl w-1/5 text-left font-semibold outline-none border-none focus:ring-0 capitalize"
//                     />
//                     {/* <FormField
//                         control={form.control}
//                         name="untitledForm"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormControl>
//                                     <Input
//                                         {...field}
//                                         placeholder="Untitled Form"
//                                         className="p-0 text-3xl w-1/20 text-left font-semibold outline-none border-none focus:ring-0 capitalize mb-5"
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     /> */}
//                     <FormField
//                         control={form.control}
//                         name="description"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex text-left text-md font-semibold mb-1">
//                                     Description
//                                 </FormLabel>
//                                 <FormControl>
//                                     <Input
//                                         {...field}
//                                         className="w-[450px] px-3 py-2 border rounded-md "
//                                         placeholder="Placeholder"
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     -----------------------------------------------------------------------
//                     {/* <FormField
//                         control={form.control}
//                         name="title"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className=" flex text-left text-xl font-semibold">
//                                     Title
//                                 </FormLabel>
//                                 <FormControl>
//                                     <Input
//                                         {...field}
//                                         className="w-[450px] px-3 py-2 border rounded-md "
//                                         placeholder="Placeholder"
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="description"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className=" flex text-left text-xl font-semibold">
//                                     Description
//                                 </FormLabel>
//                                 <FormControl>
//                                     <Input
//                                         {...field}
//                                         className="w-[450px] px-3 py-2 border rounded-md "
//                                         placeholder="Placeholder"
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     /> */}
//                     {section.map((item: any, index) => (
//                         <FormSection
//                             index={index}
//                             form={form}
//                             addQuestion={addQuestion}
//                             section={section}
//                             setSection={setSection}
//                         />
//                     ))}
//                     {/* <FormSection title={'Hello title section'} /> */}
//                     <div className="flex justify-end">
//                         <Button
//                             variant={'secondary'}
//                             type="button"
//                             onClick={addQuestion}
//                             className="gap-x-2 border-none hover:text-secondary hover:bg-popover"
//                         >
//                             <Plus /> Add Question
//                         </Button>
//                     </div>
//                     <div className="flex justify-end">
//                         <Button
//                             variant={'secondary'}
//                             type="submit"
//                             className="border-none hover:text-secondary hover:bg-popover"
//                         >
//                             Save
//                         </Button>
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     )
// }

// export default AddForm
