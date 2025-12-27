import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";

/**
 * PropertySkeleton Component
 * Beautiful loading skeleton matching nextjs-frontend design
 * Used while property data is loading
 */
export function PropertySkeleton() {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Skeleton */}
      <div className="relative h-[60vh] md:h-[80vh] overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="relative z-10 h-full flex flex-col justify-end container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery Skeleton */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>

            {/* Description Skeleton */}
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>

            {/* Features Skeleton */}
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-40 mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}









