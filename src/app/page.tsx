
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/manga/hero-section';
import { MangaGrid, type MangaItem } from '@/components/manga/manga-grid';
import { CategoryGrid, type CategoryItem } from '@/components/manga/category-grid';
import { RecentlyReadMangaGrid } from '@/components/manga/recently-read-manga-grid';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';

export const dynamic = 'force-dynamic'; 

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
  dataAiHint?: string;
  categoryNames?: string[]; // Added for future use if needed here
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
  createdAt: Timestamp;
}

async function getHomePageData() {
  let heroItem: SliderItemDoc | null = null;
  let trendingManga: MangaItem[] = [];
  let newReleaseManga: MangaItem[] = []; 
  let categories: CategoryItem[] = [];

  try {
    // Fetch Hero Item
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

    // Fetch Trending Manga
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

    // Fetch New Release Manga
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

    // Fetch Categories
    const categoriesQuery = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const categoriesSnapshot = await getDocs(categoriesQuery);
    categories = categoriesSnapshot.docs.map(doc => {
        const data = doc.data() as Omit<CategoryDoc, 'id'>;
        return {
            id: doc.id,
            name: data.name,
            href: `/category/${data.slug}`,
        };
    });

  } catch (error) {
    console.error("Error fetching homepage data: ", error);
  }

  return { heroItem, trendingManga, newReleaseManga, categories };
}


export default async function HomePage() {
  const { heroItem, trendingManga, newReleaseManga, categories } = await getHomePageData();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header transparentOnTop />
      <main className="flex-grow"> 
        {heroItem ? (
          <HeroSection
            title={heroItem.title}
            description={heroItem.description}
            imageUrl={heroItem.imageUrl}
            imageAlt={heroItem.title}
            buttonText={heroItem.buttonText}
            buttonHref={heroItem.buttonHref}
            dataAiHint={heroItem.dataAiHint || "featured manga collection"}
            isHomepageHero={true}
          />
        ) : (
           <HeroSection
            title="Featured Manga"
            description="Discover amazing manga series. Content managed via Admin Panel."
            imageUrl="https://placehold.co/1600x700.png"
            imageAlt="Featured Manga Placeholder"
            buttonText="Explore Now"
            buttonHref="/browse" // Updated to /browse as /mangas may not exist as a top-level page
            dataAiHint="placeholder featured"
            isHomepageHero={true}
          />
        )}
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RecentlyReadMangaGrid />

          {categories.length > 0 && (
            <CategoryGrid title="Browse by Category" categories={categories} />
          )}

          {trendingManga.length > 0 ? (
            <MangaGrid title="Trending This Week" mangaList={trendingManga} />
          ) : (
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl sm:text-3xl font-bold section-title text-white font-headline">Trending This Week</h2>
              </div>
              <p className="text-neutral-extralight">Trending manga will be shown here once added via the admin panel.</p>
            </section>
          )}

          {newReleaseManga.length > 0 ? (
            <MangaGrid title="New Releases" mangaList={newReleaseManga} viewAllHref="/latest" />
          ) : (
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl sm:text-3xl font-bold section-title text-white font-headline">New Releases</h2>
              </div>
              <p className="text-neutral-extralight">New manga releases will be shown here once added via the admin panel.</p>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

    