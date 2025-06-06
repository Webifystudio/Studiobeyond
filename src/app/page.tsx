
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/manga/hero-section';
import { MangaGrid, type MangaItem as MangaCardItem } from '@/components/manga/manga-grid';
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
  sectionId?: string; // For custom sections
  createdAt: Timestamp;
  updatedAt: Timestamp;
  views?: number;
}

interface SectionDoc {
  id: string;
  name: string;
  slug: string;
  createdAt: Timestamp;
}

interface CustomSectionForHomepage extends SectionDoc {
  mangaList: MangaCardItem[];
  hasMoreManga: boolean;
}

const ITEMS_PER_MANGA_SECTION_PREVIEW = 6;
const FETCH_LIMIT_FOR_MANGA_HAS_MORE = ITEMS_PER_MANGA_SECTION_PREVIEW + 1;

async function getHomePageData() {
  let heroItem: SliderItemDoc | null = null;
  let trendingManga: MangaCardItem[] = [];
  let newReleaseManga: MangaCardItem[] = []; 
  let customSections: CustomSectionForHomepage[] = [];
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

    // Fetch Custom Sections and their Manga
    const sectionsQuery = query(collection(db, 'sections'), orderBy('createdAt', 'asc')); // Order by name or a custom order field later
    const sectionsSnapshot = await getDocs(sectionsQuery);
    
    for (const sectionDoc of sectionsSnapshot.docs) {
        const sectionData = sectionDoc.data() as Omit<SectionDoc, 'id'>;
        const mangasForSectionQuery = query(
            collection(db, 'mangas'),
            where('sectionId', '==', sectionDoc.id),
            orderBy('updatedAt', 'desc'), // Or by title, or a custom order within section
            limit(FETCH_LIMIT_FOR_MANGA_HAS_MORE)
        );
        const mangasSnapshot = await getDocs(mangasForSectionQuery);
        const allMangaForSection = mangasSnapshot.docs.map(mangaDoc => {
            const data = mangaDoc.data() as Omit<MangaDoc, 'id'>;
            return {
                id: mangaDoc.id,
                title: data.title,
                chapter: `${data.status} - ${data.chapters} Ch.`,
                imageUrl: data.imageUrl,
                dataAiHint: data.dataAiHint,
            };
        });
        
        if (allMangaForSection.length > 0) {
             customSections.push({
                id: sectionDoc.id,
                name: sectionData.name,
                slug: sectionData.slug,
                createdAt: sectionData.createdAt,
                mangaList: allMangaForSection.slice(0, ITEMS_PER_MANGA_SECTION_PREVIEW),
                hasMoreManga: allMangaForSection.length > ITEMS_PER_MANGA_SECTION_PREVIEW,
            });
        }
    }

  } catch (error) {
    console.error("Error fetching homepage data: ", error);
    // Reset all data on error
    heroItem = null;
    trendingManga = [];
    newReleaseManga = [];
    customSections = [];
    hasMoreTrending = false;
    hasMoreNewReleases = false;
  }

  return { heroItem, trendingManga, newReleaseManga, customSections, hasMoreTrending, hasMoreNewReleases };
}


export default async function HomePage() {
  const { heroItem, trendingManga, newReleaseManga, customSections, hasMoreTrending, hasMoreNewReleases } = await getHomePageData();

  const hasAnyContent = trendingManga.length > 0 || newReleaseManga.length > 0 || customSections.some(sec => sec.mangaList.length > 0) || heroItem;

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
          
          {customSections.map(section => (
            section.mangaList.length > 0 && ( // Only render if the section has manga
              <MangaGrid
                key={section.id}
                title={section.name}
                mangaList={section.mangaList}
                // viewAllHref={`/sections/${section.slug}`} // Optional: if you build section-specific pages
                hasMore={section.hasMoreManga}
              />
            )
          ))}
          
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
