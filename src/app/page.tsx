
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/manga/hero-section';
import { MangaGrid, type MangaItem } from '@/components/manga/manga-grid';
import { GenreGrid, type GenreItem } from '@/components/manga/genre-grid';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';

export const dynamic = 'force-dynamic'; // Ensures the page is always dynamically rendered

interface SliderItemDoc {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonHref: string;
  dataAiHint?: string;
  createdAt: Timestamp;
}

interface MangaDoc {
  id: string;
  title: string;
  description: string; 
  chapters: number;
  status: string;
  imageUrl: string;
  genres: string[];
  dataAiHint?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface GenreDoc {
  id: string;
  name: string;
  // createdAt field exists in Firestore but not strictly needed for this mapping
}

async function getHomePageData() {
  let heroItem: SliderItemDoc | null = null;
  let trendingManga: MangaItem[] = [];
  let newReleaseManga: MangaItem[] = []; // Renamed from recentlyUpdatedManga
  let genres: GenreItem[] = [];

  try {
    // Fetch Hero Item (latest slider item by createdAt)
    const sliderQuery = query(collection(db, 'sliderItems'), orderBy('createdAt', 'desc'), limit(1));
    const sliderSnapshot = await getDocs(sliderQuery);
    if (!sliderSnapshot.empty) {
      const docData = sliderSnapshot.docs[0].data();
      heroItem = { 
        id: sliderSnapshot.docs[0].id, 
        title: docData.title,
        description: docData.description,
        imageUrl: docData.imageUrl,
        buttonText: docData.buttonText,
        buttonHref: docData.buttonHref,
        dataAiHint: docData.dataAiHint,
        createdAt: docData.createdAt,
      };
    }

    // Fetch Trending Manga (latest 6 by createdAt for "Trending")
    const trendingQuery = query(collection(db, 'mangas'), orderBy('createdAt', 'desc'), limit(6));
    const trendingSnapshot = await getDocs(trendingQuery);
    trendingManga = trendingSnapshot.docs.map(doc => {
      const data = doc.data() as Omit<MangaDoc, 'id'>;
      return {
        id: doc.id,
        title: data.title,
        chapter: `${data.status} - ${data.chapters} Ch.`, 
        imageUrl: data.imageUrl,
        dataAiHint: data.dataAiHint,
      };
    });

    // Fetch New Release Manga (latest 6 by updatedAt, fallback to createdAt)
    const newReleaseQuery = query(collection(db, 'mangas'), orderBy('updatedAt', 'desc'), limit(6));
    let newReleaseSnapshot = await getDocs(newReleaseQuery);
     
    if (newReleaseSnapshot.empty) { 
        const fallbackRecentQuery = query(collection(db, 'mangas'), orderBy('createdAt', 'desc'), limit(6));
        newReleaseSnapshot = await getDocs(fallbackRecentQuery);
    }
    
    newReleaseManga = newReleaseSnapshot.docs.map(doc => {
        const data = doc.data() as Omit<MangaDoc, 'id'>;
        return {
            id: doc.id,
            title: data.title,
            chapter: `${data.status} - ${data.chapters} Ch.`,
            imageUrl: data.imageUrl,
            dataAiHint: data.dataAiHint,
        };
    });


    // Fetch Genres (all, ordered by name for consistency)
    const genresQuery = query(collection(db, 'genres'), orderBy('name', 'asc'));
    const genresSnapshot = await getDocs(genresQuery);
    genres = genresSnapshot.docs.map(doc => {
      const data = doc.data() as Omit<GenreDoc, 'id'>;
      return {
        id: doc.id,
        name: data.name,
        href: `/genre/${encodeURIComponent(data.name.toLowerCase())}`,
      };
    });

  } catch (error) {
    console.error("Error fetching homepage data: ", error);
    // Return empty or default data so the page can still render
  }

  return { heroItem, trendingManga, newReleaseManga, genres };
}


export default async function HomePage() {
  const { heroItem, trendingManga, newReleaseManga, genres } = await getHomePageData();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {heroItem ? (
          <HeroSection
            title={heroItem.title}
            description={heroItem.description}
            imageUrl={heroItem.imageUrl}
            imageAlt={heroItem.title}
            buttonText={heroItem.buttonText}
            buttonHref={heroItem.buttonHref}
            dataAiHint={heroItem.dataAiHint || "featured manga collection"}
          />
        ) : (
           <HeroSection
            title="Featured Manga"
            description="Discover amazing manga series. Content managed via Admin Panel."
            imageUrl="https://placehold.co/1200x500.png"
            imageAlt="Featured Manga Placeholder"
            buttonText="Explore Now"
            buttonHref="/browse"
            dataAiHint="placeholder featured"
          />
        )}

        {trendingManga.length > 0 ? (
          <MangaGrid title="Trending This Week" mangaList={trendingManga} />
        ) : (
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 section-title text-white font-headline">Trending This Week</h2>
            <p className="text-neutral-extralight">Trending manga will be shown here once added via the admin panel.</p>
          </section>
        )}

        {newReleaseManga.length > 0 ? (
          <MangaGrid title="New Releases" mangaList={newReleaseManga} />
        ) : (
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 section-title text-white font-headline">New Releases</h2>
            <p className="text-neutral-extralight">New manga releases will be shown here once added via the admin panel.</p>
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
