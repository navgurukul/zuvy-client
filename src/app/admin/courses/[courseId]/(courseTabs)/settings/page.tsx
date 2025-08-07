'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

import { api } from '@/utils/axios.config'
import DeleteConfirmationModal from '../../_components/deleteModal'
import { getCourseData } from '@/store/store'
import ToggleSwitch from '@/app/admin/courses/[courseId]/_components/SwitchSettings'
import { Spinner } from '@/components/ui/spinner'
import ModulesLockToggleSwitch from '@/app/admin/courses/[courseId]/_components/ModulesLockToggleSwitch'
import Image from 'next/image'
import { useCourseExistenceCheck } from '@/hooks/useCourseExistenceCheck'

const Page = ({ params }: { params: any }) => {
    // misc
    const router = useRouter()
    // const { isCourseDeleted, loadingCourseCheck } = useCourseExistenceCheck(params.courseId)
    const [loading, setLoading] = useState(true)
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
        await api
            .put(`/bootcamp/bootcampSetting/${params.courseId}`, convertedData)
            .then((res) => {
                toast.success({
                    title: res.data.status,
                    description: `Bootcamp type updated to ${type}`,
                })
            })
            .catch((error) => {
                toast.error({
                    title: error.data.status,
                    description: error.data.message,
                })
            })
    }
    const handleDelete = async () => {
        try {
            await api.delete(`/bootcamp/${courseData?.id}`).then((res) => {
                toast.success({
                    title: res.data.status,
                    description: res.data.message,
                })
            })
            router.push('/admin/courses')
        } catch (error: any) {
            toast.error({
                title: error.data.status,
                description: error.data.message,
            })
        }
        setDeleteModalOpen(false)
    }

    useEffect(() => {
        fetchBootCampSettings()
    }, [params.courseId, fetchBootCampSettings])

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 700)

        return () => clearTimeout(timer)
    }, [])

    //   if (loadingCourseCheck) {
    //       return (
    //         <div className="flex justify-center items-center h-full mt-20">
    //           <Spinner className="text-secondary" />
    //         </div>
    //       )
    //     }
        
    //     if (isCourseDeleted) {
    //       return (
    //         <div className="flex flex-col justify-center items-center h-full mt-20">
    //           <Image src="/images/undraw_select-option_6wly.svg" width={350} height={350} alt="Deleted" />
    //           <p className="text-lg text-red-600 mt-4">This course has been deleted !</p>
    //           <Button onClick={() => router.push('/admin/courses')} className="mt-6 bg-secondary">
    //             Back to Courses
    //           </Button>
    //         </div>
    //       )
    //     }
    
    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <div className="my-5 flex justify-center items-center">
                        <div className="absolute h-screen">
                            <div className="relative top-[25%]">
                                <Spinner className="text-[rgb(81,134,114)]" />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-gray-600">
                    <div className=" w-full text-start mb-5">
                        <div>
                            <h1 className="text-lg font-semibold">
                                Course Type
                            </h1>
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

                        <h1 className="text-lg font-semibold mt-5">Course Status</h1>
                        <p>
                            This course has not been published yet. You will
                            able to unpublish it at any time if new enrollments
                            have to be stopped
                        </p>
                    </div>
                    <h1 className="text-lg font-semibold mt-5 text-left">Modules Lock Status</h1>
                    <ModulesLockToggleSwitch bootcampId={String(params.courseId)} onToggle={function (isChecked: boolean): void {
                            throw new Error('Function not implemented.')
                        } }/>

                    <div className="w-full text-start my-5">
                        <div className="mb-3 text-start">
                            <h1 className="text-lg font-semibold">
                                Permanant Deletion
                            </h1>
                            <p>
                                Courses can only be deleted if they didn’t have
                                any enrollment since the start
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
            )}
        </>
    )
}

export default Page
