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
    codingProblems: z.string().nonempty('Coding problems score is required'),
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
}

const SettingsAssessment: React.FC<SettingsAssessmentProps> = ({
    selectedCodingQuesIds,
    selectedQuizQuesIds,
    selectedOpenEndedQuesIds,
    content,
    fetchChapterContent,
    chapterData,
    chapterTitle,
}) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hour: Math.floor(content.assessment[0].timeLimit / 3600),
            minute: (content.assessment[0].timeLimit / 60) % 60,
            codingProblems:
                content.assessment[0].codingProblems == null
                    ? '0'
                    : content.assessment[0].codingProblems[0][
                          Object.keys(
                              content.assessment[0].codingProblems[0]
                          )[0]
                      ].toString(),
            passPercentage:
                content.assessment[0].passPercentage != null
                    ? content.assessment[0].passPercentage.toString()
                    : '0',
            copyPaste:
                content.assessment[0].copyPaste == null
                    ? false
                    : content.assessment[0].copyPaste,
            embeddedGoogleSearch:
                content.assessment[0].embeddedGoogleSearch == null
                    ? false
                    : content.assessment[0].embeddedGoogleSearch,
            tabChange:
                content.assessment[0].tabChange == null
                    ? false
                    : content.assessment[0].tabChange,
            screenRecord:
                content.assessment[0].screenRecord == null
                    ? false
                    : content.assessment[0].screenRecord,
            webCamera:
                content.assessment[0].webCamera == null
                    ? false
                    : content.assessment[0].webCamera,
        },
    })

    useEffect(() => {
        form.reset({
            hour: Math.floor(content.assessment[0].timeLimit / 3600),
            minute: (content.assessment[0].timeLimit / 60) % 60,
            codingProblems:
                content.assessment[0].codingProblems == null
                    ? '0'
                    : content.assessment[0].codingProblems[0][
                          Object.keys(
                              content.assessment[0].codingProblems[0]
                          )[0]
                      ].toString(),
            passPercentage:
                content.assessment[0].passPercentage != null
                    ? content.assessment[0].passPercentage.toString()
                    : '0',
            copyPaste:
                content.assessment[0].copyPaste == null
                    ? false
                    : content.assessment[0].copyPaste,
            embeddedGoogleSearch:
                content.assessment[0].embeddedGoogleSearch == null
                    ? false
                    : content.assessment[0].embeddedGoogleSearch,
            tabChange:
                content.assessment[0].tabChange == null
                    ? false
                    : content.assessment[0].tabChange,
            screenRecord:
                content.assessment[0].screenRecord == null
                    ? false
                    : content.assessment[0].screenRecord,
            webCamera:
                content.assessment[0].webCamera == null
                    ? false
                    : content.assessment[0].webCamera,
        })
    }, [content])

    const handleSubmit = async (values: any) => {
        const timeLimit = values.hour * 3600 + values.minute * 60

        const codingProblems = selectedCodingQuesIds.map((id: number) => ({
            [id]: Number(values.codingProblems),
        }))

        const data = {
            title: chapterTitle,
            description:
                'This assessment has 2 dsa problems,5 mcq and 3 theory questions',
            codingProblems,
            mcq: selectedQuizQuesIds,
            openEndedQuestions: selectedOpenEndedQuesIds,
            passPercentage: Number(values.passPercentage),
            timeLimit: Number(timeLimit),
            copyPaste: values.copyPaste,
            embeddedGoogleSearch: values.embeddedGoogleSearch,
            tabChange: values.tabChange,
            screenRecord: values.screenRecord,
            webCamera: values.webCamera,
        }

        try {
            await api.put(
                `Content/editAssessment/${content.assessment[0].id}`,
                data
            )
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
                    <h2 className="text-left mt-5 mb-3 font-bold">
                        Individual Question Score In Each Question
                    </h2>
                    <FormField
                        control={form.control}
                        name="codingProblems"
                        render={({ field }) => (
                            <FormItem className="flex items-center text-left">
                                <FormLabel className="my-3">
                                    Coding Problems
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        className="w-1/5 outline-none no-spinners ml-10 border-gray-300"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                    <div className="flex justify-end">
                        <Button type="submit" className="w-1/3 mt-5">
                            Save Settings
                        </Button>
                    </div>
                </form>
            </Form>
        </main>
    )
}

export default SettingsAssessment
