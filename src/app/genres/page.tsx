
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GenreGrid, type GenreItem } from '@/components/manga/genre-grid';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

interface GenreDoc {
  id: string;
  name: string;
  createdAt: Timestamp;
}

async function getAllGenres(): Promise<GenreItem[]> {
  try {
    const genresQuery = query(collection(db, 'genres'), orderBy('name', 'asc'));
    const genresSnapshot = await getDocs(genresQuery);
    return genresSnapshot.docs.map(doc => {
      const data = doc.data() as Omit<GenreDoc, 'id'>;
      return {
        id: doc.id,
        name: data.name,
        href: `/genre/${encodeURIComponent(data.name.toLowerCase())}`,
      };
    });
  } catch (error) {
    console.error("Error fetching all genres: ", error);
    return [];
  }
}

export default async function GenresPage() {
  const genres = await getAllGenres();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
         <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        {genres.length > 0 ? (
          <GenreGrid title="All Genres" genres={genres} />
        ) : (
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-4 font-headline">All Genres</h1>
                <p className="text-neutral-extralight">No genres found. Add genres through the admin panel.</p>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
