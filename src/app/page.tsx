
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/manga/hero-section';
import { MangaGrid, type MangaItem as MangaCardItem } from '@/components/manga/manga-grid';
import { RecentlyReadMangaGrid } from '@/components/manga/recently-read-manga-grid';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';

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
  sectionId?: string; // For querying manga by custom section
  genres?: string[]; 
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

export interface CustomSectionHomepageItem {
    id: string;
    name: string;
    slug: string;
    mangaList: MangaCardItem[];
    hasMore: boolean;
}


const ITEMS_PER_SECTION_PREVIEW = 6;
const FETCH_LIMIT_FOR_HAS_MORE = ITEMS_PER_SECTION_PREVIEW + 1;

async function getHomePageData() {
  let heroItem: SliderItemDoc | null = null;
  let trendingManga: MangaCardItem[] = [];
  let newReleaseManga: MangaCardItem[] = []; 
  let customSections: CustomSectionHomepageItem[] = [];
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
    const trendingQuery = query(collection(db, 'mangas'), orderBy('views', 'desc'), limit(FETCH_LIMIT_FOR_HAS_MORE));
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

    // Fetch New Release Manga
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

    // Fetch Custom Sections and their Manga
    const sectionsQuery = query(collection(db, 'sections'), orderBy('createdAt', 'asc'));
    const sectionsSnapshot = await getDocs(sectionsQuery);
    for (const sectionDoc of sectionsSnapshot.docs) {
        const sectionData = { id: sectionDoc.id, ...sectionDoc.data() } as SectionDoc;
        
        const mangaForSectionQuery = query(
          collection(db, 'mangas'),
          where("sectionId", "==", sectionData.id),
          orderBy('updatedAt', 'desc'), // Or any other preferred order for manga within a section
          limit(FETCH_LIMIT_FOR_HAS_MORE)
        );
        const mangaForSectionSnapshot = await getDocs(mangaForSectionQuery);
        const allMangaForSection = mangaForSectionSnapshot.docs.map(mangaDoc => {
          const data = mangaDoc.data() as Omit<MangaDoc, 'id'>;
          return {
            id: mangaDoc.id,
            title: data.title,
            chapter: `${data.status} - ${data.chapters} Ch.`,
            imageUrl: data.imageUrl,
            dataAiHint: data.dataAiHint,
          };
        });
        
        const sectionMangaList = allMangaForSection.slice(0, ITEMS_PER_SECTION_PREVIEW);
        const hasMoreForThisSection = allMangaForSection.length > ITEMS_PER_SECTION_PREVIEW;

        if (sectionMangaList.length > 0) { // Only add section if it has manga
            customSections.push({
                id: sectionData.id,
                name: sectionData.name,
                slug: sectionData.slug,
                mangaList: sectionMangaList,
                hasMore: hasMoreForThisSection,
            });
        }
    }

  } catch (error) {
    console.error("Error fetching homepage data: ", error);
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

  const hasAnyContent = trendingManga.length > 0 || newReleaseManga.length > 0 || customSections.some(sec => sec.mangaList.length > 0);

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
          
          {/* Render Custom Sections */}
          {customSections.map(section => (
            <MangaGrid
              key={section.id}
              title={section.name}
              mangaList={section.mangaList}
              // For view all, you might need a generic section page or link to a search/filter later
              // For now, let's assume a "View All" for a custom section might not be directly implemented
              // or would require a more complex routing/page like /section/[sectionSlug]
              // viewAllHref={`/section/${section.slug}`} // Placeholder if you create such pages
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

