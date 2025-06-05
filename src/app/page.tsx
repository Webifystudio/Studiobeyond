
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/manga/hero-section';
import { MangaGrid, type MangaItem } from '@/components/manga/manga-grid';
import { RecentlyReadMangaGrid } from '@/components/manga/recently-read-manga-grid';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, Timestamp, where } from 'firebase/firestore';

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
  categoryNames?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
  createdAt: Timestamp;
}

interface CategorySectionData {
  id: string;
  name: string;
  slug: string;
  mangaList: MangaItem[];
  hasMore: boolean;
}

const ITEMS_PER_SECTION_PREVIEW = 6;
const FETCH_LIMIT_FOR_HAS_MORE = ITEMS_PER_SECTION_PREVIEW + 1;

async function getHomePageData() {
  let heroItem: SliderItemDoc | null = null;
  let trendingManga: MangaItem[] = [];
  let newReleaseManga: MangaItem[] = []; 
  let categorySections: CategorySectionData[] = [];
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

    // Fetch Trending Manga (using createdAt as proxy for trending)
    const trendingQuery = query(collection(db, 'mangas'), orderBy('createdAt', 'desc'), limit(FETCH_LIMIT_FOR_HAS_MORE));
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
    trendingManga = allTrending.slice(0, ITEMS_PER_SECTION_PREVIEW);
    hasMoreTrending = allTrending.length > ITEMS_PER_SECTION_PREVIEW;


    // Fetch New Release Manga (using updatedAt)
    const newReleaseQuery = query(collection(db, 'mangas'), orderBy('updatedAt', 'desc'), limit(FETCH_LIMIT_FOR_HAS_MORE));
    let newReleaseSnapshot = await getDocs(newReleaseQuery);
     if (newReleaseSnapshot.docs.length < FETCH_LIMIT_FOR_HAS_MORE) { 
        const fallbackRecentQuery = query(collection(db, 'mangas'), orderBy('createdAt', 'desc'), limit(FETCH_LIMIT_FOR_HAS_MORE));
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
    newReleaseManga = allNewReleases.slice(0, ITEMS_PER_SECTION_PREVIEW);
    hasMoreNewReleases = allNewReleases.length > ITEMS_PER_SECTION_PREVIEW;

    // Fetch Categories and then manga for each category
    const categoriesQuery = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const categoriesSnapshot = await getDocs(categoriesQuery);
    
    for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = categoryDoc.data() as CategoryDoc;
        const mangaForCategoryQuery = query(
            collection(db, 'mangas'), 
            where('categoryNames', 'array-contains', categoryData.name), 
            orderBy('updatedAt', 'desc'), 
            limit(FETCH_LIMIT_FOR_HAS_MORE)
        );
        const mangaSnapshot = await getDocs(mangaForCategoryQuery);
        const allMangaForCategory = mangaSnapshot.docs.map(doc => {
            const data = doc.data() as Omit<MangaDoc, 'id'>;
            return {
                id: doc.id,
                title: data.title,
                chapter: `${data.status} - ${data.chapters} Ch.`,
                imageUrl: data.imageUrl,
                dataAiHint: data.dataAiHint,
            };
        });

        if (allMangaForCategory.length > 0) { // Only add section if category has manga
            categorySections.push({
                id: categoryDoc.id,
                name: categoryData.name,
                slug: categoryData.slug,
                mangaList: allMangaForCategory.slice(0, ITEMS_PER_SECTION_PREVIEW),
                hasMore: allMangaForCategory.length > ITEMS_PER_SECTION_PREVIEW,
            });
        }
    }

  } catch (error) {
    console.error("Error fetching homepage data: ", error);
  }

  return { heroItem, trendingManga, newReleaseManga, categorySections, hasMoreTrending, hasMoreNewReleases };
}


export default async function HomePage() {
  const { heroItem, trendingManga, newReleaseManga, categorySections, hasMoreTrending, hasMoreNewReleases } = await getHomePageData();

  const hasAnyContent = trendingManga.length > 0 || newReleaseManga.length > 0 || categorySections.some(sec => sec.mangaList.length > 0);

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

          {categorySections.map(section => (
            // section.mangaList.length > 0 is checked inside getHomePageData before pushing to categorySections
            // but it's good practice for defensive coding or if logic changes.
            // However, the MangaGrid component itself will return null if mangaList is empty.
            <MangaGrid
                key={section.id}
                title={section.name}
                mangaList={section.mangaList}
                viewAllHref={`/category/${section.slug}`}
                hasMore={section.hasMore}
            />
          ))}
          
          {!hasAnyContent && !heroItem && ( 
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

