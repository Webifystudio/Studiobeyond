
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/manga/hero-section';
import { MangaGrid, type MangaItem } from '@/components/manga/manga-grid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
  chapters: number;
  status: string;
  imageUrl: string;
  dataAiHint?: string;
  categoryNames?: string[];
  updatedAt: Timestamp;
  createdAt: Timestamp; // Added for fallback sorting
  views?: number; // For trending
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
    // heroItem remains null, a default will be shown by the HeroSection component
  }

  // Fetch Categories and their Manga
  try {
    const categoriesCollectionQuery = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const allCategoriesSnapshot = await getDocs(categoriesCollectionQuery);

    for (const categoryDoc of allCategoriesSnapshot.docs) {
      const categoryData = categoryDoc.data() as Omit<CategoryDoc, 'id'>;
      const currentCategory: CategoryWithManga = {
        id: categoryDoc.id,
        name: categoryData.name,
        slug: categoryData.slug,
        mangas: [],
        hasMoreManga: false,
      };

      if (!currentCategory.name || !currentCategory.slug) {
        console.warn(`Category document ${categoryDoc.id} is missing name or slug. Skipping.`);
        continue; 
      }

      try {
        const mangaQuery = query(
          collection(db, 'mangas'),
          where('categoryNames', 'array-contains', currentCategory.name),
          orderBy('updatedAt', 'desc'), 
          limit(MANGA_PER_CATEGORY_LIMIT)
        );
        
        // --- DETAILED DIAGNOSTIC LOG ---
        console.log(`[DIAGNOSTIC LOG] Processing Category: "${currentCategory.name}" (Slug: ${currentCategory.slug})`);
        console.log(`  Firestore Query Sent: mangas WHERE 'categoryNames' array-contains "${currentCategory.name}", ORDER BY 'updatedAt' DESC, LIMIT ${MANGA_PER_CATEGORY_LIMIT}.`);
        const mangaSnapshot = await getDocs(mangaQuery);
        console.log(`  Manga documents FOUND by Firestore for "${currentCategory.name}": ${mangaSnapshot.docs.length}`);

        if (mangaSnapshot.docs.length === 0) {
            console.warn(`  TROUBLESHOOTING "${currentCategory.name}": If you expect manga here:`);
            console.warn(`    1. In Firestore 'mangas' collection, check a manga you assigned to "${currentCategory.name}".`);
            console.warn(`    2. Does this manga document have a field named 'categoryNames'?`);
            console.warn(`    3. Is 'categoryNames' an ARRAY of STRINGS? (e.g., ["${currentCategory.name}", "Other Category"])`);
            console.warn(`    4. Does that array contain the EXACT string "${currentCategory.name}" (it's case-sensitive)?`);
            console.warn(`    5. Does the manga have an 'updatedAt' field that is a Firestore Timestamp?`);
            console.warn(`    6. Most importantly: Check your BROWSER'S DEVELOPER CONSOLE for any Firestore errors, especially "MISSING_INDEX" or "The query requires an index...". If you see such an error, Firestore usually provides a link to create the index. YOU MUST CREATE THIS INDEX.`);
        }
        // --- END DETAILED DIAGNOSTIC LOG ---
        
        currentCategory.mangas = mangaSnapshot.docs.slice(0, 6).map(doc => {
          const data = doc.data() as MangaDoc; // Use MangaDoc which includes categoryNames
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
        console.error(`Error fetching manga for category ${currentCategory.name}:`, mangaError);
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
            description="Your ultimate destination for manga. Explore our curated collections and latest updates, all managed via the Admin Panel."
            imageUrl="https://placehold.co/1600x700/1A202C/FF6B6B.png?text=BEYOND+SCANS+Default"
            imageAlt="Default Featured Manga Placeholder"
            buttonText="Get Started"
            buttonHref="/admin/dashboard" 
            dataAiHint="placeholder manga hero"
            isHomepageHero={true}
          />
        )}
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Display each category as a section */}
          {categoriesWithManga.map((category) => (
            category.name && category.slug && ( // Ensure category has name and slug
              <section key={category.id} className="mb-12">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold section-title text-white font-headline">{category.name}</h2>
                  <Button variant="outline" asChild size="sm" className="text-sm">
                    <Link href={`/category/${category.slug}`}>
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                {category.mangas.length > 0 ? (
                   <MangaGrid 
                      title="" // Title is handled by the h2 above
                      mangaList={category.mangas}
                      // No viewAllHref or hasMore needed here as MangaGrid doesn't use it if title is empty
                   />
                ) : (
                  <p className="text-neutral-extralight/70 pl-4">No manga in the "{category.name}" category yet.</p> 
                )}
              </section>
            )
          ))}

          {/* Message if no hero AND no categories were found at all */}
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
