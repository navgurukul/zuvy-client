import React from 'react'
import { useState } from 'react'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
    Select,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Plus, X } from 'lucide-react'

type Props = {}
const formSchema = z.object({
    difficulty: z.enum(['Easy', 'Medium', 'hard'], {
        required_error: 'You need to select a Difficulty  type.',
    }),

    topics: z.enum(['Strings', 'DSA', 'Development'], {
        required_error: 'You need to select a Topic',
    }),
    questionDescription: z.string(),
})

const NewOpenEndedQuestionForm = (props: Props) => {
    const [testCases, setTestCases] = useState([{ id: 1 }])
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(0)
    const [options, setOptions] = useState(['Easy', 'Medium', 'Hard']) // Initial state with three options

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            difficulty: 'Easy',
            topics: 'DSA',
            questionDescription: '',
        },
    })

    // const accountType = form.watch('accountType')

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        console.log({ values })
    }
    return (
        <main className="flex  flex-col p-3 ">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className=" max-w-md w-full flex flex-col gap-4"
                >
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
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Easy" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Easy
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Medium" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Medium
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="Hard" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                Hard
                                            </FormLabel>
                                        </FormItem>
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
                                <FormItem className="text-left">
                                    <FormLabel>Topics</FormLabel>
                                    <Select onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger className="w-1/2">
                                                <SelectValue placeholder="Choose Topic" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="w-1/2">
                                            <SelectItem value="DSA">
                                                DSA
                                            </SelectItem>
                                            <SelectItem value="C++">
                                                C++
                                            </SelectItem>
                                            <SelectItem value="Python">
                                                Python
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                    <FormField
                        control={form.control}
                        name="questionDescription"
                        render={({ field }) => {
                            return (
                                <FormItem className="text-left">
                                    <FormLabel>
                                        Write the Question Descriptions
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write your Question here"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />

                    <div className="flex justify-end">
                        <Button type="submit" className="w-1/2 ">
                            Create Questions
                        </Button>
                    </div>
                </form>
            </Form>
        </main>
    )
}

export default NewOpenEndedQuestionForm
