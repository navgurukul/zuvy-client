import React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'

type Props = {}
const FormSchema = z.object({
    type: z.enum(['option 1', 'option 2', 'option 3', 'option 4'], {
        required_error: 'You need to select a notification type.',
    }),
    questionInput: z.string().min(1, {
        message: 'Username must be at least 1 characters.',
    }),
    options: z.array(z.string()).nonempty({
        message: 'At least one option is required.',
    }),
})

const QuizFormComponent = ({ onSubmit }: any) => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            questionInput: '',
            options: [''],
        },
    })
    const handleAddOption = () => {
        form.setValue('options', [...form.getValues('options'), ''])
    }
    const handleRemoveOption = (index: number) => {
        const updatedOptions: any = [...form.getValues('options')]
        updatedOptions.splice(index, 1)
        form.setValue('options', updatedOptions)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
            >
                <FormField
                    control={form.control}
                    name="questionInput"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-start">
                                <FormLabel className="text-lg">
                                    Question Text
                                </FormLabel>
                            </div>
                            <FormControl>
                                <Input placeholder="Question Text" {...field} />
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem className="space-y-3 w-full">
                            <div className="flex justify-start">
                                <FormLabel className="text-lg ">
                                    Answer Choices
                                </FormLabel>
                            </div>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1 w-full"
                                >
                                    {form
                                        .getValues('options')
                                        .map((option, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <RadioGroupItem
                                                        value={`option ${
                                                            index + 1
                                                        }`}
                                                    />
                                                </FormControl>
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${index}`}
                                                    render={({ field }) => (
                                                        <FormItem className="w-[400px]">
                                                            <Input
                                                                placeholder={`Option ${
                                                                    index + 1
                                                                }`}
                                                                {...field}
                                                            />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {index !== 0 && (
                                                    <Button
                                                        variant={'ghost'}
                                                        onClick={() =>
                                                            handleRemoveOption(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <X />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            <Button
                                variant={'outline'}
                                onClick={handleAddOption}
                                className="flex justify-start text-secondary font-semibold "
                            >
                                <Plus size={15} className="text-secondary" />
                                Add options
                            </Button>
                        </FormItem>
                    )}
                />
                <Button className="flex justify-start" type="submit">
                    Submit
                </Button>
            </form>
        </Form>
    )
}

export default QuizFormComponent
