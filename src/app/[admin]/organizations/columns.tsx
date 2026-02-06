'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'

import { Edit, Trash2 } from 'lucide-react'
// import DeleteUser from './_components/DeleteUser'
import { UpdateManagementType } from './_components/UpdateManagementType'
import { formatDate } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from '@/components/ui/tooltip'
  import { Org } from '@/utils/data/schema'
  import Link from 'next/link'
  
// export interface User {
//     createdAt: any
//     id: number
//     roleId: number
//     userId: number
//     name: string
//     email: string
//     roleName: string
//     dateAdded?: string
// }

// Export a function that creates columns
// export const createColumns = (
//     roles: any[],
//     rolesLoading: boolean,
//     onRoleChange: (userId: number, roleId: number, roleName: string) => void,
//     onEdit: (userId: number) => void,
//     onDelete: (userId: number) => void,
//     refreshData: () => void
// ): ColumnDef<User>[] => [
export const createColumns = (
    management: any[],
    onEdit?: (org: any) => void,  // Add this parameter
    onDelete?: (org: any) => void // Add this parameter
): ColumnDef<Org>[] => [
    {
      accessorKey: 'organisation',
      header: 'Organisation',
      cell: ({ row }) => {
        const name = row.original.name
        const limit = 20
    
        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/admin/${name}/courses`} className="max-w-[180px] cursor-pointer text-left text-gray-900">
                  <p className='text-start'>
                    {name.length > limit
                      ? name.substring(0, limit) + '...'
                      : name}
                  </p>
                </Link>
              </TooltipTrigger>
    
              {name.length > limit && (
                <TooltipContent side="top" align="start">
                  <p className="text-sm max-w-xs break-words">
                    {name}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
        accessorKey: 'managementType',
        header: 'Management Type',
        cell: ({ row }) => {
            // const managementType = row.getValue('managementType') as string
            const managementType = row.original.managementType
            // const roleId = row.original.roleId
            return <UpdateManagementType managementType={managementType} management={management} />
            // <ChangeUserRole role={role} roles={roles} rolesLoading={rolesLoading} userId={userId} roleId={roleId} onRoleUpdate={refreshData} />
        },
    },
    {
      accessorKey: 'poc',
      header: 'Point of Contact',
      cell: ({ row }) => {
        const poc = row.original.poc
        const limit = 35
    
        return (
            <div>
                <div className="font-medium text-gray-900 text-start">{poc.name}</div>
                <div className="text-gray-500 text-xs text-start">{poc.email}</div>
            </div>
        //   <TooltipProvider delayDuration={200}>
        //     <Tooltip>
        //       <TooltipTrigger asChild>
        //         <div className="max-w-[220px] cursor-pointer text-left text-gray-600">
        //           {poc.length > limit
        //             ? poc.substring(0, limit) + '...'
        //             : poc}
        //         </div>
        //       </TooltipTrigger>
    
        //       {poc.length > limit && (
        //         <TooltipContent side="top" align="start">
        //           <p className="text-sm max-w-xs break-all">
        //             {poc}
        //           </p>
        //         </TooltipContent>
        //       )}
        //     </Tooltip>
        //   </TooltipProvider>
        )
      },
    },
        {
      accessorKey: 'assignee',
      header: 'Zuvy Assignee',
      cell: ({ row }) => {
        const assignee = row.original.assignee    
        return (
            <div>
                <div className="font-medium text-gray-900 text-start">{assignee.name}</div>
                <div className="text-gray-500 text-xs text-start">{assignee.email}</div>
            </div>
        //   <TooltipProvider delayDuration={200}>
        //     <Tooltip>
        //       <TooltipTrigger asChild>
        //         <div className="max-w-[220px] cursor-pointer text-left text-gray-600">
        //           {assignee.length > limit
        //             ? assignee.substring(0, limit) + '...'
        //             : assignee}
        //         </div>
        //       </TooltipTrigger>

        //       {assignee.length > limit && (
        //         <TooltipContent side="top" align="start">
        //           <p className="text-sm max-w-xs break-all">
        //             {assignee}
        //           </p>
        //         </TooltipContent>
        //       )}
        //     </Tooltip>
        //   </TooltipProvider>
        )
      },
    },
   {
        accessorKey: 'dateAdded',
        header: 'Date Added',
        cell: ({ row }) => {
            const createdAt = row.original.createdAt
            const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
            return (
                // <div className="text-left text-gray-600">{formatDate(createdAt)}</div>
                <div className="text-left text-gray-600">{createdAt}</div>
            )
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const selectedOrg = row.original
            return (
                <div className="flex gap-1 text-left">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 mt-1 h-7 w-7 hover:bg-primary hover:text-white"
                        onClick={() => onEdit && onEdit(selectedOrg)} // Uncomment this line
                    >
                        <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-7 w-7 hover:bg-red-50"
                        onClick={() => onDelete && onDelete(selectedOrg)} // Add this
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    {/* <DeleteUser 
                        userId={selectedUser.userId}
                        title="Delete user?"
                        description="This action cannot be undone. This will permanently delete this user."
                        onDeleteSuccess={(userId) => onDelete(userId)}
                    /> */}
                </div>
            )
        },
    },
]



















// 'use client'

// import { ColumnDef } from '@tanstack/react-table'
// import { Button } from '@/components/ui/button'

// import { Edit, Trash2 } from 'lucide-react'
// // import DeleteUser from './_components/DeleteUser'
// import { UpdateManagementType } from './_components/UpdateManagementType'
// import { formatDate } from '@/lib/utils'
// import {
//     Tooltip,
//     TooltipContent,
//     TooltipProvider,
//     TooltipTrigger,
//   } from '@/components/ui/tooltip'
//   import { Org } from '@/utils/data/schema'
//   import Link from 'next/link'
  
// // export interface User {
// //     createdAt: any
// //     id: number
// //     roleId: number
// //     userId: number
// //     name: string
// //     email: string
// //     roleName: string
// //     dateAdded?: string
// // }

// // Export a function that creates columns
// // export const createColumns = (
// //     roles: any[],
// //     rolesLoading: boolean,
// //     onRoleChange: (userId: number, roleId: number, roleName: string) => void,
// //     onEdit: (userId: number) => void,
// //     onDelete: (userId: number) => void,
// //     refreshData: () => void
// // ): ColumnDef<User>[] => [
// export const createColumns = (
//     management: any[],
//     onEdit?: (org: any) => void  // Add this parameter
// ): ColumnDef<Org>[] => [
//     {
//       accessorKey: 'organisation',
//       header: 'Organisation',
//       cell: ({ row }) => {
//         const name = row.original.name
//         const limit = 20
    
//         return (
//           <TooltipProvider delayDuration={200}>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Link href={`/admin/${name}/courses`} className="max-w-[180px] cursor-pointer text-left text-gray-900">
//                   <p className='text-start'>
//                     {name.length > limit
//                       ? name.substring(0, limit) + '...'
//                       : name}
//                   </p>
//                 </Link>
//               </TooltipTrigger>
    
//               {name.length > limit && (
//                 <TooltipContent side="top" align="start">
//                   <p className="text-sm max-w-xs break-words">
//                     {name}
//                   </p>
//                 </TooltipContent>
//               )}
//             </Tooltip>
//           </TooltipProvider>
//         )
//       },
//     },
//     {
//         accessorKey: 'managementType',
//         header: 'Management Type',
//         cell: ({ row }) => {
//             // const managementType = row.getValue('managementType') as string
//             const managementType = row.original.managementType
//             // const roleId = row.original.roleId
//             return <UpdateManagementType managementType={managementType} management={management} />
//             // <ChangeUserRole role={role} roles={roles} rolesLoading={rolesLoading} userId={userId} roleId={roleId} onRoleUpdate={refreshData} />
//         },
//     },
//     {
//       accessorKey: 'poc',
//       header: 'Point of Contact',
//       cell: ({ row }) => {
//         const poc = row.original.poc
//         const limit = 35
    
//         return (
//             <div>
//                 <div className="font-medium text-gray-900 text-start">{poc.name}</div>
//                 <div className="text-gray-500 text-xs text-start">{poc.email}</div>
//             </div>
//         //   <TooltipProvider delayDuration={200}>
//         //     <Tooltip>
//         //       <TooltipTrigger asChild>
//         //         <div className="max-w-[220px] cursor-pointer text-left text-gray-600">
//         //           {poc.length > limit
//         //             ? poc.substring(0, limit) + '...'
//         //             : poc}
//         //         </div>
//         //       </TooltipTrigger>
    
//         //       {poc.length > limit && (
//         //         <TooltipContent side="top" align="start">
//         //           <p className="text-sm max-w-xs break-all">
//         //             {poc}
//         //           </p>
//         //         </TooltipContent>
//         //       )}
//         //     </Tooltip>
//         //   </TooltipProvider>
//         )
//       },
//     },
//         {
//       accessorKey: 'assignee',
//       header: 'Zuvy Assignee',
//       cell: ({ row }) => {
//         const assignee = row.original.assignee    
//         return (
//             <div>
//                 <div className="font-medium text-gray-900 text-start">{assignee.name}</div>
//                 <div className="text-gray-500 text-xs text-start">{assignee.email}</div>
//             </div>
//         //   <TooltipProvider delayDuration={200}>
//         //     <Tooltip>
//         //       <TooltipTrigger asChild>
//         //         <div className="max-w-[220px] cursor-pointer text-left text-gray-600">
//         //           {assignee.length > limit
//         //             ? assignee.substring(0, limit) + '...'
//         //             : assignee}
//         //         </div>
//         //       </TooltipTrigger>

//         //       {assignee.length > limit && (
//         //         <TooltipContent side="top" align="start">
//         //           <p className="text-sm max-w-xs break-all">
//         //             {assignee}
//         //           </p>
//         //         </TooltipContent>
//         //       )}
//         //     </Tooltip>
//         //   </TooltipProvider>
//         )
//       },
//     },
//    {
//         accessorKey: 'dateAdded',
//         header: 'Date Added',
//         cell: ({ row }) => {
//             const createdAt = row.original.createdAt
//             const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'short',
//                 day: 'numeric'
//             })
//             return (
//                 // <div className="text-left text-gray-600">{formatDate(createdAt)}</div>
//                 <div className="text-left text-gray-600">{createdAt}</div>
//             )
//         },
//     },
//     {
//         id: 'actions',
//         header: 'Actions',
//         cell: ({ row }) => {
//             const selectedOrg = row.original
//             return (
//                 <div className="flex gap-1 text-left">
//                     <Button
//                         variant="ghost"
//                         size="sm"
//                         className="p-1 mt-1 h-7 w-7 hover:bg-primary hover:text-white"
//                         onClick={() => onEdit && onEdit(selectedOrg)} // Uncomment and fix this
//                     >
//                         <Edit className="w-4 h-4" />
//                     </Button>

//                     <Button
//                         variant="ghost"
//                         size="sm"
//                         className="p-1 h-7 w-7 hover:bg-red-50"
//                         // onClick={() => onDelete(selectedUser.userId)}
//                     >
//                         <Trash2 className="w-4 h-4 text-red-500" />
//                     </Button>
//                     {/* <DeleteUser 
//                         userId={selectedUser.userId}
//                         title="Delete user?"
//                         description="This action cannot be undone. This will permanently delete this user."
//                         onDeleteSuccess={(userId) => onDelete(userId)}
//                     /> */}
//                 </div>
//             )
//         },
//     },
// ]
