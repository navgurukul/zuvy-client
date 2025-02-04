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
import PraticeProblemsComponent from './components/PraticeProblemsComponent'
import useDebounce from '@/hooks/useDebounce'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import VideoSubmission from './components/VideoSubmission'
import Image from 'next/image'

const Page = ({ params }: { params: any }) => {
    const [activeTab, setActiveTab] = useState('practice')
    const [submissions, setSubmissions] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)
    // const [projectData, setProjectData] = useState<any>([])
    const [bootcampModules, setBootcampModules] = useState<any>([])
    const [formData, setFormData] = useState<any>([])
    const [loading, setLoading] = useState(true)
    const [searchAssessment, setsearchAssessment] = useState<string>('')
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 1000)

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        localStorage.setItem('tab', tab)
    }

    useEffect(() => {
        const lastUpdatedTab = localStorage.getItem('tab')
        if (lastUpdatedTab) {
            setActiveTab(lastUpdatedTab)
        }
    }, [])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const getProjectsData = useCallback(async () => {
        try {
            // const res = await api.get(
            //     `/submission/submissionsOfProjects/${params.courseId}`
            // )
            let baseUrl = `/submission/submissionsOfProjects/${params.courseId}`
            if (debouncedSearch && activeTab === 'projects') {
                baseUrl += `?searchProject=${encodeURIComponent(
                    debouncedSearch
                )}`
            }

            const res = await api.get(baseUrl)

            setBootcampModules(res.data.data.bootcampModules)

            setTotalStudents(res.data.totalStudents)
        } catch (error) {
            console.error('Error fetching assessments:', error)
        }
    }, [params.courseId, debouncedSearch])

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
            getProjectsData()
            getFormData()
        }
    }, [params.courseId, getProjectsData, getFormData, debouncedSearch])

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
                    <Button
                        onClick={() => handleTabChange('video')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'video'
                                ? 'bg-secondary  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Video
                    </Button>
                </div>
            )}
            <div className="flex flex-col lg:flex-row justify-between">
                <div className="relative w-full mr-2">
                    <Input
                        placeholder={`${
                            activeTab === 'assessments'
                                ? 'Search for Assessment By Name'
                                : 'Search '
                        }`}
                        className="lg:w-1/3 w-full my-6 input-with-icon pl-8"
                        value={search}
                        onChange={handleSearch}
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={20} />
                    </div>
                </div>
                {/* {activeTab === 'assessments' && (
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
                )} */}
            </div>
            <div className="w-full">
                {activeTab === 'practice' && (
                    <PraticeProblemsComponent
                        courseId={params.courseId}
                        debouncedSearch={debouncedSearch}
                    />
                )}
                {activeTab === 'assessments' && (
                    <AssesmentSubmissionComponent
                        searchTerm={search}
                        courseId={params.courseId}
                    />
                )}
                {activeTab === 'projects' &&
                    (bootcampModules.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
                            {bootcampModules.map((item: any) => {
                                const submissions =
                                    item.projectData[0].submitStudents

                                const handleDownloadPdf = async (id: any) => {
                                    const apiUrl = `/submission/projects/students?projectId=${item.projectData[0].id}&bootcampId=${params.courseId}`
                                    async function fetchData() {
                                        try {
                                            const response = await api.get(
                                                apiUrl
                                            )

                                            const assessments =
                                                response.data
                                                    .projectSubmissionData
                                                    .projectTrackingData
                                            const doc = new jsPDF()

                                            // Title Styling
                                            doc.setFontSize(18)
                                            doc.setFont('Regular', 'normal')

                                            doc.setFontSize(15)
                                            doc.setFont('Regular', 'normal')
                                            doc.text(
                                                'List of Students-:',
                                                14,
                                                23
                                            ) // Closer to the table

                                            // Define columns for the table
                                            const columns = [
                                                {
                                                    header: 'Name',
                                                    dataKey: 'userName',
                                                },
                                                {
                                                    header: 'Email',
                                                    dataKey: 'userEmail',
                                                },
                                                // { header: 'Status', dataKey: 'status' },
                                            ]

                                            // Prepare rows for the table
                                            const rows = assessments.map(
                                                (assessment: {
                                                    userName: string
                                                    userEmail: string
                                                    // status: string;
                                                }) => ({
                                                    name:
                                                        assessment.userName ||
                                                        'N/A',
                                                    email:
                                                        assessment.userEmail ||
                                                        'N/A',
                                                })
                                            )

                                            autoTable(doc, {
                                                head: [
                                                    columns.map(
                                                        (col) => col.header
                                                    ),
                                                ],
                                                body: rows.map(
                                                    (row: {
                                                        name: string
                                                        email: string
                                                    }) => [row.name, row.email]
                                                ), // Ensure status is used here
                                                startY: 25,
                                                margin: { horizontal: 10 },
                                                styles: {
                                                    overflow: 'linebreak',
                                                    halign: 'center',
                                                },
                                                headStyles: {
                                                    fillColor: [22, 160, 133],
                                                },
                                                theme: 'grid',
                                            })

                                            // Save the document
                                            doc.save(
                                                `${item.projectData[0].title}.pdf`
                                            )
                                        } catch (error) {}
                                    }

                                    fetchData()
                                }

                                return (
                                    <div
                                        key={item.id}
                                        className="relative lg:flex h-[120px] w-[400px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md p-4"
                                    >
                                        {/* Download Icon positioned at the top right corner of the card */}
                                        <button
                                            onClick={
                                                submissions > 0
                                                    ? handleDownloadPdf
                                                    : undefined
                                            } // Disable click if submissions are 0
                                            className={`absolute top-2 right-2 z-10 transform cursor-pointer ${
                                                submissions > 0
                                                    ? 'hover:text-gray-700'
                                                    : 'text-gray-400'
                                            }`}
                                            title=" No Download Report"
                                            disabled={submissions === 0} // Disable button if there are no submissions
                                        >
                                            <ArrowDownToLine
                                                size={20}
                                                className="text-gray-500"
                                            />
                                        </button>

                                        <div className="flex flex-col w-full">
                                            <h1 className="font-semibold text-start">
                                                {item.projectData[0].title}
                                            </h1>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-yellow h-2 w-2 rounded-full" />
                                                <p className="text-start">
                                                    {submissions}/
                                                    {totalStudents} Submission
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between">
                                            {submissions > 0 ? (
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
                                            ) : (
                                                <Button
                                                    variant={'ghost'}
                                                    className="text-secondary text-md opacity-50 cursor-not-allowed"
                                                    disabled
                                                >
                                                    View Submission
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="w-screen flex flex-col justify-center items-center h-4/5">
                            <h1 className="text-center font-semibold ">
                                No Projects Found
                            </h1>
                            <Image
                                src="/emptyStates/curriculum.svg"
                                alt="No Video Found"
                                width={400}
                                height={400}
                            />
                        </div>
                    ))}
                {activeTab === 'form' && (
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
                        {formData ? (
                            formData?.map((item: any) => {
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
                            })
                        ) : (
                            <div className="w-screen flex flex-col justify-center items-center h-4/5">
                                <h1 className="text-center font-semibold ">
                                    No Form Found
                                </h1>
                                <Image
                                    src="/emptyStates/curriculum.svg"
                                    alt="No Video Found"
                                    width={400}
                                    height={400}
                                />
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'assignments' && (
                    <Assignments
                        debouncedSearch={debouncedSearch}
                        courseId={params.courseId}
                    />
                )}

                {activeTab === 'video' && (
                    <VideoSubmission
                        debouncedSearch={debouncedSearch}
                        courseId={params.courseId}
                    />
                )}
            </div>
        </div>
    )
}

export default Page
