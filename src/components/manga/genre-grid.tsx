
import { GenreCard } from './genre-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface GenreItem { // Exporting for use in pages
  id: string;
  name: string;
  href: string;
}

interface GenreGridProps {
  title: string;
  genres: GenreItem[];
  viewAllHref?: string; // Optional link for a "View All" button
}

export function GenreGrid({ title, genres, viewAllHref }: GenreGridProps) {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold section-title text-white font-headline">{title}</h2>
        {viewAllHref && genres.length > 0 && (
          <Button variant="outline" asChild size="sm" className="text-sm">
            <Link href={viewAllHref}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      {genres.length === 0 ? (
         <p className="text-neutral-extralight">No genres to display yet. Add them via the admin panel.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {genres.map((genre) => (
            <GenreCard key={genre.id} name={genre.name} href={genre.href} />
          ))}
        </div>
      )}
    </section>
  );
}
