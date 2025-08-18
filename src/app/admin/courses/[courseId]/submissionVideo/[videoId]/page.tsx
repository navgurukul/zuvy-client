'use client'

// External imports
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { columns } from './column'
import { DataTable } from '@/app/_components/datatable/data-table'
import { api } from '@/utils/axios.config'
import BreadcrumbComponent from '@/app/_components/breadcrumbCmponent'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type Props = {}

const Page = ({ params }: any) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    
    const [videoData, setVideoData] = useState<any>()
    const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '')
    const [activeSearch, setActiveSearch] = useState<string>(searchParams.get('search') || '')
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false)
    const [dataTableVideo, setDataTableVideo] = useState<any>([])
    const [bootcampData, setBootcampData] = useState<any>()
    const [isLoading, setIsLoading] = useState<boolean>(true)

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
            crumb: videoData?.title || 'Loading...',
            // href: '',
            isLast: true,
        },
    ]

    // Get search suggestions from existing data
    const searchSuggestions = useMemo(() => {
        if (!searchQuery.trim() || !dataTableVideo.length) return []
        
        const suggestions: { name: string; email: string }[] = []
        const query = searchQuery.toLowerCase()
        
        dataTableVideo.forEach((student: any) => {
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
    }, [searchQuery, dataTableVideo])

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const isAddingText = value.length > searchQuery.length
        
        setSearchQuery(value)
        setShowSuggestions(isAddingText && value.trim().length > 0)
    }

    // Handle suggestion click - use name for input and URL
    const handleSuggestionClick = (suggestion: { name: string; email: string }) => {
        const displayValue = suggestion.name || suggestion.email // Fallback to email if no name
        setSearchQuery(displayValue)
        setActiveSearch(displayValue)
        setShowSuggestions(false)
        updateSearchInURL(displayValue)
    }

    // Handle clear search
    const handleClearSearch = () => {
        setSearchQuery('')
        setActiveSearch('')
        setShowSuggestions(false)
        updateSearchInURL('')
    }
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setActiveSearch(searchQuery)
            setShowSuggestions(false)
            updateSearchInURL(searchQuery.trim()) // even if empty
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }
    

    const getBootcampHandler = useCallback(async () => {
        try {
            const res = await api.get(`/bootcamp/${params.courseId}`)
            setBootcampData(res.data.bootcamp)
        } catch (error) {
            console.error('API Error:', error)
        }
    }, [params.courseId])

    const getStudentVideoDataHandler = useCallback(async () => {
        try {
            setIsLoading(true)
            const endpoint = activeSearch
                ? `admin/moduleChapter/students/chapter_id${params.videoId}?searchStudent=${activeSearch}`
                : `admin/moduleChapter/students/chapter_id${params.videoId}`

            const res = await api.get(endpoint)
            setVideoData(res.data.moduleVideochapter)
            setDataTableVideo(res.data.submittedStudents || [])
        } catch (error) {
            console.error('API Error:', error)
            setDataTableVideo([])
        } finally {
            setIsLoading(false)
        }
    }, [params.videoId, activeSearch])

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    getStudentVideoDataHandler(),
                    getBootcampHandler(),
                ])
            } catch (error) {
                console.error('Error in fetching data:', error)
            }
        }

        fetchData()
    }, [getStudentVideoDataHandler, getBootcampHandler])

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
        }
    }, [searchQuery])
    

    return (
        <>
            <BreadcrumbComponent crumbs={crumbs} />
            <MaxWidthWrapper className="p-4">
                <div className="flex flex-col gap-y-4">
                    <h1 className="text-start text-xl font-bold capitalize text-gray-600">
                        {videoData?.title || 'Loading...'}
                    </h1>

                    {/* Stats cards */}
                    <div className="text-start flex gap-x-3">
                        <div className="p-4 rounded-lg shadow-md ">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {videoData?.totalStudents || 0}
                            </h1>
                            <p className="text-gray-500">Total Students</p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {videoData?.totalSubmittedStudents || 0}
                            </h1>
                            <p className="text-gray-500">Watched Entire Video</p>
                        </div>
                        <div className="p-4 rounded-lg shadow-md">
                            <h1 className="text-gray-600 font-semibold text-xl">
                                {((videoData?.totalStudents || 0) - (videoData?.totalSubmittedStudents || 0)).toString()}
                            </h1>
                            <p className="text-gray-500">Not Yet Watched</p>
                        </div>
                    </div>

                    {/* Search input */}
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
                                    
                                    // New: if input is cleared manually and user didn't press Enter
                                    if (!searchQuery.trim() && activeSearch) {
                                        setActiveSearch('')
                                        updateSearchInURL('')
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
                    <DataTable data={dataTableVideo} columns={columns} />
                </div>
            </MaxWidthWrapper>
        </>
    )
}

export default Page
