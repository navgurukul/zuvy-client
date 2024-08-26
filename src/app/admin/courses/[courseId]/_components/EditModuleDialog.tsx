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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface editModuleDialogProps {
    moduleData: {
        name: string
        description: string
    }
    timeData: {
        days: number
        months: number
        weeks: number
    }
    editMode: any
    handleModuleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    editModule: () => void
    createModule: () => void
    handleTimeAllotedChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void
    handleTypeChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    typeId: number
}

const moduleSchema = z.object({
    moduleType: z.enum(['learning-material', 'project']),
    name: z.string().min(2, { message: 'Module Name must be at least 2 characters.' }),
    description: z.string().min(2, { message: 'Module Description must be at least 2 characters.' }),
    months: z.number().min(0, { message: 'Months Should not be empty.' }),
    weeks: z.number().min(0, { message: 'Weeks Should not be empty.' }),
    days: z.number().min(0, { message: 'Days Should not be empty.' })
})

const EditModuleDialog: React.FC<editModuleDialogProps> = ({
    editMode,
    moduleData,
    timeData,
    handleModuleChange,
    editModule,
    createModule,
    handleTimeAllotedChange,
    handleTypeChange,
    typeId,
}) => {
    const form = useForm<z.infer<typeof moduleSchema>>({
        resolver: zodResolver(moduleSchema),
        defaultValues: {
            moduleType: 'learning-material',
            name: moduleData.name,
            description: moduleData.description,
            months: timeData.months,
            weeks: timeData.weeks,
            days: timeData.days
        }

    })

    const onSubmit: any = (values: z.infer<typeof moduleSchema>) => {
        editModule()
    }

    useEffect(() => {
        form.setValue('moduleType', typeId === 2 ? 'project' : 'learning-material')  // Ensure moduleType reflects typeId
        form.setValue('name', moduleData.name)
        form.setValue('description', moduleData.description)
        form.setValue('months', timeData.months)
        form.setValue('weeks', timeData.weeks)
        form.setValue('days', timeData.days)
    }, [moduleData, timeData, typeId, form])

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col gap-4 "
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Edit Module
                        </DialogTitle>
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
                                                        onChange={handleTypeChange}
                                                        name="moduleType"
                                                        disabled
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <Label className="m-2 " htmlFor="learning-material">
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
                                                        onChange={handleTypeChange}
                                                        name="moduleType"
                                                        disabled
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
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        handleModuleChange(e)
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
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        handleModuleChange(e)
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
                                                        value={field.value}  // Use field value
                                                        onChange={(e) => {
                                                            field.onChange(e) // Sync field state
                                                            handleTimeAllotedChange(e) // External change handler
                                                        }}
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
                                                        value={field.value}  // Use field value
                                                        onChange={(e) => {
                                                            field.onChange(e) // Sync field state
                                                            handleTimeAllotedChange(e) // External change handler
                                                        }}
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
                                                        value={field.value}  // Use field value
                                                        onChange={(e) => {
                                                            field.onChange(e) // Sync field state
                                                            handleTimeAllotedChange(e) // External change handler
                                                        }}
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
                                Edit Module
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Form>
    )
}

export default EditModuleDialog
