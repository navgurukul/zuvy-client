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

interface newModuleDialogProps {
    moduleData: {
        name: string
        description: string
    }
    timeData: {
        days: number
        months: number
        weeks: number
    }
    handleModuleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    createModule: () => void
    handleTimeAllotedChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void
    handleTypeChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    typeId: number
    isOpen: any
}

const moduleSchema = z.object({
    moduleType: z.enum(['learning-material', 'project']),
    name: z
        .string()
        .min(2, { message: 'Module Name must be at least 2 characters.' }),
    description: z
        .string()
        .min(2, {
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
}) => {
    const form = useForm<z.infer<typeof moduleSchema>>({
        resolver: zodResolver(moduleSchema),
        defaultValues: {
            moduleType: 'learning-material',
            name: moduleData.name,
            description: moduleData.description,
            months: 0,
            weeks: 0,
        },
    })

    const onSubmit: any = (values: z.infer<typeof moduleSchema>) => {
        createModule()
    }

    useEffect(() => {
        if (!isOpen) {
            form.reset() // Reset form state and errors when the dialog is closed
        }
    }, [isOpen, form])

    useEffect(() => {
        // Check if typeId is not -1, which means it's a new form
        if (typeId === -1) {
            form.reset({
                moduleType: 'learning-material',
                name: '',
                description: '',
                months: 0,
                weeks: 0,
                days: 0,
            })
        } else {
            form.setValue('moduleType', 'learning-material')
            form.setValue('name', moduleData.name)
            form.setValue('description', moduleData.description)
            form.setValue('months', timeData.months)
            form.setValue('weeks', timeData.weeks)
            form.setValue('days', timeData.days)
        }
    }, [moduleData, timeData, typeId, form])

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col gap-4 "
            >
                <DialogContent>
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
                                                        checked={typeId === 1}
                                                        onChange={
                                                            handleTypeChange
                                                        }
                                                        name="moduleType"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <Label
                                        className="m-2 "
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
                                                        checked={typeId === 2}
                                                        onChange={
                                                            handleTypeChange
                                                        }
                                                        name="moduleType"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div>
                                    <Label className="mx-2 " htmlFor="project">
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
                                                    onChange={
                                                        handleModuleChange
                                                    }
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
                                                    onChange={(e) =>
                                                        handleModuleChange(e)
                                                    }
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
                                                            timeData?.months >
                                                            -1
                                                                ? timeData?.months
                                                                : undefined
                                                        }
                                                        onChange={
                                                            handleTimeAllotedChange
                                                        }
                                                        name="months"
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
                                                            timeData?.weeks > -1
                                                                ? timeData?.weeks
                                                                : undefined
                                                        }
                                                        onChange={
                                                            handleTimeAllotedChange
                                                        }
                                                        name="weeks"
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
                                                            timeData?.days > -1
                                                                ? timeData?.days
                                                                : undefined
                                                        }
                                                        onChange={
                                                            handleTimeAllotedChange
                                                        }
                                                        name="days"
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
                            <Button onClick={form.handleSubmit(onSubmit)}>
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
