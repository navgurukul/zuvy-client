'use client'

import { Input } from '@/components/ui/input'
import { api } from '@/utils/axios.config'
import React, { useEffect, useState } from 'react'
import styles from './../../admin/courses/_components/cources.module.css'
import { Card } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'
import OptimizedImageWithFallback from '@/components/ImageWithFallback'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {Bootcamp,BootcampType,Course} from "@/app/student/explore/type"


type searchedCourses = Course[]
type allPublicCourses = Course[]

const ExploreCourses = () => {
    const [searchedCourses, setSearchedCourses] = useState<searchedCourses>([])
    const [allPublicCourses, setAllPublicCourses] = useState<allPublicCourses>(
        []
    )
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    let totalPages = Math.ceil(allPublicCourses.length / itemsPerPage)

    useEffect(() => {
        const getAllPublicCourses = async () => {
            try {
                const response = await api.get(`/student/bootcamp/public`)
                setAllPublicCourses(response.data)
            } catch (error) {
                console.error('Error getting all public courses:', error)
            }
        }

        getAllPublicCourses()
    }, [])

    const getSearchedCourses = async () => {
        try {
            const response = await api.get(
                `/student/bootcamp/search?searchTerm=${searchTerm}`
            )
            setSearchedCourses(response.data)
        } catch (error) {
            console.error('Error getting searched courses:', error)
        }
    }

    totalPages = Math.ceil(
        (searchTerm ? searchedCourses.length : allPublicCourses.length) /
            itemsPerPage
    )

    const pageNumbers = []
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
    }

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage

    const currentItems =
        searchTerm && searchedCourses.length > 0
            ? searchedCourses.slice(indexOfFirstItem, indexOfLastItem)
            : allPublicCourses.slice(indexOfFirstItem, indexOfLastItem)

    const handleItemsPerPageChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setItemsPerPage(Number(e.target.value))
        const newTotalPages = Math.ceil(
            allPublicCourses.length / Number(e.target.value)
        )
        if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages)
        } else {
            setCurrentPage(1) // reset to first page when items per page changes
        }
    }
    return (
        <>
            <div
                className={styles.searchContainer}
                style={{
                    display: 'flex',

                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '600px',
                }}
            >
                <Input
                    type="text"
                    placeholder="Search for Courses - Eg. Python"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value)
                        if (searchTerm.trim().length === 0) {
                            setSearchedCourses([])
                        }
                    }}
                />
                <Button className="mt-2 ml-2" onClick={getSearchedCourses}>
                    Search
                </Button>
            </div>

            <div className="flex">
                {currentItems.map((course) => (
                    <div key={course.zuvy_bootcamps.id}>
                        <Card
                            key={course.zuvy_bootcamps.id}
                            className="h-max w-[400px] cursor-pointer mt-5 mr-10"
                        >
                            <div className="bg-muted flex justify-center h-[200px] relative overflow-hidden rounded-sm">
                                <OptimizedImageWithFallback
                                    src={course.zuvy_bootcamps.coverImage ?? ''}
                                    alt={course.zuvy_bootcamps.name}
                                    fallBackSrc={'/logo_white.png'}
                                />
                            </div>
                            <div className="text-start px-4 py-3 bg-muted">
                                <p className="capitalize mb-2 font-semibold">
                                    {course.zuvy_bootcamps.name}
                                </p>
                                <div className="flex gap-2 items-center">
                                    <GraduationCap width={20} />
                                    <div className="text-sm font-semibold">
                                        {course.students_in_bootcamp} Learners
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center pt-5">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={() =>
                                    currentPage > 1 &&
                                    setCurrentPage(currentPage - 1)
                                }
                            />
                        </PaginationItem>
                        {pageNumbers.map((number) => (
                            <PaginationItem key={number}>
                                <PaginationLink
                                    href="#"
                                    onClick={() => setCurrentPage(number)}
                                    className={
                                        number === currentPage
                                            ? 'bg-green-600 text-white'
                                            : 'bg-secondary text-white'
                                    }
                                >
                                    {number}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={() =>
                                    currentPage < totalPages &&
                                    setCurrentPage(currentPage + 1)
                                }
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <select
                                onChange={handleItemsPerPageChange}
                                value={itemsPerPage}
                            >
                                <option value="1">1</option>
                                <option value="20">20</option>
                                <option value="30">30</option>
                                <option value="40">40</option>
                                <option value="50">50</option>
                            </select>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </>
    )
}

export default ExploreCourses
