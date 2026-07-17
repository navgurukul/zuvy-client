import React, { useState } from 'react'
import { DataTable } from '@/app/_components/datatable/data-table'
import { useParams, useRouter } from 'next/navigation'
import { existingClassColumns } from './existingLiveClassesColumn'
import { getUser } from '@/store/store'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { useModuleChapters } from '@/hooks/useModuleChapters'
import { useBootcampClasses } from '@/hooks/useBootcampClasses'
import { useAddLiveClassesAsChapters } from '@/hooks/useAddLiveClassesAsChapters'
import { ExistingLiveClassProps } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/module/_components/ModuleComponentType'

const ExistingLiveClass = ({
    fetchingChapters,
    onClose,
}: ExistingLiveClassProps) => {
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const orgId = Number(organizationId) || user?.orgId
    const [selectedRows, setSelectedRows] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const param = useParams()
    const router = useRouter()

    const { classes } = useBootcampClasses(param.courseId)
    const { addLiveClassesAsChapters } = useAddLiveClassesAsChapters()
    const { chapters, refetch: refetchChapters } = useModuleChapters(param.moduleId as string)

    const sessionIds = selectedRows.map((row) => row.id)

    async function handleCreateChapters() {
        try {
            await addLiveClassesAsChapters({
                sessionIds,
                moduleId: Number(param.moduleId),
            })
            toast.success({
                title: 'Success',
                description: 'Added Classes as a Chapter',
            })
            fetchingChapters()
        } catch {
            toast.error({
                title: 'Error',
                description: 'Classes Not added',
            })
            setOpen(false)
            return
        }

        await refetchChapters()
        const latestChapter = chapters[chapters.length - 1]
        if (latestChapter) {
            router.push(
                `/${userRole}/organizations/${orgId}/courses/${param.courseId}/module/${param.moduleId}/chapters/${latestChapter.chapterId}`
            )
        }
        setOpen(false)
        onClose()
    }

    return (
        <div className="h-full">
            <div className="h-[32rem]">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DataTable
                        setSelectedRows={setSelectedRows}
                        data={classes}
                        columns={existingClassColumns}
                        customTopBar={
                            selectedRows.length > 0 && (
                                <Button
                                    onClick={() => setOpen(true)}
                                    className="bg-success-dark opacity-75"
                                >
                                    Create Chapters
                                </Button>
                            )
                        }
                    />
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Are you sure you want to create chapters from
                                selected classes?
                            </DialogTitle>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                className="text-gray-600 border border-input bg-background hover:border-[rgb(81,134,114)]"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-[rgb(81,134,114)]"
                                onClick={handleCreateChapters}
                            >
                                OK
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default ExistingLiveClass
