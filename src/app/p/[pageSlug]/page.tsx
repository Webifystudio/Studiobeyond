
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import Image from 'next/image';

interface CustomPageProps {
  params: { pageSlug: string };
}

interface CustomPageData {
  id: string;
  pageName: string;
  pageSlug: string;
  title?: string;
  description?: string;
  author?: string;
  category?: string;
  landingImageUrl?: string;
  dataAiHint?: string;
  createdAt: Timestamp;
}

async function getCustomPageData(slug: string): Promise<CustomPageData | null> {
  try {
    const pagesRef = collection(db, 'customPages');
    const q = query(pagesRef, where('pageSlug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as CustomPageData;
    }
    console.log(`No custom page found with slug: ${slug}`);
    return null;
  } catch (error) {
    console.error("Error fetching custom page data: ", error);
    return null;
  }
}

export default async function PublicCustomPage({ params }: CustomPageProps) {
  const pageData = await getCustomPageData(params.pageSlug);

  if (!pageData) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-dark">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-neutral-extralight mb-6">The page you are looking for does not exist or may have been moved.</p>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const displayTitle = pageData.title || pageData.pageName;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        
        <article className="bg-neutral-medium p-6 md:p-8 rounded-xl shadow-lg">
          {pageData.landingImageUrl && (
            <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
              <Image
                src={pageData.landingImageUrl}
                alt={displayTitle}
                layout="fill"
                objectFit="cover"
                data-ai-hint={pageData.dataAiHint || "custom page hero"}
                priority
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold text-brand-primary mb-4 font-headline">{displayTitle}</h1>
          
          {pageData.category && (
            <p className="text-sm text-accent mb-1 font-semibold">{pageData.category}</p>
          )}
          {pageData.author && (
            <p className="text-sm text-neutral-extralight/80 mb-4">By: {pageData.author}</p>
          )}
          
          {pageData.description && (
            <div className="prose prose-invert max-w-none text-neutral-extralight/90 font-body whitespace-pre-line">
              {/* For more complex content, you might use a markdown parser here if description stores markdown */}
              <p>{pageData.description}</p>
            </div>
          )}

          {!pageData.description && (
             <p className="text-neutral-extralight/70 font-body">No additional content for this page yet.</p>
          )}
        </article>
        
      </main>
      <Footer />
    </div>
  );
}

// Optional: Generate static params if you have a known, small set of custom pages
// export async function generateStaticParams() {
//   try {
//     const pagesSnapshot = await getDocs(collection(db, 'customPages'));
//     return pagesSnapshot.docs.map((doc) => ({
//       pageSlug: doc.data().pageSlug,
//     }));
//   } catch (error) {
//     console.error("Error generating static params for custom pages:", error);
//     return [];
//   }
// }

export const revalidate = 60; // Revalidate page every 60 seconds or as needed
