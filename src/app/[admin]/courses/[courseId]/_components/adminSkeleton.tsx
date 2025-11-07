'use client'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'

// CoursesSkeleton
export const CoursesSkeleton: React.FC = () => {
    return (
        <div className="w-full px-6 py-8 font-manrope">
            <div className="px-1 pt-2 pb-2">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 w-full">
                    <div className="flex-1 min-w-[220px] text-start space-y-2">
                        <Skeleton className="h-8 w-1/3" /> 
                        <Skeleton className="h-4 w-2/3" /> 
                    </div>
                    <div className="flex-1 flex justify-end min-w-[220px]">
                        <Skeleton className="h-10 w-40 rounded-lg" />{' '}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-start mt-8">
                    <Skeleton className="h-10 w-full sm:w-[500px] lg:w-[450px] rounded-lg" />
                </div>
            </div>
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
            <div className="flex justify-end mt-10">
                <Skeleton className="h-8 w-64 rounded-lg" />
            </div>
        </div>
    )
}


// CourseLayoutSkeleton
export const CourseLayoutSkeleton = () => {
    return (
        <div className="space-y-8 p-8">
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" /> 
                <Skeleton className="h-4 w-[150px]" />{' '}
            </div>
            <Skeleton className="font-heading text-start font-bold text-3xl text-foreground my-8 h-8 w-1/5" />
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



// GeneralDetailsSkeleton
export const GeneralDetailsSkeleton: React.FC = () => {
    return (
        <div className="container mx-auto px-2 pt-2 pb-2 max-w-5xl">
            <div className="mb-4">
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
                            <Skeleton className="h-full w-full rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" /> 
                            <div className="flex gap-4">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                                <Skeleton className="h-full w-full rounded-lg" />
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-5">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" /> 
                            <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
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
                <Separator className="my-4" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-36 rounded-lg" />
                </div>
            </div>
        </div>
    )
}



// CurriculumSkeleton
export const CurriculumSkeleton = () => {
    return (
        <div className="w-full px-2 md:px-0 max-w-4xl mx-auto mt-4">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-10 w-48" />
            </div>
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


// studentPageSkeleton
export const StudentPageSkeleton = () => {
  return (
    <div className="text-foreground p-6">
      <div className="text-start mt-2">
        <Skeleton className="h-7 w-[160px] mb-2" />
        <Skeleton className="h-5 w-[300px]" />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
        <div className="w-full md:w-1/2 lg:w-1/3">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="flex w-full md:w-auto gap-4">
          <Skeleton className="h-10 w-[180px] rounded-md" />
          <Skeleton className="h-10 w-[160px] rounded-md" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-10">
        <Skeleton className="h-10 w-[160px] rounded-md" />
        <Skeleton className="h-10 w-[160px] rounded-md" />
        <Skeleton className="h-10 w-[160px] rounded-md" />
        <Skeleton className="h-10 w-[160px] rounded-md" />
      </div>
      <div className="mt-6 border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-muted px-4 py-3">
          <Skeleton className="h-5 w-[20px]" />
          <Skeleton className="h-5 w-[100px]" />
          <Skeleton className="h-5 w-[160px]" />
          <Skeleton className="h-5 w-[100px]" />
          <Skeleton className="h-5 w-[120px]" />
          <Skeleton className="h-5 w-[80px]" />
          <Skeleton className="h-5 w-[80px]" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-7 items-center px-4 py-4 border-t"
          >
            <Skeleton className="h-5 w-[20px]" />
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[160px]" />
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-5 w-[80px]" />
            <Skeleton className="h-5 w-[80px]" />
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center gap-3 mt-6">
        <Skeleton className="h-8 w-[80px] rounded-md" />
        <Skeleton className="h-8 w-[100px] rounded-md" />
        <Skeleton className="h-8 w-[120px] rounded-md" />
      </div>
    </div>
  )
}



// BatchesSkeleton
export const BatchesSkeleton = () => {
    return (
        <div className="w-full max-w-none pb-8">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton className="h-10 w-[200px] rounded-md" />
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center mb-8">
                <div className="relative w-full lg:max-w-[500px]">
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>
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




// Submission Page
export const CourseSubmissionSkeleton=()=>{
  return (
    <div className="space-y-4">
      <div className="w-full bg-card border border-border items-center rounded-lg p-1 h-12 flex flex-nowrap justify-around overflow-x-auto">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton className="w-12 h-6 rounded-md" />
            <Skeleton className="w-20 h-4 rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="w-64 h-9 rounded-md" /> 
      </div>
    </div>
  )
}


// Assessment submisson page
export const AssessmentSubmissionSkeleton=()=>{
  return (
    <div className="grid relative gap-8 mt-4 md:mt-8">
      {[...Array(2)].map((_, moduleIndex) => (
        <div key={moduleIndex}>
          <Skeleton className="w-48 h-6 mb-4 rounded-md" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, cardIndex) => (
              <Card
                key={cardIndex}
                className="bg-muted/40 border border-border shadow-sm rounded-xl"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="w-32 h-5 rounded-md" /> 
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5 rounded-full" /> 
                    <Skeleton className="w-5 h-5 rounded-full" /> 
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="w-24 h-6 rounded-full" /> 
                    <Skeleton className="w-20 h-6 rounded-full" /> 
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}


// Assignment Submission Skeleton
export const AssignmentSubmissionSkeleton = () => {
  return (
    <div className="grid relative gap-8 mt-4 md:mt-8">
      {[...Array(2)].map((_, moduleIndex) => (
        <div key={moduleIndex}>
          <Skeleton className="w-48 h-6 mb-4 rounded-md" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, cardIndex) => (
              <Card
                key={cardIndex}
                className="bg-muted/40 border border-border shadow-sm rounded-xl"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="w-32 h-5 rounded-md" /> 
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5 rounded-full" /> 
                    <Skeleton className="w-5 h-5 rounded-full" /> 
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="w-24 h-6 rounded-full" /> 
                    <Skeleton className="w-20 h-6 rounded-full" /> 
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// FeedbackSubmissionSkeleton 
export const FeedbackSubmissionSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 w-full mt-4 md:mt-8">

      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="relative bg-card border border-gray-200 rounded-md p-4 shadow-sm w-full"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded-md" />
              <Skeleton className="w-32 h-5 rounded-md" />
            </div>
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
          <div className="flex justify-between items-center mt-4">
            <Skeleton className="w-28 h-6 rounded-full" />
            <Skeleton className="w-24 h-6 rounded-full" />
          </div>
        </div>
      ))}

    </div>
  );
};





// Practice Problem Submission
export const PracticeProblemSubmissionSkeleton = () => {
  return (
    <div className="grid relative gap-8 mt-4 md:mt-8">
      {[...Array(2)].map((_, moduleIndex) => (
        <div key={moduleIndex}>
          <Skeleton className="w-48 h-6 mb-4 rounded-md" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, cardIndex) => (
              <Card
                key={cardIndex}
                className="bg-muted/40 border border-border shadow-sm rounded-xl"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="w-32 h-5 rounded-md" /> 
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5 rounded-full" /> 
                    <Skeleton className="w-5 h-5 rounded-full" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="w-24 h-6 rounded-full" /> 
                    <Skeleton className="w-20 h-6 rounded-full" /> 
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}


// Video Submission
export const VideoSubmissionSkeleton = () => {
  return (
    <div className="grid relative gap-8 mt-4 md:mt-8">
      {[...Array(2)].map((_, moduleIndex) => (
        <div key={moduleIndex}>
          <Skeleton className="w-48 h-6 mb-4 rounded-md" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, cardIndex) => (
              <Card
                key={cardIndex}
                className="bg-muted/40 border border-border shadow-sm rounded-xl"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="w-32 h-5 rounded-md" /> 
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5 rounded-full" />  
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="w-24 h-6 rounded-full" /> 
                    <Skeleton className="w-20 h-6 rounded-full" /> 
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}



// LiveClassSubmissionSkeleton
export const LiveClassSubmissionSkeleton = () => {
 return (
    <div className="grid relative gap-8 mt-4 md:mt-8">
      {[...Array(2)].map((_, moduleIndex) => (
        <div key={moduleIndex}>
          <Skeleton className="w-48 h-6 mb-4 rounded-md" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, cardIndex) => (
              <Card
                key={cardIndex}
                className="bg-muted/40 border border-border shadow-sm rounded-xl"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="w-32 h-5 rounded-md" /> 
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5 rounded-full" /> 
                    <Skeleton className="w-5 h-5 rounded-full" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="w-24 h-6 rounded-full" /> 
                    <Skeleton className="w-20 h-6 rounded-full" /> 
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// SettingsSkeleton 
export const SettingsSkeleton = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
            <div className="bg-card rounded-lg p-6 shadow-4dp border border-border space-y-6">
                <Skeleton className="h-6 w-40" />
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
                <Skeleton className="h-px w-full" />
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                </div>
                <div className="flex justify-end pt-4">
                    <Skeleton className="h-10 w-28 rounded-md" />
                </div>
            </div>
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



// question bank
export const CodingProblemsSkeleton = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-80" /> 
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" /> 
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Skeleton className="h-10 w-[350px] rounded-md" /> 
        <Skeleton className="h-10 w-[180px] rounded-md" /> 
        <Skeleton className="h-10 w-[180px] rounded-md" />
      </div>
      <div className="grid grid-cols-6 gap-4 mt-6 border-b border-border pb-3">
        <Skeleton className="h-6 w-24" /> 
        <Skeleton className="h-6 w-20" /> 
        <Skeleton className="h-6 w-20" /> 
        <Skeleton className="h-6 w-16" /> 
        <Skeleton className="h-6 w-20" /> 
        <Skeleton className="h-6 w-20" /> 
      </div>
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-6 items-center gap-4 border-b border-border py-3"
          >
            <Skeleton className="h-5 w-48" /> 
            <Skeleton className="h-5 w-28" /> 
            <Skeleton className="h-6 w-20 rounded-full" /> 
            <Skeleton className="h-5 w-10" /> 
            <Skeleton className="h-5 w-24" />
            <div className="flex gap-3">
              <Skeleton className="h-5 w-5 rounded-md" /> 
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-5 w-5 rounded-md" /> 
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6 gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  )
}


// McqSkeleton
export const McqSkeleton = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-72" /> 
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[120px]" /> 
          <Skeleton className="h-10 w-[130px]" /> 
        </div>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-[350px] rounded-lg" /> 
        <Skeleton className="h-10 w-[180px] rounded-lg" /> 
        <Skeleton className="h-10 w-[180px] rounded-lg" /> 
      </div>
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="grid grid-cols-[40px_1.5fr_1fr_0.8fr_0.6fr_0.8fr_0.8fr] bg-muted border-b p-3">
            <Skeleton className="h-4 w-4 rounded-sm" /> 
            <Skeleton className="h-5 w-[160px]" /> 
            <Skeleton className="h-5 w-[100px]" /> 
            <Skeleton className="h-5 w-[90px]" />
            <Skeleton className="h-5 w-[60px]" />
            <Skeleton className="h-5 w-[80px]" /> 
            <Skeleton className="h-5 w-[80px]" /> 
          </div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[40px_1.5fr_1fr_0.8fr_0.6fr_0.8fr_0.8fr] items-center border-b px-3 py-3"
            >
              <Skeleton className="h-4 w-4 rounded-sm" /> 
              <Skeleton className="h-5 w-[300px]" /> 
              <Skeleton className="h-5 w-[100px]" /> 
              <Skeleton className="h-6 w-[80px] rounded-full" /> 
              <Skeleton className="h-5 w-[50px]" /> 
              <Skeleton className="h-5 w-[80px]" /> 
              <div className="flex gap-2">
                <Skeleton className="h-6 w-6 rounded-full" /> 
                <Skeleton className="h-6 w-6 rounded-full" /> 
                <Skeleton className="h-6 w-6 rounded-full" /> 
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-end items-center gap-4 mt-6">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  )
}

// OpenEndedQuestionsSkeleton
export const OpenEndedQuestionsSkeleton = () => {
    return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-80" /> 
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" /> 
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Skeleton className="h-10 w-[350px] rounded-md" /> 
        <Skeleton className="h-10 w-[180px] rounded-md" /> 
        <Skeleton className="h-10 w-[180px] rounded-md" />
      </div>
      <div className="grid grid-cols-6 gap-4 mt-6 border-b border-border pb-3">
        <Skeleton className="h-6 w-24" /> 
        <Skeleton className="h-6 w-20" /> 
        <Skeleton className="h-6 w-20" /> 
        <Skeleton className="h-6 w-16" /> 
        <Skeleton className="h-6 w-20" /> 
        <Skeleton className="h-6 w-20" /> 
      </div>
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-6 items-center gap-4 border-b border-border py-3"
          >
            <Skeleton className="h-5 w-48" /> 
            <Skeleton className="h-5 w-28" /> 
            <Skeleton className="h-6 w-20 rounded-full" /> 
            <Skeleton className="h-5 w-10" /> 
            <Skeleton className="h-5 w-24" /> 
            <div className="flex gap-3">
              <Skeleton className="h-5 w-5 rounded-md" /> 
              <Skeleton className="h-5 w-5 rounded-md" /> 
              <Skeleton className="h-5 w-5 rounded-md" /> 
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6 gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  )
}
