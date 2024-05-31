'use client'
import React, { useCallback, useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowDownToLine, Search } from 'lucide-react'

import PraticeProblems from '../../_components/PraticeProblems'
import Assesments from '../../_components/Assesments'
import Projects from '../../_components/Projects'
import { api } from '@/utils/axios.config'
import PracticeProblems from '../../_components/PraticeProblems'

const Page = ({ params }: { params: any }) => {
    const [activeTab, setActiveTab] = useState('practice')
    const [submissions, setSubmissions] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)
    const [assesments, setAssesments] = useState<any[]>([])

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
            console.error('Error fetching submissions:', error)
        }
    }, [params.courseId])

    const getAssessments = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/assessmentInfoBy?bootcampId=${params.courseId}&limit=10&offset=0`
            )
            setAssesments(res.data.data)
            setTotalStudents(res.data.totalStudents)
        } catch (error) {
            console.error('Error fetching assessments:', error)
        }
    }, [params.courseId])

    useEffect(() => {
        if (params.courseId) {
            getSubmissions()
            getAssessments()
        }
    }, [getSubmissions, getAssessments, params.courseId])

    return (
        <div className="">
            <div className="flex items-start gap-x-3">
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
            </div>
            <div className="flex justify-between">
                <div className="relative w-full mr-2">
                    <Input
                        placeholder="Search for Name, Email"
                        className="w-1/3 my-6 input-with-icon pl-8 "
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={20} />
                    </div>
                </div>
                {activeTab === 'assessments' && (
                    <Button>
                        <ArrowDownToLine size={20} className="mr-2" /> Download
                        Full Report
                    </Button>
                )}
                {activeTab === 'projects' && (
                    <Button>
                        <ArrowDownToLine size={20} className="mr-2" /> Download
                        Full Report
                    </Button>
                )}
            </div>
            <div className="w-full">
                {activeTab === 'practice' &&
                    submissions
                        .filter(
                            ({ moduleChapterData }) =>
                                moduleChapterData.length > 0
                        )
                        .map(({ id, name, moduleChapterData }) => (
                            <PracticeProblems
                                key={id}
                                courseId={params.courseId}
                                name={name}
                                totalStudents={totalStudents}
                                submission={moduleChapterData}
                                moduleId={id}
                            />
                        ))}
                {activeTab === 'assessments' && (
                    <>
                        {assesments
                            .filter(
                                ({ moduleAssessments }) =>
                                    moduleAssessments.length > 0
                            )
                            .map(({ id, name, moduleAssessments }) => (
                                <Assesments
                                    key={id}
                                    courseId={params.courseId}
                                    name={name}
                                    moduleAssessments={moduleAssessments}
                                />
                            ))}
                    </>
                )}
                {activeTab === 'projects' && (
                    <Projects courseId={params.courseId} />
                )}
            </div>
        </div>
    )
}

export default Page
