import React from 'react'

import { Button } from '@/components/ui/button'
import {
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

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

const NewModuleDialog: React.FC<newModuleDialogProps> = ({
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
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {editMode ? 'Edit Module' : 'New Module'}
                </DialogTitle>
                <div className="main_container flex items-center align-middle text-center">
                    <div className="flex items-center">
                        <div>
                            <Input
                                type="radio"
                                id="learning-material"
                                name="module-type"
                                className="size-4"
                                value="learning-material"
                                checked={typeId === 1}
                                onChange={handleTypeChange}
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
                            <Input
                                type="radio"
                                id="Project"
                                name="module-type"
                                className="size-4"
                                value="project"
                                checked={typeId === 2}
                                onChange={handleTypeChange}
                            />
                        </div>
                        <div>
                            <Label className="mx-2   " htmlFor="Project">
                                Project
                            </Label>
                        </div>
                    </div>
                </div>

                <div className="py-4">
                    <Label htmlFor="name">
                        {typeId === 2 ? 'Project Name' : 'Module Name'}
                    </Label>
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        placeholder={
                            typeId === 2 ? 'Project Name' : 'Module Name'
                        }
                        value={moduleData?.name}
                        onChange={handleModuleChange}
                    />
                </div>
                <div className="py-4">
                    <Label htmlFor="desc">
                        {typeId === 2
                            ? 'Project Description'
                            : 'Module Description'}
                    </Label>
                    <Input
                        type="text"
                        id="desc"
                        name="description"
                        placeholder={
                            typeId === 2
                                ? 'Project Description'
                                : 'Module Description'
                        }
                        value={moduleData?.description}
                        onChange={handleModuleChange}
                    />
                </div>
                <div className="py-4">
                    <Label>Time Alotted:</Label>
                    <div className="flex gap-2">
                        <Input
                            className="no-spinners focus-visible:ring-muted"
                            type="number"
                            id="months"
                            name="months"
                            placeholder="Months"
                            value={
                                timeData?.months > -1
                                    ? timeData?.months
                                    : undefined
                            }
                            onChange={handleTimeAllotedChange}
                        />
                        <Input
                            className="no-spinners focus-visible:ring-muted"
                            type="number"
                            id="weeks"
                            name="weeks"
                            placeholder="Weeks"
                            value={
                                timeData?.weeks > -1
                                    ? timeData?.weeks
                                    : undefined
                            }
                            onChange={handleTimeAllotedChange}
                        />
                        <Input
                            className="no-spinners focus-visible:ring-muted"
                            type="number"
                            id="days"
                            name="days"
                            placeholder="Days"
                            value={
                                timeData?.days > -1 ? timeData?.days : undefined
                            }
                            onChange={handleTimeAllotedChange}
                        />
                    </div>
                </div>
            </DialogHeader>
            <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                    {editMode ? (
                        <Button onClick={() => editModule()}>
                            Edit Module
                        </Button>
                    ) : (
                        <Button onClick={() => createModule()}>
                            Create Module
                        </Button>
                    )}
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default NewModuleDialog
