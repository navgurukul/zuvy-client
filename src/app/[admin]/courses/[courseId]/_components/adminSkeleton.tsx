// Course Studio skeleton

'use client'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'; // Icon import

export const CoursesSkeleton: React.FC = () => {
  return (
    <div className="w-full px-6 py-8 font-manrope">
      {/* Header section */}
      <div className="px-1 pt-2 pb-2">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 w-full">
          <div className="flex-1 min-w-[220px] text-start space-y-2">
            <Skeleton className="h-8 w-1/3" /> {/* title */}
            <Skeleton className="h-4 w-2/3" /> {/* subtitle */}
          </div>
          <div className="flex-1 flex justify-end min-w-[220px]">
            <Skeleton className="h-10 w-40 rounded-lg" /> {/* create button */}
          </div>
        </div>

        {/* Search box */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-start mt-8">
          <Skeleton className="h-10 w-full sm:w-[500px] lg:w-[450px] rounded-lg" />
        </div>
      </div>

      {/* Course cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 border p-4 rounded-2xl shadow-sm">
            <Skeleton className="h-40 w-full rounded-lg" /> 
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" /> 
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" /> 
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-end mt-10">
        <Skeleton className="h-8 w-64 rounded-lg" />
      </div>
    </div>
  )
}





// Course Detail page
export const GeneralDetailsSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-2 pt-2 pb-2 max-w-5xl">
      {/* Title */}
      <div className="mb-4">
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Form Skeleton */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section: Images & Collaborator */}
          <div className="space-y-4">
            {/* Course Image */}
            <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>

            {/* Collaborator */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" /> {/* Label */}
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            </div>
          </div>

          {/* Right Section: Form Fields */}
          <div className="lg:col-span-2 space-y-5">
            {/* Course Title */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" /> {/* Label */}
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" /> {/* Label */}
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>

            {/* Duration & Start Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-16" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Separator & Save Button */}
        <Separator className="my-4" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  )
}




// // CourseLayoutSkeleton
// export const CourseLayoutSkeleton=()=> {
//     return (
//         <div className="px-6 py-8 space-y-6">
//             {/* Back button + title */}
//             <div className="flex items-center gap-3">
//                 <Skeleton className="h-5 w-5 rounded-full" />
//                 <Skeleton className="h-5 w-[180px]" />
//             </div>

//             {/* Course title */}
//             <Skeleton className="h-8 w-[250px] mt-4" />

//             {/* Tabs */}
//             <div className="flex gap-3 mt-6 overflow-x-auto">
//                 {[...Array(6)].map((_, i) => (
//                     <Skeleton key={i} className="h-10 w-[120px] rounded-md" />
//                 ))}
//             </div>

//             {/* Main content placeholder */}
//             <div className="space-y-4 mt-10">
//                 <Skeleton className="h-6 w-[200px]" />
//                 <Skeleton className="h-4 w-[80%]" />
//                 <Skeleton className="h-4 w-[70%]" />
//                 <Skeleton className="h-4 w-[60%]" />
//             </div>
//         </div>
//     )
// }







// export const CourseLayoutSkeleton = () => {
//   return (
//     <div className="px-8 py-10 space-y-6">
//       {/* Back to Course Library */}
//       <div className="flex items-center gap-2">
//         <Skeleton className="h-4 w-4 rounded-full" /> {/* back icon */}
//         <Skeleton className="h-4 w-[150px]" /> {/* "Back to Course Library" */}
//       </div>

//       {/* Course title */}
//       <Skeleton className="h-9 w-[120px] mt-4" /> {/* e.g. React */}

//       {/* Tabs (General Details, Curriculum, etc.) */}
//       <div className="flex items-center justify-start gap-6 mt-8 border-b border-gray-200 pb-2 overflow-x-auto">
//         {["General Details", "Curriculum", "Students", "Batches", "Submissions", "Settings"].map(
//           (tab, i) => (
//             <div key={i} className="flex items-center gap-2">
//               <Skeleton className="h-4 w-4 rounded-full" /> {/* icon placeholder */}
//               <Skeleton className="h-5 w-[120px] rounded-md" /> {/* tab name */}
//             </div>
//           )
//         )}
//       </div>

//     </div>
//   );
// };









export const CourseLayoutSkeleton = () => {
  return (
    <div className="space-y-8 p-8">
      {/* Back to Course Library Button */}
       <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" /> {/* back icon */}
         <Skeleton className="h-4 w-[150px]" /> {/* "Back to Course Library" */}
      </div>

      {/* Course Title Skeleton */}
      <Skeleton className="font-heading text-start font-bold text-3xl text-foreground my-8 h-8 w-1/5" />

      {/* Tabs Skeleton */}
      <div className="w-full">
        <div
          className="relative border-muted pr-3 flex justify-start overflow-x-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            flex: '0 0 auto',
          }}
        >
          <div className="w-full bg-card items-center rounded-lg p-1 h-12 flex flex-wrap justify-around">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Skeleton className="w-12 h-6 rounded-md" />
                <Skeleton className="w-24 h-6 rounded-md" /> 
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}






// CurriculumSkeleton
export const CurriculumSkeleton = () => {
  return (
    <div className="w-full px-2 md:px-0 max-w-4xl mx-auto mt-4">
      {/* Title and button skeleton */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Placeholder list of modules */}
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="border border-muted rounded-md p-4 shadow-sm"
          >
            <Skeleton className="h-5 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}



