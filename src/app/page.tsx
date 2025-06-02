
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/manga/hero-section';
import { MangaGrid } from '@/components/manga/manga-grid';
import { GenreGrid } from '@/components/manga/genre-grid';

// Mock data removed - to be fetched from Firestore via admin panel

const trendingManga: any[] = []; 
const recentlyUpdatedManga: any[] = [];
const genres: any[] = [];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <HeroSection
          title="Featured Manga"
          description="Discover amazing manga series, curated for you. Content managed via Admin Panel."
          imageUrl="https://placehold.co/1200x500.png" // Generic placeholder
          imageAlt="Featured Manga"
          buttonText="Explore Now"
          buttonHref="/browse" // Generic link
          dataAiHint="featured manga collection"
        />
        {trendingManga.length > 0 ? (
          <MangaGrid title="Trending This Week" mangaList={trendingManga} />
        ) : (
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 section-title text-white font-headline">Trending This Week</h2>
            <p className="text-neutral-extralight">Trending manga will be shown here once added via the admin panel.</p>
          </section>
        )}
        {recentlyUpdatedManga.length > 0 ? (
          <MangaGrid title="Recently Updated" mangaList={recentlyUpdatedManga} />
        ) : (
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 section-title text-white font-headline">Recently Updated</h2>
            <p className="text-neutral-extralight">Recently updated manga will be shown here once added via the admin panel.</p>
          </section>
        )}
        {genres.length > 0 ? (
          <GenreGrid title="Browse by Genre" genres={genres} />
        ) : (
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 section-title text-white font-headline">Browse by Genre</h2>
            <p className="text-neutral-extralight">Genres will be shown here once added via the admin panel.</p>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
