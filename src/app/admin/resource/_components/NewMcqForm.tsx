'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import DOMPurify from 'dompurify'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import TipTapForForm from './TipTapForForm'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { X } from 'lucide-react'

const formSchema = z.object({
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    topics: z.number().min(1, 'You need to select a Topic'),
    variants: z.array(
        z.object({
            questionText: z.string().nonempty('Question text is required'),
            selectedOption: z.number().nonnegative(),
            options: z
                .array(
                    z.object({
                        optionText: z
                            .string()
                            .nonempty('Option text is required'),
                    })
                )
                .min(2, 'At least two options are required'),
        })
    ),
})

export default function NewMcqForm({
    tags,
    closeModal,
    setStoreQuizData,
    getAllQuizQuesiton,
    setIsMcqModalOpen,
}: {
    tags: any[]
    closeModal: () => void
    setStoreQuizData: any
    getAllQuizQuesiton: any
    setIsMcqModalOpen: any
}) {
    const [showTagName, setShowTagName] = useState<boolean>(false)
    const [codeSnippet, setCodeSnippet] = useState<any>()
    const [activeVariantIndex, setActiveVariantIndex] = useState<number>(0)
    const [selectedTag, setSelectedTag] = useState<{
        id: number
        tagName: String
    }>({ id: 0, tagName: '' })
    const difficulties = ['Easy', 'Medium', 'Hard']

    const form = useForm<z.infer<typeof formSchema>>({
        mode: 'onChange',
        resolver: zodResolver(formSchema),
        defaultValues: {
            difficulty: 'Easy',
            topics: 0,
            variants: [
                {
                    questionText: '',
                    selectedOption: 0,
                    options: [{ optionText: '' }, { optionText: '' }],
                },
            ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'variants',
    })

    const handleAddVariant = () => {
        append({
            questionText: '',
            selectedOption: 0,
            options: [{ optionText: '' }, { optionText: '' }],
        })
        setActiveVariantIndex(fields.length)
    }

    const handleRemoveVariant = (index: number) => {
        if (fields.length > 1) {
            remove(index)
            if (activeVariantIndex >= fields.length - 1) {
                setActiveVariantIndex(fields.length - 2)
            }
        }
    }

    const {
        fields: optionFields,
        append: appendOption,
        remove: removeOption,
    } = useFieldArray({
        control: form.control,
        name: `variants.${activeVariantIndex}.options`,
    })

    const onSubmitHandler = async (values: z.infer<typeof formSchema>) => {
        const transformedObj: any = {
            title: 'Introduction to Quantum Physics',
            difficulty: values.difficulty,
            tagId: values.topics,
            content:
                'Detailed content explaining quantum theories and experiments.',
            isRandomOptions: false,
            variantMCQs: values.variants.map((variant, index) => ({
                question: variant.questionText,
                options: variant.options.reduce((acc: any, option, idx) => {
                    acc[idx + 1] = option.optionText
                    return acc
                }, {}),
                correctOption: variant.selectedOption + 1,
            })),
        }

        try {
            await api.post(`/Content/quiz`, { quizzes: [transformedObj] })
            toast({
                title: 'Success',
                description: 'Question Created Successfully',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            setIsMcqModalOpen(false)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'An error occurred',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    return (
        <Form {...form}>
            {/* <div dangerouslySetInnerHTML={{ __html: codeSnippet }} /> */}
            <form
                onSubmit={form.handleSubmit(onSubmitHandler)}
                className="space-y-8 mr-12 w-[700px] flex flex-col justify-center items-center "
            >
                <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                        <div className="w-full ml-[140px]">
                            <FormItem className="space-y-3 text-start ">
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <div className="flex gap-x-5 ">
                                            <FormLabel className="mt-5 font-semibold text-md ">
                                                Difficulty
                                            </FormLabel>
                                            {difficulties.map((difficulty) => (
                                                <FormItem
                                                    key={difficulty}
                                                    className="flex items-center space-x-2 space-y-0"
                                                >
                                                    <FormControl className="">
                                                        <RadioGroupItem
                                                            value={difficulty}
                                                            className="text-secondary"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-md ">
                                                        {difficulty}
                                                    </FormLabel>
                                                </FormItem>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </div>
                    )}
                />

                <FormField
                    control={form.control}
                    name="topics"
                    render={({ field }) => (
                        <div className="w-full ml-[140px]">
                            <FormItem className="text-start flex flex-col flex-start  ">
                                <FormLabel className="font-semibold text-md">
                                    Topics
                                </FormLabel>
                                <div className="flex gap-x-4">
                                    <Select
                                        onValueChange={(value) => {
                                            const selectedTag = tags.find(
                                                (tag) => tag.tagName === value
                                            )
                                            if (selectedTag) {
                                                field.onChange(selectedTag.id)
                                                setSelectedTag(selectedTag)
                                                setShowTagName(true)
                                            }
                                        }}
                                    >
                                        <FormControl className="w-[190px]">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose Topic" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {tags.map((tag) => (
                                                <SelectItem
                                                    key={tag.id}
                                                    value={tag.tagName}
                                                >
                                                    {tag.tagName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* {showTagName && (
                                        <div className="flex items-start gap-x-2 bg-[#FFF3E3] pt-1 px-2 rounded-lg">
                                            <h1 className="mt-1 text-sm">
                                                {selectedTag.tagName}
                                            </h1>
                                            <span
                                                onClick={() =>
                                                    setShowTagName(false)
                                                }
                                                className="cursor-pointer"
                                            >
                                                x
                                            </span>
                                        </div>
                                    )} */}
                                </div>
                                <FormMessage />
                            </FormItem>
                        </div>
                    )}
                />

                <div className="space-y-4 ml-[145px]">
                    <FormLabel className="mt-5 font-semibold text-md flex ">
                        Variants
                    </FormLabel>
                    <div className="flex space-x-4">
                        {fields.map((field, index) => (
                            <Button
                                key={field.id}
                                className={`${
                                    activeVariantIndex === index
                                        ? 'border-b-4 border-secondary text-secondary text-md'
                                        : ''
                                } rounded-none`}
                                variant="ghost"
                                type="button"
                                onClick={() => setActiveVariantIndex(index)}
                            >
                                Variant {index + 1}
                            </Button>
                        ))}
                        {activeVariantIndex > 0 && (
                            <X
                                size={18}
                                onClick={() =>
                                    handleRemoveVariant(activeVariantIndex)
                                }
                                className="mt-3 ml-5 text-red-500 bg-white cursor-pointer"
                            />
                            // <Button type="button">
                            // </Button>
                        )}
                        <Button
                            type="button"
                            onClick={handleAddVariant}
                            variant="ghost"
                            className="font-semibold text-md"
                        >
                            + Add Variant
                        </Button>
                    </div>

                    {fields.length > 0 && (
                        <>
                            <FormField
                                key={fields[activeVariantIndex]?.id}
                                control={form.control}
                                name={`variants.${activeVariantIndex}.questionText`}
                                render={({ field }) => (
                                    <FormItem className="text-left w-full">
                                        <FormLabel className="text-md font-normal">
                                            Question Text
                                        </FormLabel>
                                        <FormControl>
                                            <TipTapForForm
                                                description={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Options for the active variant with Radio Buttons */}
                            <div className="space-y-4">
                                <FormField
                                    key={fields[activeVariantIndex]?.id}
                                    control={form.control}
                                    name={`variants.${activeVariantIndex}.selectedOption`}
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={field.value.toString()}
                                            onValueChange={(value) =>
                                                field.onChange(Number(value))
                                            }
                                        >
                                            <FormLabel className="text-left text-md font-normal">
                                                Answer Choices
                                            </FormLabel>
                                            {optionFields.map(
                                                (optionField, optionIndex) => (
                                                    <div
                                                        key={optionField.id}
                                                        className="flex items-center space-x-4"
                                                    >
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value={optionIndex.toString()}
                                                            />
                                                        </FormControl>
                                                        <FormField
                                                            control={
                                                                form.control
                                                            }
                                                            name={`variants.${activeVariantIndex}.options.${optionIndex}.optionText`}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <FormItem className="w-full">
                                                                    {/* <FormLabel>
                                                                        Option
                                                                        Text{' '}
                                                                        {optionIndex +
                                                                            1}
                                                                    </FormLabel> */}
                                                                    <FormControl>
                                                                        <Input
                                                                            value={
                                                                                field.value
                                                                            }
                                                                            onChange={
                                                                                field.onChange
                                                                            }
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Radio Button to select this option */}

                                                        {optionFields.length >
                                                            2 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="text-red-500"
                                                                onClick={() =>
                                                                    removeOption(
                                                                        optionIndex
                                                                    )
                                                                }
                                                            >
                                                                X
                                                            </Button>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </RadioGroup>
                                    )}
                                />

                                <div className="flex ">
                                    <Button
                                        type="button"
                                        variant={'ghost'}
                                        onClick={() =>
                                            appendOption({ optionText: '' })
                                        }
                                        className="text-left text-secondary font-semibold text-md"
                                    >
                                        + Add Option
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="flex flex-col justify-end items-end w-[550px]">
                    <Button className="" type="submit">
                        Add Question
                    </Button>
                </div>
            </form>
        </Form>
    )
}
