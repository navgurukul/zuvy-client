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
import { editModuleDialogProps } from '@/app/[admin]/[organizationId]/courses/[courseId]/_components/adminCourseCourseIdComponentType'

const moduleSchema = z.object({
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

const EditModuleDialog: React.FC<editModuleDialogProps> = ({
    editMode,
    moduleData,
    timeData,
    handleModuleChange,
    editModule,
    createModule,
    handleTimeAllotedChange,
    typeId,
}) => {
    const form = useForm<z.infer<typeof moduleSchema>>({
        resolver: zodResolver(moduleSchema),
        defaultValues: {
            name: moduleData.name,
            description: moduleData.description,
            months: timeData.months,
            weeks: timeData.weeks,
            days: timeData.days,
        },
    })

    const onSubmit: any = (values: z.infer<typeof moduleSchema>) => {
        editModule()
    }

    useEffect(() => {
        form.reset({
            name: moduleData.name,
            description: moduleData.description,
            months: timeData.months,
            weeks: timeData.weeks,
            days: timeData.days,
        })
    }, [moduleData, timeData, form])

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col gap-4 "
            >
                <DialogContent className="text-foreground">
                    <DialogHeader>
                        <DialogTitle>Edit Module</DialogTitle>
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
                            <Label>Time Allotted:</Label>
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
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            field.onChange(e)
                                                            handleTimeAllotedChange(
                                                                e
                                                            )
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
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            field.onChange(e)
                                                            handleTimeAllotedChange(
                                                                e
                                                            )
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
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            field.onChange(e)
                                                            handleTimeAllotedChange(
                                                                e
                                                            )
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
                            >
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
