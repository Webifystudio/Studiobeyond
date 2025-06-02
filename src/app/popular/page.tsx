import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MangaGrid } from '@/components/manga/manga-grid';

const popularManga = [
  { id: 'jujutsu-kaisen-pop', title: 'Jujutsu Kaisen', chapter: 'Chapter 250', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'sorcery fight anime' },
  { id: 'one-piece-pop', title: 'One Piece', chapter: 'Chapter 1100', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'pirate adventure anime' },
  { id: 'spy-x-family-pop', title: 'Spy x Family', chapter: 'Chapter 95', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'spy comedy anime' },
  { id: 'chainsaw-man-pop', title: 'Chainsaw Man', chapter: 'Chapter 155', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'devil hunter anime' },
];

export default function PopularPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
         <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <MangaGrid title="Popular Manga" mangaList={popularManga} />
      </main>
      <Footer />
    </div>
  );
}
