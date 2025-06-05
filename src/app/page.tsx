
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/manga/hero-section';
import { MangaGrid, type MangaItem as MangaCardItem } from '@/components/manga/manga-grid';
import { CategoryGrid, type CategoryItem } from '@/components/manga/category-grid';
import { RecentlyReadMangaGrid } from '@/components/manga/recently-read-manga-grid';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where, type Timestamp } from 'firebase/firestore';

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
  genres?: string[]; 
  createdAt: Timestamp;
  updatedAt: Timestamp;
  views?: number;
}

interface CategoryDocForHomepage {
  id: string;
  name: string;
  slug: string;
  createdAt: Timestamp;
}

const ITEMS_PER_MANGA_SECTION_PREVIEW = 6;
const FETCH_LIMIT_FOR_MANGA_HAS_MORE = ITEMS_PER_MANGA_SECTION_PREVIEW + 1;

async function getHomePageData() {
  let heroItem: SliderItemDoc | null = null;
  let trendingManga: MangaCardItem[] = [];
  let newReleaseManga: MangaCardItem[] = []; 
  let categories: CategoryItem[] = [];
  let hasMoreTrending = false;
  let hasMoreNewReleases = false;

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
    const trendingQuery = query(collection(db, 'mangas'), orderBy('views', 'desc'), limit(FETCH_LIMIT_FOR_MANGA_HAS_MORE));
    const trendingSnapshot = await getDocs(trendingQuery);
    const allTrending = trendingSnapshot.docs.map(doc => {
      const data = doc.data() as Omit<MangaDoc, 'id'>;
      return {
        id: doc.id,
        title: data.title,
        chapter: `${data.status} - ${data.chapters} Ch.`, 
        imageUrl: data.imageUrl,
        dataAiHint: data.dataAiHint,
      };
    });
    trendingManga = allTrending.slice(0, ITEMS_PER_MANGA_SECTION_PREVIEW);
    hasMoreTrending = allTrending.length > ITEMS_PER_MANGA_SECTION_PREVIEW;

    // Fetch New Release Manga
    const newReleaseQuery = query(collection(db, 'mangas'), orderBy('updatedAt', 'desc'), limit(FETCH_LIMIT_FOR_MANGA_HAS_MORE));
    let newReleaseSnapshot = await getDocs(newReleaseQuery);
     if (newReleaseSnapshot.docs.length < FETCH_LIMIT_FOR_MANGA_HAS_MORE) { 
        const fallbackRecentQuery = query(collection(db, 'mangas'), orderBy('createdAt', 'desc'), limit(FETCH_LIMIT_FOR_MANGA_HAS_MORE));
        const fallbackSnapshot = await getDocs(fallbackRecentQuery);
        if (fallbackSnapshot.docs.length > newReleaseSnapshot.docs.length) {
            newReleaseSnapshot = fallbackSnapshot;
        }
    }
    const allNewReleases = newReleaseSnapshot.docs.map(doc => {
        const data = doc.data() as Omit<MangaDoc, 'id'>;
        return {
            id: doc.id,
            title: data.title,
            chapter: `${data.status} - ${data.chapters} Ch.`,
            imageUrl: data.imageUrl,
            dataAiHint: data.dataAiHint,
        };
    });
    newReleaseManga = allNewReleases.slice(0, ITEMS_PER_MANGA_SECTION_PREVIEW);
    hasMoreNewReleases = allNewReleases.length > ITEMS_PER_MANGA_SECTION_PREVIEW;

    // Fetch Categories
    const categoriesQuery = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const categoriesSnapshot = await getDocs(categoriesQuery);
    categories = categoriesSnapshot.docs.map(doc => {
      const data = doc.data() as Omit<CategoryDocForHomepage, 'id'>;
      return {
        id: doc.id,
        name: data.name,
        href: `/category/${data.slug || data.name.toLowerCase().replace(/\s+/g, '-')}`,
      };
    });

  } catch (error) {
    console.error("Error fetching homepage data: ", error);
    heroItem = null;
    trendingManga = [];
    newReleaseManga = [];
    categories = [];
    hasMoreTrending = false;
    hasMoreNewReleases = false;
  }

  return { heroItem, trendingManga, newReleaseManga, categories, hasMoreTrending, hasMoreNewReleases };
}


export default async function HomePage() {
  const { heroItem, trendingManga, newReleaseManga, categories, hasMoreTrending, hasMoreNewReleases } = await getHomePageData();

  const hasAnyContent = trendingManga.length > 0 || newReleaseManga.length > 0 || categories.length > 0 || heroItem;

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
            buttonHref="/browse" 
            dataAiHint="placeholder featured"
            isHomepageHero={true}
          />
        )}
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RecentlyReadMangaGrid />

          {trendingManga.length > 0 && (
            <MangaGrid 
                title="Trending This Week" 
                mangaList={trendingManga} 
                viewAllHref="/popular" 
                hasMore={hasMoreTrending}
            />
          )}

          {newReleaseManga.length > 0 && (
            <MangaGrid 
                title="New Releases" 
                mangaList={newReleaseManga} 
                viewAllHref="/latest" 
                hasMore={hasMoreNewReleases}
            />
          )}
          
          {categories.length > 0 && (
            <CategoryGrid title="Browse by Category" categories={categories} />
          )}
          
          {!hasAnyContent && ( 
            <div className="text-center py-10 text-neutral-extralight">
              <p className="text-xl mb-2">Welcome to BEYOND SCANS!</p>
              <p>Content is being prepared. Check back soon for exciting manga series.</p>
              <p className="mt-4 text-sm">Admins can add content through the dashboard.</p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
