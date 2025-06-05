
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MangaGrid, type MangaItem } from '@/components/manga/manga-grid';
import { db, collection, getDocs, query, where, orderBy, limit, type Timestamp } from '@/lib/firebase';

interface CategoryPageProps {
  params: { categorySlug: string };
}

interface MangaDoc {
  id: string;
  title: string;
  chapters: number;
  status: string;
  imageUrl: string;
  categoryNames?: string[]; 
  dataAiHint?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CategoryDoc {
  id: string;
  name: string; 
  slug: string; 
}

async function getMangaByCategory(categorySlug: string): Promise<{ mangaList: MangaItem[], canonicalCategoryName: string | null }> {
  let canonicalCategoryName: string | null = null;
  let mangaList: MangaItem[] = [];

  try {
    const categoriesCollectionRef = collection(db, 'categories');
    const categoryQuery = query(categoriesCollectionRef, where('slug', '==', categorySlug), limit(1));
    const categorySnapshot = await getDocs(categoryQuery);

    if (!categorySnapshot.empty) {
      const categoryDocData = categorySnapshot.docs[0].data() as CategoryDoc;
      canonicalCategoryName = categoryDocData.name;

      if (canonicalCategoryName) {
        const mangasCollectionRef = collection(db, 'mangas');
        const mangasQuery = query(
          mangasCollectionRef,
          where('categoryNames', 'array-contains', canonicalCategoryName),
          orderBy('updatedAt', 'desc')
        );
        const mangaSnapshot = await getDocs(mangasQuery);
        mangaList = mangaSnapshot.docs.map(doc => {
          const data = doc.data() as Omit<MangaDoc, 'id'>;
          return {
            id: doc.id,
            title: data.title,
            chapter: `${data.status} - ${data.chapters} Ch.`,
            imageUrl: data.imageUrl,
            dataAiHint: data.dataAiHint,
          };
        });
      }
    } else {
      console.log(`No category found with slug: ${categorySlug}`);
    }
  } catch (error) {
    console.error(`Error fetching manga for category slug ${categorySlug}: `, error);
  }
  return { mangaList, canonicalCategoryName };
}

export default async function CategorySpecificPage({ params }: CategoryPageProps) {
  const categorySlug = decodeURIComponent(params.categorySlug);
  const { mangaList, canonicalCategoryName } = await getMangaByCategory(categorySlug);
  
  const pageTitle = canonicalCategoryName || (categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' '));

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/"> 
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        {mangaList.length > 0 ? (
            <MangaGrid title={`${pageTitle} Manga`} mangaList={mangaList} />
        ) : (
            <div className="text-center py-10">
                <h1 className="text-3xl font-bold text-white mb-4 font-headline">{pageTitle} Manga</h1>
                <p className="text-neutral-extralight">
                  No manga found for this category. 
                  {canonicalCategoryName === null && "The category slug in the URL might not match any existing category. "}
                  Ensure mangas are correctly assigned to the category <span className="font-semibold text-brand-primary">{`"${pageTitle}"`}</span> in the admin panel.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/admin/dashboard/assign-manga-category">Assign Manga to Category</Link>
                </Button>
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const categoriesSnapshot = await getDocs(query(collection(db, 'categories'), orderBy('name', 'asc')));
    const categories = categoriesSnapshot.docs.map(doc => doc.data() as CategoryDoc);
    return categories
      .filter(category => category.slug) 
      .map((category) => ({
        categorySlug: category.slug, 
    }));
  } catch (error) {
    console.error("Error generating static params for categories:", error);
    return [];
  }
}

export const revalidate = 0; 

    