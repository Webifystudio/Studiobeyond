
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Search, Share2, ThumbsUp, MessageCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

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
  views?: number;
  createdAt: Timestamp;
}

export default function PublicCustomPage() {
  const params = useParams();
  const pageSlug = params.pageSlug as string;
  const { toast } = useToast();

  const [pageData, setPageData] = useState<CustomPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localViews, setLocalViews] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!pageSlug) return;

    const fetchAndIncrementView = async () => {
      setIsLoading(true);
      try {
        const pagesRef = collection(db, 'customPages');
        const q = query(pagesRef, where('pageSlug', '==', pageSlug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = { id: docSnap.id, ...docSnap.data() } as CustomPageData;
          setPageData(data);
          setLocalViews(data.views !== undefined ? data.views + 1 : 1); // Optimistic update for UI

          // Increment views in Firestore
          const pageDocRef = doc(db, 'customPages', docSnap.id);
          await updateDoc(pageDocRef, {
            views: increment(1)
          });
        } else {
          console.log(`No custom page found with slug: ${pageSlug}`);
          setPageData(null); // Explicitly set to null if not found
        }
      } catch (error) {
        console.error("Error fetching or updating custom page data: ", error);
        toast({ title: "Error", description: "Could not load page data.", variant: "destructive" });
      }
      setIsLoading(false);
    };

    fetchAndIncrementView();
  }, [pageSlug, toast]);

  const handleInteraction = (action: string) => {
    toast({
      title: "Login Required",
      description: `You need to be logged in to ${action}. (Feature coming soon!)`,
    });
  };
  
  const handleShare = async () => {
    if (navigator.share && pageData) {
      try {
        await navigator.share({
          title: pageData.title || pageData.pageName,
          text: pageData.description?.substring(0, 100) || `Check out this page: ${pageData.title || pageData.pageName}`,
          url: window.location.href,
        });
        toast({title: "Shared successfully!"});
      } catch (error) {
        console.error('Error sharing:', error);
        toast({title: "Could not share", description: "Sharing failed or was cancelled.", variant: "destructive"});
      }
    } else {
         try {
            await navigator.clipboard.writeText(window.location.href);
            toast({title: "Link Copied!", description: "Page URL copied to clipboard."});
        } catch (err) {
            console.error('Failed to copy: ', err);
            toast({title: "Failed to Copy", description: "Could not copy link to clipboard.", variant: "destructive"});
        }
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-dark text-white">
        <nav className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-transparent">
          <Skeleton className="h-10 w-10 rounded-md bg-neutral-light/50" />
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-md bg-neutral-light/50" />
            <Skeleton className="h-10 w-10 rounded-md bg-neutral-light/50" />
          </div>
        </nav>
        <main className="relative flex-grow flex items-center justify-center min-h-screen">
            <Skeleton className="absolute inset-0 w-full h-full bg-neutral-medium" />
            <div className="relative z-10 p-6 text-center">
                <Skeleton className="h-10 w-3/4 mx-auto mb-4 bg-neutral-light/70" />
                <Skeleton className="h-20 w-full max-w-md mx-auto bg-neutral-light/70" />
            </div>
        </main>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-dark">
        <nav className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-transparent">
           <Link href="/" aria-label="Go to Homepage">
            <Home className="h-7 w-7 text-white hover:text-brand-primary transition-colors" />
          </Link>
        </nav>
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
          <p className="text-neutral-extralight mb-6">The page you are looking for does not exist or may have been moved.</p>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  const displayTitle = pageData.title || pageData.pageName;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark text-white">
      {/* Custom Transparent Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-transparent transition-all duration-300 hover:bg-black/30">
        <Link href="/" aria-label="Go to Homepage">
          <Home className="h-7 w-7 text-white hover:text-brand-primary transition-colors" />
        </Link>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-white hover:text-brand-primary hover:bg-white/10" onClick={() => toast({title: "Search Coming Soon!", description: "This feature is under development."})}>
            <Search className="h-6 w-6" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-brand-primary hover:bg-white/10" onClick={handleShare}>
            <Share2 className="h-6 w-6" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </nav>

      {/* Main Content with Background Image */}
      <main className="relative flex-grow flex items-end min-h-screen">
        {pageData.landingImageUrl && (
          <Image
            src={pageData.landingImageUrl}
            alt={displayTitle}
            layout="fill"
            objectFit="cover"
            className="z-0"
            data-ai-hint={pageData.dataAiHint || "custom page hero"}
            priority
          />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10"></div>

        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20 md:pb-24 text-white w-full">
          <article className="max-w-3xl">
            {pageData.category && (
              <p className="text-sm text-brand-primary font-semibold mb-2 tracking-wider uppercase">{pageData.category}</p>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-headline shadow-black [text-shadow:_2px_2px_4px_var(--tw-shadow-color)]">{displayTitle}</h1>
            
            {pageData.author && (
              <p className="text-md text-neutral-extralight/90 mb-6 font-inter">By {pageData.author}</p>
            )}

            {pageData.description && (
              <div className="prose prose-lg prose-invert max-w-none text-neutral-extralight/95 font-body mb-8 [text-shadow:_1px_1px_2px_rgba(0,0,0,0.7)]">
                {/* Using a simple p tag for now, can be enhanced with markdown parser later */}
                {pageData.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
             {!pageData.description && !pageData.author && !pageData.category && (
                 <p className="text-neutral-extralight/70 font-body mb-8">No additional content available for this page yet.</p>
            )}

            {/* Interaction Icons */}
            <div className="flex items-center space-x-6">
              <Button variant="ghost" className="text-white hover:text-brand-primary p-1 group" onClick={() => handleInteraction('like this page')}>
                <ThumbsUp className="h-5 w-5 mr-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Like</span> 
              </Button>
              <Button variant="ghost" className="text-white hover:text-brand-primary p-1 group" onClick={() => handleInteraction('comment on this page')}>
                <MessageCircle className="h-5 w-5 mr-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Comment</span>
              </Button>
              <div className="flex items-center text-neutral-extralight/80 p-1">
                <Eye className="h-5 w-5 mr-1.5" />
                <span className="text-sm">{localViews ?? pageData.views ?? 0} Views</span>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
