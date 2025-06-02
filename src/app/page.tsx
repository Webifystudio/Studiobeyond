import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/manga/hero-section';
import { MangaGrid } from '@/components/manga/manga-grid';
import { GenreGrid } from '@/components/manga/genre-grid';

const trendingManga = [
  { id: 'jujutsu-kaisen', title: 'Jujutsu Kaisen', chapter: 'Chapter 250', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'sorcery fight anime' },
  { id: 'one-piece', title: 'One Piece', chapter: 'Chapter 1100', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'pirate adventure anime' },
  { id: 'my-hero-academia', title: 'My Hero Academia', chapter: 'Chapter 420', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'superhero school anime' },
  { id: 'chainsaw-man', title: 'Chainsaw Man', chapter: 'Chapter 155', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'devil hunter anime' },
  { id: 'spy-x-family', title: 'Spy x Family', chapter: 'Chapter 95', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'spy comedy anime' },
  { id: 'blue-lock', title: 'Blue Lock', chapter: 'Chapter 230', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'soccer striker anime' },
];

const recentlyUpdatedManga = [
  { id: 'kagurabachi', title: 'Kagurabachi', chapter: 'Chapter 30', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'sword revenge manga' },
  { id: 'oshi-no-ko', title: 'Oshi no Ko', chapter: 'Chapter 140', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'entertainment industry anime' },
  { id: 'vinland-saga', title: 'Vinland Saga', chapter: 'Chapter 205', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'viking history anime' },
  { id: 'solo-leveling', title: 'Solo Leveling', chapter: 'Chapter 200 (Completed)', imageUrl: 'https://placehold.co/300x450/2D3748/A0AEC0.png', dataAiHint: 'hunter fantasy manhwa' },
];

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
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <HeroSection
          title="Attack on Titan: Final Season"
          description="The epic conclusion to the dark fantasy series. Witness the final battle for humanity's survival."
          imageUrl="https://placehold.co/1200x500/1A202C/A0AEC0.png"
          imageAlt="Featured Manga: Attack on Titan"
          buttonText="Read Now"
          buttonHref="/manga/attack-on-titan"
          dataAiHint="titan battle anime"
        />
        <MangaGrid title="Trending This Week" mangaList={trendingManga} />
        <MangaGrid title="Recently Updated" mangaList={recentlyUpdatedManga} />
        <GenreGrid title="Browse by Genre" genres={genres} />
      </main>
      <Footer />
    </div>
  );
}
