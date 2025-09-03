'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowDownToLine, ChevronRight, Search, X } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'
import FormComponent from '../../_components/FormComponent'
import Assignments from './components/assignments'
import AssesmentSubmissionComponent from './components/AssesmentSubmission'
import PraticeProblemsComponent from './components/PraticeProblemsComponent'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import VideoSubmission from './components/VideoSubmission'
import Image from 'next/image'
import { useSearchWithSuggestions } from '@/utils/useUniversalSearchDynamic'
import { SearchBox } from '@/utils/searchBox'

interface SearchSuggestion {
    id: string
    title: string
    type:
        | 'practice'
        | 'assessments'
        | 'projects'
        | 'form'
        | 'assignments'
        | 'video'
}
const Page = ({ params }: { params: any }) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get initial values from URL
    const initialTab = searchParams.get('tab') || 'practice'


    const [activeTab, setActiveTab] = useState(initialTab)
    const [submissions, setSubmissions] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)
    const [bootcampModules, setBootcampModules] = useState<any[]>([])
    const [formData, setFormData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [appliedSearchQuery, setAppliedSearchQuery] = useState(searchParams.get('search') || '')

    // Fetch suggestions API function
    const fetchSuggestionsApi = useCallback(async (searchTerm: string): Promise<SearchSuggestion[]> => {
        if (!searchTerm.trim() || searchTerm.length < 1) {
            return []
        }
        const term = searchTerm.toLowerCase()
        const newSuggestions: SearchSuggestion[] = []
        // Only search for suggestions relevant to the current active tab
        switch (activeTab) {
            case 'practice':
                try {
                    const practiceRes = await api.get(
                        `/submission/submissionsOfPractiseProblems/${params.courseId}?searchPractiseProblem=${encodeURIComponent(searchTerm)}`
                    )
                    if (practiceRes.data.trackingData) {
                        practiceRes.data.trackingData.forEach((item: any) => {
                            if (item.moduleChapterData) {
                                item.moduleChapterData.forEach((chapter: any) => {
                                    if (chapter.codingQuestionDetails) {
                                        const title = chapter.codingQuestionDetails.title || ''
                                        if (title.toLowerCase().includes(term)) {
                                            newSuggestions.push({
                                                id: chapter.codingQuestionDetails.id,
                                                title: title,
                                                type: 'practice',
                                            })
                                        }
                                    }
                                })
                            }
                        })
                    }
                } catch (error) {
                    console.error('Error fetching practice problems for suggestions:', error)
                }
                break

            case 'assessments':
                try {
                    const assessmentRes = await api.get(
                        `/admin/bootcampAssessment/bootcamp_id${params.courseId}?searchAssessment=${encodeURIComponent(searchTerm)}`
                    )
                    if (assessmentRes.data) {
                        Object.values(assessmentRes.data).forEach((assessmentGroup: any) => {
                            if (Array.isArray(assessmentGroup)) {
                                assessmentGroup.forEach((assessment: any) => {
                                    const title = assessment.title || ''
                                    if (title.toLowerCase().includes(term)) {
                                        newSuggestions.push({
                                            id: assessment.id,
                                            title: title,
                                            type: 'assessments',
                                        })
                                    }
                                })
                            }
                        })
                    }
                } catch (error) {
                    console.error('Error fetching assessments for suggestions:', error)
                }
                break
            case 'projects':
                try {
                    const projectRes = await api.get(
                        `/submission/submissionsOfProjects/${params.courseId}?searchProject=${encodeURIComponent(searchTerm)}`
                    )
                    if (projectRes.data?.data?.bootcampModules) {
                        projectRes.data.data.bootcampModules.forEach((module: any) => {
                            if (module.projectData && module.projectData[0]) {
                                const title = module.projectData[0].title || ''
                                newSuggestions.push({
                                    id: module.projectData[0].id,
                                    title,
                                    type: 'projects',
                                })
                            }
                        })
                    }
                } catch (error) {
                    console.error('Error fetching projects for suggestions:', error)
                }
                break
            case 'form':
                try {
                    const formRes = await api.get(
                        `/submission/submissionsOfForms/${params.courseId}?searchForm=${encodeURIComponent(searchTerm)}`
                    )
                    // Fix: Access the correct data structure
                    if (formRes.data?.trackingData) {
                        formRes.data.trackingData.forEach((form: any) => {
                            if (form.moduleChapterData) {
                                form.moduleChapterData.forEach((chapter: any) => {
                                    const chapterTitle = chapter.title || chapter.name || ''
                                    if (chapterTitle.toLowerCase().includes(term)) {
                                        newSuggestions.push({
                                            id: chapter.id,
                                            title: chapterTitle,
                                            type: 'form',
                                        })
                                    }
                                })
                            }
                        })
                    }
                } catch (error) {
                    console.error('Error fetching forms for suggestions:', error)
                }
                break

            case 'assignments':
                try {
                    const assignmentRes = await api.get(
                        `/submission/submissionsOfAssignment/${params.courseId}?searchAssignment=${encodeURIComponent(searchTerm)}`
                    )
                    if (assignmentRes.data && assignmentRes.data.data && assignmentRes.data.data.trackingData) {
                        assignmentRes.data.data.trackingData.forEach((module: any) => {
                            if (module.moduleChapterData && Array.isArray(module.moduleChapterData)) {
                                module.moduleChapterData.forEach((assignment: any) => {
                                    const title = assignment.title || ''
                                    if (title.toLowerCase().includes(term)) {
                                        newSuggestions.push({
                                            id: assignment.id,
                                            title: title,
                                            type: 'assignments',
                                        })
                                    }
                                })
                            }
                        })
                    }
                } catch (error) {
                    console.error('Error fetching assignments for suggestions:', error)
                }
                break

            case 'video':
                try {
                    const videoRes = await api.get(
                        `/admin/bootcampModuleCompletion/bootcamp_id${params.courseId}?searchVideos=${encodeURIComponent(searchTerm)}`
                    )
                    if (videoRes.data) {
                        Object.keys(videoRes.data).forEach((moduleKey) => {
                            if (moduleKey !== 'totalStudents' && moduleKey !== 'totalRows' && moduleKey !== 'message') {
                                const moduleChapters = videoRes.data[moduleKey]
                                if (Array.isArray(moduleChapters)) {
                                    moduleChapters.forEach((video: any) => {
                                        const title = video.title || video.name || ''
                                        if (title.toLowerCase().includes(term)) {
                                            newSuggestions.push({
                                                id: video.id,
                                                title: title,
                                                type: 'video',
                                            })
                                        }
                                    })
                                }
                            }
                        })
                    }
                } catch (error) {
                    console.error('Error fetching videos for suggestions:', error)
                }
                break
        }

        // Limit suggestions to 8 items and remove duplicates
        const uniqueSuggestions = newSuggestions.filter(
            (suggestion, index, self) =>
                index === self.findIndex((s) => s.id === suggestion.id && s.type === suggestion.type)
        )

        return uniqueSuggestions.slice(0, 8)
    }, [params.courseId, activeTab])

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        setAppliedSearchQuery(query)
    }, [])

    const defaultFetchApi = useCallback(async () => {
        setAppliedSearchQuery('')
    }, [])
    const {
        
        clearSearch,
    } = useSearchWithSuggestions({
        fetchSuggestionsApi,
        fetchSearchResultsApi,
        defaultFetchApi,
    })

    // Update URL when tab changes
    const updateURL = useCallback(
        (newTab: string, newSearch: string) => {
            const params = new URLSearchParams(searchParams.toString())

            if (newTab !== 'practice') {
                params.set('tab', newTab)
            } else {
                params.delete('tab')
            }

            if (newSearch.trim()) {
                params.set('search', newSearch.trim())
            } else {
                params.delete('search')
            }

            const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''
                }`
            router.replace(newURL, { scroll: false })
        },
        [router, searchParams]
    )

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setAppliedSearchQuery('')
        clearSearch()
        updateURL(tab, '')
    }

    const getProjectsData = useCallback(async () => {
        try {
            let url = `/submission/submissionsOfProjects/${params.courseId}`
            if (appliedSearchQuery && activeTab === 'projects') {
                url += `?searchProject=${encodeURIComponent(appliedSearchQuery)}`
            }

            const res = await api.get(url)
            const projectsData = res.data?.data?.bootcampModules || []
            setBootcampModules(projectsData)
            setTotalStudents(res.data?.totalStudents || 0)
        } catch (error) {
            setBootcampModules([])
            setTotalStudents(0)
        }
    }, [params.courseId, appliedSearchQuery, activeTab])

    const getFormData = useCallback(async () => {
        try {
            let url = `/submission/submissionsOfForms/${params.courseId}`
            if (appliedSearchQuery && activeTab === 'form') {
                url += `?searchForm=${encodeURIComponent(appliedSearchQuery)}`
            }

            const res = await api.get(url)
            const formsData = res.data?.trackingData || []
            setFormData(formsData)
            setTotalStudents(res.data?.totalStudents || 0)
        } catch (error) {
            setFormData([])
            setTotalStudents(0)
            toast({
                title: 'Error',
                description: 'Error fetching form data',
                variant: 'destructive',
            })
        }
    }, [params.courseId, appliedSearchQuery, activeTab])
    useEffect(() => {
        if (!params.courseId) return
        if (activeTab === 'projects') getProjectsData()
        if (activeTab === 'form') getFormData()
    }, [params.courseId, activeTab, getProjectsData, getFormData])

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
                            <Spinner className="text-[rgb(81,134,114)]" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex justify-start overflow-x-auto overflow-y-hidden items-start gap-x-3">
                    <Button
                        onClick={() => handleTabChange('practice')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'practice'
                                ? 'bg-success-dark opacity-75  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Practice Problems
                    </Button>
                    <Button
                        onClick={() => handleTabChange('assessments')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'assessments'
                                ? 'bg-success-dark opacity-75  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Assessments
                    </Button>
                    <Button
                        onClick={() => handleTabChange('projects')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'projects'
                                ? 'bg-success-dark opacity-75  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Projects
                    </Button>
                    <Button
                        onClick={() => handleTabChange('form')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'form'
                                ? 'bg-success-dark opacity-75  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Form
                    </Button>
                    <Button
                        onClick={() => handleTabChange('assignments')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'assignments'
                                ? 'bg-success-dark opacity-75  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Assignments
                    </Button>
                    <Button
                        onClick={() => handleTabChange('video')}
                        className={`px-4 py-2 rounded-full font-semibold focus:outline-none ${
                            activeTab === 'video'
                                ? 'bg-success-dark opacity-75  text-white'
                                : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                        Video
                    </Button>
                </div>
            )}
            <div className="flex flex-col lg:flex-row justify-between">
                <div className="relative w-full mr-2">
                     <div className="relative w-full lg:w-1/3">
                     <SearchBox
                            placeholder={`${
                                activeTab === 'practice'
                                    ? 'Search for practice problems by name'
                                    : `Search for ${activeTab} by name`
                            }`}
                            fetchSuggestionsApi={fetchSuggestionsApi}
                            fetchSearchResultsApi={fetchSearchResultsApi}
                            defaultFetchApi={defaultFetchApi}
                            getSuggestionLabel={(s) => (
                                <div>
                                    <div className="font-medium">{s.title}</div>
                                </div>
                                
                            )}                            
                            inputWidth="w-full my-6 pr-10"
                        />
                        </div>
                </div>
            </div>

            <div className="w-full">
                {activeTab === 'practice' && (
                    <PraticeProblemsComponent
                        courseId={params.courseId}
                        debouncedSearch={appliedSearchQuery}
                    />
                )}
                {activeTab === 'assessments' && (
                    <AssesmentSubmissionComponent
                        searchTerm={appliedSearchQuery}
                        courseId={params.courseId}
                    />
                )}
                {activeTab === 'projects' &&
                    (bootcampModules.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
                            {bootcampModules.map((item: any) => {
                                const submissions = item.projectData?.[0]?.submitStudents || 0

                                const handleDownloadPdf = async (id: any) => {
                                    const projectId = item.projectData?.[0]?.id
                                    if (!projectId) return

                                    const apiUrl = `/submission/projects/students?projectId=${projectId}&bootcampId=${params.courseId}`

                                    async function fetchData() {
                                        try {
                                            const response = await api.get(
                                                apiUrl
                                            )
                                            const assessments =
                                                response.data
                                                    ?.projectSubmissionData
                                                    ?.projectTrackingData || []

                                            const doc = new jsPDF()

                                            doc.setFontSize(18)
                                            doc.setFont('Regular', 'normal')
                                            doc.setFontSize(15)
                                            doc.setFont('Regular', 'normal')
                                            doc.text(
                                                'List of Students-:',
                                                14,
                                                23
                                            )

                                            const columns = [
                                                {
                                                    header: 'Name',
                                                    dataKey: 'userName',
                                                },
                                                {
                                                    header: 'Email',
                                                    dataKey: 'userEmail',
                                                },
                                            ]

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
                                                head: [columns.map((col) => col.header)],
                                                body: rows.map((row: { name: string; email: string }) => [
                                                    row.name,
                                                    row.email,
                                                ]),
                                                startY: 25,
                                                margin: { horizontal: 10 },
                                                styles: { overflow: 'linebreak', halign: 'center' },
                                                headStyles: { fillColor: [22, 160, 133] },
                                                theme: 'grid',
                                            })

                                            doc.save(`${item.projectData?.[0]?.title || 'project'}.pdf`)
                                        } catch (error) {
                                            console.error('Error generating PDF:', error)
                                            toast({
                                                title: 'Error',
                                                description: 'Failed to generate PDF',
                                                variant: 'destructive',
                                            })
                                        }
                                    }
                                    fetchData()
                                }

                                return (
                                    <div
                                        key={item.id}
                                        className="relative lg:flex h-[120px] w-[400px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md p-4 text-gray-600"
                                    >
                                        <button
                                            onClick={submissions > 0 ? handleDownloadPdf : undefined}
                                            className={`absolute top-2 right-2 z-10 transform cursor-pointer ${submissions > 0 ? 'hover:text-gray-700' : 'text-gray-400'
                                                }`}
                                            title="Download Report"
                                            disabled={submissions === 0}
                                        >
                                            <ArrowDownToLine size={20} className="text-gray-500" />
                                        </button>

                                        <div className="flex flex-col w-full">
                                            <h1 className="font-semibold text-start text-[1.063rem] capitalize">
                                                {item.projectData[0].title || 'Untitled Project'}
                                            </h1>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-yellow h-2 w-2 rounded-full" />
                                                <p className="text-start">
                                                    {submissions}/{totalStudents} Submission
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between">
                                            {submissions > 0 ? (
                                                <Link
                                                    href={`/admin/courses/${params.courseId}/submissionProjects/${item.projectData?.[0]?.id}`}
                                                >
                                                    <Button variant={'ghost'} className="text-green-700 text-sm">
                                                        View Submission{' '}
                                                        <ChevronRight className="text-green-700" size={17} />
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button
                                                    variant={'ghost'}
                                                    className="text-green-700 text-md opacity-50 cursor-not-allowed"
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
                            <h1 className="text-center font-semibold text-[1.063rem]">
                                {appliedSearchQuery
                                    ? `No Projects Found for "${appliedSearchQuery}"`
                                    : 'No Projects Found'}
                            </h1>
                            <Image
                                src="/emptyStates/curriculum.svg"
                                alt="No Projects Found"
                                width={400}
                                height={400}
                            />
                        </div>
                    ))}
                {activeTab === 'form' && (
                    <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
                        {formData.length > 0 ? (
                            formData.map((item: any) =>
                                (item.moduleChapterData || []).map((data: any, index: any) => (
                                    <FormComponent
                                        key={`${item.id}-${index}`}
                                        moduleName={item.name}
                                        moduleId={item.id}
                                        bootcampId={item.bootcampId}
                                        data={data}
                                        debouncedSearch={appliedSearchQuery}
                                    />
                                ))
                            )
                        ) : (
                            <div className="w-screen flex flex-col justify-center items-center h-4/5">
                                <h1 className="text-center font-semibold text-[1.063rem]">
                                    {appliedSearchQuery ? `No Forms Found for "${appliedSearchQuery}"` : 'No Forms Found'}
                                </h1>
                                <Image
                                    src="/emptyStates/curriculum.svg"
                                    alt="No Forms Found"
                                    width={400}
                                    height={400}
                                />
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'assignments' && (
                    <Assignments
                        debouncedSearch={appliedSearchQuery}
                        courseId={params.courseId}
                    />
                )}
                {activeTab === 'video' && (
                    <VideoSubmission
                        debouncedSearch={appliedSearchQuery}
                        courseId={params.courseId}
                    />
                )}
            </div>
        </div>
    )
}

export default Page
