
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { summarizeReviews, type SummarizeReviewsInput, type SummarizeReviewsOutput } from '@/ai/flows/summarize-reviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { MangaItem as MangaCardItem } from '@/components/manga/manga-grid'; // For related manga
import { MangaGrid } from '@/components/manga/manga-grid';


interface MangaPageProps {
  params: { id: string };
}

interface MangaDoc {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  dataAiHint?: string;
  chapters: number;
  status: string;
  genres: string[];
  reviews?: string[]; // Optional for now, can be a subcollection
  externalReadLink?: string; // Optional
  createdAt: Timestamp;
  updatedAt: Timestamp;
}


async function getMangaDetails(id: string): Promise<MangaDoc | null> {
  try {
    const mangaRef = doc(db, 'mangas', id);
    const mangaSnap = await getDoc(mangaRef);

    if (mangaSnap.exists()) {
      return { id: mangaSnap.id, ...mangaSnap.data() } as MangaDoc;
    } else {
      console.log(`No manga found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching manga details: ", error);
    return null;
  }
}

async function getRelatedManga(currentMangaId: string, genres: string[], limitCount: number = 5): Promise<MangaCardItem[]> {
  if (!genres || genres.length === 0) return [];
  try {
    // Fetch manga that share at least one genre, are not the current manga, and limit the results.
    // This is a simplified approach. More complex recommendations would require a different strategy.
    const q = query(
      collection(db, "mangas"),
      where("genres", "array-contains-any", genres.slice(0, 10)), // Firestore array-contains-any limit is 10
      orderBy("createdAt", "desc"), // Or some other relevance metric
      limit(limitCount + 1) // Fetch one more to exclude current if it appears
    );
    const querySnapshot = await getDocs(q);
    const related = querySnapshot.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as MangaDoc))
      .filter(manga => manga.id !== currentMangaId) // Exclude the current manga
      .slice(0, limitCount) // Ensure only limitCount items
      .map(manga => ({
        id: manga.id,
        title: manga.title,
        chapter: `${manga.status} - ${manga.chapters} Ch.`,
        imageUrl: manga.imageUrl,
        dataAiHint: manga.dataAiHint,
      }));
    return related;
  } catch (error) {
    console.error("Error fetching related manga:", error);
    return [];
  }
}


export default async function MangaDetailPage({ params }: MangaPageProps) {
  const manga = await getMangaDetails(params.id);

  if (!manga) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-dark">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex items-center justify-center">
          <div>
            <Button variant="outline" asChild className="mb-6">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
            <h1 className="text-2xl text-white text-center">Manga not found.</h1>
            <p className="text-neutral-extralight text-center">It might have been moved or does not exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  let reviewSummary: SummarizeReviewsOutput | null = null;
  const reviewsToSummarize = manga.reviews && manga.reviews.length > 0 ? manga.reviews : ["No user reviews available for this manga yet."];
  try {
    reviewSummary = await summarizeReviews({ reviews: reviewsToSummarize, mangaTitle: manga.title });
  } catch (error) {
    console.error("Failed to summarize reviews:", error);
  }
  
  const relatedManga = await getRelatedManga(manga.id, manga.genres);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <Card className="bg-neutral-medium border-neutral-light">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold text-brand-primary font-headline">{manga.title}</CardTitle>
            <CardDescription className="text-neutral-extralight/80">
              {manga.status} - {manga.chapters} Chapters
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div className="md:col-span-1">
              <div className="aspect-[2/3] relative w-full rounded-lg shadow-md overflow-hidden">
                <Image
                  src={manga.imageUrl || 'https://placehold.co/400x600.png'}
                  alt={manga.title}
                  layout="fill"
                  objectFit="cover"
                  className="w-full h-full"
                  data-ai-hint={manga.dataAiHint || "manga cover detail"}
                  priority // Prioritize loading cover image
                />
              </div>
              {manga.externalReadLink && (
                <Button asChild size="lg" className="w-full mt-4 bg-brand-primary hover:bg-brand-primary/80 text-white">
                  <Link href={manga.externalReadLink} target="_blank" rel="noopener noreferrer">
                    Read Externally
                  </Link>
                </Button>
              )}
            </div>
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2 font-headline">Description</h2>
                <p className="text-neutral-extralight/90 font-body whitespace-pre-line">{manga.description || "No description available."}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2 font-headline">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {manga.genres && manga.genres.length > 0 ? manga.genres.map(genre => (
                    <Link key={genre} href={`/genre/${encodeURIComponent(genre.toLowerCase())}`} legacyBehavior>
                      <a className="bg-neutral-light text-neutral-extralight px-3 py-1 rounded-full text-sm font-body hover:bg-brand-primary/30 hover:text-brand-primary transition-colors">
                        {genre}
                      </a>
                    </Link>
                  )) : <span className="text-neutral-extralight/70 font-body">No genres listed.</span>}
                </div>
              </div>
              {reviewSummary && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3 font-headline">AI Review Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-neutral-light p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-400 mb-2 font-headline">Pros</h3>
                      {reviewSummary.pros.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-neutral-extralight/90 font-body">
                          {reviewSummary.pros.map((pro, index) => <li key={`pro-${index}`}>{pro}</li>)}
                        </ul>
                      ) : (
                        <p className="text-neutral-extralight/70 font-body">No specific pros highlighted in reviews.</p>
                      )}
                    </div>
                    <div className="bg-neutral-light p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-red-400 mb-2 font-headline">Cons</h3>
                      {reviewSummary.cons.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-neutral-extralight/90 font-body">
                          {reviewSummary.cons.map((con, index) => <li key={`con-${index}`}>{con}</li>)}
                        </ul>
                      ) : (
                         <p className="text-neutral-extralight/70 font-body">No specific cons highlighted in reviews.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
               {manga.reviews && manga.reviews.length > 0 && (
                 <div>
                    <h2 className="text-xl font-semibold text-white mb-3 font-headline">Original Reviews</h2>
                    <div className="space-y-2 max-h-60 overflow-y-auto bg-neutral-light p-4 rounded-lg">
                      {manga.reviews.map((review, index) => (
                        <p key={`review-${index}`} className="text-neutral-extralight/80 border-b border-neutral-medium pb-1 mb-1 text-sm font-body">
                          "{review}"
                        </p>
                      ))}
                    </div>
                </div>
               )}
            </div>
          </CardContent>
        </Card>

        {relatedManga.length > 0 && (
          <div className="mt-12">
            <MangaGrid title="Related Manga" mangaList={relatedManga} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  try {
    // Fetch a few recent manga to pre-render their pages
    const q = query(collection(db, "mangas"), orderBy("createdAt", "desc"), limit(10)); // Limit to avoid too many static pages
    const mangaSnapshot = await getDocs(q);
    return mangaSnapshot.docs.map((doc) => ({
      id: doc.id,
    }));
  } catch (error) {
    console.error("Error generating static params for manga details:", error);
    return [];
  }
}

export const revalidate = 3600; // Revalidate page every hour
