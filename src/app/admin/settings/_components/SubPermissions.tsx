// 'use client'

// import React, { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Checkbox } from '@/components/ui/checkbox'

// const SubPermissions: React.FC = ({ getSelectedAction }: any) => {
//     return (
//         <div>
//             Sub permissions
//             <div className="flex-1 overflow-y-auto">
//                 {Array.isArray(getSelectedAction()?.permissions) &&
//                 (getSelectedAction()?.permissions?.length ?? 0) > 0 ? (
//                     <div className="space-y-3">
//                         {getSelectedAction()?.permissions?.map(
//                             (permission: any) => (
//                                 <div
//                                     key={permission}
//                                     className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
//                                 >
//                                     <label
//                                         htmlFor={permission}
//                                         className="flex-1 text-sm text-start font-medium text-gray-900 cursor-pointer"
//                                     >
//                                         {formatPermissionName(permission)}
//                                     </label>
//                                     <Checkbox
//                                         id={permission}
//                                         checked={selectedPermissions.has(
//                                             permission
//                                         )}
//                                         onCheckedChange={() =>
//                                             handlePermissionToggle(permission)
//                                         }
//                                     />
//                                 </div>
//                             )
//                         )}
//                     </div>
//                 ) : (
//                     <div className="flex-1 flex flex-col items-center justify-center text-center mt-8">
//                         <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                             <Users className="w-12 h-12 text-gray-400" />
//                         </div>
//                         <h4 className="text-lg font-medium text-gray-900 mb-2">
//                             No permissions available
//                         </h4>
//                         <p className="text-gray-500 max-w-md">
//                             This role action doesn't have any permissions
//                             defined yet
//                         </p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }

// export default SubPermissions
