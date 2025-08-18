import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const ModuleContentSkeleton = () => {
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

export default ModuleContentSkeleton; 