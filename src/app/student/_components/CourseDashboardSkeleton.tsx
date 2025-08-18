const CourseDashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        {/* Loading Skeleton for Course Information Banner */}
        <div className="w-full rounded-b-lg shadow-8dp bg-gradient-to-br from-primary/8 via-background to-accent/8 border-b border-border/50">
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            {/* Desktop Layout Skeleton */}
            <div className="hidden md:flex flex-col md:flex-row items-start gap-6 mb-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-lg bg-muted animate-pulse"></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-muted rounded animate-pulse mb-4"></div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                    <div className="h-12 w-12 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout Skeleton */}
            <div className="md:hidden mb-6">
              <div className="w-full h-40 rounded-lg bg-muted animate-pulse mb-4"></div>
              <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-6 bg-muted rounded animate-pulse mb-4"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                <div className="h-12 w-12 bg-muted rounded animate-pulse"></div>
              </div>
            </div>

            {/* Progress Bar Skeleton */}
            <div className="mb-6">
              <div className="relative bg-muted rounded-full h-2 w-full animate-pulse"></div>
            </div>

            {/* Batch Information Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-muted animate-pulse"></div>
                <div>
                  <div className="h-3 bg-muted rounded animate-pulse mb-1"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-muted animate-pulse"></div>
                <div>
                  <div className="h-3 bg-muted rounded animate-pulse mb-1"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-muted animate-pulse"></div>
                <div>
                  <div className="h-3 bg-muted rounded animate-pulse mb-1"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="h-8 bg-muted rounded animate-pulse mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-6">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded animate-pulse mb-2 w-24"></div>
                          <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
                          <div className="h-4 bg-muted rounded animate-pulse mb-3"></div>
                        </div>
                        <div className="hidden lg:block">
                          <div className="h-10 bg-muted rounded animate-pulse w-32"></div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="relative bg-muted rounded-full h-2 w-full animate-pulse"></div>
                      </div>
                      <div className="lg:hidden mt-4">
                        <div className="h-10 bg-muted rounded animate-pulse w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-8">
              <div className="border rounded-lg p-6">
                <div className="h-6 bg-muted rounded animate-pulse mb-4"></div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-muted rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="h-6 bg-muted rounded animate-pulse mb-4"></div>
                <div className="text-center mb-6">
                  <div className="h-8 bg-muted rounded animate-pulse mx-auto mb-2 w-16"></div>
                  <div className="h-4 bg-muted rounded animate-pulse mx-auto w-48"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
                      </div>
                      <div className="h-6 bg-muted rounded animate-pulse w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDashboardSkeleton; 