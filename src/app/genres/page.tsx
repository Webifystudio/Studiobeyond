import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GenreGrid } from '@/components/manga/genre-grid';


const genres = [
  { name: 'Action', href: '/genre/action' },
  { name: 'Adventure', href: '/genre/adventure' },
  { name: 'Comedy', href: '/genre/comedy' },
  { name: 'Fantasy', href: '/genre/fantasy' },
  { name: 'Romance', href: '/genre/romance' },
  { name: 'Sci-Fi', href: '/genre/sci-fi' },
  { name: 'Slice of Life', href: '/genre/slice-of-life' },
  { name: 'Sports', href: '/genre/sports' },
  { name: 'Horror', href: '/genre/horror' },
  { name: 'Isekai', href: '/genre/isekai' },
  { name: 'Drama', href: '/genre/drama' },
  { name: 'Mystery', href: '/genre/mystery' },
];


export default function GenresPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
         <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <GenreGrid title="All Genres" genres={genres} />
      </main>
      <Footer />
    </div>
  );
}
