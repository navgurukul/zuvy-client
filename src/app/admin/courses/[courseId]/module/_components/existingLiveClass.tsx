import React, { useEffect, useState } from 'react'
import { DataTable } from '@/app/_components/datatable/data-table'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { api } from '@/utils/axios.config'
import { OFFSET, POSITION } from '@/utils/constant'
import { useParams } from 'next/navigation'
import { existingClassColumns } from './existingLiveClassesColumn'
import { getIsRowSelected } from '@/store/store'
import { Table } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

type CreateSessionDialogProps = {
    fetchingChapters: () => void;
    // or whatever the correct type is
  };
const ExistingLiveClass = ({fetchingChapters}: CreateSessionDialogProps) => {


    const [position, setPosition] = useState(POSITION)
    const [selectedRows, setSelectedRows] = useState<any[]>([])

    const param = useParams()
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

    return (
        <div className="h-full">
            <div className="h-[32rem]">
                {selectedRows.length > 0 && (
                    <div className='flex ' >
                        <Button onClick={addLiveClassesAsaChapter} className="">Create Chapters</Button>
                    </div>
                )}

                <DataTable
                    setSelectedRows={setSelectedRows}
                    data={classes}
                    columns={existingClassColumns}
                />
                <DataTablePagination
                    totalStudents={classes?.length}
                    position={position}
                    setPosition={setPosition}
                    pages={pages}
                    lastPage={lastPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    fetchStudentData={getAllClasses}
                    setOffset={setOffset}
                />
            </div>
        </div>
    )
}

export default ExistingLiveClass
