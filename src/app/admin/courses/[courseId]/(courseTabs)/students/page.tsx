// 'use client'
// import { useCourseExistenceCheck } from '@/hooks/useCourseExistenceCheck'
// import React, { useState, useEffect, useCallback } from 'react'
// import Image from 'next/image'
// import { ArrowLeft, ArrowRight, ChevronDown, Plus } from 'lucide-react'

// import { Button } from '@/components/ui/button'
// import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { DataTable } from '@/app/_components/datatable/data-table'
// import { ROWS_PER_PAGE } from '@/utils/constant'
// import AddStudentsModal from '../../_components/addStudentsmodal'
// import { columns } from './columns'
// import { getBatchData } from '@/store/store'
// import { useRouter } from 'next/navigation'
// import { useStudentData } from './components/useStudentData'
// import { ComboboxStudent } from './components/comboboxStudentDataTable'
// import { api } from '@/utils/axios.config'
// import AlertDialogDemo from './components/deleteModalNew'
// import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
// import axios from 'axios'
// import { toast } from '@/components/ui/use-toast'

// export type StudentData = {
//     email: string
//     name: string
//     userId: number
//     bootcampId: number
//     batchName: string
//     batchId: number
//     progress: number
//     profilePicture: string
// }

// interface Student {
//     email: string
//     name: string
// }

// type StudentDataState = Student[]

// const Page = ({ params }: { params: any }) => {
//     const router = useRouter()
//     // const { isCourseDeleted, loadingCourseCheck } = useCourseExistenceCheck(params.courseId)
//     const {
//         students,
//         totalPages,
//         currentPage,
//         limit,
//         offset,
//         search,
//         totalStudents,
//         suggestions, // Use suggestions instead of students for autocomplete
//         setStudents,
//         handleSetSearch,
//         commitSearch,
//         internalSearch,
//         debouncedInternalSearch,
//         fetchStudentData,
//     } = useStudentData(params.courseId)

//     const { batchData } = getBatchData()
//     const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
//     const [studentData, setStudentData] = useState<StudentDataState | any>({})
//     const [isOpen, setIsOpen] = useState(false)
//     const [showSuggestions, setShowSuggestions] = useState(false)

//     const filteredSuggestions = suggestions.slice(0, 6)

//     // Reset selectedRows when course changes
//     useEffect(() => {
//         setSelectedRows([])
//     }, [params.courseId])

//     const newBatchData = batchData?.map((data) => {
//         return {
//             value: data.id,
//             label: data.name,
//         }
//     })

//     const fetchStudentDataForBatch = useCallback(
//         async (offsetValue: number) => {
//             try {
//                 const res = await api.get(
//                     `/bootcamp/students/${params.courseId}?limit=${limit}&offset=${offset}`
//                 )
//                 setSelectedRows([])
//                 setStudents(res.data.modifiedStudentInfo)
//             } catch (error: any) {
//                 if (axios.isAxiosError(error)) {
//                     if (
//                         error?.response?.data.message === 'Bootcamp not found!'
//                     ) {
//                         router.push(`/admin/courses`)
//                         toast.info({
//                             title: 'Caution',
//                             description:
//                                 'The Course has been deleted by another Admin',
//                         })
//                     }
//                 }
//                 console.error(error)
//             }
//         },
//         [params.courseId, limit, setStudents]
//     )

//     const userIds = selectedRows.map((item: any) => item.userId)

//     //     if (loadingCourseCheck) {
//     //       return (
//     //       <div className="flex justify-center items-center h-full mt-20">
//     //        <Spinner className="text-secondary" />
//     //      </div>
//     //      )
//     //    }

//     //    if (isCourseDeleted) {
//     //     return (
//     //      <div className="flex flex-col justify-center items-center h-full mt-20">
//     //        <Image src="/images/undraw_select-option_6wly.svg" width={350} height={350} alt="Deleted" />
//     //       <p className="text-lg text-red-600 mt-4">This course has been deleted.</p>
//     //       <Button onClick={() => router.push('/admin/courses')} className="mt-6 bg-secondary">
//     //         Back to Courses
//     //       </Button>
//     //      </div>
//     //    )
//     //   }

//     return (
//         <div className="text-gray-600">
//             <div>
//                 <div className="flex flex-col md:flex-row justify-between items-center gap-y-4">
//                     <div className="relative w-full md:w-1/2 lg:w-1/4">
//                         <Input
//                             type="search"
//                             placeholder="Search"
//                             className="w-full"
//                             value={internalSearch}
//                             onChange={(e) => {
//                                 handleSetSearch(e)
//                                 setShowSuggestions(true)

//                                 // If cleared, commit search but don't reset pagination
//                                 if (e.target.value.trim() === '') {
//                                     commitSearch('')
//                                     setShowSuggestions(false)
//                                 }
//                             }}
//                             onKeyDown={(e) => {
//                                 if (
//                                     e.key === 'Enter' &&
//                                     internalSearch.trim()
//                                 ) {
//                                     commitSearch(internalSearch.trim())
//                                     setShowSuggestions(false)
//                                 }
//                             }}
//                             onFocus={() => setShowSuggestions(true)}
//                             onBlur={() =>
//                                 setTimeout(() => setShowSuggestions(false), 200)
//                             }
//                         />

//                         {showSuggestions && filteredSuggestions.length > 0 && (
//                             <div className="absolute z-50 w-full bg-white border border-border rounded-md mt-1 shadow-lg">
//                                 {/* {filteredSuggestions.map(
//                                     (student: StudentData, i: number) => (
//                                         <div
//                                             key={i}
//                                             className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-left"
//                                             onClick={() => {
//                                                 handleSetSearch(student.name)
//                                                 commitSearch(student.name)
//                                                 setShowSuggestions(false)
//                                             }}
//                                         >
//                                             {student.name}
//                                         </div>
//                                     )
//                                 )} */}
//                                 {filteredSuggestions.map((student: StudentData, i: number) => (
//                                     <div
//                                         key={i}
//                                         className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-left"
//                                         onClick={() => {
//                                             handleSetSearch(student.name)
//                                             commitSearch(student.name)
//                                             setShowSuggestions(false)
//                                         }}
//                                     >
//                                         <div className="font-medium">{student.name}</div>
//                                         <div className="text-sm text-gray-500">{student.email}</div>
//                                     </div>
//                                 ))}

//                             </div>
//                         )}
//                     </div>

//                     <div className="flex flex-col md:flex-row items-center gap-x-2 gap-y-4">
//                         {selectedRows.length > 0 && (
//                             <>
//                                 <AlertDialogDemo
//                                     setSelectedRows={setSelectedRows}
//                                     userId={userIds}
//                                     bootcampId={batchData && params.courseId}
//                                     title="Are you absolutely sure?"
//                                     description={`This action cannot be undone. This will permanently remove the ${selectedRows.length > 1 ? 'students' : 'student'} from the bootcamp`}
//                                 />
//                                 <ComboboxStudent
//                                     batchData={newBatchData || []}
//                                     bootcampId={batchData && params.courseId}
//                                     selectedRows={selectedRows}
//                                     fetchStudentData={fetchStudentDataForBatch}
//                                 />
//                             </>
//                         )}
//                         <Dialog
//                             open={isOpen}
//                             onOpenChange={(open) => {
//                                 setIsOpen(open)
//                                 if (!open) {
//                                     // Modal is closing → reset studentData
//                                     setStudentData({ name: '', email: '' })
//                                 }
//                             }}
//                         >
//                             <DialogTrigger asChild>
//                                 <Button className="gap-x-2 bg-success-dark opacity-75">
//                                     <Plus /> Add Students
//                                 </Button>
//                             </DialogTrigger>
//                             <DialogOverlay />
//                             <AddStudentsModal
//                                 message={false}
//                                 id={params.courseId || 0}
//                                 batch={false}
//                                 batchId={0}
//                                 setStudentData={setStudentData}
//                                 studentData={studentData}
//                             />
//                         </Dialog>
//                     </div>
//                 </div>

//                 <div>
//                     <div className="mt-5">
//                         <DataTable
//                             data={students}
//                             columns={columns}
//                             setSelectedRows={setSelectedRows}
//                         />
//                     </div>

//                     {/* Use the imported DataTablePagination component */}
//                     <DataTablePagination
//                         totalStudents={totalStudents}
//                         lastPage={totalPages}
//                         pages={totalPages}
//                         fetchStudentData={fetchStudentData}
//                     />
//                 </div>
//             </div>
//         </div>
//     )
// }
// export default Page

// 'use client'

// import React, { useState, useEffect, useCallback } from 'react'
// import { useSearchParams, useRouter } from 'next/navigation'
// import Image from 'next/image'
// import { ArrowLeft, ArrowRight, ChevronDown, Plus, FileSpreadsheet, UserPlus } from 'lucide-react'

// import { Button } from '@/components/ui/button'
// import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { DataTable } from '../../../../../_components/datatable/data-table'
// import { ROWS_PER_PAGE } from '@/utils/constant'
// import AddStudentsModal from '../../_components/addStudentsmodal'
// import { columns } from './columns'
// import { getBatchData } from '@/store/store'
// import { useStudentData } from './components/useStudentData'
// import { ComboboxStudent } from './components/comboboxStudentDataTable'
// import { api } from '@/utils/axios.config'
// import AlertDialogDemo from './components/deleteModalNew'
// import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
// import axios from 'axios'
// import { toast } from '@/components/ui/use-toast'
// import { SearchBox } from '@/utils/searchBox'
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select"
// import StudentDetailsView from './components/StudentDetailsView'

// export type StudentData = {
//     email: string
//     name: string
//     userId: number
//     bootcampId: number
//     batchName: string
//     batchId: number
//     progress: number
//     profilePicture: string
//     enrolledDate?: string | null
// }

// interface Student {
//     email: string
//     name: string
// }

// type StudentDataState = Student[]

// const StudentsPage = ({ params }: { params: any }) => {
//     const searchParams = useSearchParams()
//     const router = useRouter()
//     const view = searchParams.get('view')
//     const studentId = searchParams.get('studentId')

//     const {
//         students,
//         totalPages,
//         currentPage,
//         limit,
//         offset,
//         search,
//         totalStudents,
//         setStudents,
//         fetchStudentData,
//     } = useStudentData(params.courseId)

//     const { batchData } = getBatchData()
//     const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
//     const [studentData, setStudentData] = useState<StudentDataState | any>({})
//     const [isOpen, setIsOpen] = useState(false)
//     const [isSingleStudentOpen, setIsSingleStudentOpen] = useState(false)
//     const [batchFilter, setBatchFilter] = useState<string>('')
//     const [statusFilter, setStatusFilter] = useState<string>('')

//     const fetchSuggestionsApi = useCallback(async (query: string) => {
//         const response = await api.get(
//           `/bootcamp/students/${params.courseId}?searchTerm=${query}`
//         );
//         // Map StudentData to include id property for Suggestion interface
//         const suggestions = (response.data.modifiedStudentInfo || []).map(
//           (student: StudentData) => ({
//             ...student,
//             id: student.userId, // Map userId to id for Suggestion interface
//           })
//         );
//         return suggestions;
//       }, [params.courseId]);

//       const fetchSearchResultsApi = useCallback(
//         async (query: string) => {
//           const response = await api.get(
//             `/bootcamp/students/${params.courseId}?limit=${limit}&offset=0&searchTerm=${query}`
//           );
//           setStudents(response.data.modifiedStudentInfo || []);
//           setSelectedRows([]);
//           return response.data;
//         },
//         [params.courseId, limit, setStudents]
//       );

//       const defaultFetchApi = useCallback(
//         async () => {
//           // Check if there's a search query in URL params
//           const urlSearchParams = new URLSearchParams(window.location.search);
//           const searchQuery = urlSearchParams.get("search");
//           let response;
//           if (searchQuery) {
//             // If there's a search query, fetch search results instead of default data
//             response = await api.get(
//               `/bootcamp/students/${params.courseId}?limit=${limit}&offset=0&searchTerm=${searchQuery}`
//             );
//           } else {
//             // Fetch default data when no search
//             response = await api.get(
//               `/bootcamp/students/${params.courseId}?limit=${limit}&offset=${offset}`
//             );
//           }
//           setStudents(response.data.modifiedStudentInfo || []);
//           setSelectedRows([]);
//           return response.data;
//         },
//         [params.courseId, limit, offset, setStudents, router]
//       );
//     // Reset selectedRows when course changes
//     useEffect(() => {
//         setSelectedRows([])
//     }, [params.courseId])

//     const newBatchData = batchData?.map((data) => {
//         return {
//             value: data.id,
//             label: data.name,
//         }
//     })

//     const fetchStudentDataForBatch = useCallback(
//         async (offsetValue: number) => {
//             try {
//                 const res = await api.get(
//                     `/bootcamp/students/${params.courseId}?limit=${limit}&offset=${offset}`
//                 )
//                 setSelectedRows([])
//                 setStudents(res.data.modifiedStudentInfo)
//             } catch (error: any) {
//                 if (axios.isAxiosError(error)) {
//                     if (
//                         error?.response?.data.message === 'Bootcamp not found!'
//                     ) {
//                         router.push(`/admin/courses`)
//                         toast.info({
//                             title: 'Caution',
//                             description:
//                                 'The Course has been deleted by another Admin',
//                         })
//                     }
//                 }
//                 console.error(error)
//             }
//         },
//         [params.courseId, limit, setStudents]
//     )

//     const userIds = selectedRows.map((item: any) => item.userId)

//     // Conditional rendering based on view parameter (Student folder style)
//     if (view === 'details' && studentId) {
//         return (
//             <StudentDetailsView
//                 courseId={params.courseId}
//                 studentId={studentId}
//                 onBack={() => {
//                     // Remove query params and go back to table view
//                     router.push(`/admin/courses/${params.courseId}/students`)
//                 }}
//             />
//         )
//     }

//     // Normal table view (default)
//     return (
//         <div className="text-gray-800">
//             <div className="text-start">
//                 <h2 className="font-heading text-xl font-semibold">Students</h2>
//                 <p className="text-muted-foreground">
//                     Manage student enrollments and track their progress
//                 </p>
//             </div>
//             <div>
//                 <div className="flex flex-col md:flex-row justify-between items-center gap-y-4">
//                     <div className="relative w-full md:w-1/2 lg:w-1/4">
//                          <SearchBox
//                         placeholder="Search students..."
//                         fetchSuggestionsApi={fetchSuggestionsApi}
//                         fetchSearchResultsApi={fetchSearchResultsApi}
//                         defaultFetchApi={defaultFetchApi}
//                         getSuggestionLabel={(student) => (
//                             <div>
//                                 <div className="font-medium">{student.name}</div>
//                                 <div className="text-sm text-gray-500">{student.email}</div>
//                             </div>

//                         )}
//                         inputWidth="w-full"
//                     />
//                     </div>

//                   {/* Filters Row (on mobile both in one row) */}
//                   <div className="flex w-full flex-row sm:flex-row items-center gap-x-3 gap-y-2 md:w-auto">
//                     {/* Batch Filter */}
//                     <Select value={batchFilter} onValueChange={setBatchFilter}>
//                       <SelectTrigger className="w-full sm:w-[160px] text-sm">
//                         <SelectValue placeholder="All Batches" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">All Batches</SelectItem>
//                         <SelectItem value="batch1">Batch A</SelectItem>
//                         <SelectItem value="batch2">Batch B</SelectItem>
//                         <SelectItem value="batch3">Batch C</SelectItem>
//                       </SelectContent>
//                     </Select>

//                     {/* Status Filter */}
//                     <Select value={statusFilter} onValueChange={setStatusFilter}>
//                       <SelectTrigger className="w-full sm:w-[160px] text-sm">
//                         <SelectValue placeholder="All Status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">All Status</SelectItem>
//                         <SelectItem value="active">Active</SelectItem>
//                         <SelectItem value="dropout">Dropout</SelectItem>
//                         <SelectItem value="graduate">Graduate</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Action Buttons Row (on mobile both in one row) */}
//                   <div className="flex w-full flex-row md:flex-row items-center gap-x-4 gap-y-2 md:w-auto">
//                     {/* Add Single Student Button */}
//                     <Dialog
//                       open={isSingleStudentOpen}
//                       onOpenChange={(open) => {
//                         setIsSingleStudentOpen(open)
//                         if (!open) {
//                           setStudentData({ name: '', email: '' })
//                         }
//                       }}
//                     >
//                       <DialogTrigger asChild>
//                         <Button className="flex-1 text-gray-800 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
//                           <UserPlus className="h-4 w-4 mr-2" />
//                           Add Single Student
//                         </Button>
//                       </DialogTrigger>
//                       <DialogOverlay />
//                       <AddStudentsModal
//                         message={false}
//                         id={params.courseId || 0}
//                         batch={false}
//                         batchId={0}
//                         setStudentData={setStudentData}
//                         studentData={studentData}
//                         modalType="single"
//                       />
//                     </Dialog>

//                     {/* Bulk Upload Button */}
//                     <Dialog
//                       open={isOpen}
//                       onOpenChange={(open) => {
//                         setIsOpen(open)
//                         if (!open) {
//                           setStudentData({ name: '', email: '' })
//                         }
//                       }}
//                     >
//                       <DialogTrigger asChild>
//                         <Button className="flex-1 bg-primary hover:bg-primary-dark shadow-4dp">
//                           <FileSpreadsheet className="h-4 w-4 mr-2" />
//                           Bulk Upload
//                         </Button>
//                       </DialogTrigger>
//                       <DialogOverlay />
//                       <AddStudentsModal
//                         message={false}
//                         id={params.courseId || 0}
//                         batch={false}
//                         batchId={0}
//                         setStudentData={setStudentData}
//                         studentData={studentData}
//                         modalType="bulk"
//                       />
//                     </Dialog>
//                   </div>
//                 </div>

//                 <div>
//                     <div className="mt-5">
//                         <DataTable
//                             data={students}
//                             columns={columns}
//                             setSelectedRows={setSelectedRows}
//                         />
//                     </div>

//                     {/* Use the imported DataTablePagination component */}
//                     <DataTablePagination
//                         totalStudents={totalStudents}
//                         lastPage={totalPages}
//                         pages={totalPages}
//                         fetchStudentData={fetchStudentData}
//                     />
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default StudentsPage

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    Plus,
    FileSpreadsheet,
    UserPlus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DataTable } from '../../../../../_components/datatable/data-table'
import { ROWS_PER_PAGE } from '@/utils/constant'
import AddStudentsModal from '../../_components/addStudentsmodal'
import { columns } from './columns'
import { getBatchData } from '@/store/store'
import { useStudentData } from './components/useStudentData'
import { ComboboxStudent } from './components/comboboxStudentDataTable'
import { api } from '@/utils/axios.config'
import AlertDialogDemo from './components/deleteModalNew'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { SearchBox } from '@/utils/searchBox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import StudentDetailsView from './components/StudentDetailsView'

export type StudentData = {
    email: string
    name: string
    userId: number
    bootcampId: number
    batchName: string
    batchId: number
    progress: number
    profilePicture: string
    enrolledDate?: string | null
}

interface Student {
    email: string
    name: string
}

type StudentDataState = Student[]

const StudentsPage = ({ params }: { params: any }) => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const view = searchParams.get('view')
    const studentId = searchParams.get('studentId')

    const {
        students,
        totalPages,
        currentPage,
        limit,
        offset,
        search,
        totalStudents,
        setStudents,
        fetchStudentData,
    } = useStudentData(params.courseId)

    const { batchData } = getBatchData()
    const [selectedRows, setSelectedRows] = useState<StudentData[]>([])
    const [studentData, setStudentData] = useState<StudentDataState | any>({})
    const [isOpen, setIsOpen] = useState(false)
    const [isSingleStudentOpen, setIsSingleStudentOpen] = useState(false)
    const [batchFilter, setBatchFilter] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [lastActiveFilter, setLastActiveFilter] = useState<string>('all')

    const fetchSuggestionsApi = useCallback(
        async (query: string) => {
            const response = await api.get(
                `/bootcamp/students/${params.courseId}?searchTerm=${query}`
            )
            // Map StudentData to include id property for Suggestion interface
            const suggestions = (response.data.modifiedStudentInfo || []).map(
                (student: StudentData) => ({
                    ...student,
                    id: student.userId, // Map userId to id for Suggestion interface
                })
            )
            return suggestions
        },
        [params.courseId]
    )

    const fetchSearchResultsApi = useCallback(
        async (query: string) => {
            const response = await api.get(
                `/bootcamp/students/${params.courseId}?limit=${limit}&offset=0&searchTerm=${query}`
            )
            setStudents(response.data.modifiedStudentInfo || [])
            setSelectedRows([])
            return response.data
        },
        [params.courseId, limit, setStudents]
    )

    //     const fetchSearchResultsApi = useCallback(
    //     async (query: string) => {
    //         let url = `/bootcamp/students/${params.courseId}?limit=${limit}&offset=0`

    //         // Detect if user typed attendance filter like ">80" or "<=60"
    //         const trimmed = query.trim()
    //         const attendanceMatch = trimmed.match(/^([<>]=?)\s*(\d{1,3})$/)

    //         if (attendanceMatch) {
    //             const operator = attendanceMatch[1]
    //             const value = attendanceMatch[2]
    //             url += `&attendanceFilter=${operator}${value}`
    //         } else {
    //             url += `&searchTerm=${query}`
    //         }

    //         const response = await api.get(url)
    //         setStudents(response.data.modifiedStudentInfo || [])
    //         setSelectedRows([])
    //         return response.data
    //     },
    //     [params.courseId, limit, setStudents]
    // )

    const defaultFetchApi = useCallback(async () => {
        // Check if there's a search query in URL params
        const urlSearchParams = new URLSearchParams(window.location.search)
        const searchQuery = urlSearchParams.get('search')
        let response
        if (searchQuery) {
            // If there's a search query, fetch search results instead of default data
            response = await api.get(
                `/bootcamp/students/${params.courseId}?limit=${limit}&offset=0&searchTerm=${searchQuery}`
            )
        } else {
            // Fetch default data when no search
            response = await api.get(
                `/bootcamp/students/${params.courseId}?limit=${limit}&offset=${offset}`
            )
        }
        setStudents(response.data.modifiedStudentInfo || [])
        setSelectedRows([])
        return response.data
    }, [params.courseId, limit, offset, setStudents, router])
    // Reset selectedRows when course changes
    useEffect(() => {
        setSelectedRows([])
    }, [params.courseId])

    const newBatchData = batchData?.map((data) => {
        return {
            value: data.id,
            label: data.name,
        }
    })

    const fetchStudentDataForBatch = useCallback(
        async (offsetValue: number) => {
            try {
                const res = await api.get(
                    `/bootcamp/students/${params.courseId}?limit=${limit}&offset=${offset}`
                )
                setSelectedRows([])
                setStudents(res.data.modifiedStudentInfo)
            } catch (error: any) {
                if (axios.isAxiosError(error)) {
                    if (
                        error?.response?.data.message === 'Bootcamp not found!'
                    ) {
                        router.push(`/admin/courses`)
                        toast.info({
                            title: 'Caution',
                            description:
                                'The Course has been deleted by another Admin',
                        })
                    }
                }
                console.error(error)
            }
        },
        [params.courseId, limit, setStudents]
    )

    const userIds = selectedRows.map((item: any) => item.userId)

    // Conditional rendering based on view parameter (Student folder style)
    if (view === 'details' && studentId) {
        return (
            <StudentDetailsView
                courseId={params.courseId}
                studentId={studentId}
                onBack={() => {
                    // Remove query params and go back to table view
                    router.push(`/admin/courses/${params.courseId}/students`)
                }}
            />
        )
    }

    // Normal table view (default)
    return (
        <div className="text-gray-800">
            <div className="text-start">
                <h2 className="font-heading text-xl font-semibold">Students</h2>
                <p className="text-muted-foreground">
                    Manage student enrollments and track their progress
                </p>
            </div>
            <div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-y-4">
                    <div className="relative w-full md:w-1/2 lg:w-1/4">
                        <SearchBox
                            placeholder="Search students..."
                            fetchSuggestionsApi={fetchSuggestionsApi}
                            fetchSearchResultsApi={fetchSearchResultsApi}
                            defaultFetchApi={defaultFetchApi}
                            getSuggestionLabel={(student) => (
                                <div>
                                    <div className="font-medium">
                                        {student.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {student.email}
                                    </div>
                                </div>
                            )}
                            inputWidth="w-full"
                        />
                    </div>

                    {/* Action Buttons Row (on mobile both in one row) */}
                    <div className="flex w-full flex-row md:flex-row items-center gap-x-4 gap-y-2 md:w-auto">
                        {/* Add Single Student Button */}
                        <Dialog
                            open={isSingleStudentOpen}
                            onOpenChange={(open) => {
                                setIsSingleStudentOpen(open)
                                if (!open) {
                                    setStudentData({ name: '', email: '' })
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button className="flex-1 text-gray-800 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Single Student
                                </Button>
                            </DialogTrigger>
                            <DialogOverlay />
                            <AddStudentsModal
                                message={false}
                                id={params.courseId || 0}
                                batch={false}
                                batchId={0}
                                setStudentData={setStudentData}
                                studentData={studentData}
                                modalType="single"
                            />
                        </Dialog>

                        {/* Bulk Upload Button */}
                        <Dialog
                            open={isOpen}
                            onOpenChange={(open) => {
                                setIsOpen(open)
                                if (!open) {
                                    setStudentData({ name: '', email: '' })
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button className="flex-1 bg-primary hover:bg-primary-dark shadow-4dp">
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    Bulk Upload
                                </Button>
                            </DialogTrigger>
                            <DialogOverlay />
                            <AddStudentsModal
                                message={false}
                                id={params.courseId || 0}
                                batch={false}
                                batchId={0}
                                setStudentData={setStudentData}
                                studentData={studentData}
                                modalType="bulk"
                            />
                        </Dialog>
                    </div>
                </div>

                {/* Filters Row (on mobile both in one row) */}
                <div className="flex flex-col md:flex-row items-center gap-y-4 md:gap-x-4 md:gap-y-0 mt-5">
                    {/* Batch Filter */}
                    <div className="w-full sm:w-[160px]">
                        <Select
                            value={batchFilter}
                            onValueChange={setBatchFilter}
                        >
                            <SelectTrigger className="text-sm w-full">
                                <SelectValue placeholder="All Batches" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Batches</SelectItem>
                                <SelectItem value="batch1">Batch A</SelectItem>
                                <SelectItem value="batch2">Batch B</SelectItem>
                                <SelectItem value="batch3">Batch C</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="w-full sm:w-[160px]">
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="text-sm w-full">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="dropout">Dropout</SelectItem>
                                <SelectItem value="graduate">
                                    Graduate
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Last Active Filter */}
                    <div className="w-full sm:w-[160px]">
                        <Select
                            value={lastActiveFilter}
                            onValueChange={setLastActiveFilter}
                        >
                            <SelectTrigger className="text-sm w-full">
                                <SelectValue placeholder="Last Active" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Active</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">
                                    Yesterday
                                </SelectItem>
                                <SelectItem value="thisWeek">
                                    This Week
                                </SelectItem>
                                <SelectItem value="thisMonth">
                                    This Month
                                </SelectItem>
                                <SelectItem value="older">Older</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search Box */}
                    <div className="relative w-full md:w-1/2 lg:w-1/4">
                        <SearchBox
                            placeholder="Search students by Attendance..."
                            fetchSuggestionsApi={fetchSuggestionsApi}
                            fetchSearchResultsApi={fetchSearchResultsApi}
                            defaultFetchApi={defaultFetchApi}
                            getSuggestionLabel={(student) => (
                                <div>
                                    <div className="font-medium">
                                        {student.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {student.email}
                                    </div>
                                </div>
                            )}
                            inputWidth="w-full"
                        />
                    </div>
                </div>

                <div>
                    <div className="mt-5">
                        <DataTable
                            data={students}
                            columns={columns}
                            setSelectedRows={setSelectedRows}
                        />
                    </div>

                    {/* Use the imported DataTablePagination component */}
                    <DataTablePagination
                        totalStudents={totalStudents}
                        lastPage={totalPages}
                        pages={totalPages}
                        fetchStudentData={fetchStudentData}
                    />
                </div>
            </div>
        </div>
    )
}
export default StudentsPage
