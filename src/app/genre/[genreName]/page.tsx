
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MangaGrid, type MangaItem } from '@/components/manga/manga-grid';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

interface GenrePageProps {
  params: { genreName: string }; // This will be the slug
}

interface MangaDoc {
  id: string;
  title: string;
  chapters: number;
  status: string;
  imageUrl: string;
  genres: string[]; // Array of exact genre names
  dataAiHint?: string;
  createdAt: Timestamp;
}

interface GenreDoc {
  id: string;
  name: string; // The canonical name, e.g., "Sci-Fi"
  slug: string;  // The URL-friendly slug, e.g., "sci-fi"
}

async function getMangaByGenre(genreSlug: string): Promise<{ mangaList: MangaItem[], canonicalGenreName: string | null }> {
  let canonicalGenreName: string | null = null;
  let mangaList: MangaItem[] = [];

  try {
    // 1. Find the genre document by its slug to get the canonical name
    const genresCollectionRef = collection(db, 'genres');
    const genreQuery = query(genresCollectionRef, where('slug', '==', genreSlug), limit(1));
    const genreSnapshot = await getDocs(genreQuery);

    if (!genreSnapshot.empty) {
      const genreDoc = genreSnapshot.docs[0].data() as GenreDoc;
      canonicalGenreName = genreDoc.name;

      // 2. Use the canonical name to query mangas
      if (canonicalGenreName) {
        const mangasQuery = query(
          collection(db, 'mangas'),
          where('genres', 'array-contains', canonicalGenreName),
          orderBy('createdAt', 'desc')
        );
        const mangaSnapshot = await getDocs(mangasQuery);
        mangaList = mangaSnapshot.docs.map(doc => {
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
    } else {
      console.log(`No genre found with slug: ${genreSlug}`);
    }
  } catch (error) {
    console.error(`Error fetching manga for genre slug ${genreSlug}: `, error);
  }
  return { mangaList, canonicalGenreName };
}

export default async function GenreSpecificPage({ params }: GenrePageProps) {
  const genreSlug = decodeURIComponent(params.genreName);
  const { mangaList, canonicalGenreName } = await getMangaByGenre(genreSlug);
  
  const pageTitle = canonicalGenreName || (genreSlug.charAt(0).toUpperCase() + genreSlug.slice(1).replace(/-/g, ' '));

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
            <MangaGrid title={`${pageTitle} Manga`} mangaList={mangaList} />
        ) : (
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-4 font-headline">{pageTitle} Manga</h1>
                <p className="text-neutral-extralight">
                  No manga found for this genre. Ensure the genre exists and mangas are correctly assigned to it in the admin panel.
                  {canonicalGenreName === null && " Also, the genre slug in the URL might not match any existing genre."}
                </p>
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
    return genres
      .filter(genre => genre.slug) 
      .map((genre) => ({
        genreName: genre.slug, 
    }));
  } catch (error) {
    console.error("Error generating static params for genres:", error);
    return [];
  }
}

export const revalidate = 0; // Changed from 60 to 0
