import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MangaGrid } from '@/components/manga/manga-grid';

const latestManga = [
  { id: 'kagurabachi-latest', title: 'Kagurabachi', chapter: 'Chapter 30 (Latest)', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'sword revenge manga' },
  { id: 'oshi-no-ko-latest', title: 'Oshi no Ko', chapter: 'Chapter 140 (Latest)', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'entertainment industry anime' },
  { id: 'vinland-saga-latest', title: 'Vinland Saga', chapter: 'Chapter 205 (Latest)', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'viking history anime' },
  { id: 'one-punch-man-latest', title: 'One-Punch Man', chapter: 'Chapter 190 (Latest)', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'superhero comedy anime' },
];

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
        <MangaGrid title="Latest Updates" mangaList={latestManga} />
      </main>
      <Footer />
    </div>
  );
}
