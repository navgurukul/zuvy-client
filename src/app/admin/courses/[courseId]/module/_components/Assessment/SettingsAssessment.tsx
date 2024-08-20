'use client'
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import ToggleSwitch from './ToggleSwitch'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import { useEffect } from 'react'

const formSchema = z.object({
    hour: z
        .number()
        .min(1, 'Hour must be between 1 and 5')
        .max(5, 'Hour must be between 1 and 5'),
    minute: z
        .number()
        .min(0, 'Minute must be between 0 and 59')
        .max(59, 'Minute must be between 0 and 59'),
    passPercentage: z.string().nonempty('Percentage is required'),
    copyPaste: z.boolean(),
    embeddedGoogleSearch: z.boolean(),
    tabChange: z.boolean(),
    screenRecord: z.boolean(),
    webCamera: z.boolean(),
})

type SettingsAssessmentProps = {
    selectedCodingQuesIds: any
    selectedQuizQuesIds: any
    selectedOpenEndedQuesIds: any
    content: any
    fetchChapterContent: (chapterId: number) => void
    chapterData: any
    chapterTitle: string
    saveSettings: boolean
    setSaveSettings: (value: boolean) => void
}

const SettingsAssessment: React.FC<SettingsAssessmentProps> = ({
    selectedCodingQuesIds,
    selectedQuizQuesIds,
    selectedOpenEndedQuesIds,
    content,
    fetchChapterContent,
    chapterData,
    chapterTitle,
    saveSettings,
    setSaveSettings,
}) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hour: content.timeLimit ? Math.floor(content.timeLimit / 3600) : 2,
            minute: (content.timeLimit / 60) % 60,
            passPercentage:
                content.passPercentage != null
                    ? content.passPercentage.toString()
                    : '70',
            copyPaste: content.copyPaste == null ? true : content.copyPaste,
            embeddedGoogleSearch:
                content.embeddedGoogleSearch == null
                    ? false
                    : content.embeddedGoogleSearch,
            tabChange: content.tabChange == null ? true : content.tabChange,
            screenRecord:
                content.screenRecord == null ? false : content.screenRecord,
            webCamera: content.webCamera == null ? false : content.webCamera,
        },
    })

    useEffect(() => {
        form.reset({
            hour: content.timeLimit ? Math.floor(content.timeLimit / 3600) : 2,
            minute: (content.timeLimit / 60) % 60,
            passPercentage:
                content.passPercentage != null
                    ? content.passPercentage.toString()
                    : '70',
            copyPaste: content.copyPaste == null ? true : content.copyPaste,
            embeddedGoogleSearch:
                content.embeddedGoogleSearch == null
                    ? false
                    : content.embeddedGoogleSearch,
            tabChange: content.tabChange == null ? true : content.tabChange,
            screenRecord:
                content.screenRecord == null ? false : content.screenRecord,
            webCamera: content.webCamera == null ? false : content.webCamera,
        })
    }, [content])

    useEffect(() => {
        if (saveSettings) {
            form.handleSubmit(handleSubmit)()
            setSaveSettings(false)
        }
    }, [saveSettings])

    const handleSubmit = async (values: any) => {
        const timeLimit = values.hour * 3600 + values.minute * 60

        const data = {
            title: chapterTitle,
            description:
                'This assessment has 2 dsa problems,5 mcq and 3 theory questions',
            codingProblemIds: selectedCodingQuesIds,
            mcqIds: selectedQuizQuesIds,
            openEndedQuestionIds: selectedOpenEndedQuesIds,
            passPercentage: Number(values.passPercentage),
            timeLimit: Number(timeLimit),
            copyPaste: values.copyPaste,
            embeddedGoogleSearch: values.embeddedGoogleSearch,
            tabChange: values.tabChange,
            screenRecord: values.screenRecord,
            webCamera: values.webCamera,
        }

        try {
            await api.put(`Content/editAssessment/${content.id}`, data)
            fetchChapterContent(chapterData.chapterId)
            toast({
                title: 'Assessment Updated Successfully',
                description: 'Assessment has been updated successfully',
                className: 'text-start capitalize border border-secondary',
            })
        } catch (error) {
            console.error(error)
        }
    }

    const hours = Array.from({ length: 5 }, (_, i) => i + 1)
    const minutes = Array.from({ length: 60 }, (_, i) => i)

    return (
        <main className="flex flex-col p-3">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="max-w-md w-full flex flex-col gap-4"
                >
                    <h1 className="text-left mb-3">Time Limit</h1>
                    <div className="flex gap-2">
                        <FormField
                            control={form.control}
                            name="hour"
                            render={({ field }) => (
                                <FormItem className="text-left w-full">
                                    <FormLabel>Hour</FormLabel>
                                    <Select
                                        onValueChange={(value) =>
                                            field.onChange(parseInt(value))
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={`${
                                                        field.value
                                                    } Hour${
                                                        field.value > 1
                                                            ? 's'
                                                            : ''
                                                    }`}
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectGroup>
                                                {hours.map((hour) => (
                                                    <SelectItem
                                                        key={hour}
                                                        value={hour.toString()}
                                                    >
                                                        {hour} Hour
                                                        {hour !== 1 ? 's' : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="minute"
                            render={({ field }) => (
                                <FormItem className="text-left w-full">
                                    <FormLabel>Minute</FormLabel>
                                    <Select
                                        onValueChange={(value) =>
                                            field.onChange(parseInt(value))
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={`${
                                                        field.value
                                                    } Minute${
                                                        field.value !== 1
                                                            ? 's'
                                                            : ''
                                                    }`}
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectGroup>
                                                {minutes.map((minute) => (
                                                    <SelectItem
                                                        key={minute}
                                                        value={minute.toString()}
                                                    >
                                                        {minute} Minute
                                                        {minute !== 1
                                                            ? 's'
                                                            : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <h2 className="text-left mt-5 font-bold">
                        Pass Percentage (Out of 100)
                    </h2>
                    <FormField
                        control={form.control}
                        name="passPercentage"
                        render={({ field }) => (
                            <FormItem className="text-left">
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        className="w-1/5 outline-none no-spinners border-gray-300"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="proctoring text-left">
                        <h2 className=" mt-5 font-bold">
                            Manage Proctoring Boundaries
                        </h2>
                        <FormField
                            control={form.control}
                            name="copyPaste"
                            render={({ field }) => (
                                <FormItem className="flex justify-between">
                                    <FormLabel className="my-3">
                                        Copy Paste
                                    </FormLabel>
                                    <FormControl>
                                        <ToggleSwitch
                                            initialChecked={field.value}
                                            onToggle={(checked: any) =>
                                                field.onChange(checked)
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="embeddedGoogleSearch"
                            render={({ field }) => (
                                <FormItem className="flex justify-between">
                                    <FormLabel className="my-3">
                                        Embedded Google Search
                                    </FormLabel>
                                    <FormControl>
                                        <ToggleSwitch
                                            initialChecked={field.value}
                                            onToggle={(checked: any) =>
                                                field.onChange(checked)
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tabChange"
                            render={({ field }) => (
                                <FormItem className="flex justify-between">
                                    <FormLabel className="my-3">
                                        Tab Change
                                    </FormLabel>
                                    <FormControl>
                                        <ToggleSwitch
                                            initialChecked={field.value}
                                            onToggle={(checked: any) =>
                                                field.onChange(checked)
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="screenRecord"
                            render={({ field }) => (
                                <FormItem className="flex justify-between">
                                    <FormLabel className="my-3">
                                        Screen Record
                                    </FormLabel>
                                    <FormControl>
                                        <ToggleSwitch
                                            initialChecked={field.value}
                                            onToggle={(checked: any) =>
                                                field.onChange(checked)
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="webCamera"
                            render={({ field }) => (
                                <FormItem className="flex justify-between">
                                    <FormLabel className="my-3">
                                        Web Camera
                                    </FormLabel>
                                    <FormControl>
                                        <ToggleSwitch
                                            initialChecked={field.value}
                                            onToggle={(checked: any) =>
                                                field.onChange(checked)
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>
        </main>
    )
}

export default SettingsAssessment
