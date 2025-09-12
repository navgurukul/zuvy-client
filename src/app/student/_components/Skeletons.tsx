import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, FileText, TestTube2, Clock, MemoryStick } from 'lucide-react'

export const VideoSkeleton = () => (
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

                {/* Extra Video Cards (if multiple links) */}
                <div className="space-y-6">
                    {[...Array(1)].map((_, i) => (
                        <div
                            key={i}
                            className="aspect-video w-full bg-muted rounded-xl animate-pulse"
                        ></div>
                    ))}
                </div>

                {/* Mark as Watched Button */}
                <div className="flex justify-end">
                    <div className="h-10 w-40 bg-muted rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
)

export const ArticleSkeleton = () => (
    <div className="bg-gradient-to-br from-background via-card-light to-background py-8 px-2 sm:px-0">
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with title + badge */}
            <div className="flex justify-between items-center mb-6">
                <div className="space-y-4">
                    <div className="h-7 w-48 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
            </div>

            {/* Main content area */}
            <div className="space-y-6">
                {/* PDF / Editor skeleton (big content box) */}
                <div className="h-[28rem] w-full bg-muted rounded-lg animate-pulse"></div>

                {/* Action button */}
                <div className="flex justify-end">
                    <div className="h-10 w-40 bg-muted rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>
)

export const AssignmentSkeleton = () => {
    const isMobile =
        typeof window !== 'undefined' ? window.innerWidth < 768 : false

    return (
        <div
            className={`space-y-6 mx-auto ${
                isMobile ? 'p-4' : 'p-6'
            } max-w-4xl`}
        >
            {/* Header: Title + Badge */}
            <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                    <div className="h-6 w-3/4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-1/3 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
            </div>

            {/* Assignment Content / Resource */}
            <div
                className={`${
                    isMobile ? 'h-48' : 'h-64'
                } w-full bg-muted rounded-xl animate-pulse`}
            ></div>

            {/* Submission Section */}
            <div className="space-y-4">
                {/* Section Heading */}
                <div className="h-5 w-48 bg-muted rounded animate-pulse"></div>
                {/* Input Field */}
                <div className="h-10 w-full bg-muted rounded-lg animate-pulse"></div>
                {/* Submit Button */}
                <div className="h-10 w-36 bg-muted rounded-lg animate-pulse"></div>
            </div>
        </div>
    )
}

export const QuizSkeleton = () => (
    <div className="max-w-4xl mx-auto p-6">
        {/* Title & Status */}
        <div className="flex justify-between items-center mb-8 max-w-3xl">
            <div className="h-8 w-40 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
        </div>

        {/* Description */}
        <div className="mb-8 space-y-3 max-w-3xl">
            <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
        </div>

        {/* Quiz Questions */}
        <div className="space-y-10">
            {/* Question 1 - Text-based */}
            <div className="w-full border rounded-2xl p-6 bg-muted/30 space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-6 w-3/4 bg-muted rounded"></div>
                    <div className="flex space-x-2">
                        <div className="h-5 w-16 bg-muted rounded-full"></div>
                        <div className="h-5 w-20 bg-muted rounded-full"></div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="h-4 w-4 rounded-full bg-muted"></div>
                        <div className="h-4 w-1/2 bg-muted rounded"></div>
                    </div>
                </div>
            </div>

            {/* Question 2 - Code Block Style */}
            <div className="w-full border rounded-2xl p-6 bg-muted/30 space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-6 w-10 bg-muted rounded"></div>
                </div>

                {/* Simulated Code Block */}
                <div className="bg-muted w-full rounded-md p-4 space-y-2">
                    <div className="h-3 w-full bg-muted/70 rounded"></div>
                </div>

                {/* Option Text (short answer or explanation) */}
                <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-muted rounded"></div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="h-4 w-4 rounded-full bg-muted"></div>
                        <div className="h-4 w-1/3 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-8">
            <div className="h-12 w-40 bg-muted rounded-lg animate-pulse"></div>
        </div>
    </div>
)

export const AssessmentSkeleton = () => {
    return (
        <div className="h-full overflow-y-auto">
            <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-4 py-4 sm:py-6 lg:py-8 mt-4 sm:mt-6 lg:mt-8">
                <div className="flex flex-col gap-y-4 text-left w-full max-w-lg sm:max-w-xl lg:max-w-4xl">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 lg:pr-10 mb-8">
                        <div className="min-w-0 flex-1">
                            <div className="flex w-full justify-between items-center mb-6">
                                <div className="h-6 w-2/3 bg-muted rounded animate-pulse"></div>{' '}
                                {/* Title */}
                                <div className="h-6 w-24 bg-muted rounded-full animate-pulse"></div>
                            </div>

                            {/* Meta Info Row */}
                            <div className="flex flex-wrap gap-x-12 gap-y-4 mb-8">
                                <div className="space-y-2">
                                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                                    <div className="h-5 w-28 bg-muted rounded animate-pulse"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                                    <div className="h-5 w-28 bg-muted rounded animate-pulse"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                                    <div className="h-5 w-20 bg-muted rounded animate-pulse"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                                    <div className="h-5 w-20 bg-muted rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-10 space-y-3">
                        <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-5/6 bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
                    </div>

                    {/* Dynamic Cards (Results / Active / Published / Closed / Reattempt) */}
                    <div className="space-y-6">
                        <div className="h-28 w-full bg-muted rounded-lg animate-pulse"></div>
                        <div className="h-28 w-full bg-muted rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}



export const LiveClassSkeleton = ({
    type,
}: {
    type: 'scheduled' | 'ongoing' | 'completed'
}) => {
    return (
        <div className="max-w-4xl mx-auto p-8 space-y-6">
            {/* Title & Badge */}
            <div className="flex justify-between items-center">
                <div className="h-8 w-1/3 bg-muted rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
            </div>

            {/* Description */}
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>

            {type === 'scheduled' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-5 w-2/3 bg-muted rounded animate-pulse"></div>
                        <div className="h-5 w-1/2 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="h-12 w-full bg-muted rounded-lg animate-pulse"></div>
                </div>
            )}

            {type === 'ongoing' && (
                <div className="space-y-4">
                    <div className="h-10 w-40 bg-muted rounded-md animate-pulse"></div>
                    <div className="h-4 w-1/3 bg-muted rounded animate-pulse"></div>
                </div>
            )}

            {type === 'completed' && (
                <div className="space-y-6">
                    <div className="h-64 w-full bg-muted rounded-lg animate-pulse"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
                </div>
            )}
        </div>
    )
}



export const CodingContentChapterSkeleton = () => {
    return (
        <div className="min-h-[70vh] bg-background py-8 px-4 sm:px-0 animate-pulse">
            <div className="max-w-3xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 px-6">
                    <div className="flex flex-col gap-2">
                        <div className="h-6 w-48 bg-muted rounded" />{' '}
                        {/* Title */}
                        <div className="h-4 w-64 bg-muted rounded" />{' '}
                        {/* Description */}
                    </div>
                    <div className="h-6 w-24 bg-muted rounded-full" />{' '}
                    {/* Badge */}
                </div>

                {/* Skeleton Cards */}
                <div className="border rounded-md shadow px-6 py-6 mb-6 space-y-5">
                    {/* Question Title */}
                    <div className="h-5 w-3/4 bg-muted rounded" />

                    {/* Difficulty + Tag */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="h-5 w-20 bg-muted rounded" />
                        <div className="h-5 w-28 bg-muted rounded" />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded" />
                        <div className="h-4 w-5/6 bg-muted rounded" />
                        <div className="h-4 w-2/3 bg-muted rounded" />
                    </div>

                    {/* Button */}
                    <div className="flex justify-center pt-4">
                        <div className="h-10 w-40 bg-muted rounded" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export const FeedbackFormSkeleton = () => {
    return (
        <div className="min-h-[70vh] bg-gradient-to-br from-background via-card-light to-background px-2 sm:px-0">
            <div className="max-w-4xl mx-auto py-6">
                <div className="space-y-8 animate-pulse">
                    {/* Header */}
                    <div className="mb-6 space-y-3 text-left">
                        <div className="h-6 w-2/3 bg-muted rounded"></div>
                        <div className="h-4 w-1/2 bg-muted rounded"></div>
                    </div>

                    {/* Question 1 - Radio */}
                    <div className="space-y-4 border-b pb-6">
                        <div className="h-5 w-5/6 bg-muted rounded"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-1/3 bg-muted rounded"></div>
                            <div className="h-4 w-1/4 bg-muted rounded"></div>
                            <div className="h-4 w-2/5 bg-muted rounded"></div>
                            <div className="h-4 w-1/3 bg-muted rounded"></div>
                        </div>
                    </div>

                    {/* Question 2 - Checkbox */}
                    <div className="space-y-4 border-b pb-6">
                        <div className="h-5 w-5/6 bg-muted rounded"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-1/3 bg-muted rounded"></div>
                            <div className="h-4 w-1/4 bg-muted rounded"></div>
                            <div className="h-4 w-2/5 bg-muted rounded"></div>
                            <div className="h-4 w-1/3 bg-muted rounded"></div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className="flex justify-start mt-8">
                        <div className="h-10 w-40 bg-muted rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}



export const CodingChallengeSkeleton = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b animate-pulse">
                <div className="h-6 w-6 bg-muted rounded-full"></div>
                <div className="h-5 w-24 bg-muted rounded"></div>
            </div>

            {/* Main layout */}
            <div className="flex h-[calc(100vh-64px)] animate-pulse">
                <div className="w-1/2 p-6 space-y-6 border-r overflow-y-auto">
                    {/* Title */}
                    <div className="h-6 w-1/3 bg-muted rounded"></div>

                    {/* Description Section */}
                    <div className="space-y-2">
                        <div className="h-4 w-1/2 bg-muted rounded"></div>
                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                        <div className="h-4 w-2/3 bg-muted rounded"></div>
                    </div>

                    {/* Constraints */}
                    <div className="space-y-2">
                        <div className="h-4 w-1/4 bg-muted rounded"></div>
                        <div className="h-4 w-1/3 bg-muted rounded"></div>
                    </div>

                    {/* Examples */}
                    <div className="space-y-4">
                        {[1, 2].map((example) => (
                            <div
                                key={example}
                                className="space-y-3 border rounded p-4"
                            >
                                {/* Example Title */}
                                <div className="h-4 w-28 bg-muted rounded"></div>

                                {/* Input Section */}
                                <div className="space-y-1">
                                    <div className="h-3 w-16 bg-muted rounded"></div>
                                    <div className="h-10 w-full bg-muted rounded"></div>
                                </div>

                                {/* Output Section */}
                                <div className="space-y-1">
                                    <div className="h-3 w-20 bg-muted rounded"></div>
                                    <div className="h-10 w-full bg-muted rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* RIGHT PANEL */}
                <div className="w-1/2 flex flex-col justify-between">
                    <div className="p-6 space-y-4">
                        <div className="h-5 w-32 bg-muted rounded"></div>
                        <div className="h-64 w-full bg-muted rounded"></div>
                        <div className="flex justify-between">
                            <div className="h-10 w-24 bg-muted rounded"></div>
                            <div className="h-10 w-24 bg-muted rounded"></div>
                        </div>
                    </div>

                    <div className="h-32 p-6 border-t bg-muted/20">
                        <div className="h-4 w-20 bg-muted rounded mb-2"></div>
                        <div className="h-4 w-full bg-muted rounded mb-1"></div>
                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}




export const CodingSubmissionSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2 w-full">
          <div className="bg-gray-300 dark:bg-gray-700 animate-pulse h-5 w-40 rounded-md" />
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Status Card */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-2">
              <div className="bg-gray-300 dark:bg-gray-700 animate-pulse h-6 w-56 rounded-md" />
              <div className="bg-gray-200 dark:bg-gray-600 animate-pulse h-4 w-40 rounded-md" />
            </div>
            <div className="bg-gray-300 dark:bg-gray-700 animate-pulse h-6 w-28 rounded-full" />
          </div>
          <div className="bg-gray-200 dark:bg-gray-600 animate-pulse h-20 w-full rounded-xl" />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-300 dark:bg-gray-700 animate-pulse h-28 rounded-xl" />
          <div className="bg-gray-300 dark:bg-gray-700 animate-pulse h-28 rounded-xl" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Source Code Skeleton */}
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-14 w-full" />
            <div className="bg-gray-300 dark:bg-gray-800 animate-pulse h-[600px] w-full" />
          </div>

          {/* Test Cases Skeleton */}
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-200 dark:bg-gray-700 animate-pulse h-14 w-full" />
            <div className="p-6 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="border-2 border-gray-300 dark:border-gray-700 rounded-xl p-6 space-y-4 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="bg-gray-300 dark:bg-gray-700 h-5 w-32 rounded-md" />
                    <div className="bg-gray-300 dark:bg-gray-700 h-6 w-20 rounded-full" />
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-600 h-16 w-full rounded-md" />
                  <div className="bg-gray-200 dark:bg-gray-600 h-16 w-full rounded-md" />
                  <div className="bg-gray-200 dark:bg-gray-600 h-12 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};




// ModuleContentSkeleton
export const ModuleContentSkeleton = () => {
  return (
    <div className="h-screen flex">
      {/* Mobile Header Skeleton */}
      <div className="lg:hidden px-4 py-4 border-b border-border flex items-center justify-between">
        <div className="h-6 bg-muted rounded animate-pulse w-48"></div>
        <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
      </div>

      {/* Desktop Sidebar Skeleton */}
      <div className="hidden lg:block w-64 h-screen bg-background border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="h-4 bg-muted rounded animate-pulse mb-4 w-24"></div>
          <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
        </div>
        
        <div className="border-t border-border flex-shrink-0"></div>
        
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-3">
            {/* Topic Skeleton */}
            <div className="space-y-2">
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              
              {/* Items Skeleton */}
              <div className="space-y-1 pl-0">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="flex items-start gap-2 p-2">
                    <div className="w-6 h-6 bg-muted rounded animate-pulse flex-shrink-0 mt-1"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Second Topic Skeleton */}
            <div className="space-y-2">
              <div className="h-10 bg-muted rounded animate-pulse"></div>
              
              {/* Items Skeleton */}
              <div className="space-y-1 pl-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-2 p-2">
                    <div className="w-6 h-6 bg-muted rounded animate-pulse flex-shrink-0 mt-1"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <ScrollBar />
        </ScrollArea>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 h-screen flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Content Header Skeleton */}
            <div className="mb-8">
              <div className="h-8 bg-muted rounded animate-pulse mb-4 w-64"></div>
              <div className="h-6 bg-muted rounded animate-pulse mb-6 w-96"></div>
            </div>

            {/* Content Body Skeleton */}
            <div className="space-y-6">
              {/* Video/Content Player Skeleton */}
              <div className="w-full h-64 bg-muted rounded-lg animate-pulse"></div>
              
              {/* Content Description Skeleton */}
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded animate-pulse w-48"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex gap-4 pt-4">
                <div className="h-10 bg-muted rounded animate-pulse w-32"></div>
                <div className="h-10 bg-muted rounded animate-pulse w-24"></div>
              </div>
            </div>
          </div>
          <ScrollBar />
        </ScrollArea>
      </div>
    </div>
  );
};









// StudentDashboardSkeleton 

export const StudentDashboardSkeleton = () => {
  return (
    <div className="mb-12">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
        {/* Welcome Message Skeleton */}
        <div className="mb-8 text-left">
          <div className="h-9 bg-muted rounded animate-pulse w-1/3 mb-2"></div>
          <div className="h-7 bg-muted rounded animate-pulse w-1/2"></div>
        </div>

        {/* My Courses Section Skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-muted rounded animate-pulse w-1/4 mb-6"></div>
          
          {/* Filter Chips Skeleton */}
          <div className="flex gap-3 mb-6">
            <div className="h-8 bg-muted rounded-full animate-pulse w-24"></div>
            <div className="h-8 bg-muted rounded-full animate-pulse w-28"></div>
          </div>
        </div>

        {/* Course Cards Skeleton */}
        <div className="space-y-6 mb-12">
          {[1, 2].map((i) => (
            <div key={i} className="w-full shadow-4dp rounded-lg p-6 border border-border/50">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Course Image Skeleton */}
                <div className="flex-shrink-0 md:w-20 md:h-20">
                  <div className="w-full h-20 md:w-20 md:h-20 rounded-lg bg-muted animate-pulse"></div>
                </div>
                
                {/* Course Info Skeleton */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded animate-pulse w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded animate-pulse w-full mb-3"></div>
                      <div className="h-4 bg-muted rounded animate-pulse w-1/2 mb-4"></div>
                      
                      {/* Progress Bar Skeleton */}
                      <div className="mb-4 md:mb-0">
                        <div className="relative bg-muted rounded-full h-2 w-full animate-pulse"></div>
                      </div>
                    </div>

                    {/* Action Button Skeleton */}
                    <div className="hidden md:flex flex-shrink-0">
                      <div className="h-10 bg-muted rounded animate-pulse w-40"></div>
                    </div>
                  </div>

                  {/* Mobile Action Button Skeleton */}
                  <div className="md:hidden mt-4">
                    <div className="h-10 bg-muted rounded animate-pulse w-full"></div>
                  </div>
                </div>
              </div>

              {/* Separator and Upcoming Items Skeleton */}
              <>
                <div className="border-t border-border/20 mt-6 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-start gap-3 p-3 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-1"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

