
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Search, Share2, ThumbsUp, MessageCircle, Eye, ArrowLeft, X as CloseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { db, serverTimestamp, collection, query, where, getDocs, doc, updateDoc, increment, Timestamp, orderBy } from '@/lib/firebase';
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

interface ChapterItem {
  id: string;
  name: string;
  imageUrls: string[];
  createdAt: Timestamp;
}

export default function PublicCustomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageSlug = params.pageSlug as string;
  const { toast } = useToast();

  const [pageData, setPageData] = useState<CustomPageData | null>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  
  const [selectedChapter, setSelectedChapter] = useState<ChapterItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Effect for fetching page data and incrementing views
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

          const viewedKey = `viewed-page-${data.id}`;
          if (typeof window !== 'undefined' && !localStorage.getItem(viewedKey)) {
            const pageDocRef = doc(db, 'customPages', docSnap.id);
            await updateDoc(pageDocRef, {
              views: increment(1)
            });
            localStorage.setItem(viewedKey, 'true');
            setPageData(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
          }
          
          // Fetch chapters after page data is loaded
          fetchChapters(docSnap.id);

        } else {
          console.log(`No custom page found with slug: ${pageSlug}`);
          setPageData(null); 
        }
      } catch (error) {
        console.error("Error fetching or updating custom page data: ", error);
        toast({ title: "Error", description: "Could not load page data.", variant: "destructive" });
      }
      setIsLoading(false);
    };

    fetchAndIncrementView();
  }, [pageSlug, toast]);

  const fetchChapters = async (currentPageId: string) => {
    if (!currentPageId) return;
    setIsLoadingChapters(true);
    try {
      const chaptersRef = collection(db, 'customPages', currentPageId, 'chapters');
      const qChapters = query(chaptersRef, orderBy('createdAt', 'asc'));
      const chaptersSnapshot = await getDocs(qChapters);
      const fetchedChapters = chaptersSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as ChapterItem));
      setChapters(fetchedChapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      toast({ title: "Error", description: "Could not load chapters.", variant: "destructive" });
    }
    setIsLoadingChapters(false);
  };


  const handleInteraction = (action: string) => {
    toast({
      title: "Login Required",
      description: `You need to be logged in to ${action}.`,
      action: <Button variant="outline" size="sm" onClick={() => router.push('/login')}>Login</Button>
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
        // toast({title: "Could not share", description: "Sharing failed or was cancelled.", variant: "destructive"});
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

  const openChapterViewer = (chapter: ChapterItem) => {
    setSelectedChapter(chapter);
    setCurrentImageIndex(0);
  };

  const closeChapterViewer = () => {
    setSelectedChapter(null);
  };

  const navigateImage = (direction: 'next' | 'prev') => {
    if (!selectedChapter) return;
    setCurrentImageIndex(prev => {
      if (direction === 'next') {
        return prev < selectedChapter.imageUrls.length - 1 ? prev + 1 : prev;
      } else {
        return prev > 0 ? prev - 1 : prev;
      }
    });
  };

  const navigateChapter = (direction: 'next' | 'prev') => {
    if (!selectedChapter) return;
    const currentChapterIndexInList = chapters.findIndex(ch => ch.id === selectedChapter.id);
    if (direction === 'next' && currentChapterIndexInList < chapters.length - 1) {
      openChapterViewer(chapters[currentChapterIndexInList + 1]);
    } else if (direction === 'prev' && currentChapterIndexInList > 0) {
      openChapterViewer(chapters[currentChapterIndexInList - 1]);
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

  if (selectedChapter) {
    // Chapter Image Viewer Mode
    const totalImages = selectedChapter.imageUrls.length;
    const currentImageUrl = selectedChapter.imageUrls[currentImageIndex];
    const currentChapterIndexInList = chapters.findIndex(ch => ch.id === selectedChapter.id);

    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        {/* Viewer Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 p-2 sm:p-4 flex justify-between items-center bg-black/70 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={closeChapterViewer} className="hover:bg-white/10">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Page Details</span>
          </Button>
          <div className="text-center">
            <h2 className="text-sm sm:text-lg font-semibold truncate max-w-[150px] sm:max-w-xs md:max-w-md">{selectedChapter.name}</h2>
            {totalImages > 0 && <p className="text-xs sm:text-sm text-neutral-400">Page {currentImageIndex + 1} of {totalImages}</p>}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateChapter('prev')} 
              disabled={currentChapterIndexInList <= 0}
              className="hover:bg-white/10 text-xs sm:text-sm px-2 sm:px-3"
            >
              Prev Ch
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateChapter('next')} 
              disabled={currentChapterIndexInList >= chapters.length - 1}
              className="hover:bg-white/10 text-xs sm:text-sm px-2 sm:px-3"
            >
              Next Ch
            </Button>
          </div>
        </nav>

        {/* Image Display Area */}
        <main className="flex-grow flex items-center justify-center pt-16 pb-16 sm:pt-20 sm:pb-20 overflow-hidden">
          {totalImages > 0 && currentImageUrl ? (
            <Image
              key={currentImageUrl} // Force re-render on URL change
              src={currentImageUrl}
              alt={`Page ${currentImageIndex + 1} of ${selectedChapter.name}`}
              width={800} // Intrinsic width, will be styled by CSS
              height={1200} // Intrinsic height
              className="max-w-full max-h-full object-contain"
              data-ai-hint="manga page"
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/800x1200/000000/FFFFFF?text=Error+Loading+Image')}
            />
          ) : (
            <p className="text-neutral-400">{totalImages === 0 ? "No images in this chapter." : "Error loading image."}</p>
          )}
        </main>

        {/* Viewer Footer Navigation */}
        <footer className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 flex justify-between items-center bg-black/70 backdrop-blur-sm">
          <Button 
            variant="ghost" 
            onClick={() => navigateImage('prev')} 
            disabled={currentImageIndex <= 0 || totalImages === 0}
            className="hover:bg-white/10 text-sm sm:text-base"
          >
            Previous
          </Button>
          <Button variant="ghost" size="icon" onClick={closeChapterViewer} className="hover:bg-white/10">
            <CloseIcon className="h-6 w-6" />
            <span className="sr-only">Close Viewer</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigateImage('next')} 
            disabled={currentImageIndex >= totalImages - 1 || totalImages === 0}
            className="hover:bg-white/10 text-sm sm:text-base"
          >
            Next
          </Button>
        </footer>
      </div>
    );
  }


  // Default Page View
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark text-white">
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

      <main className="relative flex-grow">
        {/* Landing Section */}
        <section className="relative flex items-end min-h-[70vh] sm:min-h-screen">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10"></div>

          <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16 md:pb-20 text-white w-full">
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
                  {pageData.description.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
              {!pageData.description && !pageData.author && !pageData.category && (
                   <p className="text-neutral-extralight/70 font-body mb-8">No additional content available for this page yet.</p>
              )}

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
                  <span className="text-sm">{pageData.views ?? 0} Views</span>
                </div>
              </div>
            </article>
          </div>
        </section>
        
        {/* Chapters Section */}
        {chapters.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-neutral-dark">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white font-headline section-title border-l-4 border-brand-primary pl-3">Chapters</h2>
            {isLoadingChapters ? (
              <p className="text-neutral-extralight/70">Loading chapters...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {chapters.map(chapter => (
                  <Card 
                    key={chapter.id} 
                    className="bg-neutral-medium border-neutral-light hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => openChapterViewer(chapter)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-brand-primary font-semibold truncate">{chapter.name}</CardTitle>
                      <CardDescription className="text-neutral-extralight/70">{chapter.imageUrls?.length || 0} Pages</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

