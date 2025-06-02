import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { summarizeReviews, type SummarizeReviewsInput, type SummarizeReviewsOutput } from '@/ai/flows/summarize-reviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface MangaPageProps {
  params: { id: string };
}

// Mock data fetching function
async function getMangaDetails(id: string) {
  // In a real app, you'd fetch this from a database or API
  if (id === 'attack-on-titan') {
    return {
      id: 'attack-on-titan',
      title: 'Attack on Titan',
      description: 'In a world where humanity resides within enormous walled cities to protect themselves from gigantic humanoid creatures known as Titans, a young man named Eren Yeager vows to exterminate the Titans after they bring about a devastating loss.',
      imageUrl: 'https://placehold.co/400x600/1A202C/A0AEC0.png',
      dataAiHint: 'titan battle anime',
      chapters: 139,
      status: 'Completed',
      genres: ['Action', 'Dark Fantasy', 'Post-apocalyptic'],
      reviews: [
        "The story is incredible, full of twists and turns.",
        "Character development is top-notch. You really feel for them.",
        "Pacing can be slow at times, but the payoff is worth it.",
        "Art style is unique and improves over time.",
        "Some plot points felt rushed towards the end.",
        "An absolute masterpiece of storytelling.",
        "The ending was controversial for some fans."
      ],
      externalReadLink: 'https://example.com/read/attack-on-titan' // Placeholder external link
    };
  }
  // Fallback for other IDs
  return {
      id: id,
      title: `Manga: ${id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
      description: 'This is a sample description for the manga. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.',
      imageUrl: 'https://placehold.co/400x600/1A202C/A0AEC0.png',
      dataAiHint: 'manga cover generic',
      chapters: Math.floor(Math.random() * 200) + 50,
      status: Math.random() > 0.5 ? 'Ongoing' : 'Completed',
      genres: ['Action', 'Fantasy', 'Adventure'],
      reviews: [
        "This manga is pretty good, I enjoyed the art.",
        "The plot is engaging and keeps you hooked.",
        "Characters are well-written and relatable.",
        "Sometimes the story drags a bit.",
        "Overall a solid read, would recommend."
      ],
      externalReadLink: `https://example.com/read/${id}`
  };
}

export default async function MangaDetailPage({ params }: MangaPageProps) {
  const manga = await getMangaDetails(params.id);

  if (!manga) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-dark">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex items-center justify-center">
          <h1 className="text-2xl text-white">Manga not found.</h1>
        </main>
        <Footer />
      </div>
    );
  }

  let reviewSummary: SummarizeReviewsOutput | null = null;
  try {
    reviewSummary = await summarizeReviews({ reviews: manga.reviews, mangaTitle: manga.title });
  } catch (error) {
    console.error("Failed to summarize reviews:", error);
    // Handle error, e.g. show a message to the user or log it
  }

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
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Image
                src={manga.imageUrl}
                alt={manga.title}
                width={400}
                height={600}
                className="rounded-lg shadow-md w-full h-auto object-cover"
                data-ai-hint={manga.dataAiHint}
              />
              <Button asChild size="lg" className="w-full mt-4 bg-brand-primary hover:bg-brand-primary/80 text-white">
                <Link href={manga.externalReadLink} target="_blank" rel="noopener noreferrer">
                  Read Externally
                </Link>
              </Button>
            </div>
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2 font-headline">Description</h2>
                <p className="text-neutral-extralight/90 font-body">{manga.description}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2 font-headline">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {manga.genres.map(genre => (
                    <span key={genre} className="bg-neutral-light text-neutral-extralight px-3 py-1 rounded-full text-sm font-body">
                      {genre}
                    </span>
                  ))}
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
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

// Add revalidate strategy if data can change frequently
// export const revalidate = 3600; // Revalidate every hour
