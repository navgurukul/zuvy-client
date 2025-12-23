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
    const handleDownloadPdf = async (projectId: string, projectTitle: string) => {
        if (!projectId) return

        const apiUrl = `/submission/projects/students?projectId=${projectId}&bootcampId=${courseId}`

        try {
            const response = await api.get(apiUrl)
            const assessments = response.data?.projectSubmissionData?.projectTrackingData || []
            const doc = new jsPDF()

            doc.setFontSize(18)
            doc.setFont('Regular', 'normal')
            doc.setFontSize(15)
            doc.setFont('Regular', 'normal')
            doc.text('List of Students-:', 14, 23)

            const columns = [
                { header: 'Name', dataKey: 'name' },
                { header: 'Email', dataKey: 'email' },
                { header: 'Project Link', dataKey: 'projectLink' },

            ]

            const rows = assessments.map((assessment: { name: string; email: string,projectLink: string}) => ({
                name: assessment.name || 'N/A',
                email: assessment.email || 'N/A',
                projectLink: assessment.projectLink || 'N/A',
            }))

            autoTable(doc, {
                head: [columns.map((col) => col.header)],
                body: rows.map((row: { name: string; email: string,projectLink: string  }) => [row.name, row.email,row.projectLink,]),
                startY: 25,
                margin: { horizontal: 10 },
                styles: { overflow: 'linebreak', halign: 'center' },
                headStyles: { fillColor: [22, 160, 133] },
                theme: 'grid',
            })

            doc.save(`${projectTitle || 'project'}.pdf`)
        } catch (error) {
            console.error('Error generating PDF:', error)
            toast({
                title: 'Error',
                description: 'Failed to generate PDF',
                variant: 'destructive',
            })
        }
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
                        <div className="absolute top-2 right-1 z-10 flex items-center gap-0">
                            <button
                                onClick={submissions > 0 ? () => handleDownloadPdf(projectId, projectTitle) : undefined}
                                className={`cursor-pointer ${
                                    submissions > 0 ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400'
                                }`}
                                title="Download Report"
                                disabled={submissions === 0}
                            >
                                <ArrowDownToLine size={20} className="" />
                            </button>
                            {submissions > 0 ? (
                                <Link href={`/admin/courses/${courseId}/submissionProjects/${projectId}`}>
                                    <Button variant={'ghost'} className="hover:bg-white-600 hover:text-gray-700 transition-colors">
                                        <Eye className="text-gray-500" size={20} />
                                    </Button>
                                </Link>
                            ) : (
                                <Button variant={'ghost'} className="text-gray-400 text-sm" disabled>
                                    <Eye className="text-gray-400" size={20} />
                                </Button>
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