'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tag } from '../mcq/page'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import TipTapForForm from './TipTapForForm'

const formSchema = z.object({
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    topics: z.number().min(1, 'You need to select a Topic'),
    variants: z.array(
        z.object({
            questionText: z.string().nonempty('Question text is required'),
        })
    ),
})

export default function NewMcqForm({
    tags,
    closeModal,
    setStoreQuizData,
    getAllQuizQuesiton,
}: {
    tags: Tag[]
    closeModal: () => void
    setStoreQuizData: any
    getAllQuizQuesiton: any
}) {
    const [showTagName, setShowTagName] = useState<boolean>(false)
    const [activeVariantIndex, setActiveVariantIndex] = useState<number>(0)

    const [selectedTag, setSelectedTag] = useState<{
        id: number
        tagName: String
    }>({ id: 0, tagName: '' })
    const difficulties = ['Easy', 'Medium', 'Hard']

    // ...
    const form = useForm<z.infer<typeof formSchema>>({
        mode: 'onChange',
        resolver: zodResolver(formSchema),
        defaultValues: {
            difficulty: 'Easy',
            topics: 0,
            variants: [{ questionText: '' }],
        },
    })
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'variants',
    })
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    const handleAddVariant = () => {
        append({ questionText: '' })
        // Set the active index to the newly added variant
        setActiveVariantIndex(fields.length) // fields.length is the index of the new item
    }

    const handleRemoveVariant = (index: number) => {
        if (fields.length > 1) {
            remove(index)
            // Adjust the active variant index to stay within bounds
            if (activeVariantIndex >= fields.length - 1) {
                setActiveVariantIndex(fields.length - 2)
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex space-y-1"
                                >
                                    <FormLabel className="mt-5">
                                        Difficulty
                                    </FormLabel>
                                    {difficulties.map((difficulty) => {
                                        return (
                                            <FormItem
                                                key={difficulty}
                                                className="flex items-center space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={difficulty}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {difficulty}
                                                </FormLabel>
                                            </FormItem>
                                        )
                                    })}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="topics"
                    render={({ field }) => {
                        return (
                            <FormItem className="text-left w-full">
                                <FormLabel>Topics</FormLabel>
                                <div className="flex gap-x-4  ">
                                    <Select
                                        onValueChange={(value) => {
                                            const selectedTag = tags?.find(
                                                (tag: Tag) =>
                                                    tag.tagName === value
                                            )
                                            if (selectedTag) {
                                                field.onChange(selectedTag.id)
                                                setSelectedTag(selectedTag)
                                                setShowTagName(true)
                                            }
                                        }}
                                    >
                                        <FormControl className="w-1/2">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose Topic" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {tags.map((tag: any) => (
                                                <SelectItem
                                                    key={tag.id}
                                                    value={tag.tagName}
                                                >
                                                    {tag.tagName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {showTagName && (
                                        <div className="flex items-start gap-x-2 bg-[#FFF3E3] pt-1 px-2 rounded-lg  ">
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
                                    )}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />

                <div className="space-y-4">
                    <div className="flex space-x-4">
                        {fields.map((field, index) => (
                            <Button
                                key={field.id}
                                variant={
                                    activeVariantIndex === index
                                        ? 'default'
                                        : 'ghost'
                                }
                                onClick={() => setActiveVariantIndex(index)} // Set active variant index
                            >
                                Variant {index + 1}
                            </Button>
                        ))}
                        <Button
                            type="button"
                            onClick={() => append({ questionText: '' })}
                            variant={'ghost'}
                        >
                            + Add Variant
                        </Button>
                    </div>

                    {/* Only display the active variant */}
                    {fields.length > 0 && (
                        <FormField
                            key={fields[activeVariantIndex]?.id}
                            control={form.control}
                            name={`variants.${activeVariantIndex}.questionText`}
                            render={({ field }) => (
                                <FormItem className="text-left w-full">
                                    <FormLabel>Question Text</FormLabel>
                                    <FormControl>
                                        <TipTapForForm
                                            description={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    {activeVariantIndex > 0 && (
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                remove(activeVariantIndex)
                                            }
                                            className="mt-2 text-red-500 bg-white"
                                        >
                                            Remove Variant
                                        </Button>
                                    )}
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}
