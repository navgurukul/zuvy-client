'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { DataTable } from '@/app/_components/datatable/data-table';
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination';
import { createColumns } from './columns'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import AddOrganization from './_components/AddOrganization';
import { DeleteModalDialog } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/(courseTabs)/students/components/deleteModal'
import { useOrganizations, Organization } from '@/hooks/useOrganizations'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBox } from '@/utils/searchBox'
import { useSearchWithSuggestions } from '@/utils/useUniversalSearchDynamic'
import { api } from '@/utils/axios.config'
import { useSearchParams, useRouter } from 'next/navigation'
import MultiSelector from '@/components/ui/multi-selector'

// Add interface for filter options
interface FilterOption {
    value: string
    label: string
}

export default function OrganizationsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // Get page and limit from URL
    const currentPage = useMemo(() => parseInt(searchParams.get('page') || '1'), [searchParams])
    const limit = useMemo(() => parseInt(searchParams.get('limit') || '10'), [searchParams])
    
    const [currentSearchQuery, setCurrentSearchQuery] = useState<string>('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingOrg, setEditingOrg] = useState<any>(null)
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        organizationId: '',
        organizationName: ''
    })

    // Add filter state for management type
    const [managementTypeFilter, setManagementTypeFilter] = useState<FilterOption[]>([
        { value: 'all', label: 'All Types' }
    ])
    const [urlInitialized, setUrlInitialized] = useState(false)

    // Management type options
    const managementTypeOptions: FilterOption[] = [
        { value: 'all', label: 'All Types' },
        { value: 'self_manage', label: 'Self Managed' },
        { value: 'zuvy_manage', label: 'Zuvy Managed' }
    ]

    // Build filter query for API
    const getFilterQuery = () => {
        const filters = managementTypeFilter.filter(f => f.value !== 'all')
        return filters.length > 0 ? filters.map(f => f.value).join(',') : ''
    }

    // Pass page, limit, and filter to hook
    const { organizations, loading, error, totalCount, totalPages, fetchOrganizations } = useOrganizations({
        limit: limit,
        page: currentPage,
        auto: false
    })

    // Function to update URL params
    const updateURLParams = useCallback((page: number, newLimit?: number, filters?: string) => {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.set('page', String(page))
        newParams.set('limit', String(newLimit || limit))
        
        if (filters) {
            newParams.set('filterType', filters)
        } else {
            newParams.delete('filterType')
        }
        
        router.replace(`?${newParams.toString()}`)
    }, [searchParams, router, limit])

    // Initialize from URL
    const initializeFromURL = useCallback(() => {
        if (urlInitialized) return

        const urlFilter = searchParams.get('filterType')
        
        if (urlFilter) {
            const filterValues = urlFilter.split(',')
            const matchedOptions = filterValues
                .map(val => managementTypeOptions.find(opt => opt.value === val))
                .filter(Boolean) as FilterOption[]

            if (matchedOptions.length > 0) {
                setManagementTypeFilter(matchedOptions)
            } else {
                setManagementTypeFilter([{ value: 'all', label: 'All Types' }])
            }
        } else {
            setManagementTypeFilter([{ value: 'all', label: 'All Types' }])
        }

        setUrlInitialized(true)
    }, [urlInitialized, searchParams, managementTypeOptions])

    // Initialize from URL on mount
    useEffect(() => {
        initializeFromURL()
    }, [initializeFromURL])

    // Update URL when filters change
    useEffect(() => {
        if (!urlInitialized) return

        const filterQuery = getFilterQuery()
        updateURLParams(currentPage, limit, filterQuery)
    }, [managementTypeFilter, urlInitialized, updateURLParams, currentPage, limit])

    // Search API functions for SearchBox - ADD FILTER TO SUGGESTIONS
    const fetchSuggestionsApi = useCallback(async (query: string) => {
        try {
            const queryParams = new URLSearchParams()
            queryParams.append('search', query)
            queryParams.append('limit', '10')
            
            // ADD CURRENT FILTER TO SUGGESTIONS API CALL
            const currentFilter = getFilterQuery()
            if (currentFilter) {
                queryParams.append('filterType', currentFilter)
            }
            
            const response = await api.get(`/org/getAllOrgs?${queryParams.toString()}`)
            return response.data.data || []
        } catch (error) {
            console.error('Error fetching suggestions:', error)
            return []
        }
    }, [managementTypeFilter]) // ADD managementTypeFilter as dependency

    const fetchSearchResultsApi = useCallback(async (query: string) => {
        console.log("SEARCH API CALLED", { query });
        setCurrentSearchQuery(query);
        updateURLParams(1, limit, getFilterQuery());
        await fetchOrganizations(query, 1, limit, getFilterQuery());
        return [];
    }, [fetchOrganizations, limit, updateURLParams, managementTypeFilter])

    const defaultFetchApi = useCallback(async () => {
        setCurrentSearchQuery('');
        updateURLParams(1, limit, getFilterQuery());
        await fetchOrganizations('', 1, limit, getFilterQuery());
        return [];
    }, [fetchOrganizations, limit, updateURLParams, managementTypeFilter])

    const { clearSearch } = useSearchWithSuggestions({
        fetchSuggestionsApi,
        fetchSearchResultsApi,
        defaultFetchApi,
    })

    // Handle management type filter
    const handleManagementTypeFilter = (option: FilterOption) => {
        if (option.value === 'all') {
            setManagementTypeFilter([option])
        } else {
            if (managementTypeFilter.some(item => item.value === 'all')) {
                setManagementTypeFilter([option])
            } else if (managementTypeFilter.some(item => item.value === option.value)) {
                setManagementTypeFilter(managementTypeFilter.filter(item => item.value !== option.value))
            } else {
                setManagementTypeFilter([...managementTypeFilter, option])
            }
        }
    }

    // Fetch data when URL params change
    useEffect(() => {
        if (!urlInitialized) return

        const filterQuery = getFilterQuery()
        fetchOrganizations(currentSearchQuery, currentPage, limit, filterQuery)
    }, [currentPage, limit, urlInitialized, managementTypeFilter, fetchOrganizations])

    // Transform API data to match your existing interface
    const transformedOrganizations = useMemo(() => {
        return organizations.map(org => ({
            id: org.id.toString(),
            name: org.displayName || org.title,
            code: org.title.substring(0, 2).toUpperCase(),
            managementType: org.isManagedByZuvy ? 'Zuvy Managed' : 'Self Managed' as 'Self Managed' | 'Zuvy Managed',
            poc: {
                name: org.pocName,
                email: org.pocEmail
            },
            assignee: {
                name: org.zuvyPocName,
                email: org.zuvyPocEmail
            },
            createdAt: new Date(org.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            isVerified: org.isVerified,
            logoUrl: org.logoUrl
        }))
    }, [organizations])

    const management = [
        {name: 'Self Managed', id: 1, description: 'Organisations who manage all functions on the platform'}, 
        {name: 'Zuvy Managed', id: 2, description: 'Organisations for whom Zuvy manages all functions on the platform'}
    ]

    const handleEdit = (org: any) => {
        setEditingOrg(org)
        setIsEditMode(true)
        setIsAddModalOpen(true)
    }

    const handleDelete = (org: any) => {
        setDeleteModal({
            isOpen: true,
            organizationId: org.id,
            organizationName: org.name
        })
    }

    const columns = useMemo(() => createColumns(management, handleEdit, handleDelete), [management])

    const handleCloseModal = () => {
        setIsAddModalOpen(false)
        setEditingOrg(null)
        setIsEditMode(false)
        const filterQuery = getFilterQuery()
        fetchOrganizations(currentSearchQuery, currentPage, limit, filterQuery)
    }

    const handleCloseDeleteModal = () => {
        setDeleteModal({ isOpen: false, organizationId: '', organizationName: '' })
        const filterQuery = getFilterQuery()
        fetchOrganizations(currentSearchQuery, currentPage, limit, filterQuery)
    }

    // Pagination handler
    const fetchStudentData = (offset: number) => {
        // The pagination component handles URL updates automatically
    }

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
                <div key={index} className="flex space-x-4 p-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                </div>
            ))}
        </div>
    )

    // Error component
    if (error) {
        return (
            <div className="p-8">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error loading organizations: {error}</p>
                    <Button onClick={() => fetchOrganizations('', currentPage, limit, getFilterQuery())}>
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-start">
                            Organisations ({loading ? '...' : totalCount})
                        </h1>
                        <p className="text-gray-600">Manage organisations onboarded on the platform</p>
                    </div>

                    {/* Delete Modal */}
                    <DeleteModalDialog
                        title="Confirm Delete"
                        description={`Are you sure you want to delete the organisation "${deleteModal.organizationName}"? This action cannot be undone.`}
                        userId={deleteModal.organizationId ? [Number(deleteModal.organizationId)] : []}
                        bootcampId={0}
                        isOpen={deleteModal.isOpen}
                        onClose={handleCloseDeleteModal}
                        setSelectedRows={() => {}}
                    />

                    {/* Add Organization Dialog */}
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { setIsEditMode(false)}} >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Organisation
                            </Button>
                        </DialogTrigger>
                        {isAddModalOpen && (
                            <AddOrganization  
                                isEditMode={isEditMode}
                                management={management}
                                user={editingOrg}
                                isOpen={isAddModalOpen}
                                onClose={handleCloseModal}
                            />
                        )}
                    </Dialog>
                </div>

                <div className="flex gap-4 mb-6">
                    {/* SearchBox */}
                    <div className="flex-1 relative">
                        <SearchBox
                            placeholder="Search organisations..."
                            fetchSuggestionsApi={fetchSuggestionsApi}
                            fetchSearchResultsApi={fetchSearchResultsApi}
                            defaultFetchApi={defaultFetchApi}
                            getSuggestionLabel={(org) => (
                                <div className="capitalize font-medium text-foreground">
                                    {org.displayName || org.title}
                                </div>
                            )}
                            getSuggestionValue={(org) => org.displayName || org.title}
                            inputWidth="w-full"
                        />
                    </div>
                    
                    {/* MultiSelector for Management Type Filter */}
                    <div className="w-[200px] flex-shrink-0">
                        <MultiSelector
                            selectedCount={
                                managementTypeFilter.filter(f => f.value !== 'all').length
                            }
                            options={managementTypeOptions}
                            selectedOptions={managementTypeFilter}
                            handleOptionClick={handleManagementTypeFilter}
                            type="Management Type"
                        />
                    </div>
                </div>

                {loading ? (
                    <LoadingSkeleton />
                ) : totalCount === 0 ? (
                    <div className="flex justify-center items-center min-h-[60vh]">
                        <div className="text-center">
                            {currentSearchQuery ? (
                                <>
                                    <p className="text-gray-600 mb-4">
                                        {`No organizations found for "${currentSearchQuery}"`}
                                    </p>
                                    <Button onClick={clearSearch} variant="outline">
                                        Clear Search
                                    </Button>
                                </>
                            ) : (
                                <p className="text-gray-600">No organizations found</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <DataTable
                            columns={columns}
                            data={transformedOrganizations}
                        />
                        
                        <DataTablePagination
                            totalStudents={totalCount}
                            lastPage={totalPages}
                            pages={totalPages}
                            fetchStudentData={fetchStudentData}
                        />
                    </>
                )}
            </div>
        </div>
    );
}



















// 'use client';

// import React, { useState, useMemo } from 'react';
// import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
// import { DataTable } from '@/app/_components/datatable/data-table';
// // import type { User } from './columns'
// import { createColumns } from './columns'
// import { Dialog, DialogTrigger } from '@/components/ui/dialog'
// import { Button } from '@/components/ui/button'
// import AddOrganization from './_components/AddOrganization';
// import { Description } from '@radix-ui/react-toast';


// interface Organization {
//     id: string;
//     name: string;
//     code: string;
//     managementType: 'Self Managed' | 'Zuvy Managed';
//     poc: {
//         name: string;
//         email: string;
//     };
//     assignee?: {
//         name: string;
//         email: string;
//     };
//     createdAt: string;
// }

// const mockOrganizations: Organization[] = [
//     {
//         id: '1',
//         name: 'Amazon Future Engineer',
//         code: 'AF',
//         managementType: 'Self Managed',
//         poc: { name: 'John Doe', email: 'john.doe@amazon.com' },
//         assignee: { name: 'Alex Kumar', email: 'alex.kumar@zuvy.com' },
//         createdAt: '2024-01-15',
//     },
//     {
//         id: '2',
//         name: 'Microsoft',
//         code: 'M',
//         managementType: 'Zuvy Managed',
//         poc: { name: 'Sarah Smith', email: 'sarah.smith@microsoft.com' },
//         assignee: { name: 'Alex Kumar', email: 'alex.kumar@zuvy.com' },
//         createdAt: '2024-02-20',
//     },
//     {
//         id: '3',
//         name: 'Global Solutions Inc',
//         code: 'GS',
//         managementType: 'Self Managed',
//         poc: { name: 'Michael Johnson', email: 'michael@globalsolutions.com' },
//         assignee: { name: 'Priya Sharma', email: 'priya.sharma@zuvy.com' },
//         createdAt: '2024-03-10',
//     },
//     {
//         id: '4',
//         name: 'Enterprise Solutions',
//         code: 'ES',
//         managementType: 'Self Managed',
//         poc: { name: 'David Wilson', email: 'david.wilson@enterprisesol.com' },
//         assignee: { name: 'Priya Sharma', email: 'priya.sharma@zuvy.com' },
//         createdAt: '2024-05-12',
//     },
// ];

// export default function OrganizationsPage() {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterType, setFilterType] = useState('All Types');
//     const [isAddModalOpen, setIsAddModalOpen] = useState(false)
//     const [isEditMode, setIsEditMode] = useState(false)
//     const [editingOrg, setEditingOrg] = useState<any>(null) // Add this state

//     const filtered = mockOrganizations.filter((org) =>
//         org.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const management = [{name : 'Self Managed', id: 1, description: 'Organisations who manage all functions on the platform'}, {name: 'Zuvy Managed', id: 2, description: 'Organisations for whom Zuvy manages all functions on the platform'}]

//     const handleEdit = (org: any) => {
//         setEditingOrg(org)
//         setIsEditMode(true)
//         setIsAddModalOpen(true)
//     }

//     const columns = useMemo(() => createColumns(management, handleEdit), [management]) // Pass handleEdit

//     const handleCloseModal = () => {
//         setIsAddModalOpen(false)
//         setEditingOrg(null) // Reset editing org
//         setIsEditMode(false)
//     }

//     // const columns = createColumns(
//     //     roles,
//     //     rolesLoading,
//     //     handleRoleChange,
//     //     handleEdit,
//     //     handleDelete,
//     //     refreshData
//     // )

//     return (
//         <div className="p-8">
//             <div className="mx-auto">
//                 <div className="flex justify-between items-start mb-8">
//                     <div>
//                         <h1 className="text-3xl font-bold text-gray-900 mb-2 text-start">
//                             Organisations ({mockOrganizations.length})
//                         </h1>
//                         <p className="text-gray-600">Manage organisations onboarded on the platform</p>
//                     </div>
//                     <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//                         <DialogTrigger asChild>
//                             <Button onClick={() => { setIsEditMode(false)}} >
//                                 <Plus className="w-4 h-4 mr-2" />
//                                 Add Organisation
//                             </Button>
//                         </DialogTrigger>
//                         {isAddModalOpen && (
//                             // <AddUserModal 
//                             //     isEditMode={isEditMode}
//                             //     user={user}
//                             //     isOpen={isAddModalOpen}
//                             //     refetchUsers={() => {
//                             //         refetchUsers(offset)
//                             //         handleCloseModal()
//                             //     }} 
//                             //     onClose={handleCloseModal}
//                             // />
//                             <AddOrganization  
//                                 isEditMode={isEditMode}
//                                 management={management}
//                                 user={editingOrg} // Pass the editing organization
//                                 isOpen={isAddModalOpen}
//                                 // refetchUsers={() => {
//                                 //     refetchUsers(offset)
//                                 //     handleCloseModal()
//                                 // }} 
//                                 onClose={handleCloseModal}
//                             />
//                         )}
//                     </Dialog>
//                 </div>

//                 <div className="flex gap-4 mb-6">
//                     <div className="flex-1 relative">
//                         <Search className="absolute left-3 top-3 text-gray-400" size={20} />
//                         <input
//                             type="text"
//                             placeholder="Search organisations..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
//                         />
//                     </div>
//                     <select
//                         value={filterType}
//                         onChange={(e) => setFilterType(e.target.value)}
//                         className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
//                     >
//                         <option>All Types</option>
//                         <option>Self Managed</option>
//                         <option>Zuvy Managed</option>
//                     </select>
//                 </div>

//                 <DataTable
//                     columns={columns}
//                     data={mockOrganizations}
//                 />
//             </div>
//         </div>
//     );
// }