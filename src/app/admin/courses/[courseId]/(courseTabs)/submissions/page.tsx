'use client'
import React, { useCallback, useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowDownToLine, ChevronRight, Search } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

import { api } from '@/utils/axios.config'
import PracticeProblems from '../../_components/PraticeProblems'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'
import FormComponent from '../../_components/FormComponent'
import Assignments from './components/assignments'
import AssesmentSubmissionComponent from './components/AssesmentSubmission'

const Page = ({ params }: { params: any }) => {
    const [activeTab, setActiveTab] = useState('practice')
    const [submissions, setSubmissions] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)
    const [projectData, setProjectData] = useState<any>([])
    const [formData, setFormData] = useState<any>([])
    const [loading, setLoading] = useState(true)

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
    }

    const getSubmissions = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/submissionsOfPractiseProblems/${params.courseId}`
            )
            setSubmissions(res.data.trackingData)
            setTotalStudents(res.data.totalStudents)
        } catch (error) {
            // console.error('Error fetching submissions:', error)
            toast({
                title: 'Error',
                description: 'Error fetching submissions:',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }, [params.courseId])

    const getProjectsData = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/submissionsOfProjects/${params.courseId}`
            )
            setProjectData(res.data.data.bootcampModules)
            setTotalStudents(res.data.totalStudents)
        } catch (error) {
            // console.error('Error fetching assessments:', error)
            toast({
                title: 'Error',
                description: 'Error fetching assessments:',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }, [params.courseId])

    const getFormData = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/submissionsOfForms/${params.courseId}`
            )
            setFormData(res.data.trackingData)
            setTotalStudents(res.data.totalStudents)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error fetching form data:',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }, [params.courseId])

    useEffect(() => {
        if (params.courseId) {
            getSubmissions()
            getProjectsData()
            getFormData()
        }
    }, [getSubmissions, params.courseId, getProjectsData, getFormData])

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="">
            {loading ? (
                <div className="my-5 flex justify-center items-center">
                    <div className="absolute h-screen">
                        <div className="relative top-[75%]">
                            <Spinner className="text-secondary" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex justify-start overflow-x-auto overflow-y-hidden items-start gap-x-3">
                    <Button
                        onClick={() => handleTabChange('practice')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'practice'
                                ? 'bg-secondary  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Practice Problems
                    </Button>
                    <Button
                        onClick={() => handleTabChange('assessments')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'assessments'
                                ? 'bg-secondary  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Assessments
                    </Button>
                    <Button
                        onClick={() => handleTabChange('projects')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'projects'
                                ? 'bg-secondary  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Projects
                    </Button>
                    <Button
                        onClick={() => handleTabChange('form')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'form'
                                ? 'bg-secondary  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Form
                    </Button>
                    <Button
                        onClick={() => handleTabChange('assignments')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'assignments'
                                ? 'bg-secondary  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Assignments
                    </Button>
                </div>
            )}
            <div className="flex flex-col lg:flex-row justify-between">
                <div className="relative w-full mr-2">
                    <Input
                        placeholder="Search for Name, Email bkhnkj"
                        className="lg:w-1/3 w-full my-6 input-with-icon pl-8 "
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={20} />
                    </div>
                </div>
                {activeTab === 'assessments' && (
                    <Button>
                        <ArrowDownToLine size={20} className="mr-2" />
                        Download Full Report
                    </Button>
                )}
                {activeTab === 'projects' && (
                    <Button>
                        <ArrowDownToLine size={20} className="mr-2" />
                        Download Full Report
                    </Button>
                )}
            </div>
            <div className="w-full">
                {activeTab === 'practice' &&
                    (() => {
                        const allEmpty = submissions.every(
                            ({ moduleChapterData }) =>
                                moduleChapterData.length === 0
                        )

                        if (allEmpty) {
                            return (
                                <div className="text-left font-semibold my-5">
                                    No practice problems found.
                                </div>
                            )
                        } else {
                            return submissions.map(
                                ({ id, name, moduleChapterData }) =>
                                    moduleChapterData.length > 0 ? (
                                        <PracticeProblems
                                            key={id}
                                            courseId={params.courseId}
                                            name={name}
                                            totalStudents={totalStudents}
                                            submission={moduleChapterData}
                                            moduleId={id}
                                        />
                                    ) : null
                            )
                        }
                    })()}
                {activeTab === 'assessments' && (
                    <AssesmentSubmissionComponent courseId={params.courseId} />
                )}
                {activeTab === 'projects' &&
                    (projectData.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
                            {projectData.map((item: any) => {
                                return (
                                    <div
                                        key={item.id}
                                        className="lg:flex h-[120px] w-[400px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md p-4"
                                    >
                                        <div className="flex flex-col w-full ">
                                            <h1 className="font-semibold text-start">
                                                {item.projectData[0].title}
                                            </h1>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-yellow h-2 w-2 rounded-full" />
                                                <p className="text-start">
                                                    {
                                                        item.projectData[0]
                                                            .submitStudents
                                                    }
                                                    /{totalStudents} Submission
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-end ">
                                            <Link
                                                href={`/admin/courses/${params.courseId}/submissionProjects/${item.projectData[0].id}`}
                                            >
                                                <Button
                                                    variant={'ghost'}
                                                    className="text-secondary text-md"
                                                >
                                                    View Submission{' '}
                                                    <ChevronRight
                                                        className="text-secondary"
                                                        size={17}
                                                    />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-left font-semibold">
                            No projects found
                        </div>
                    ))}
                {activeTab === 'form' && (
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
                        {formData?.map((item: any) => {
                            return item.moduleChapterData.map(
                                (data: any, index: any) => (
                                    <FormComponent
                                        key={index}
                                        moduleName={item.name}
                                        moduleId={item.id}
                                        bootcampId={item.bootcampId}
                                        data={data}
                                        totalStudents={totalStudents}
                                    />
                                )
                            )
                        })}
                    </div>
                )}
                {activeTab === 'assignments' && (
                    <Assignments courseId={params.courseId} />
                )}
            </div>
        </div>
    )
}

export default Page
