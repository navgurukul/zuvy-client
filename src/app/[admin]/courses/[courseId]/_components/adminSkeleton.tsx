// Course Studio skeleton

'use client'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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







export const StudentPageSkeleton = () => {
  return (
    <div className="text-foreground">
      {/* Title and description */}
      <div className="text-start mt-6">
        <Skeleton className="h-7 w-[150px] mb-2" />
        <Skeleton className="h-5 w-[300px]" />
      </div>

      {/* Search box and action buttons */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-y-4 mt-6">
        {/* Search Box */}
        <div className="w-full md:w-1/2 lg:w-1/4">
          <Skeleton className="h-10" />
        </div>

        {/* Buttons */}
        <div className="flex w-full flex-row mt-2 gap-x-4 md:w-auto">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[160px]" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-y-4 md:gap-x-4 mt-10">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="w-full sm:w-[160px] mt-2">
            <Skeleton className="h-10" />
          </div>
        ))}
        {/* Attendance input */}
        <div className="w-full sm:w-[160px]">
          <Skeleton className="h-10" />
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <Skeleton className="h-[400px] rounded-md" />
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-6">
        <Skeleton className="h-10 w-[200px] rounded-md" />
      </div>
    </div>
  )
}




export const BatchCardSkeleton = () => {
    return (
        <div className="w-[380px] p-4 bg-gray-100 rounded-md shadow animate-pulse space-y-4">
            {/* Title */}
            <Skeleton className="h-5 w-3/4 rounded" />

            {/* Status badge */}
            <Skeleton className="h-6 w-20 rounded-full bg-yellow-300" />

            {/* Instructor */}
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded" />
            </div>

            {/* Students */}
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-1/2 rounded" />
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-3/5 rounded" />
            </div>

            {/* Button */}
            <Skeleton className="h-10 w-32 rounded-md bg-blue-300" />
        </div>
    )
}






export default function BatchesSkeleton() {
    return (
        <div className="w-full max-w-none pb-8">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-[200px] rounded-md" />
            </div>

            {/* Search Bar Skeleton */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-8">
                <div className="relative w-full lg:max-w-[500px]">
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>

            {/* Grid of Batch Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card
                        key={i}
                        className="flex flex-col w-[380px] hover:shadow-lg transition-all duration-200"
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-16 rounded-md" />
                                </div>
                                <div className="flex gap-1">
                                    <Skeleton className="h-6 w-6 rounded-md" />
                                    <Skeleton className="h-6 w-6 rounded-md" />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-44" />
                            </div>
                        </CardContent>

                        <CardFooter className="pt-3">
                            <Skeleton className="h-8 w-full rounded-md" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}