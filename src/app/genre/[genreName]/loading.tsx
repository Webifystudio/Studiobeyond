
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Construction } from 'lucide-react';
import Link from 'next/link';

export default function GenrePageLoading_REMOVED() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        
        <div className="text-center py-10">
            <Construction className="mx-auto h-16 w-16 text-neutral-extralight/50 mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4 font-headline">Page Loading...</h1>
            <p className="text-neutral-extralight">(Note: Genre feature has been removed)</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
