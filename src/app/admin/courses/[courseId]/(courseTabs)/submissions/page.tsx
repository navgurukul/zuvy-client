'use client'
import React, { useCallback, useEffect, useState, useRef } from 'react'
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
import { useCourseExistenceCheck } from '@/hooks/useCourseExistenceCheck'

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
    const rawSearch = searchParams.get('search') || ''
    // Get initial values from URL
    const initialTab = searchParams.get('tab') || 'practice'
    const initialSearch = searchParams.get('search') || ''

    // const { isCourseDeleted, loadingCourseCheck } = useCourseExistenceCheck(
    //     params.courseId
    // )
    const [activeTab, setActiveTab] = useState(initialTab)
    const [submissions, setSubmissions] = useState<any[]>([])
    const [totalStudents, setTotalStudents] = useState(0)
    const [bootcampModules, setBootcampModules] = useState<any[]>([])
    const [formData, setFormData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchInput, setSearchInput] = useState(initialSearch)
    const [appliedSearch, setAppliedSearch] = useState(initialSearch)
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestionTimeout, setSuggestionTimeout] =
        useState<NodeJS.Timeout | null>(null)
    const [allData, setAllData] = useState<{
        practice: any[]
        assessments: any[]
        projects: any[]
        form: any[]
        assignments: any[]
        video: any[]
    }>({
        practice: [],
        assessments: [],
        projects: [],
        form: [],
        assignments: [],
        video: [],
    })

    const searchInputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Update URL when tab or search changes
    const updateURL = useCallback(
        (newTab: string, newSearch: string) => {
            const params = new URLSearchParams(searchParams.toString())

            // Set tab only if it's not the default 'practice'
            if (newTab !== 'practice') {
                params.set('tab', newTab)
            } else {
                params.delete('tab')
            }

            // Set search only if it's not empty
            if (newSearch.trim()) {
                params.set('search', newSearch.trim())
            } else {
                params.delete('search')
            }

            const newURL = `${window.location.pathname}${
                params.toString() ? '?' + params.toString() : ''
            }`
            router.replace(newURL, { scroll: false })
        },
        [router, searchParams]
    )

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setAppliedSearch('')
        setSearchInput('')
        setShowSuggestions(false)
        setSuggestions([]) // Clear suggestions when tab changes
        updateURL(tab, '')
    }

    // Handle search input changes with debouncing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchInput(value)

        // Clear previous timeout
        if (suggestionTimeout) {
            clearTimeout(suggestionTimeout)
        }

        // Show suggestions if search has at least 1 character
        if (value.length >= 1) {
            setShowSuggestions(true)

            // Debounce API calls for suggestions
            const timeout = setTimeout(() => {
                generateSuggestions(value)
            }, 300) // Wait 300ms after user stops typing

            setSuggestionTimeout(timeout)
        } else {
            setShowSuggestions(false)
            setSuggestions([])
        }
    }

    // Apply search when user selects a suggestion or presses Enter
    const applySearch = (searchTerm: string, tab: string = activeTab) => {
        const trimmedSearch = searchTerm.trim()
        setAppliedSearch(trimmedSearch)
        setSearchInput(trimmedSearch)
        setActiveTab(tab)
        setShowSuggestions(false)
        updateURL(tab, trimmedSearch)
    }

    const handleSuggestionClick = (suggestion: SearchSuggestion) => {
        applySearch(suggestion.title, suggestion.type)
    }

    const clearSearch = () => {
        setSearchInput('')
        setAppliedSearch('')
        setShowSuggestions(false)
        setSuggestions([])
        updateURL(activeTab, '')
        searchInputRef.current?.focus()
    }

    // Generate search suggestions based on current search term AND active tab
    const generateSuggestions = useCallback(
        async (searchTerm: string) => {
            if (!searchTerm.trim() || searchTerm.length < 1) {
                setSuggestions([])
                return
            }

            const term = searchTerm.toLowerCase()
            const newSuggestions: SearchSuggestion[] = []

            try {
                // Only search for suggestions relevant to the current active tab
                switch (activeTab) {
                    case 'practice':
                        // Search through practice problems only
                        try {
                            const practiceRes = await api.get(
                                `/submission/submissionsOfPractiseProblems/${
                                    params.courseId
                                }?searchPractiseProblem=${encodeURIComponent(
                                    searchTerm
                                )}`
                            )
                            if (practiceRes.data.trackingData) {
                                practiceRes.data.trackingData.forEach(
                                    (item: any) => {
                                        if (item.moduleChapterData) {
                                            item.moduleChapterData.forEach(
                                                (chapter: any) => {
                                                    if (
                                                        chapter.codingQuestionDetails
                                                    ) {
                                                        const title =
                                                            chapter
                                                                .codingQuestionDetails
                                                                .title || ''
                                                        if (
                                                            title
                                                                .toLowerCase()
                                                                .includes(term)
                                                        ) {
                                                            newSuggestions.push(
                                                                {
                                                                    id: chapter
                                                                        .codingQuestionDetails
                                                                        .id,
                                                                    title: title,
                                                                    type: 'practice',
                                                                }
                                                            )
                                                        }
                                                    }
                                                }
                                            )
                                        }
                                    }
                                )
                            }
                        } catch (error) {
                            console.error(
                                'Error fetching practice problems for suggestions:',
                                error
                            )
                        }
                        break

                    case 'assessments':
                        // Search through assessments only
                        try {
                            const assessmentRes = await api.get(
                                `/admin/bootcampAssessment/bootcamp_id${
                                    params.courseId
                                }?searchAssessment=${encodeURIComponent(
                                    searchTerm
                                )}`
                            )
                            if (assessmentRes.data) {
                                Object.values(assessmentRes.data).forEach(
                                    (assessmentGroup: any) => {
                                        if (Array.isArray(assessmentGroup)) {
                                            assessmentGroup.forEach(
                                                (assessment: any) => {
                                                    const title =
                                                        assessment.title || ''
                                                    if (
                                                        title
                                                            .toLowerCase()
                                                            .includes(term)
                                                    ) {
                                                        newSuggestions.push({
                                                            id: assessment.id,
                                                            title: title,
                                                            type: 'assessments',
                                                        })
                                                    }
                                                }
                                            )
                                        }
                                    }
                                )
                            }
                        } catch (error) {
                            console.error(
                                'Error fetching assessments for suggestions:',
                                error
                            )
                        }
                        break

                    case 'projects':
                        // Search through projects only
                        if (bootcampModules && bootcampModules.length > 0) {
                            bootcampModules.forEach((item: any) => {
                                if (item.projectData && item.projectData[0]) {
                                    const title =
                                        item.projectData[0].title || ''
                                    if (title.toLowerCase().includes(term)) {
                                        newSuggestions.push({
                                            id: item.projectData[0].id,
                                            title: title,
                                            type: 'projects',
                                        })
                                    }
                                }
                            })
                        }
                        break
                    case 'form':
                        // Search through forms only (but skip module name)
                        if (formData && formData.length > 0) {
                            formData.forEach((item: any) => {
                                // Only check moduleChapterData
                                if (item.moduleChapterData) {
                                    item.moduleChapterData.forEach(
                                        (chapter: any) => {
                                            const chapterTitle =
                                                chapter.title ||
                                                chapter.name ||
                                                ''
                                            if (
                                                chapterTitle
                                                    .toLowerCase()
                                                    .includes(term)
                                            ) {
                                                newSuggestions.push({
                                                    id: chapter.id,
                                                    title: chapterTitle,
                                                    type: 'form',
                                                })
                                            }
                                        }
                                    )
                                }
                            })
                        }
                        break

                    case 'assignments':
                        // Fixed assignment API endpoint and data handling
                        try {
                            const assignmentRes = await api.get(
                                `/submission/submissionsOfAssignment/${
                                    params.courseId
                                }?searchAssignment=${encodeURIComponent(
                                    searchTerm
                                )}`
                            )
                            if (
                                assignmentRes.data &&
                                assignmentRes.data.data &&
                                assignmentRes.data.data.trackingData
                            ) {
                                // Handle the response structure properly
                                assignmentRes.data.data.trackingData.forEach(
                                    (module: any) => {
                                        if (
                                            module.moduleChapterData &&
                                            Array.isArray(
                                                module.moduleChapterData
                                            )
                                        ) {
                                            module.moduleChapterData.forEach(
                                                (assignment: any) => {
                                                    const title =
                                                        assignment.title || ''
                                                    if (
                                                        title
                                                            .toLowerCase()
                                                            .includes(term)
                                                    ) {
                                                        newSuggestions.push({
                                                            id: assignment.id,
                                                            title: title,
                                                            type: 'assignments',
                                                        })
                                                    }
                                                }
                                            )
                                        }
                                    }
                                )
                            }
                        } catch (error) {
                            console.error(
                                'Error fetching assignments for suggestions:',
                                error
                            )
                        }
                        break

                    case 'video':
                        try {
                            const videoRes = await api.get(
                                `/admin/bootcampModuleCompletion/bootcamp_id${
                                    params.courseId
                                }?searchAssessment=${encodeURIComponent(
                                    searchTerm
                                )}`
                            )
                            if (videoRes.data) {
                                // Handle the response structure - modules are keys in the response
                                Object.keys(videoRes.data).forEach(
                                    (moduleKey) => {
                                        // Skip non-module keys like totalStudents, totalRows, etc.
                                        if (
                                            moduleKey !== 'totalStudents' &&
                                            moduleKey !== 'totalRows' &&
                                            moduleKey !== 'message'
                                        ) {
                                            const moduleChapters =
                                                videoRes.data[moduleKey]
                                            if (Array.isArray(moduleChapters)) {
                                                moduleChapters.forEach(
                                                    (video: any) => {
                                                        const title =
                                                            video.title ||
                                                            video.name ||
                                                            ''
                                                        if (
                                                            title
                                                                .toLowerCase()
                                                                .includes(term)
                                                        ) {
                                                            newSuggestions.push(
                                                                {
                                                                    id: video.id,
                                                                    title: title,
                                                                    type: 'video',
                                                                }
                                                            )
                                                        }
                                                    }
                                                )
                                            }
                                        }
                                    }
                                )
                            }
                        } catch (error) {
                            console.error(
                                'Error fetching videos for suggestions:',
                                error
                            )
                        }
                        break
                }

                // Limit suggestions to 8 items and remove duplicates
                const uniqueSuggestions = newSuggestions.filter(
                    (suggestion, index, self) =>
                        index ===
                        self.findIndex(
                            (s) =>
                                s.id === suggestion.id &&
                                s.type === suggestion.type
                        )
                )

                setSuggestions(uniqueSuggestions.slice(0, 8))
            } catch (error) {
                console.error('Error generating suggestions:', error)
                setSuggestions([])
            }
        },
        [bootcampModules, formData, params.courseId, activeTab]
    ) // Added activeTab to dependencies

    // Load all data for suggestions
    const loadAllData = useCallback(async () => {
        try {
            setAllData((prevData) => ({
                ...prevData,
                projects: bootcampModules || [],
                form: formData || [],
            }))
        } catch (error) {
            console.error('Error loading data for suggestions:', error)
        }
    }, [bootcampModules, formData])

    // Click outside handler for suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target as Node) &&
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        // Cleanup timeout on unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            if (suggestionTimeout) {
                clearTimeout(suggestionTimeout)
            }
        }
    }, [suggestionTimeout])

    // Keyboard navigation for suggestions
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            // Apply search when Enter is pressed
            applySearch(searchInput.trim())
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }

    const getProjectsData = useCallback(async () => {
        try {
            let baseUrl = `/submission/submissionsOfProjects/${params.courseId}`
            if (appliedSearch && activeTab === 'projects') {
                baseUrl += `?searchProject=${encodeURIComponent(appliedSearch)}`
            }

            const res = await api.get(baseUrl)
            // Safe access to data with fallback to empty array
            const projectsData = res.data?.data?.bootcampModules || []
            setBootcampModules(projectsData)
            setTotalStudents(res.data?.totalStudents)
        } catch (error) {
            setBootcampModules([]) // Set to empty array on error
            setTotalStudents(0)
        }
    }, [params.courseId, appliedSearch, activeTab])

    const getFormData = useCallback(async () => {
        try {
            let baseUrl = `/submission/submissionsOfForms/${params.courseId}`
            if (appliedSearch && activeTab === 'form') {
                baseUrl += `?searchForm=${encodeURIComponent(appliedSearch)}`
            }

            const res = await api.get(baseUrl)
            // Safe access to data with fallback to empty array
            const formsData = res.data?.trackingData || []
            setFormData(formsData)
            console.log('res.data?.totalStudents', res.data?.totalStudents)
            setTotalStudents(res.data?.totalStudents)
        } catch (error) {
            setFormData([]) // Set to empty array on error
            setTotalStudents(0)
            toast.error({
                title: 'Error',
                description: 'Error fetching form data',
            })
            // }
        }
    }, [params.courseId, appliedSearch, activeTab])

    useEffect(() => {
        if (params.courseId) {
            getProjectsData()
            getFormData()
        }
    }, [params.courseId, getProjectsData, getFormData, activeTab])

    // Update suggestions when data changes
    useEffect(() => {
        loadAllData()
    }, [loadAllData])

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

     // If input is manually cleared (not via X), remove search param and show all data
    useEffect(() => {
        if (searchInput.trim() === '' && appliedSearch !== '') {
            setAppliedSearch('')
            updateURL(activeTab, '')
        }
    }, [searchInput, appliedSearch, activeTab, updateURL])
    
    // Filter projects based on applied search - with safe array access
    const filteredProjects = (bootcampModules || []).filter((item: any) => {
        if (!appliedSearch) return true
        const title = item.projectData?.[0]?.title || ''
        return title.toLowerCase().includes(appliedSearch.toLowerCase())
    })

    // Filter forms based on applied search - with safe array access
    const filteredForms = (formData || []).filter((item: any) => {
        if (!appliedSearch) return true

        // Check main form name
        const formName = item.name || ''
        if (formName.toLowerCase().includes(appliedSearch.toLowerCase())) {
            return true
        }

        // Check chapter names - with safe array access
        return item.moduleChapterData?.some((chapter: any) => {
            const chapterTitle = chapter.title || chapter.name || ''
            return chapterTitle
                .toLowerCase()
                .includes(appliedSearch.toLowerCase())
        })
    })

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
                        <Input
                            ref={searchInputRef}
                            placeholder={`${
                                activeTab === 'practice'
                                    ? 'Search for practice problems by name'
                                    : `Search for ${activeTab} by name`
                            }`}
                            className="w-full my-6 pl-10 pr-10"
                            value={searchInput}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() =>
                                searchInput.length >= 1 &&
                                setShowSuggestions(true)
                            }
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                        {searchInput && (
                            <button
                                onClick={clearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                        <div
                            ref={suggestionsRef}
                            className="absolute z-50 w-full lg:w-1/3 bg-white border border-gray-200 rounded-md shadow-lg"
                            style={{ top: '100%', marginTop: '-1rem' }}
                        >
                            {suggestions
                                .slice(0, 7)
                                .map((suggestion, index) => (
                                    <div
                                        key={`${suggestion.type}-${suggestion.id}-${index}`}
                                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                        onClick={() =>
                                            handleSuggestionClick(suggestion)
                                        }
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900 truncate">
                                                {suggestion.title}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full">
                {activeTab === 'practice' && (
                    <PraticeProblemsComponent
                        courseId={params.courseId}
                        debouncedSearch={appliedSearch}
                    />
                )}
                {activeTab === 'assessments' && (
                    <AssesmentSubmissionComponent
                        searchTerm={appliedSearch}
                        courseId={params.courseId}
                    />
                )}
                {activeTab === 'projects' &&
                    (filteredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
                            {filteredProjects.map((item: any) => {
                                const submissions =
                                    item.projectData?.[0]?.submitStudents || 0

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
                                                // { header: 'Status', dataKey: 'status' },
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

                                            doc.save(
                                                `${
                                                    item.projectData?.[0]
                                                        ?.title || 'project'
                                                }.pdf`
                                            )
                                        } catch (error) {
                                            console.error(
                                                'Error generating PDF:',
                                                error
                                            )
                                            toast({
                                                title: 'Error',
                                                description:
                                                    'Failed to generate PDF',
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
                                            onClick={
                                                submissions > 0
                                                    ? handleDownloadPdf
                                                    : undefined
                                            }
                                            className={`absolute top-2 right-2 z-10 transform cursor-pointer ${
                                                submissions > 0
                                                    ? 'hover:text-gray-700'
                                                    : 'text-gray-400'
                                            }`}
                                            title="Download Report"
                                            disabled={submissions === 0}
                                        >
                                            <ArrowDownToLine
                                                size={20}
                                                className="text-gray-500"
                                            />
                                        </button>

                                        <div className="flex flex-col w-full">
                                            <h1 className="font-semibold text-start text-[1.5rem]">
                                                {item.projectData[0].title ||
                                                    'Untitled Project'}
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
                                                    href={`/admin/courses/${params.courseId}/submissionProjects/${item.projectData?.[0]?.id}`}
                                                >
                                                    <Button
                                                        variant={'ghost'}
                                                        className="text-green-700 text-sm"
                                                    >
                                                        View Submission{' '}
                                                        <ChevronRight
                                                            className="text-green-700"
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
                            <h1 className="text-center font-semibold text-[1.063rem]">
                                {appliedSearch
                                    ? `No Projects Found for "${appliedSearch}"`
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
                        {filteredForms.length > 0 ? (
                            filteredForms.map((item: any) => {
                                // Filter chapters based on search if there's a search term - with safe array access
                                const filteredChapters = appliedSearch
                                    ? (item.moduleChapterData || []).filter(
                                          (chapter: any) => {
                                              const chapterTitle =
                                                  chapter.title ||
                                                  chapter.name ||
                                                  ''
                                              const formName = item.name || ''
                                              return (
                                                  chapterTitle
                                                      .toLowerCase()
                                                      .includes(
                                                          appliedSearch.toLowerCase()
                                                      ) ||
                                                  formName
                                                      .toLowerCase()
                                                      .includes(
                                                          appliedSearch.toLowerCase()
                                                      )
                                              )
                                          }
                                      )
                                    : item.moduleChapterData || []

                                return filteredChapters.map(
                                    (data: any, index: any) => (
                                        <FormComponent
                                            key={`${item.id}-${index}`}
                                            moduleName={item.name}
                                            moduleId={item.id}
                                            bootcampId={item.bootcampId}
                                            data={data}
                                            debouncedSearch={appliedSearch}
                                        />
                                    )
                                )
                            })
                        ) : (
                            <div className="w-screen flex flex-col justify-center items-center h-4/5">
                                <h1 className="text-center font-semibold text-[1.063rem]">
                                    {appliedSearch
                                        ? `No Forms Found for "${appliedSearch}"`
                                        : 'No Forms Found'}
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
                        debouncedSearch={appliedSearch}
                        courseId={params.courseId}
                    />
                )}
                {activeTab === 'video' && (
                    <VideoSubmission
                        debouncedSearch={searchParams.get('search') || ''}
                        courseId={params.courseId}
                    />
                )}
            </div>
        </div>
    )
}

export default Page
