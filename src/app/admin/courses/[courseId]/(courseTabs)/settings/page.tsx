'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

import api from '@/utils/axios.config'
import DeleteConfirmationModal from '../../_components/deleteModal'
import { getCourseData } from '@/store/store'
import ToggleSwitch from '../../_components/SwitchSettings'
const Page = ({ params }: { params: any }) => {
    // misc
    const router = useRouter()
    const { courseData } = getCourseData()
    // state and variables
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
    const [bootcampSettings, setBootcampSettings] = useState('')
    const [isChecked, setIsChecked] = useState<boolean>(
        bootcampSettings === 'Public' ? true : false
    )

    // async
    const fetchBootCampSettings = useCallback(async () => {
        try {
            const response = await api.get(
                `/bootcamp/bootcampSetting/${params.courseId}`
            )
            const type = response.data.bootcampSetting[0].type
            setBootcampSettings(type)
            setIsChecked(type === 'Public')
        } catch (error) {
            console.error('Error fetching boot camp settings:', error)
        }
    }, [params.courseId])

    const handleToggle = async (checked: boolean) => {
        const type = checked ? 'Public' : 'Private'
        const convertedData = {
            type,
        }
        // console.log(convertedData)
        await api
            .put(`/bootcamp/bootcampSetting/${params.courseId}`, convertedData)
            .then((res) => {
                toast({
                    title: res.data.status,
                    description: `Bootcamp type updated to ${type}`,
                    className: 'text-start capitalize',
                })
            })
    }
    const handleDelete = async () => {
        try {
            await api.delete(`/bootcamp/${courseData?.id}`).then((res) => {
                toast({
                    title: res.data.status,
                    description: res.data.message,
                    className: 'text-start capitalize',
                })
            })
            router.push('/admin/courses')
        } catch (error: any) {
            toast({
                title: error.data.status,
                description: error.data.message,
                className: 'text-start capitalize',
            })
            console.error('Error deleting:', error)
        }
        setDeleteModalOpen(false)
    }

    useEffect(() => {
        fetchBootCampSettings()
    }, [params.courseId, fetchBootCampSettings])

    return (
        <div>
            <div className=" w-full text-start mb-5">
                <div>
                    <h1 className="text-lg font-semibold">Course Type</h1>
                    <div className="flex mt-2 flex-col gap-y-3 items-start">
                        <div className="flex items-center  w-1/2 space-x-4  ">
                            {/* <SwitchForm bootcampId={params.courseId} /> */}
                            <ToggleSwitch
                                // isChecked={isChecked}
                                onToggle={handleToggle}
                                bootcampId={params.courseId}
                            />{' '}
                        </div>
                    </div>
                </div>

                <h1 className="text-lg font-semibold">Course Status</h1>
                <p>
                    This course has not been published yet. You will able to
                    unpublish it at any time if new enrollments have to be
                    stopped
                </p>
            </div>
            <div className="w-full text-start my-5">
                <div className="mb-3 text-start">
                    <h1 className="text-lg font-semibold">
                        Permanant Deletion
                    </h1>
                    <p>
                        Courses can only be deleted if they didn’t have any
                        enrollment since the start
                    </p>
                </div>
                <Button
                    variant={'destructive'}
                    onClick={() => setDeleteModalOpen(true)}
                >
                    Delete Course
                </Button>
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    modalText="Are you sure you want to delete this Bootcamp?"
                    buttonText="Delete Course"
                    input={false}
                    modalText2=""
                    instructorInfo={{}}
                />
            </div>
        </div>
    )
}

export default Page
