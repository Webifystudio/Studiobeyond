
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { db, collection, getDocs, query, orderBy, type Timestamp } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNowStrict } from 'date-fns';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

interface NewsItemDoc {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText?: string;
  buttonHref?: string;
  dataAiHint?: string;
  createdAt: Timestamp;
}

async function getNewsItems(): Promise<NewsItemDoc[]> {
  try {
    const newsQuery = query(collection(db, 'newsItems'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(newsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NewsItemDoc));
  } catch (error) {
    console.error("Error fetching news items: ", error);
    return [];
  }
}

export default async function NewsPage() {
  const newsItems = await getNewsItems();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8 font-headline text-center">Latest News & Updates</h1>

        {newsItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {newsItems.map((item) => (
              <Card key={item.id} className="bg-neutral-medium border-neutral-light flex flex-col overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
                <div className="relative w-full aspect-video">
                  <Image
                    src={item.imageUrl || 'https://placehold.co/600x400.png'}
                    alt={item.title}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={item.dataAiHint || "news article image"}
                  />
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold text-brand-primary font-headline line-clamp-2" title={item.title}>
                    {item.title}
                  </CardTitle>
                   {item.createdAt?.toDate && (
                     <p className="text-xs text-neutral-extralight/70">
                        {formatDistanceToNowStrict(item.createdAt.toDate(), { addSuffix: true })}
                     </p>
                   )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-neutral-extralight/90 line-clamp-4 font-body">
                    {item.description}
                  </CardDescription>
                </CardContent>
                {item.buttonText && item.buttonHref && (
                  <CardFooter className="pt-3">
                    <Button asChild className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white">
                      <Link href={item.buttonHref} target={item.buttonHref.startsWith('http') ? '_blank' : '_self'} rel={item.buttonHref.startsWith('http') ? 'noopener noreferrer' : ''}>
                        {item.buttonText}
                        {item.buttonHref.startsWith('http') && <ExternalLink className="ml-2 h-4 w-4" />}
                      </Link>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Newspaper className="mx-auto h-16 w-16 text-neutral-extralight/50 mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">No News Yet</h2>
            <p className="text-neutral-extralight/80">Check back soon for the latest updates!</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Helper icon, as it was requested in admin but might be useful here too.
const Newspaper = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h4v11H4Z"/><path d="M18 2h-8v12a4 4 0 0 0 4 4h4V2Z"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/></svg>
);
