
import { MangaCard } from './manga-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export interface MangaItem { 
  id: string;
  title: string;
  chapter: string; 
  imageUrl: string;
  dataAiHint?: string;
}

interface MangaGridProps {
  title: string;
  mangaList: MangaItem[];
  viewAllHref?: string;
  hasMore?: boolean; // New prop to control "View All" button visibility
}

export function MangaGrid({ title, mangaList, viewAllHref, hasMore }: MangaGridProps) {
  if (mangaList.length === 0) {
    // Optionally, render nothing or a placeholder if the list is empty for a specific section on homepage
    // For dedicated pages like /latest, the page itself would handle the "no manga" message
    return null; 
  }

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold section-title text-white font-headline">{title}</h2>
        {viewAllHref && hasMore && (
          <Button variant="outline" asChild size="sm" className="text-sm">
            <Link href={viewAllHref}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      <ScrollArea orientation="horizontal" className="w-full pb-3 -mb-3">
        <div className="flex space-x-4 sm:space-x-5 py-2">
          {mangaList.map((manga) => (
            <div key={manga.id} className="w-[150px] sm:w-[160px] md:w-[170px] lg:w-[180px] shrink-0">
              <MangaCard
                id={manga.id}
                title={manga.title}
                chapter={manga.chapter}
                imageUrl={manga.imageUrl}
                dataAiHint={manga.dataAiHint}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

    