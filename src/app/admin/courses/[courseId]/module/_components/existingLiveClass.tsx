import React, { useEffect, useState } from 'react'
import { DataTable } from '@/app/_components/datatable/data-table'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { api } from '@/utils/axios.config'
import { OFFSET, POSITION } from '@/utils/constant'
import { useParams, useRouter } from 'next/navigation'
import { existingClassColumns } from './existingLiveClassesColumn'
import { getIsRowSelected } from '@/store/store'
import { Table } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"

import {ExistingLiveClassProps} from "@/app/admin/courses/[courseId]/module/_components/ModuleComponentType"
const ExistingLiveClass = ({ fetchingChapters, onClose }: ExistingLiveClassProps) => {
    const [position, setPosition] = useState(POSITION)
    const [selectedRows, setSelectedRows] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const param = useParams()
    const router = useRouter()
    const [pages, setPages] = useState(0)
    const [lastPage, setLastPage] = useState(0)
    const [offset, setOffset] = useState<number>(OFFSET)
    const [currentPage, setCurrentPage] = useState(1)
    const [classes, setClasses] = useState([])

    // Main fetch function
    async function getAllClasses() {
        if (!param?.courseId) return

        try {
            const res = await api.get(
                `/classes/bootcamp/${param.courseId}/classes?limit=${position}&offset=${offset}`
            )
            setClasses(res.data.data.classes)
        } catch (err) {
            console.error('Failed to fetch classes', err)
        }
    }
    useEffect(() => {
        getAllClasses()
    }, [offset, position, param?.courseId])
    const sesssionIds = selectedRows.map((rows) => rows.id)
    async function addLiveClassesAsaChapter () {
        const transformedBody = {
            sessionIds : sesssionIds,
            moduleId: +param.moduleId
        }
      await api.post(`/classes/addliveClassesAsChapters` , transformedBody).then((res)=> {
        toast.success({
            title: 'Success',
            description: 'Added Classes as a Chapter'
        })
        fetchingChapters()

      }).catch((error)=>{
        toast.error({
            title: 'Error',
            description: 'Classes Not added'
        })
      })
    }

    async function handleCreateChapters() {
        await addLiveClassesAsaChapter()
        
        const chaptersRes = await api.get(`/Content/allChaptersOfModule/${param.moduleId}`)
        const chapters = chaptersRes?.data?.chapterWithTopic || []
        
        const latestChapter = chapters[chapters.length - 1]
        if (latestChapter) {
            router.push(`/admin/courses/${param.courseId}/module/${param.moduleId}/chapters/${latestChapter.chapterId}`)
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
                                <Button onClick={() => setOpen(true)} className="bg-success-dark opacity-75">
                                    Create Chapters
                                </Button>
                            )
                        }
                    />
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Are you sure you want to create chapters from selected classes?
                            </DialogTitle>
                        </DialogHeader>
                        <DialogFooter>
                            <Button className='text-gray-600 border border-input bg-background hover:border-[rgb(81,134,114)]' onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button className='bg-[rgb(81,134,114)]' onClick={handleCreateChapters}>
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
