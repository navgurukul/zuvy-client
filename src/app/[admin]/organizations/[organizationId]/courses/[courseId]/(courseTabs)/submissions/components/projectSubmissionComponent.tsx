import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowDownToLine, BookOpen, Eye } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import useDownloadCsv from '@/hooks/useDownloadCsv'
import { useParams } from 'next/navigation'
import { getUser } from '@/store/store'

interface ProjectsComponentProps {
    courseId: string
    debouncedSearch: string
    bootcampModules: any[]
    totalStudents: number
}

const ProjectsComponent: React.FC<ProjectsComponentProps> = ({
    courseId,
    debouncedSearch,
    bootcampModules,
    totalStudents,
}) => {
    const { downloadCsv } = useDownloadCsv()
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin';
    const orgId = isSuperAdmin ? organizationId : user?.orgId 

    const handleDownloadCsv = (projectId: string, projectTitle: string) => {
        downloadCsv({
            endpoint: `/submission/projects/students?projectId=${projectId}&bootcampId=${courseId}`,
            fileName: projectTitle || 'project',
            dataPath: 'projectSubmissionData.projectTrackingData',
            columns: [
                { header: 'Name', key: 'name' },
                { header: 'Email', key: 'email' },
                { header: 'Project Links', key: 'projectLink' },
            ],
            mapData: (student: any) => ({
                name: student.name || 'N/A',
                email: student.email || 'N/A',
                projectLink: formatProjectLinks(student.projectLink),
            }),
        })
    }


    if (bootcampModules.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center">
                <p className="text-center text-muted-foreground max-w-md">
                    {debouncedSearch
                        ? `No Projects Found for "${debouncedSearch}"`
                        : 'No Projects submissions available from the students yet. Please wait until the first submission'}
                </p>
                <Image
                    src="/emptyStates/empty-submissions.png"
                    alt="No Projects Found"
                    width={120}
                    height={120}
                    className="mb-6"
                />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-4">
            {bootcampModules.map((item: any) => {
                const submissions = item.projectData?.[0]?.submitStudents || 0
                const projectId = item.projectData?.[0]?.id
                const projectTitle = item.projectData?.[0]?.title || 'Untitled Project'

                return (
                    <div
                        key={item.id}
                        className="relative bg-card border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-[2px]">
                            {submissions > 0 ? (
                                <button
                                    onClick={() => handleDownloadCsv(projectId, projectTitle)}
                                    className="cursor-pointer text-gray-500 hover:text-gray-700 px-1"
                                    title="Download Report"
                                >
                                    <ArrowDownToLine size={20} />
                                </button>
                            ) : (
                                <div className="relative group inline-flex">
                                        <button disabled className="cursor-not-allowed px-1 text-gray-400 mt-2">
                                            <ArrowDownToLine size={20} className="text-gray-400" />
                                        </button>

                                        <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">
                                            No submissions available
                                        </div>
                                </div>
                            )}
                            {submissions > 0 ? (
                                <Link href={`/${userRole}/organizations/${orgId}/courses/${courseId}/submissionProjects/${projectId}`}>
                                    <Button
                                        variant="ghost"
                                        className="hover:bg-white-500  px-1 hover:text-gray-700 transition-colors"
                                    >
                                        <Eye className="text-gray-500" size={20} />
                                    </Button>
                                </Link>
                            ) : (
                                <div className="relative group inline-flex">
                                        <button
                                            disabled
                                            className="cursor-not-allowed px-1 mt-2"
                                        >
                                            <Eye className="text-gray-400" size={20} />
                                        </button>
                                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap z-50">
                                        No submissions to view
                                    </div>
                                </div>
                            )}
                        </div>


                        <div className="flex flex-col w-full">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-md">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <h3 className="font-medium text-base">{projectTitle}</h3>
                            </div>
                            <div className="flex items-center justify-between mt-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Badge
                                        variant="outline"
                                        className="text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600"
                                    >
                                        {submissions} submissions
                                    </Badge>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                >
                                    {totalStudents - submissions} pending
                                </Badge>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ProjectsComponent

const formatProjectLinks = (links?: string | string[]) => {
    if (!links) return 'N/A'
    if (Array.isArray(links)) {
        const joined = links.map((link) => link.trim()).filter(Boolean).join(' | ')
        return joined || 'N/A'
    }
    const joined = links
        .split(/\r?\n+/)
        .map((link) => link.trim())
        .filter(Boolean)
        .join(' | ')
    return joined || 'N/A'
}
