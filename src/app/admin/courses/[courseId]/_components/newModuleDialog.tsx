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
}

const NewModuleDialog: React.FC<newModuleDialogProps> = ({
    moduleData,
    timeData,
    handleModuleChange,
    createModule,
    handleTimeAllotedChange,
}) => {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New Module</DialogTitle>
                <div className="py-4">
                    <Label htmlFor="name">Module Name:</Label>
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter Module Name"
                        value={moduleData?.name}
                        onChange={handleModuleChange}
                    />
                </div>
                <div className="py-4">
                    <Label htmlFor="desc">Module Description:</Label>
                    <Input
                        type="text"
                        id="desc"
                        name="description"
                        placeholder="Enter Module Description"
                        value={moduleData?.description}
                        onChange={handleModuleChange}
                    />
                </div>
                <div className="py-4">
                    <Label>Time Alotted:</Label>
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            id="months"
                            name="months"
                            placeholder="Months"
                            value={timeData?.months}
                            onChange={handleTimeAllotedChange}
                        />
                        <Input
                            type="number"
                            id="weeks"
                            name="weeks"
                            placeholder="Weeks"
                            value={timeData?.weeks}
                            onChange={handleTimeAllotedChange}
                        />
                        <Input
                            type="number"
                            id="days"
                            name="days"
                            placeholder="Days"
                            value={timeData?.days}
                            onChange={handleTimeAllotedChange}
                        />
                    </div>
                </div>
            </DialogHeader>
            <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                    <Button
                        onClick={() => createModule()}
                        // className={styles.createCourseBtnDialog}
                    >
                        Create Course
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default NewModuleDialog
