import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@radix-ui/react-popover'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'


// const sectionSchema = z.object({
//     type: z.string().min(4, { message: 'Type must be at least 4 characters.' }),
//     question: z.string().min(4, { message: 'Question must be at least 4 characters.' }),
//     options: z.array(z.string()),
//     answer: z.union([z.string(), z.array(z.string()), z.date()]),  // Includes z.date() for date type
// });

// const formSchema = z.object({
//     section: z.array(sectionSchema),
// });

const formSchema = z.object({
    section: z.array(
        z.object({
            type: z.string(),
            question: z.string(),
            options: z.array(z.string()),
            answer: z.union([z.string(), z.array(z.string()), z.date()]), // Include z.date() for date type
        })
    ),
})

const FeedbackForm = () => {

    const newContent = {
        title: 'Class Feedback',
        description:
            'We would like to know how you liked this class. Please share your insights with us',
        section: [
            {
                type: 'multiple-choice',
                question: 'What is your favorite color?',
                options: ['Red', 'Blue', 'Green', 'Yellow'],
                // answer: 'Blue',
                answer: '',
            },
            {
                type: 'paragraph',
                question: 'How are your?',
                options: [],
                // answer: 'I am good!',
                answer: '',
            },
            {
                type: 'checkbox',
                question: 'What are your favorite pet animal?',
                options: ['Dog', 'Cat', 'Squerall', 'Rabbit'],
                // answer: ['Dog', 'Cat', 'Rabbit'],
                answer: [],
            },
            {
                type: 'paragraph',
                question: 'Which course are you studying currently?',
                options: [],
                // answer: 'I am studying Data Science',
                answer: '',
            },
            {
                type: 'time',
                question: 'When do you start studying?',
                options: [],
                // answer: '08:00 am',
                answer: '',
            },
            {
                type: 'date',
                question: 'When did you start this course?',
                options: [],
                // answer: '15th May 2024',
                answer: '',
            },
        ],
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            section: newContent?.section,
        },
        values: {
            section: newContent?.section,
        },
    })

    const { watch } = form

    const currentValues = watch()

    console.log('currentValues', currentValues)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // const paylod = { ...values, section }
        console.log('values', values)
        // console.log('paylod', paylod)
    }

    return (
        <>
            <div className="flex justify-center">
                <div className="flex flex-col gap-5 text-left w-1/2">
                    <h1 className="text-xl font-bold text-secondary-foreground">
                        {newContent.title}
                    </h1>
                    <p className="text-lg">
                        {newContent.description}
                    </p>
                    <div>
                        <p className="text-lg description bg-blue-100 p-5 rounded-lg">
                            Note: Please do not share any personal and sensitive
                            information in the responses. We will never ask for
                            such information from you
                        </p>
                    </div>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            {newContent.section.map((item, index) => (
                                <div
                                    key={index}
                                    className="space-y-3 text-start"
                                >
                                    {item.type === 'multiple-choice' && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name={`section.${index}.answer`}
                                                render={({ field }) => (
                                                    <div className="space-y-3 text-start">
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            value={field.value as string}
                                                        >
                                                            {item.options.map(option => (
                                                                <div
                                                                    key={option}
                                                                    className={`flex space-x-2 mr-4 mt-1 p-3 ${
                                                                        field.value as string === option &&
                                                                        `border border-secondary border-2 rounded-lg`
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center w-full space-x-3 space-y-0">
                                                                        <RadioGroupItem value={option} />
                                                                        <label className="font-normal">{option}</label>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </RadioGroup>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {item.type === 'checkbox' && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <div className="mt-2">
                                                {item.options.map((option) => (
                                                    <FormField
                                                        key={option}
                                                        control={form.control}
                                                        name={`section.${index}.answer`}
                                                        render={({ field }) => (
                                                                <div
                                                                    className={`flex space-x-2 mr-4 mt-1 p-3 ${
                                                                        (field.value as string[]).includes(option) &&
                                                                        'border border-secondary border-2 rounded-lg'
                                                                    }`}
                                                                >
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={(field.value as string[]).includes(option)}
                                                                                onCheckedChange={(checked) => {
                                                                                    const fieldValue = field.value as string[]
                                                                                    const newValue = checked
                                                                                                ? [...fieldValue, option]
                                                                                            : fieldValue.filter((val: string) =>
                                                                                                      val !== option
                                                                                              )
                                                                                    field.onChange(newValue)
                                                                                }}
                                                                                aria-label={option}
                                                                                className="translate-y-[2px] mr-1"
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="text-md font-light">
                                                                            {option}
                                                                        </FormLabel>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                </div>
                                                            )
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {item.type === 'paragraph' && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold mb-3">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name={`section.${index}.answer`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea
                                                                {...field}
                                                                className="w-full h-[170px] px-3 py-2 border rounded-md"  //w-[550px]
                                                                placeholder="Type your answer..."
                                                                value={
                                                                    field.value as string
                                                                } // Ensured `value` is a string
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                } // Managed the change event
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {item.type === 'time' && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name={`section.${index}.answer`}
                                                render={({ field }) => (
                                                    <FormItem className="text-left flex flex-col w-[100px]">
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Time"
                                                                {...field}
                                                                type="time"
                                                                value={
                                                                    field.value as string
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {item.type === 'date' && (
                                        <div className="mt-6">
                                            <div className="flex flex-row gap-x-2 font-semibold">
                                                <p>{index + 1}.</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <div className="flex flex-row gap-x-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`section.${index}.answer`}
                                                    render={({ field }) => {
                                                        const dateValue =
                                                            field.value instanceof
                                                            Date
                                                                ? field.value
                                                                : new Date() // Ensure field.value is a Date object

                                                        return (
                                                            <div className="flex item-start justify-start mt-2">
                                                                <FormItem>
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <FormControl>
                                                                            <Button
                                                                                variant={'outline'}
                                                                                className={`w-[230px] pl-3 text-left font-normal ${
                                                                                    !dateValue && 'text-muted-foreground'
                                                                                }`}
                                                                            >
                                                                                {dateValue ? (
                                                                                    format(dateValue, 'PPP')
                                                                                ) : (
                                                                                    <span>Pick a date</span>
                                                                                )}
                                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                            </Button>
                                                                        </FormControl>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-auto bg-popover rounded-lg shadow-md p-6 my-3" align="start">
                                                                        <Calendar
                                                                            mode="single"
                                                                            selected={dateValue}
                                                                            onSelect={(date) => {
                                                                                if (date) {
                                                                                    field.onChange(date);
                                                                                }
                                                                            }}
                                                                            initialFocus
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </FormItem>
                                                            </div>
                                                        )
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <Button type="submit" className="mt-7">
                                Submit Responses
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </>
    )
}

export default FeedbackForm
