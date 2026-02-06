'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { DataTable } from '@/app/_components/datatable/data-table';
// import type { User } from './columns'
import { createColumns } from './columns'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import AddOrganization from './_components/AddOrganization';
import { Description } from '@radix-ui/react-toast';
import { DeleteModalDialog } from '@/app/[admin]/[organization]/courses/[courseId]/(courseTabs)/students/components/deleteModal'


interface Organization {
    id: string;
    name: string;
    code: string;
    managementType: 'Self Managed' | 'Zuvy Managed';
    poc: {
        name: string;
        email: string;
    };
    assignee?: {
        name: string;
        email: string;
    };
    createdAt: string;
}

const mockOrganizations: Organization[] = [
    {
        id: '1',
        name: 'Amazon Future Engineer',
        code: 'AF',
        managementType: 'Self Managed',
        poc: { name: 'John Doe', email: 'john.doe@amazon.com' },
        assignee: { name: 'Alex Kumar', email: 'alex.kumar@zuvy.com' },
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        name: 'Microsoft',
        code: 'M',
        managementType: 'Zuvy Managed',
        poc: { name: 'Sarah Smith', email: 'sarah.smith@microsoft.com' },
        assignee: { name: 'Alex Kumar', email: 'alex.kumar@zuvy.com' },
        createdAt: '2024-02-20',
    },
    {
        id: '3',
        name: 'Global Solutions Inc',
        code: 'GS',
        managementType: 'Self Managed',
        poc: { name: 'Michael Johnson', email: 'michael@globalsolutions.com' },
        assignee: { name: 'Priya Sharma', email: 'priya.sharma@zuvy.com' },
        createdAt: '2024-03-10',
    },
    {
        id: '4',
        name: 'Enterprise Solutions',
        code: 'ES',
        managementType: 'Self Managed',
        poc: { name: 'David Wilson', email: 'david.wilson@enterprisesol.com' },
        assignee: { name: 'Priya Sharma', email: 'priya.sharma@zuvy.com' },
        createdAt: '2024-05-12',
    },
];

export default function OrganizationsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All Types');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editingOrg, setEditingOrg] = useState<any>(null)
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        organizationId: '',
        organizationName: ''
    })

    const filtered = mockOrganizations.filter((org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const management = [{name : 'Self Managed', id: 1, description: 'Organisations who manage all functions on the platform'}, {name: 'Zuvy Managed', id: 2, description: 'Organisations for whom Zuvy manages all functions on the platform'}]

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
        setEditingOrg(null) // Reset editing org
        setIsEditMode(false)
    }

    const handleCloseDeleteModal = () => {
        setDeleteModal({ isOpen: false, organizationId: '', organizationName: '' })
    }

    // const columns = createColumns(
    //     roles,
    //     rolesLoading,
    //     handleRoleChange,
    //     handleEdit,
    //     handleDelete,
    //     refreshData
    // )

    return (
        <div className="p-8">
            <div className="mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-start">
                            Organisations ({mockOrganizations.length})
                        </h1>
                        <p className="text-gray-600">Manage organisations onboarded on the platform</p>
                    </div>
                    {/* <button className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2">
                        <Plus size={20} />
                        Add Organisation
                    </button> */}

                    {/* Add Delete Modal using existing component */}
                    <DeleteModalDialog
                        title="Confirm Delete"
                        description={`Are you sure you want to delete the organisation "${deleteModal.organizationName}"? This action cannot be undone.`}
                        userId={deleteModal.organizationId ? [Number(deleteModal.organizationId)] : []} // convert to number[] to match interface
                        bootcampId={0} // Not needed for organization, but required by interface
                        isOpen={deleteModal.isOpen}
                        onClose={handleCloseDeleteModal}
                        setSelectedRows={() => {}} // Not needed but required by interface
                    />

                     <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { setIsEditMode(false)}} >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Organisation
                            </Button>
                        </DialogTrigger>
                        {isAddModalOpen && (
                            // <AddUserModal 
                            //     isEditMode={isEditMode}
                            //     user={user}
                            //     isOpen={isAddModalOpen}
                            //     refetchUsers={() => {
                            //         refetchUsers(offset)
                            //         handleCloseModal()
                            //     }} 
                            //     onClose={handleCloseModal}
                            // />
                            <AddOrganization  
                                isEditMode={isEditMode}
                                management={management}
                                user={editingOrg} // Pass the editing organization
                                isOpen={isAddModalOpen}
                                // refetchUsers={() => {
                                //     refetchUsers(offset)
                                //     handleCloseModal()
                                // }} 
                                onClose={handleCloseModal}
                            />
                        )}
                    </Dialog>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search organisations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
                    >
                        <option>All Types</option>
                        <option>Self Managed</option>
                        <option>Zuvy Managed</option>
                    </select>
                </div>

                <DataTable
                    columns={columns}
                    data={mockOrganizations}
                />
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