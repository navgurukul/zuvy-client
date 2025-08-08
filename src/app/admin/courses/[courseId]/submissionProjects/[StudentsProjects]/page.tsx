'use client'
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { columns } from './columns'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import { Skeleton } from '@nextui-org/react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type Props = {}

const Page = ({ params }: any) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [data, setData] = useState<any>()
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [projectStudentData, setProjectStudentData] = useState<any>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [searchQuery, setSearchQuery] = useState<string>('') // What user types
    const [appliedSearchQuery, setAppliedSearchQuery] = useState<string>('') // What actually filters the data
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

    const crumbs = [
        {
            crumb: 'My Courses',
            href: `/admin/courses`,
            isLast: false,
        },
        {
            crumb: bootcampData?.name,
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: 'Submission - Projects',
            href: `/admin/courses/${params.courseId}/submissions`,
            isLast: false,
        },
        {
            crumb: data?.projectData[0].title,
            isLast: true,
        },
    ]

    // Get search suggestions from existing data - use searchQuery for suggestions
    const searchSuggestions = useMemo(() => {
        // Fixed: Add null/undefined check for searchQuery
        if (!searchQuery?.trim() || !projectStudentData?.length) return []
    
        const query = searchQuery.toLowerCase()
        const suggestions: { name: string; email: string }[] = []
    
        const seen = new Set()
    
        projectStudentData.forEach((student: any) => {
            // Fixed: Use consistent property names (userName and userEmail)
            const nameMatch = student.userName?.toLowerCase().includes(query)
            const emailMatch = student.userEmail?.toLowerCase().includes(query)
    
            if ((nameMatch || emailMatch) && !seen.has(student.userEmail)) {
                suggestions.push({ 
                    name: student.userName || '', 
                    email: student.userEmail || '' 
                })
                seen.add(student.userEmail)
            }
        })
    
        return suggestions.slice(0, 5)
    }, [searchQuery, projectStudentData])

   // Filter data based on appliedSearchQuery, not searchQuery
    const filteredData = useMemo(() => {
        // Fixed: Add null/undefined check for appliedSearchQuery
        if (!appliedSearchQuery?.trim()) {
            return projectStudentData
        }

        const searchTerm = appliedSearchQuery.toLowerCase()
        const filtered = projectStudentData.filter((student: any) => {
            const nameMatch = student.userName && student.userName.toLowerCase().includes(searchTerm)
            const emailMatch = student.userEmail && student.userEmail.toLowerCase().includes(searchTerm)
            return nameMatch || emailMatch
        })
        return filtered
    }, [projectStudentData, appliedSearchQuery])

    // Update URL with search parameter
    const updateSearchInURL = useCallback((query: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (query?.trim()) {
            params.set('search', query)
        } else {
            params.delete('search')
        }

        router.push(pathname + '?' + params.toString())
    }, [searchParams, router, pathname])

    // Handle search input change - only update searchQuery, not appliedSearchQuery
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value || '' // Ensure it's never undefined
        setSearchQuery(value)
        setShowSuggestions(value?.trim()?.length > 0)

        // If input is empty, clear search from URL and applied query
        if (!value?.trim()) {
            setAppliedSearchQuery('') // Clear applied search when input is empty
            updateSearchInURL('')
        }
    }

    // Handle search submission - apply the search query
    const handleSearchSubmit = (query?: string) => {
        const searchTerm = (query || searchQuery || '').trim() // Safe fallback
        setAppliedSearchQuery(searchTerm) // Apply the search to filter data
        setShowSuggestions(false)
        updateSearchInURL(searchTerm)
    }

    // Fixed: Handle suggestion click - apply the selected suggestion
    const handleSuggestionClick = (suggestion: { name: string; email: string }) => {
        console.log('Suggestion clicked:', suggestion)
        const searchTerm = suggestion.name // You can use suggestion.name or suggestion.email
        setSearchQuery(searchTerm)
        setAppliedSearchQuery(searchTerm) // Apply the selected suggestion to filter data
        setShowSuggestions(false)
        updateSearchInURL(searchTerm)
    }

    // Handle clear search - clear both search queries
    const handleClearSearch = () => {
        setSearchQuery('')
        setAppliedSearchQuery('') // Clear applied search
        setShowSuggestions(false)
        updateSearchInURL('')
    }

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchSubmit()
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }

    const getProjectsData = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/submissionsOfProjects/${params.courseId}`
            )
            setData(res.data.data.bootcampModules[0])
            setTotalStudents(res.data.totalStudents)
        } catch (error) {
            console.error(error)
        }
    }, [params.courseId])

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.courseId])

    const getProjectsStudentData = useCallback(async () => {
        try {
            const res = await api.get(
                `/submission/projects/students?projectId=${params.StudentsProjects}&bootcampId=${params.courseId}`
            )
            setProjectStudentData(
                res.data.projectSubmissionData.projectTrackingData
            )
        } catch (error) {
            console.error('Error fetching project student data:', error)
        }
    }, [params.courseId, params.StudentsProjects])

    // Initialize search from URL on component mount
    useEffect(() => {
        const searchFromURL = searchParams.get('search')
        console.log('Search from URL:', searchFromURL)
        if (searchFromURL) {
            setSearchQuery(searchFromURL)
            setAppliedSearchQuery(searchFromURL) // Also apply it to filter data
        } else {
            setSearchQuery('')
            setAppliedSearchQuery('')
        }
    }, [searchParams])

    useEffect(() => {
        getProjectsData()
        getProjectsStudentData()
        getBootcampHandler()
    }, [getProjectsData, getProjectsStudentData, getBootcampHandler])

    return (
        <>
            {data ? (
                <BreadcrumbComponent crumbs={crumbs} />
            ) : (
                <Skeleton className="h-4 w-4/6" />
            )}
            <MaxWidthWrapper className="p-4">
                <div className="flex flex-col gap-y-4">
                    {data ? (
                        <h1 className="text-start text-xl font-bold capitalize text-gray-600">
                            {data?.projectData[0].title}
                        </h1>
                    ) : (
                        <Skeleton className="h-4 w-full" />
                    )}

                    <div className="text-start flex gap-x-3">
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {totalStudents}
                            </h1>
                            <p className="text-gray-500 ">Total Students</p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {data?.projectData[0].submitStudents}
                            </h1>
                            <p className="text-gray-500 ">
                                Submissions Received
                            </p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {data?.projectData[0]?.submitStudents ?
                                    (totalStudents - data.projectData[0].submitStudents).toString() :
                                    totalStudents.toString()
                                }
                            </h1>
                            <p className="text-gray-500 ">Not Yet Submitted</p>
                        </div>
                    </div>

                    {/* Search Input with Suggestions */}
                    <div className="relative w-1/3">
                        <div className="relative">
                            <Input
                                placeholder="Search for Name, Email..."
                                className="input-with-icon pl-8 pr-10"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyPress}
                                onFocus={() => {
                                    if (searchQuery.trim().length > 0) {
                                        setShowSuggestions(true)
                                    }
                                }}
                                onBlur={() => {
                                    // Small delay to allow suggestion clicks to work
                                    setTimeout(() => setShowSuggestions(false), 150)
                                }}
                            />
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <Search className="text-gray-400" size={20} />
                            </div>
                            {searchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute inset-y-0 right-0 pr-2 flex items-center hover:text-gray-600 transition-colors"
                                    type="button"
                                >
                                    <X className="text-gray-400 hover:text-gray-600" size={20} />
                                </button>
                            )}
                        </div>

                        {/* Search Suggestions Dropdown */}
                        {showSuggestions && searchSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                {searchSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors text-sm text-gray-700"
                                        onClick={() => handleSuggestionClick(suggestion)} // Fixed: Pass whole suggestion object
                                        onMouseDown={(e) => e.preventDefault()} // Prevents onBlur from firing before onClick
                                        type="button"
                                    >
                                       <div className="font-medium">{suggestion.name}</div>
                                       <div className="text-xs text-gray-500">{suggestion.email}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <DataTable data={filteredData} columns={columns} />
                </div>
            </MaxWidthWrapper>

            {/* Click outside to close suggestions */}
            {showSuggestions && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSuggestions(false)}
                />
            )}
        </>
    )
}

export default Page
