
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewsPageLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6 opacity-50" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
        
        <Skeleton className="h-10 w-1/2 mx-auto mb-10" /> {/* Page Title Skeleton */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[...Array(3)].map((_, i) => ( 
            <div key={i} className="bg-neutral-medium rounded-xl overflow-hidden shadow-lg">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 sm:p-6">
                <Skeleton className="h-6 w-3/4 mb-2" /> {/* Title */}
                <Skeleton className="h-4 w-1/4 mb-4" /> {/* Date */}
                <Skeleton className="h-4 w-full mb-1" /> {/* Description line 1 */}
                <Skeleton className="h-4 w-full mb-1" /> {/* Description line 2 */}
                <Skeleton className="h-4 w-5/6 mb-4" /> {/* Description line 3 */}
                <Skeleton className="h-10 w-full" /> {/* Button */}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
