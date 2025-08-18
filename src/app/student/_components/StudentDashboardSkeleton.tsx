const StudentDashboardSkeleton = () => {
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

export default StudentDashboardSkeleton; 