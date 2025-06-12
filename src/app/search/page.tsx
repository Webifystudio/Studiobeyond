
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MangaGrid, type MangaItem } from '@/components/manga/manga-grid';
import { db, collection, getDocs, type Timestamp } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

interface MangaDoc {
  id: string;
  title: string;
  chapters: number;
  status: string;
  imageUrl: string;
  dataAiHint?: string;
  updatedAt: Timestamp;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  
  const [allManga, setAllManga] = useState<MangaItem[]>([]);
  const [filteredManga, setFilteredManga] = useState<MangaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterManga = async () => {
      setIsLoading(true);
      try {
        const mangasCollectionRef = collection(db, 'mangas');
        const querySnapshot = await getDocs(mangasCollectionRef);
        const fetchedMangaList = querySnapshot.docs.map(doc => {
          const data = doc.data() as Omit<MangaDoc, 'id'>;
          return {
            id: doc.id,
            title: data.title,
            chapter: `${data.status} - ${data.chapters} Ch.`,
            imageUrl: data.imageUrl,
            dataAiHint: data.dataAiHint,
          };
        });
        setAllManga(fetchedMangaList);

        if (query && query.trim()) {
          const lowercasedQuery = query.toLowerCase().trim();
          const results = fetchedMangaList.filter(manga => 
            manga.title.toLowerCase().includes(lowercasedQuery)
          );
          setFilteredManga(results);
        } else {
          setFilteredManga([]); 
        }
      } catch (error) {
        console.error("Error fetching or filtering manga: ", error);
        setFilteredManga([]);
      }
      setIsLoading(false);
    };

    fetchAndFilterManga();
  }, [query]);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-medium rounded-xl overflow-hidden shadow-lg">
              <Skeleton className="aspect-[2/3] w-full" />
              <div className="p-3 sm:p-4">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!query || query.trim() === "") {
    return (
      <div className="text-center py-10">
        <SearchX className="mx-auto h-16 w-16 text-neutral-extralight/50 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Search for Manga</h1>
        <p className="text-neutral-extralight/80">Please enter a search term in the header to find manga.</p>
      </div>
    );
  }

  return (
    <>
      {filteredManga.length > 0 ? (
        <MangaGrid title={`Search Results for "${query}"`} mangaList={filteredManga} />
      ) : (
        <div className="text-center py-10">
            <SearchX className="mx-auto h-16 w-16 text-neutral-extralight/50 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">No Results Found</h1>
            <p className="text-neutral-extralight/80">We couldn't find any manga matching "{query}". Try a different search term.</p>
        </div>
      )}
    </>
  );
}


export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <Suspense fallback={
            // Wrap fallback content in a single div
            <div> 
                <Skeleton className="h-8 w-1/3 mb-6" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-neutral-medium rounded-xl overflow-hidden shadow-lg">
                    <Skeleton className="aspect-[2/3] w-full" />
                    <div className="p-3 sm:p-4">
                        <Skeleton className="h-5 w-3/4 mb-1" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    </div>
                ))}
                </div>
            </div>
        }>
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
