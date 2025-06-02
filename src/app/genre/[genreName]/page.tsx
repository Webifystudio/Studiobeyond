
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MangaGrid, type MangaItem } from '@/components/manga/manga-grid';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

interface GenrePageProps {
  params: { genreName: string };
}

interface MangaDoc {
  id: string;
  title: string;
  chapters: number;
  status: string;
  imageUrl: string;
  genres: string[];
  dataAiHint?: string;
  createdAt: Timestamp;
}

interface GenreDoc {
  id: string;
  name: string;
}

async function getMangaByGenre(genreName: string): Promise<MangaItem[]> {
  const normalizedGenreName = genreName.toLowerCase();
  try {
    const mangasQuery = query(
      collection(db, 'mangas'),
      where('genres', 'array-contains', normalizedGenreName), // Case-sensitive, ensure genres stored lowercase or match case
      orderBy('createdAt', 'desc')
    );
    // For case-insensitive, you might need to store genres in a standardized format (e.g., all lowercase)
    // Or fetch all and filter in code, which is less efficient.
    // The current approach assumes genre names in the 'genres' array match `normalizedGenreName`.
    // A common practice is to store genre names consistently (e.g. "Action", not "action" sometimes and "Action" others).
    // If you stored "Action" in Firestore, and `genreName` from URL is "action", this won't match.
    // Let's try matching against the capitalized version as well or the original params.genreName
    
    let mangaList: MangaItem[] = [];
    
    // Try fetching with the decoded URI component first (which might have specific casing)
    const q1 = query(
        collection(db, 'mangas'),
        where('genres', 'array-contains', decodeURIComponent(genreName)),
        orderBy('createdAt', 'desc')
    );
    const snapshot1 = await getDocs(q1);
    mangaList = snapshot1.docs.map(doc => {
        const data = doc.data() as Omit<MangaDoc, 'id'>;
        return {
            id: doc.id,
            title: data.title,
            chapter: `${data.status} - ${data.chapters} Ch.`,
            imageUrl: data.imageUrl,
            dataAiHint: data.dataAiHint,
        };
    });

    // If no results, try with lowercase (common for URL slugs)
    if (mangaList.length === 0 && decodeURIComponent(genreName) !== normalizedGenreName) {
        const q2 = query(
            collection(db, 'mangas'),
            where('genres', 'array-contains', normalizedGenreName),
            orderBy('createdAt', 'desc')
        );
        const snapshot2 = await getDocs(q2);
        mangaList = snapshot2.docs.map(doc => {
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
     // If still no results, try with first letter capitalized
    if (mangaList.length === 0) {
        const capitalizedGenre = normalizedGenreName.charAt(0).toUpperCase() + normalizedGenreName.slice(1);
        if (decodeURIComponent(genreName) !== capitalizedGenre && normalizedGenreName !== capitalizedGenre) {
             const q3 = query(
                collection(db, 'mangas'),
                where('genres', 'array-contains', capitalizedGenre),
                orderBy('createdAt', 'desc')
            );
            const snapshot3 = await getDocs(q3);
            mangaList = snapshot3.docs.map(doc => {
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
    }


    return mangaList;

  } catch (error) {
    console.error(`Error fetching manga for genre ${genreName}: `, error);
    return [];
  }
}

export default async function GenreSpecificPage({ params }: GenrePageProps) {
  const genreNameDecoded = decodeURIComponent(params.genreName);
  const mangaList = await getMangaByGenre(params.genreName); // Use original param for fetching logic
  const capitalizedGenreName = genreNameDecoded.charAt(0).toUpperCase() + genreNameDecoded.slice(1);

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
                <p className="text-neutral-extralight">No manga found for this genre, or the genre name in the URL doesn't match the stored format. Ensure genres are added consistently in the admin panel.</p>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const genresSnapshot = await getDocs(query(collection(db, 'genres'), orderBy('name', 'asc')));
    const genres = genresSnapshot.docs.map(doc => doc.data() as GenreDoc);
    return genres.map((genre) => ({
      genreName: encodeURIComponent(genre.name.toLowerCase()), // Use lowercase for URL consistency
    }));
  } catch (error) {
    console.error("Error generating static params for genres:", error);
    return [];
  }
}
