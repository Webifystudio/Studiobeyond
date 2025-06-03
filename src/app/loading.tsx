
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      {/* Header Skeleton */}
      <header className="bg-neutral-medium shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Skeleton className="h-8 w-48" /> {/* Logo Placeholder */}
            <div className="hidden md:flex space-x-6 items-center">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Skeleton className="h-10 w-40 rounded-full hidden sm:block" /> {/* Search Placeholder */}
              <Skeleton className="h-10 w-10 rounded-full" /> {/* User Icon Placeholder */}
              <div className="md:hidden">
                <Skeleton className="h-10 w-10 rounded-full" /> {/* Menu Icon Placeholder */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {/* Hero Section Skeleton */}
        <section className="relative overflow-hidden mb-12 min-h-[60vh] sm:min-h-[70vh] lg:min-h-[500px] flex items-end p-6 sm:p-10 bg-neutral-medium rounded-xl">
          <div className="relative z-10 w-full">
            <Skeleton className="h-12 w-3/4 mb-3" />
            <Skeleton className="h-6 w-1/2 mb-6" />
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        </section>

        {/* Manga Grid Skeleton */}
        <section className="mb-12">
          <Skeleton className="h-8 w-1/3 mb-6" /> {/* Section Title Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-neutral-medium rounded-xl overflow-hidden shadow-lg">
                <Skeleton className="aspect-[2/3] w-full" />
                <div className="p-3 sm:p-4">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Genre Grid Skeleton */}
        <section className="mb-12">
          <Skeleton className="h-8 w-1/4 mb-6" /> {/* Section Title Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl bg-neutral-medium" />
             ))}
          </div>
        </section>
      </main>

      {/* Footer Skeleton */}
      <footer className="bg-neutral-medium border-t border-neutral-light mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div>
              <Skeleton className="h-5 w-24 mb-4" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-4 w-20 mb-2" />
            </div>
            <div>
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="flex space-x-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-neutral-light pt-8 text-center">
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        </div>
      </footer>
    </div>
  );
}
