
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
  updatedAt: Timestamp; // Expecting updatedAt for sorting
}

async function getLatestManga(): Promise<MangaItem[]> {
  try {
    // Fetch latest 12 manga by 'updatedAt' or 'createdAt'
    const latestQuery = query(collection(db, 'mangas'), orderBy('updatedAt', 'desc'), limit(12));
    const snapshot = await getDocs(latestQuery);
    
    if (snapshot.empty) { // Fallback to createdAt if updatedAt yields no results
        const fallbackQuery = query(collection(db, 'mangas'), orderBy('createdAt', 'desc'), limit(12));
        const fallbackSnapshot = await getDocs(fallbackQuery);
        return fallbackSnapshot.docs.map(doc => {
            const data = doc.data() as Omit<MangaDoc, 'id'>;
            return {
            id: doc.id,
            title: data.title,
            chapter: `${data.status} - ${data.chapters} Ch.`,
            imageUrl: data.imageUrl,
            dataAiHint: data.dataAiHint,
            };
        });
    }

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
    console.error("Error fetching latest manga: ", error);
    return [];
  }
}

export default async function LatestUpdatesPage() {
  const latestManga = await getLatestManga();

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
            <p className="text-neutral-extralight">No manga updates found. Add new manga or update existing ones through the admin panel.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
