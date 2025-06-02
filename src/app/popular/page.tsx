
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MangaGrid, type MangaItem } from '@/components/manga/manga-grid';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';

interface MangaDoc {
  id: string;
  title: string;
  chapters: number;
  status: string;
  imageUrl: string;
  dataAiHint?: string;
  createdAt: Timestamp; // Using createdAt as a proxy for popularity for now
}

async function getPopularManga(): Promise<MangaItem[]> {
  try {
    // Fetch 12 most recently created manga as "popular" for now
    // Later, this could be based on a 'views' or 'rating' field
    const popularQuery = query(collection(db, 'mangas'), orderBy('createdAt', 'desc'), limit(12));
    const snapshot = await getDocs(popularQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<MangaDoc, 'id'>;
      return {
        id: doc.id,
        title: data.title,
        chapter: `${data.status} - ${data.chapters} Ch.`,
        imageUrl: data.imageUrl,
        dataAiHint: data.dataAiHint,
      };
    });
  } catch (error) {
    console.error("Error fetching popular manga: ", error);
    return [];
  }
}

export default async function PopularPage() {
  const popularManga = await getPopularManga();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
         <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        {popularManga.length > 0 ? (
            <MangaGrid title="Popular Manga" mangaList={popularManga} />
        ) : (
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-4 font-headline">Popular Manga</h1>
                <p className="text-neutral-extralight">No popular manga found. Content will be populated from the admin panel.</p>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
