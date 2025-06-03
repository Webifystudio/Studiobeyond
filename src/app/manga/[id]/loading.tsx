
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MangaDetailPageLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6 opacity-50" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
        <div className="bg-neutral-medium border-neutral-light p-6 md:p-8 rounded-xl shadow-lg">
          <Skeleton className="h-10 w-3/4 mb-2" /> {/* Title Skeleton */}
          <Skeleton className="h-6 w-1/4 mb-6" /> {/* Subtitle Skeleton (status, chapters) */}
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div className="md:col-span-1">
              <Skeleton className="aspect-[2/3] w-full rounded-lg shadow-md" /> {/* Image Skeleton */}
              <Skeleton className="h-12 w-full mt-4 rounded-lg" /> {/* Read Button Skeleton */}
            </div>
            <div className="md:col-span-2 space-y-6">
              <div>
                <Skeleton className="h-7 w-1/3 mb-2" /> {/* Description Title */}
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-4/5" />
              </div>
              <div>
                <Skeleton className="h-7 w-1/4 mb-2" /> {/* Genres Title */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              </div>
              <div>
                <Skeleton className="h-7 w-1/2 mb-3" /> {/* AI Review Summary Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-light p-4 rounded-lg">
                    <Skeleton className="h-6 w-1/3 mb-2" /> {/* Pros/Cons Title */}
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <div className="bg-neutral-light p-4 rounded-lg">
                    <Skeleton className="h-6 w-1/3 mb-2" /> {/* Pros/Cons Title */}
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Manga Skeleton */}
        <div className="mt-12">
          <Skeleton className="h-8 w-1/3 mb-6" /> {/* Section Title Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-neutral-light rounded-xl overflow-hidden shadow-lg">
                <Skeleton className="aspect-[2/3] w-full" />
                <div className="p-3 sm:p-4">
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
