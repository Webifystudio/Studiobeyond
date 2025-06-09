
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/manga/hero-section';
import { DynamicMangaSection } from '@/components/manga/dynamic-manga-section'; // Import the new component
import { db, collection, getDocs, query, orderBy, limit, type Timestamp } from '@/lib/firebase';

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

async function getHeroData(): Promise<SliderItemDoc | null> {
  try {
    const sliderQuery = query(collection(db, 'sliderItems'), orderBy('createdAt', 'desc'), limit(1));
    const sliderSnapshot = await getDocs(sliderQuery);
    if (!sliderSnapshot.empty) {
      const docData = sliderSnapshot.docs[0].data();
      return { 
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
    return null;
  } catch (error) {
    console.error("Error fetching hero item:", error);
    return null;
  }
}

export default async function HomePage() {
  const heroItem = await getHeroData();

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
            title="Welcome to BEYOND SCANS"
            description="Your ultimate destination for manga. Explore our curated collections and latest updates."
            imageUrl="https://placehold.co/1600x700/1A202C/FF6B6B.png?text=BEYOND+SCANS"
            imageAlt="Default Featured Manga Placeholder"
            buttonText="Explore Now"
            buttonHref="/latest" 
            dataAiHint="placeholder manga hero"
            isHomepageHero={true}
          />
        )}
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* This is the new dynamic section */}
          <DynamicMangaSection />

          {/* If no heroItem and no dynamic content is expected to load initially, 
              you might want a placeholder here. But DynamicMangaSection handles its own empty/loading states. */}
          {!heroItem && ( 
             <div className="text-center py-10 text-neutral-extralight">
                {/* This message might be redundant if DynamicMangaSection is loading or empty */}
             </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
