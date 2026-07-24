'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowDownToLine, ChevronRight, FileText, CheckSquare, Code, MessageSquare, ClipboardCheck, BookOpen, Play, Video, Eye, Search } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'
import FormComponent from '../../_components/FormComponent'
import Assignments from './components/assignments'
import AssesmentSubmissionComponent from './components/AssesmentSubmission'
import PraticeProblemsComponent from './components/PraticeProblemsComponent'
import LiveClassSubmission from './components/LiveClassSubmission'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import VideoSubmission from './components/VideoSubmission'
import Image from 'next/image'
import { useSearchWithSuggestions } from '@/utils/useUniversalSearchDynamic'
import { SearchBox } from '@/utils/searchBox'
import { CourseSubmissionSkeleton } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton'
import ProjectsComponent from './components/projectSubmissionComponent'
import { useProjectSubmissions } from '@/app/[admin]/hooks/useProjectSubmissions'
import { usePracticeProblemSubmissions } from '@/app/[admin]/hooks/usePracticeProblemSubmissions'
import { useFormSubmissions } from '@/app/[admin]/hooks/useFormSubmissions'
import { useLiveClassSubmissions } from '@/app/[admin]/hooks/useLiveClassSubmissions'
import { useGetAssessmentSubmissions } from '@/app/[admin]/hooks/useGetAssessmentSubmissions'
import { useGetProjectSubmissions } from '@/app/[admin]/hooks/useGetProjectSubmissions'
import { useGetAssignmentSubmissions } from '@/app/[admin]/hooks/useGetAssignmentSubmissions'
import { useGetVideoSubmissions } from '@/app/[admin]/hooks/useGetVideoSubmissions'
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
    | 'live'
}

// Define submission types with icons
const submissionTypes = [

    { id: 'assessments', label: 'Assessments', icon: ClipboardCheck },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'projects', label: 'Projects', icon: BookOpen },
    { id: 'form', label: 'Feedback Forms', icon: MessageSquare },
    { id: 'practice', label: 'Practice Problems', icon: Code },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'live', label: 'Live Classes', icon: Play },
]

const Page = ({ params }: { params: any }) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get initial values from URL
    const initialTab = searchParams.get('tab') || 'assessments'
    const [activeTab, setActiveTab] = useState(initialTab)
    const [submissions, setSubmissions] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)
    const [formData, setFormData] = useState<any[]>([])
    const [liveClassData, setLiveClassData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [appliedSearchQuery, setAppliedSearchQuery] = useState(searchParams.get('search') || '')

    const { bootcampModules: hookBootcampModules, totalStudents: hookTotalStudents } = useProjectSubmissions(params.courseId, {
        searchProject: appliedSearchQuery,
        enabled: activeTab === 'projects'
    })

    // New state for controlling search input display vs applied search
    const [searchInputValue, setSearchInputValue] = useState(searchParams.get('search') || '')

    const { getFormSubmissions } = useFormSubmissions()
    const { fetchLiveClassSubmissions } = useLiveClassSubmissions(params.courseId, { enabled: false })
    const { fetchSubmissions: fetchPracticeSubmissions } = usePracticeProblemSubmissions(params.courseId, { enabled: false })
    const { getAssessmentSubmissions } = useGetAssessmentSubmissions()
    const { getProjectSubmissions } = useGetProjectSubmissions()
    const { getAssignmentSubmissions } = useGetAssignmentSubmissions()
    const { getVideoSubmissions } = useGetVideoSubmissions()

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
                    const practiceData = await fetchPracticeSubmissions(searchTerm)
                    if (practiceData.trackingData) {
                        practiceData.trackingData.forEach((item: any) => {
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
                    const assessmentRes = await getAssessmentSubmissions(params.courseId, searchTerm)
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
                    const projectRes = await getProjectSubmissions(params.courseId, searchTerm)
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
                    const formRes = await getFormSubmissions(params.courseId, searchTerm)
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
                    const assignmentRes = await getAssignmentSubmissions(params.courseId, searchTerm)
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
                    const videoRes = await getVideoSubmissions(params.courseId, searchTerm)
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

            case 'live':
                try {
                    const liveRes = await fetchLiveClassSubmissions(params.courseId, searchTerm)
                    if (liveRes.data?.data?.trackingData) {
                        liveRes.data.data.trackingData.forEach((module: any) => {
                            if (module.moduleChapterData && Array.isArray(module.moduleChapterData)) {
                                module.moduleChapterData.forEach((liveClass: any) => {
                                    const title = liveClass.title || ''
                                    if (title.toLowerCase().includes(term)) {
                                        newSuggestions.push({
                                            id: liveClass.id,
                                            title: title,
                                            type: 'live',
                                        })
                                    }
                                })
                            }
                        })
                    }
                } catch (error) {
                    console.error('Error fetching live classes for suggestions:', error)
                }
                break
        }

        // Limit suggestions to 8 items and remove duplicates
        const uniqueSuggestions = newSuggestions.filter(
            (suggestion, index, self) =>
                index === self.findIndex((s) => s.id === suggestion.id && s.type === suggestion.type)
        )



        return uniqueSuggestions.slice(0, 8)
    }, [params.courseId, activeTab, fetchPracticeSubmissions, getAssessmentSubmissions, getProjectSubmissions, getFormSubmissions, getAssignmentSubmissions, getVideoSubmissions, fetchLiveClassSubmissions])

    // Modified: Only apply search when user selects suggestion or presses enter
    const fetchSearchResultsApi = useCallback(async (query: string) => {
        setAppliedSearchQuery(query)
        setSearchInputValue(query)
        updateURL(activeTab, query)
    }, [activeTab])

    const defaultFetchApi = useCallback(async () => {
        setAppliedSearchQuery('')
        setSearchInputValue('')
        updateURL(activeTab, '')
    }, [activeTab])

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

            if (newTab !== 'assessments') {
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
        setSearchInputValue('')
        clearSearch()
        updateURL(tab, '')
    }

    // Modified: Handle search input change without applying search immediately
    const handleSearchInputChange = (value: string) => {
        setSearchInputValue(value)
        // Don't update appliedSearchQuery here - only update for suggestions
    }

    const getFormData = useCallback(async () => {
        try {
            const res = await getFormSubmissions(
                params.courseId,
                appliedSearchQuery && activeTab === 'form' ? appliedSearchQuery : undefined
            )
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
    }, [params.courseId, appliedSearchQuery, activeTab, getFormSubmissions])

    const getLiveClassData = useCallback(async () => {
        try {
            const res = await fetchLiveClassSubmissions(
                params.courseId,
                appliedSearchQuery && activeTab === 'live' ? appliedSearchQuery : undefined
            )
            const trackingData = res.data?.data?.trackingData || []
            setLiveClassData(trackingData)
            setTotalStudents(res.data?.data?.totalStudents || 0)
        } catch (error) {
            setLiveClassData([])
            setTotalStudents(0)
        }
    }, [params.courseId, appliedSearchQuery, activeTab, fetchLiveClassSubmissions])

    useEffect(() => {
        if (!params.courseId) return
        if (activeTab === 'form') getFormData()
        if (activeTab === 'live') getLiveClassData()
    }, [params.courseId, activeTab, appliedSearchQuery, getFormData, getLiveClassData])


    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="">
            {loading ? (
                <CourseSubmissionSkeleton />
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Course Submissions</h2>
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={handleTabChange}
                        className="w-full"
                    >
                        <TabsList className="grid w-full rounded-none border-b bg-transparent p-0 h-auto"
                            style={{ gridTemplateColumns: `repeat(${submissionTypes.length}, 1fr)` }}>
                            {submissionTypes.map(type => (
                                <TabsTrigger
                                    key={type.id}
                                    value={type.id}
                                    className="flex items-center gap-2 rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-3 font-medium text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none hover:text-foreground"
                                >
                                    <type.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{type.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Search Box */}
                        <div className="flex flex-col lg:flex-row justify-between mt-6">
                            <div className="relative w-full mr-2">
                                {/* <div className="relative w-full lg:w-1/3"> */}
                                <div className="relative w-full lg:max-w-[500px] [&_input]:pl-10">
                                    <SearchBox
                                        placeholder={`${activeTab === 'practice'
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
                                        value={searchInputValue}                           // Use searchInputValue instead
                                        onSearchChange={handleSearchInputChange}           // Use new handler
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tab Content */}
                        {submissionTypes.map(type => (
                            <TabsContent key={type.id} value={type.id} className="mt-6">
                                <div className="w-full">
                                    {type.id === 'practice' && (
                                        <PraticeProblemsComponent
                                            courseId={params.courseId}
                                            debouncedSearch={appliedSearchQuery}
                                        />
                                    )}
                                    {type.id === 'assessments' && (
                                        <AssesmentSubmissionComponent
                                            searchTerm={appliedSearchQuery}
                                            courseId={params.courseId}
                                        />
                                    )}
                                    {type.id === 'projects' &&
                                        <ProjectsComponent
                                            courseId={params.courseId}
                                            debouncedSearch={appliedSearchQuery}
                                            bootcampModules={hookBootcampModules}
                                            totalStudents={hookTotalStudents}
                                        />
                                    }
                                    {type.id === 'form' && (
                                        <div className="grid relative gap-8 mt-4 md:mt-8">
                                            {formData.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-4">
                                                    {formData.map((item: any) =>
                                                        (item.moduleChapterData || []).map((data: any, index: any) => (
                                                            <FormComponent
                                                                key={`${item.id}-${index}`}
                                                                moduleName={item.name}
                                                                moduleId={item.id}
                                                                bootcampId={item.bootcampId}
                                                                data={data}
                                                                debouncedSearch={appliedSearchQuery}
                                                                totalStudents={totalStudents}
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            ) : (

                                                <div className="flex flex-col justify-center items-center">
                                                    <p className="text-center text-muted-foreground max-w-md">
                                                        {appliedSearchQuery ? `No Forms Found for "${appliedSearchQuery}"` : 'No Forms submissions available from the students yet. Please wait until the first submission'}
                                                    </p>
                                                    <Image
                                                        src="/emptyStates/empty-submissions.png"
                                                        alt="No Forms Found"
                                                        width={120}
                                                        height={120}
                                                        className="mb-6"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {type.id === 'assignments' && (
                                        <Assignments
                                            debouncedSearch={appliedSearchQuery}
                                            courseId={params.courseId}
                                        />
                                    )}
                                    {type.id === 'video' && (
                                        <VideoSubmission
                                            debouncedSearch={appliedSearchQuery}
                                            courseId={params.courseId}
                                        />
                                    )}
                                    {type.id === 'live' && (
                                        <LiveClassSubmission
                                            debouncedSearch={appliedSearchQuery}
                                            courseId={params.courseId}
                                        />
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            )}
        </div>
    )
}

export default Page