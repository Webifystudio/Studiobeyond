
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/manga/hero-section';
import { MangaCard } from '@/components/manga/manga-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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

interface MangaItem {
  id: string;
  title: string;
  chapter: string; 
  imageUrl: string;
  dataAiHint?: string;
}

interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
}

interface CategoryWithManga extends CategoryDoc {
  mangas: MangaItem[];
  hasMoreManga: boolean;
}

const MANGA_PER_CATEGORY_LIMIT = 7; // Fetch 7 to see if "View All" is needed for first 6

async function getHomePageData() {
  let heroItem: SliderItemDoc | null = null;
  const categoriesWithManga: CategoryWithManga[] = [];

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

  // Fetch Categories and their Manga
  try {
    const categoriesQuery = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const categoriesSnapshot = await getDocs(categoriesQuery);

    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryData = categoryDoc.data() as Omit<CategoryDoc, 'id'>;
      const currentCategory: CategoryWithManga = {
        id: categoryDoc.id,
        name: categoryData.name,
        slug: categoryData.slug,
        mangas: [],
        hasMoreManga: false,
      };

      try {
        const mangaQuery = query(
          collection(db, 'mangas'),
          where('categoryNames', 'array-contains', categoryData.name), // Assumes categoryNames stores the NAME
          orderBy('updatedAt', 'desc'),
          limit(MANGA_PER_CATEGORY_LIMIT)
        );
        const mangaSnapshot = await getDocs(mangaQuery);
        
        currentCategory.mangas = mangaSnapshot.docs.slice(0, 6).map(doc => {
          const data = doc.data() as { title: string; status: string; chapters: number; imageUrl: string; dataAiHint?: string };
          return {
            id: doc.id,
            title: data.title,
            chapter: `${data.status} - ${data.chapters} Ch.`,
            imageUrl: data.imageUrl,
            dataAiHint: data.dataAiHint,
          };
        });
        currentCategory.hasMoreManga = mangaSnapshot.docs.length >= MANGA_PER_CATEGORY_LIMIT;

      } catch (mangaError) {
        console.error(`Error fetching manga for category ${categoryData.name}:`, mangaError);
        // Keep the category, it will show as empty
      }
      categoriesWithManga.push(currentCategory);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  return { heroItem, categoriesWithManga };
}


export default async function HomePage() {
  const { heroItem, categoriesWithManga } = await getHomePageData();

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
          {categoriesWithManga.map(category => (
            <section key={category.id} className="mb-12">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold section-title text-white font-headline">{category.name}</h2>
                {(category.mangas.length > 0 || category.hasMoreManga) && ( // Show View All if there are manga or possibility of more
                  <Button variant="outline" asChild size="sm" className="text-sm">
                    <Link href={`/category/${category.slug}`}>
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
              {category.mangas.length > 0 ? (
                <ScrollArea orientation="horizontal" className="w-full pb-3 -mb-3">
                  <div className="flex space-x-4 sm:space-x-5 py-2">
                    {category.mangas.map((manga) => (
                      <div key={manga.id} className="w-[150px] sm:w-[160px] md:w-[170px] lg:w-[180px] shrink-0">
                        <MangaCard
                          id={manga.id}
                          title={manga.title}
                          chapter={manga.chapter}
                          imageUrl={manga.imageUrl}
                          dataAiHint={manga.dataAiHint}
                        />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              ) : (
                <p className="text-neutral-extralight/70 pl-4">No manga in this category yet.</p>
              )}
            </section>
          ))}

          {!heroItem && categoriesWithManga.length === 0 && ( 
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
    