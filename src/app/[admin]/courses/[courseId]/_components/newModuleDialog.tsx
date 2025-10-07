'use client'

import React, { useEffect } from 'react'

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
import {
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { newModuleDialogProps } from '@/app/[admin]/courses/[courseId]/_components/adminCourseCourseIdComponentType'

const moduleSchema = z.object({
    moduleType: z.enum(['learning-material', 'project']),
    name: z
        .string()
        .min(2, { message: 'Module Name must be at least 2 characters.' }),
    description: z.string().min(2, {
        message: 'Module Description must be at least 2 characters.',
    }),
    months: z.number().min(0, { message: 'Months Should not be empty.' }),
    weeks: z.number().min(0, { message: 'Weeks Should not be empty.' }),
    days: z.number().min(0, { message: 'Days Should not be empty.' }),
})

const NewModuleDialog: React.FC<newModuleDialogProps> = ({
    moduleData,
    timeData,
    handleModuleChange,
    createModule,
    handleTimeAllotedChange,
    handleTypeChange,
    typeId,
    isOpen,
    setIsLoading,
    isLoading,
}) => {
    const form = useForm<z.infer<typeof moduleSchema>>({
        resolver: zodResolver(moduleSchema),
        defaultValues: {
            moduleType: 'learning-material',
            name: '',
            description: '',
            months: 0,
            weeks: 0,
            days: 0,
        },
    })

    const onSubmit: any = (values: z.infer<typeof moduleSchema>) => {
        setIsLoading(true)
        createModule()
    }

    // FIXED: Dialog close pe form reset
    useEffect(() => {
        if (isOpen) {
            const event = {
                target: {
                    value: 'learning-material',
                },
            } as React.ChangeEvent<HTMLInputElement>
            handleTypeChange(event)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) {
            form.reset({
                moduleType: 'learning-material',
                name: '',
                description: '',
                months: 0,
                weeks: 0,
                days: 0,
            })
        }
    }, [isOpen, form])

    // FIXED: Proper synchronization between parent state and form state
    useEffect(() => {
        // Update form values when parent state changes
        const currentModuleType = typeId === 1 ? 'learning-material' : 'project'

        form.setValue('moduleType', currentModuleType)
        form.setValue('name', moduleData.name)
        form.setValue('description', moduleData.description)

        // Handle time data properly
        form.setValue('months', timeData.months > -1 ? timeData.months : 0)
        form.setValue('weeks', timeData.weeks > -1 ? timeData.weeks : 0)
        form.setValue('days', timeData.days > -1 ? timeData.days : 0)
    }, [moduleData, timeData, typeId, form, isOpen]) // Added isOpen to dependencies

    // FIXED: Enhanced handleTypeChange wrapper
    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value as 'learning-material' | 'project'

        // Update form state
        form.setValue('moduleType', value)

        // Update parent state
        handleTypeChange(e)

        // Force form re-render
        form.trigger('moduleType')
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col gap-4 "
            >
                <DialogContent className="text-gray-600">
                    <DialogHeader>
                        <DialogTitle>New Module</DialogTitle>
                        <div className="main_container flex items-center align-middle text-center">
                            <div className="flex items-center">
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="moduleType"
                                        render={({ field }) => (
                                            <FormItem className="text-left">
                                                <FormControl>
                                                    <Input
                                                        type="radio"
                                                        id="learning-material"
                                                        className="size-4"
                                                        value="learning-material"
                                                        checked={
                                                            field.value ===
                                                            'learning-material'
                                                        } // FIXED: Use form field value
                                                        onChange={
                                                            handleRadioChange
                                                        } // FIXED: Use wrapper function
                                                        name="moduleType"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="mt-2">
                                    <Label
                                        className="mx-2 "
                                        htmlFor="learning-material"
                                    >
                                        Learning Material
                                    </Label>
                                </div>
                            </div>

                            <div className="flex items-center ">
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="moduleType"
                                        render={({ field }) => (
                                            <FormItem className="text-left">
                                                <FormControl>
                                                    <Input
                                                        type="radio"
                                                        id="project"
                                                        className="size-4"
                                                        value="project"
                                                        checked={
                                                            field.value ===
                                                            'project'
                                                        } // FIXED: Use form field value
                                                        onChange={
                                                            handleRadioChange
                                                        } // FIXED: Use wrapper function
                                                        name="moduleType"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="mt-2">
                                    <Label className="mx-2" htmlFor="project">
                                        Project
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="py-4">
                            <div>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="text-left">
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder={
                                                        typeId === 2
                                                            ? 'Project Name'
                                                            : 'Module Name'
                                                    }
                                                    value={field.value} // FIXED: Use form field value
                                                    onChange={(e) => {
                                                        field.onChange(e) // Update form state
                                                        handleModuleChange(e) // Update parent state
                                                    }}
                                                    name="name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="py-4">
                            <Label htmlFor="desc">
                                {typeId === 2
                                    ? 'Project Description'
                                    : 'Module Description'}
                            </Label>

                            <div>
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="text-left">
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    id="desc"
                                                    placeholder={
                                                        typeId === 2
                                                            ? 'Project Description'
                                                            : 'Module Description'
                                                    }
                                                    value={field.value} // FIXED: Use form field value
                                                    onChange={(e) => {
                                                        field.onChange(e) // Update form state
                                                        handleModuleChange(e) // Update parent state
                                                    }}
                                                    name="description"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="py-4">
                            <Label>Time Alotted:</Label>
                            <div className="flex gap-2">
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="months"
                                        render={({ field }) => (
                                            <FormItem className="text-left">
                                                <FormControl>
                                                    <Input
                                                        className="no-spinners focus-visible:ring-muted"
                                                        type="number"
                                                        id="months"
                                                        placeholder="Months"
                                                        value={
                                                            field.value || ''
                                                        } // FIXED: Use form field value
                                                        onChange={(e) => {
                                                            const value =
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            field.onChange(
                                                                value
                                                            ) // Update form state
                                                            handleTimeAllotedChange(
                                                                e
                                                            ) // Update parent state
                                                        }}
                                                        name="months"
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key === '-' ||
                                                                e.key === 'e'
                                                            )
                                                                e.preventDefault()
                                                        }}
                                                        min={0}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div>
                                    <FormField
                                        control={form.control}
                                        name="weeks"
                                        render={({ field }) => (
                                            <FormItem className="text-left">
                                                <FormControl>
                                                    <Input
                                                        className="no-spinners focus-visible:ring-muted"
                                                        type="number"
                                                        id="weeks"
                                                        placeholder="Weeks"
                                                        value={
                                                            field.value || ''
                                                        } // FIXED: Use form field value
                                                        onChange={(e) => {
                                                            const value =
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            field.onChange(
                                                                value
                                                            ) // Update form state
                                                            handleTimeAllotedChange(
                                                                e
                                                            ) // Update parent state
                                                        }}
                                                        name="weeks"
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key === '-' ||
                                                                e.key === 'e'
                                                            )
                                                                e.preventDefault()
                                                        }}
                                                        min={0}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div>
                                    <FormField
                                        control={form.control}
                                        name="days"
                                        render={({ field }) => (
                                            <FormItem className="text-left">
                                                <FormControl>
                                                    <Input
                                                        className="no-spinners focus-visible:ring-muted"
                                                        type="number"
                                                        id="days"
                                                        placeholder="Days"
                                                        value={
                                                            field.value || ''
                                                        } // FIXED: Use form field value
                                                        onChange={(e) => {
                                                            const value =
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                ) || 0
                                                            field.onChange(
                                                                value
                                                            ) // Update form state
                                                            handleTimeAllotedChange(
                                                                e
                                                            ) // Update parent state
                                                        }}
                                                        name="days"
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key === '-' ||
                                                                e.key === 'e'
                                                            )
                                                                e.preventDefault()
                                                        }}
                                                        min={0}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end">
                        <DialogClose asChild>
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                className="bg-[rgb(81,134,114)]"
                                disabled={isLoading}
                            >
                                Create Module
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Form>
    )
}

export default NewModuleDialog
