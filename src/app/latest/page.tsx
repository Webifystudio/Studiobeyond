
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MangaGrid } from '@/components/manga/manga-grid';

const latestManga: any[] = []; // Data to be fetched from Firestore

export default function LatestUpdatesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
         <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        {latestManga.length > 0 ? (
          <MangaGrid title="Latest Updates" mangaList={latestManga} />
        ) : (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4 font-headline">Latest Updates</h1>
            <p className="text-neutral-extralight">Latest manga updates will appear here once added through the admin panel.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
