
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/manga/hero-section';
import { CategoryGrid, type CategoryItem } from '@/components/manga/category-grid';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, type Timestamp } from 'firebase/firestore';

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

interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
  createdAt: Timestamp;
}

async function getHomePageData() {
  let heroItem: SliderItemDoc | null = null;
  let categories: CategoryItem[] = [];

  // Fetch Hero Item
  try {
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
  } catch (error) {
    console.error("Error fetching hero item:", error);
  }

  // Fetch Categories
  try {
    const categoriesQuery = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const categoriesSnapshot = await getDocs(categoriesQuery);
    categories = categoriesSnapshot.docs.map(doc => {
      const data = doc.data() as Omit<CategoryDoc, 'id'>;
      return {
        id: doc.id,
        name: data.name,
        href: `/category/${encodeURIComponent(data.slug)}`, // Link to category specific page
      };
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  return { heroItem, categories };
}


export default async function HomePage() {
  const { heroItem, categories } = await getHomePageData();

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
            description="Discover amazing manga series. Explore our curated collections and latest updates. Content is managed via the Admin Panel."
            imageUrl="https://placehold.co/1600x700/1D232A/FF6B6B.png?text=BEYOND+SCANS"
            imageAlt="Featured Manga Placeholder"
            buttonText="Explore Now"
            buttonHref="/browse" 
            dataAiHint="placeholder featured"
            isHomepageHero={true}
          />
        )}
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {categories.length > 0 && (
            <CategoryGrid title="Browse by Category" categories={categories} />
          )}

          {!heroItem && categories.length === 0 && ( 
                <div className="text-center py-10 text-neutral-extralight">
                <p className="text-xl mb-2">Homepage content is being prepared!</p>
                <p>Add a hero item or categories in the admin panel to populate the homepage.</p>
                </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
