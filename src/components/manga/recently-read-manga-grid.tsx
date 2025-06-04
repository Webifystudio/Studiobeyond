
"use client";

import { useEffect, useState } from 'react';
import { MangaGrid, type MangaItem } from './manga-grid';
import { db, collection, getDocs, query, where, documentId, Timestamp } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface MangaDocForGrid {
  id: string;
  title: string;
  chapters: number;
  status: string;
  imageUrl: string;
  dataAiHint?: string;
  // Add other fields if needed by MangaCard
}

const LOCAL_STORAGE_KEY = 'recentlyReadManga';
const MAX_RECENTLY_READ_DISPLAY = 6; // Display up to 6 on homepage

export function RecentlyReadMangaGrid() {
  const [recentlyReadManga, setRecentlyReadManga] = useState<MangaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    const fetchRecentlyRead = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        setHasAttemptedLoad(true);
        return;
      }
      
      setIsLoading(true);
      setHasAttemptedLoad(true);
      try {
        const storedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!storedItems) {
          setRecentlyReadManga([]);
          setIsLoading(false);
          return;
        }

        let mangaIds: string[] = JSON.parse(storedItems);
        if (mangaIds.length === 0) {
          setRecentlyReadManga([]);
          setIsLoading(false);
          return;
        }
        
        // Limit to display on homepage, and also to keep 'in' query small
        mangaIds = mangaIds.slice(0, MAX_RECENTLY_READ_DISPLAY);

        if (mangaIds.length === 0) { // Check again after slicing
            setRecentlyReadManga([]);
            setIsLoading(false);
            return;
        }
        
        const mangasQuery = query(collection(db, 'mangas'), where(documentId(), 'in', mangaIds));
        const snapshot = await getDocs(mangasQuery);
        
        const fetchedMangas = snapshot.docs.map(doc => {
          const data = doc.data() as Omit<MangaDocForGrid, 'id'>;
          return {
            id: doc.id,
            title: data.title,
            chapter: `${data.status} - ${data.chapters} Ch.`,
            imageUrl: data.imageUrl,
            dataAiHint: data.dataAiHint,
          };
        });

        // Preserve order from localStorage
        const orderedMangas = mangaIds
            .map(id => fetchedMangas.find(manga => manga.id === id))
            .filter(manga => manga !== undefined) as MangaItem[];

        setRecentlyReadManga(orderedMangas);
      } catch (error) {
        console.error("Error fetching recently read manga from Firestore:", error);
        setRecentlyReadManga([]);
      }
      setIsLoading(false);
    };

    fetchRecentlyRead();
  }, []);

  // Don't render the section if not yet attempted load OR if loading is done and there's nothing to show
  if ((isLoading && !hasAttemptedLoad) || (!isLoading && recentlyReadManga.length === 0)) {
    // If we haven't attempted load, show skeleton, otherwise (loaded and empty) show nothing.
    // However, to avoid layout shifts, we might just return null if it's truly empty after loading.
    if (!hasAttemptedLoad && isLoading) {
       return (
        <section className="mb-12">
          <Skeleton className="h-8 w-1/3 mb-6 bg-neutral-light" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(MAX_RECENTLY_READ_DISPLAY)].map((_, i) => (
              <div key={i} className="bg-neutral-medium rounded-xl overflow-hidden shadow-lg">
                <Skeleton className="aspect-[2/3] w-full bg-neutral-light" />
                <div className="p-3 sm:p-4">
                  <Skeleton className="h-5 w-3/4 mb-1 bg-neutral-light" />
                  <Skeleton className="h-4 w-1/2 bg-neutral-light" />
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }
    return null; 
  }
  
  if (recentlyReadManga.length > 0) {
    return (
      <MangaGrid title="Recently Read" mangaList={recentlyReadManga} />
    );
  }

  return null; // Default to rendering nothing if no conditions met
}
