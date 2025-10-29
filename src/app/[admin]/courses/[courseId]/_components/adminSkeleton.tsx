// Course Studio skeleton

'use client'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

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
                        <Skeleton className="h-10 w-40 rounded-lg" />{' '}
                        {/* create button */}
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
                    <div
                        key={i}
                        className="flex flex-col space-y-3 border p-4 rounded-2xl shadow-sm"
                    >
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
                <Skeleton className="h-4 w-[150px]" />{' '}
                {/* "Back to Course Library" */}
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
                            <div
                                key={index}
                                className="flex items-center space-x-2"
                            >
                                <Skeleton className="w-12 h-6 rounded-md" />
                                <Skeleton className="w-24 h-6 rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
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


export const BatchesSkeleton = () => {
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
                {Array.from({ length: 3 }).map((_, i) => (
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



// SettingsSkeleton 
export const SettingsSkeleton = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
            {/* Course Settings Card */}
            <div className="bg-card rounded-lg p-6 shadow-4dp border border-border space-y-6">
                {/* Heading */}
                <Skeleton className="h-6 w-40" />

                {/* Course Type */}
                <div className="space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <Skeleton className="h-px w-full" />

                {/* Module Lock */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <Skeleton className="h-10 w-28 rounded-md" />
                </div>
            </div>

            {/* Delete Course Card */}
            <div className="bg-card rounded-lg p-6 shadow-4dp border border-border">
                <div className="flex items-start justify-between">
                    <div className="space-y-3 w-3/4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-3 w-4/6" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-md" />
                </div>
            </div>
        </div>
    )
}





//  VideoSkeletons
export const VideoSkeletons = () => (
    <div className="min-h-[70vh] bg-gradient-to-br from-background via-card-light to-background py-8 px-2 sm:px-0">
        <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-4 w-full">
                        <div className="h-7 w-2/3 bg-muted rounded animate-pulse"></div>{' '}
                        {/* Title */}
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                            <div className="h-4 w-5/6 bg-muted rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>{' '}
                    {/* Badge */}
                </div>

                {/* Video Player */}
                <div className="aspect-video w-full bg-muted rounded-xl animate-pulse relative">
                    <div className="absolute top-4 left-4 h-6 w-20 bg-muted/70 rounded-full animate-pulse"></div>
                </div>

                {/* Mark as Watched Button */}
                <div className="flex justify-end">
                    <div className="h-10 w-40 bg-muted rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
)




// ArticleSkeletons
export const ArticleSkeletons = () => {
     return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Title input */}
      <Skeleton className="h-10 w-full rounded-md" />

      {/* Assignment label */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Editor / Upload PDF radio buttons */}
      <div className="flex items-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Assignment Details Card */}
      <div className="border rounded-lg bg-card shadow-sm p-6 space-y-6">
        {/* Heading */}
        <Skeleton className="h-6 w-40" />

        {/* Deadline picker */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-10 w-[30%] rounded-md" />
        </div>

        {/* Description area */}
        <div className="space-y-3 mt-2">
          <Skeleton className="h-5 w-32" /> 
          <div className="border rounded-lg p-4 space-y-2">
            {/* Toolbar buttons */}
            <div className="flex gap-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-6 rounded-md" />
              ))}
            </div>
            {/* Text editor box */}
            <Skeleton className="h-32 w-full rounded-md mt-2" />
          </div>
        </div>
      </div>
      {/* Save button */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  )
}





// CodingChallengeSkeleton 
export const CodingChallengeSkeleton = () => {
    return (
      
        <div className="p-5 space-y-5">
          <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col space-y-2 w-2/4">
                    <Skeleton className="h-8 w-3/4 rounded-md" /> 
                   <Skeleton className="h-4 w-1/2 rounded-md" />{' '}
                   {/* sub text */}
               </div>
              <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-20 rounded-md" /> 
                  <Skeleton className="h-8 w-20 rounded-md" /> 
             </div>
         </div>
          {/* Header Section */}
            <div className="flex flex-col space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-16" />
            </div>

            {/* Search + Filters */}
            <div className="flex items-center justify-between gap-4">
                {/* Search Bar (takes more width) */}
                <Skeleton className="h-10 w-[60%] rounded-md" />

                {/* Filter Dropdowns */}
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-40 rounded-md" />
                    <Skeleton className="h-10 w-40 rounded-md" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-6 mt-4">
                {/* Left side - MCQ Library */}
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-5 w-32" />

                    {/* Question Cards */}
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="p-4 border rounded-lg space-y-3 bg-card"
                        >
                            <Skeleton className="h-5 w-3/4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ))}
                </div>

                {/* Right side - Selected Question */}
                <div className="w-[35%] border-l pl-6 space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-52" />
                </div>
            </div>
        </div>
    )
}




// SkeletonQuiz 
export const SkeletonQuiz = () => {
    return (
        <div className="p-5 space-y-5">
            {/* Header Section */}
            <div className="flex flex-col space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-16" />
            </div>

            {/* Search + Filters */}
            <div className="flex items-center justify-between gap-4">
                {/* Search Bar (takes more width) */}
                <Skeleton className="h-10 w-[60%] rounded-md" />

                {/* Filter Dropdowns */}
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-40 rounded-md" />
                    <Skeleton className="h-10 w-40 rounded-md" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-6 mt-4">
                {/* Left side - MCQ Library */}
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-5 w-32" />

                    {/* Question Cards */}
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="p-4 border rounded-lg space-y-3 bg-card"
                        >
                            <Skeleton className="h-5 w-3/4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ))}
                </div>

                {/* Right side - Selected Question */}
                <div className="w-[35%] border-l pl-6 space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-52" />
                </div>
            </div>
        </div>
    )
}



export const AssignmentSkeletons = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Title input */}
      <Skeleton className="h-10 w-full rounded-md" />

      {/* Assignment label */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Editor / Upload PDF radio buttons */}
      <div className="flex items-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Assignment Details Card */}
      <div className="border rounded-lg bg-card shadow-sm p-6 space-y-6">
        {/* Heading */}
        <Skeleton className="h-6 w-40" />

        {/* Deadline picker */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-10 w-[30%] rounded-md" />
        </div>

        {/* Description area */}
        <div className="space-y-3 mt-2">
          <Skeleton className="h-5 w-32" /> {/* Label */}
          <div className="border rounded-lg p-4 space-y-2">
            {/* Toolbar buttons */}
            <div className="flex gap-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-6 rounded-md" />
              ))}
            </div>
            {/* Text editor box */}
            <Skeleton className="h-32 w-full rounded-md mt-2" />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  )
}





export const AssessmentSkeleton = () => {
  return (
    <div className="w-full pb-2">
      {/* Header Section */}
      <div className="px-5 border-b border-gray-200 space-y-5">
        {/* Title & Next Button */}
        <div className="flex items-center mb-5 w-full justify-between">
          {/* Title Input */}
          <div className="w-2/6">
            <Skeleton className="h-8 w-full rounded-md" />
          </div>

          {/* Next Button */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>

        {/* Tabs (Coding / MCQ / Open-Ended) */}
        <div className="flex gap-6 mb-5 border-b border-gray-200 w-1/2 pb-2">
          <Skeleton className="h-8 w-40 rounded-md" />
          <Skeleton className="h-8 w-40 rounded-md" />
          <Skeleton className="h-8 w-56 rounded-md" />
        </div>
      </div>

      {/* Filters + Main Content */}
      <div className="px-5 pt-4 bg-card space-y-4">
        {/* Search + Filters */}
        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <Skeleton className="h-10 w-[60%] rounded-md" />

          {/* Filter Dropdowns */}
          <div className="flex gap-4">
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </div>

        {/* Section Headings */}
        <div className="flex justify-between w-2/3">
          <Skeleton className="h-5 w-40 rounded-md" /> 
          <Skeleton className="h-5 w-48 rounded-md" /> 
        </div>

        {/* Main Layout: Left (Questions) | Separator | Right (Selected) */}
        <div className="flex gap-6">
          {/* Left Section - Question Library */}
          <div className="flex-1 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 border rounded-lg space-y-3 bg-card shadow-sm"
              >
                <Skeleton className="h-5 w-3/4" /> 
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-32" /> 
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="w-[2px] bg-gray-200 rounded-lg" />

          {/* Right Section - Selected Questions */}
          <div className="w-[35%] border-l border-gray-200 pl-6 space-y-3">
            <Skeleton className="h-5 w-48" /> 
            <Skeleton className="h-4 w-52" /> 
          </div>
        </div>
      </div>
    </div>
  )
}


export const FeedbackFormSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-6 max-w-4xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64 rounded-md" /> 
      </div>

      {/* Form Title */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24 rounded-md" /> 
        <Skeleton className="h-10 w-full rounded-md" /> 
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24 rounded-md" /> 
        <Skeleton className="h-10 w-full rounded-md" /> 
      </div>

      {/* Questions Header */}
      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-5 w-32 rounded-md" /> 
        <Skeleton className="h-9 w-36 rounded-md" /> 
      </div>

      {/* Question Box */}
      <div className="border rounded-lg p-5 space-y-4 bg-muted/40">
        {/* Question Header */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-28 rounded-md" /> 
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>

        {/* Question Type Dropdown */}
        <Skeleton className="h-10 w-52 rounded-md" />

        {/* Question Input */}
        <Skeleton className="h-10 w-full rounded-md" />

        {/* Options */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-9 w-3/4 rounded-md" />
          <Skeleton className="h-9 w-3/4 rounded-md" />
        </div>

        {/* Add Option */}
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Save Button */}
      <div className="flex justify-start mt-2">
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  )
}



export const RecordingSkeletons = () => {
  return (
    <div className="w-full p-6 border rounded-lg bg-card space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-3">
          {/* Session Title */}
          <Skeleton className="h-6 w-72 rounded-md" />

          {/* Status Badge */}
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Download Button */}
        <Skeleton className="h-9 w-44 rounded-md" />
      </div>

      {/* Session Info (Date, Time, Created By) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-64 rounded-md" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-44 rounded-md" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-52 rounded-md" />
        </div>
      </div>

      {/* Recording Section */}
      <div className="flex justify-center mt-6">
        <Skeleton className="h-10 w-full max-w-[1000px] rounded-md bg-muted/50" />
      </div>
    </div>
  )
}
