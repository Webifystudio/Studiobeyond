import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MangaGrid } from '@/components/manga/manga-grid';

interface GenrePageProps {
  params: { genreName: string };
}

// Mock data for demonstration
const mangaByGenre: { [key: string]: any[] } = {
  action: [
    { id: 'action-manga-1', title: 'Action Manga Alpha', chapter: 'Chapter 50', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint:'action anime' },
    { id: 'action-manga-2', title: 'Action Manga Beta', chapter: 'Chapter 75', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint:'action manga' },
  ],
  adventure: [
    { id: 'adventure-manga-1', title: 'Adventure Manga Gamma', chapter: 'Chapter 100', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint:'adventure anime' },
  ],
  // Add more genres and manga as needed
};


export default function GenreSpecificPage({ params }: GenrePageProps) {
  const genreName = decodeURIComponent(params.genreName);
  const mangaList = mangaByGenre[genreName.toLowerCase()] || [];
  const capitalizedGenreName = genreName.charAt(0).toUpperCase() + genreName.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/genres">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Genres
          </Link>
        </Button>
        {mangaList.length > 0 ? (
            <MangaGrid title={`${capitalizedGenreName} Manga`} mangaList={mangaList} />
        ) : (
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-4 font-headline">{capitalizedGenreName} Manga</h1>
                <p className="text-neutral-extralight">No manga found for this genre currently.</p>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  const genres = ['action', 'adventure', 'comedy', 'fantasy', 'romance', 'sci-fi', 'slice-of-life', 'sports', 'horror', 'isekai', 'drama', 'mystery'];
  return genres.map((genreName) => ({
    genreName: genreName,
  }));
}
