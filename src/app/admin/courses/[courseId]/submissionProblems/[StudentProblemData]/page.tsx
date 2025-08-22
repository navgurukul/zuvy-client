'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'

import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import { columns } from './columns'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {PageParams,BootcampData,StudentPage,Module} from "@/app/admin/courses/[courseId]/submissionProblems/[StudentProblemData]/studentProblemdataType"


const PraticeProblems = ({ params }: PageParams) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    
    const [matchingData, setMatchingData] = useState<any>(null)
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [studentDetails, setStudentDetails] = useState<any[]>([])
    const [filteredStudentDetails, setFilteredStudentDetails] = useState<any[]>([])
    const [bootcampData, setBootcampData] = useState<BootcampData |null>(null)
    const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '')
    const [activeSearch, setActiveSearch] = useState<string>(searchParams.get('search') || '')
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false)

    // Update URL with search parameter
    const updateSearchInURL = useCallback((query: string) => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (query.trim()) {
            params.set('search', query)
        } else {
            params.delete('search')
        }
        
        router.push(pathname + '?' + params.toString())
    }, [searchParams, router, pathname])

    const crumbs = useMemo(
        () => [
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
            // {
            //     crumb: 'Submission - Practice Problems',
            //     href: '',
            //     isLast: false,
            // },
            {
                crumb: (matchingData?.moduleChapterData[0]?.codingQuestionDetails 
                ?.title) + ' - Submissions',
                href: '',
                isLast: true,
            },
        ],
        [bootcampData, matchingData, params]
    )

    // Get search suggestions from existing data
    const searchSuggestions = useMemo(() => {
        if (!searchQuery.trim() || !studentDetails.length) return []
        
        const suggestions: { name: string; email: string }[] = []
        const query = searchQuery.toLowerCase()
        
        studentDetails.forEach((student: StudentPage) => {
            const nameMatch = student.name && student.name.toLowerCase().includes(query)
            const emailMatch = student.email && student.email.toLowerCase().includes(query)
            
            if (nameMatch || emailMatch) {
                // Avoid duplicates
                const exists = suggestions.some(s => s.name === student.name && s.email === student.email)
                if (!exists) {
                    suggestions.push({
                        name: student.name || '',
                        email: student.email || ''
                    })
                }
            }
        })
        
        return suggestions.slice(0, 5)
    }, [searchQuery, studentDetails])

    // Filter student details based on search
    const filterStudentDetails = useCallback((students: StudentPage[], query: string) => {
        if (!query.trim()) return students
        
        const searchTerm = query.toLowerCase()
        return students.filter((student: StudentPage) => {
            const nameMatch = student.name && student.name.toLowerCase().includes(searchTerm)
            const emailMatch = student.email && student.email.toLowerCase().includes(searchTerm)
            return nameMatch || emailMatch
        })
    }, [])

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const isAddingText = value.length > searchQuery.length
        
        setSearchQuery(value)
        setShowSuggestions(isAddingText && value.trim().length > 0)
        
        // Filter data in real-time
        const filtered = filterStudentDetails(studentDetails, value)
        setFilteredStudentDetails(filtered)
    }

    // Handle suggestion click - use name for input and URL
    const handleSuggestionClick = (suggestion: { name: string; email: string }) => {
        const displayValue = suggestion.name || suggestion.email // Fallback to email if no name
        setSearchQuery(displayValue)
        setActiveSearch(displayValue)
        setShowSuggestions(false)
        updateSearchInURL(displayValue)
        
        // Filter data based on selected suggestion
        const filtered = filterStudentDetails(studentDetails, displayValue)
        setFilteredStudentDetails(filtered)
    }

    // Handle clear search
    const handleClearSearch = () => {
        setSearchQuery('')
        setActiveSearch('')
        setShowSuggestions(false)
        updateSearchInURL('')
        setFilteredStudentDetails(studentDetails) // Reset to all data
    }
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setActiveSearch(searchQuery)
            setShowSuggestions(false)
            updateSearchInURL(searchQuery.trim())
            
            // Filter data on Enter
            const filtered = filterStudentDetails(studentDetails, searchQuery)
            setFilteredStudentDetails(filtered)
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(
            'crumbData',
            JSON.stringify([
                bootcampData?.name,
                `${matchingData?.moduleChapterData[0]?.codingQuestionDetails
                    ?.title} - Submissions`,
            ])
        )
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [submissionRes, bootcampRes] = await Promise.all([
                    api.get(
                        `/submission/submissionsOfPractiseProblems/${params.courseId}`
                    ),
                    api.get(`/bootcamp/${params.courseId}`),
                ])

                const submissions = submissionRes.data.trackingData
                setTotalStudents(submissionRes.data.totalStudents)
                setBootcampData(bootcampRes.data.bootcamp)

                if (submissions.length > 0 && params.StudentProblemData) {
                    const matchingModule = submissions.find(
                        (module: Module) =>
                            module.id === +params.StudentProblemData
                    )
                    setMatchingData(matchingModule || null)

                    if (matchingModule) {
                        const studentRes = await api.get(
                            `/submission/practiseProblemStatus/${matchingModule.id}?chapterId=${matchingModule.moduleChapterData[0].id}&questionId=${matchingModule.moduleChapterData[0].codingQuestionDetails.id}`
                        )
                        const updatedStudentDetails = studentRes.data.data.map((studentDetail: any) => ({
                            ...studentDetail,
                            email: studentDetail.emailId,
                            bootcampId: params.courseId,
                            questionId: matchingModule.moduleChapterData[0].codingQuestionDetails.id,
                            moduleId: params.StudentProblemData,
                        }))
                        

                        setStudentDetails(updatedStudentDetails)
                        
                        // Apply initial search filter if there's a search query from URL
                        const searchFromURL = searchParams.get('search')
                        if (searchFromURL) {
                            const filtered = filterStudentDetails(updatedStudentDetails, searchFromURL)
                            setFilteredStudentDetails(filtered)
                        } else {
                            setFilteredStudentDetails(updatedStudentDetails)
                        }
                    }
                } else {
                    setMatchingData(null)
                    setStudentDetails([])
                    setFilteredStudentDetails([])
                }
            } catch (error) {
                console.error('Error fetching data', error)
            }
        }

        fetchData()
    }, [params.courseId, params.StudentProblemData, searchParams, filterStudentDetails])

    // Initialize from URL
    useEffect(() => {
        const searchFromURL = searchParams.get('search')
        if (searchFromURL) {
            setSearchQuery(searchFromURL)
            setActiveSearch(searchFromURL)
        }
    }, [searchParams])
    
    useEffect(() => {
        if (!searchQuery.trim() && activeSearch) {
            setActiveSearch('')
            updateSearchInURL('')
            setFilteredStudentDetails(studentDetails) // Reset to all data
        }
    }, [searchQuery, activeSearch, updateSearchInURL, studentDetails])

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <MaxWidthWrapper className="p-4">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-primary">
                        {
                            matchingData?.moduleChapterData[0]
                                ?.codingQuestionDetails?.title
                        }
                    </h1>

                    <div className="text-start flex gap-x-3">
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {totalStudents}
                            </h1>
                            <p className="text-gray-500 ">Total Students</p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {
                                    matchingData?.moduleChapterData[0]
                                        .submitStudents
                                }
                            </h1>
                            <p className="text-gray-500 ">
                                Submissions Received
                            </p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {totalStudents -
                                    matchingData?.moduleChapterData[0]
                                        .submitStudents}
                            </h1>
                            <p className="text-gray-500 ">Not Yet Submitted</p>
                        </div>
                    </div>

                    {/* Search input with suggestions */}
                    <div className="relative w-1/3">
                        <div className="relative">
                            <Input
                                placeholder="Search by name or email"
                                className="input-with-icon pl-8 pr-10"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyPress}
                                onFocus={() => {
                                    setIsInputFocused(true)
                                    if (searchQuery.trim().length > 0) {
                                        setShowSuggestions(true)
                                    }
                                }}
                                onBlur={() => {
                                    setIsInputFocused(false)
                                    setTimeout(() => setShowSuggestions(false), 200)
                                    
                                    // If input is cleared manually and user didn't press Enter
                                    if (!searchQuery.trim() && activeSearch) {
                                        setActiveSearch('')
                                        updateSearchInURL('')
                                        setFilteredStudentDetails(studentDetails)
                                    }
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

                        {/* Suggestions dropdown */}
                        {showSuggestions && isInputFocused && searchQuery.trim().length > 0 && searchSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                                {searchSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors text-sm text-gray-700"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        type="button"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{suggestion.name}</span>
                                            <span className="text-xs text-gray-500">{suggestion.email}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <DataTable data={filteredStudentDetails} columns={columns} />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default PraticeProblems