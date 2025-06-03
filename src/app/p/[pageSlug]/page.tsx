
"use client";

import { useEffect, useState, type ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Search, Share2, ThumbsUp, MessageCircle, Eye, ArrowLeft, X as CloseIcon, DownloadCloud, LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { db, collection, query, where, getDocs, doc, updateDoc, increment, Timestamp, orderBy, auth, onAuthStateChanged, type User } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  downloadLink?: string;
  createdAt: Timestamp;
}

export default function PublicCustomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const pageSlug = params.pageSlug as string;
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pageData, setPageData] = useState<CustomPageData | null>(null);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  
  const [selectedChapter, setSelectedChapter] = useState<ChapterItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [readingMode, setReadingMode] = useState<'horizontal' | 'vertical'>('horizontal');

  const [showChapterSearch, setShowChapterSearch] = useState(false);
  const [chapterSearchTerm, setChapterSearchTerm] = useState('');


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);
  
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
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: `You need to be logged in to ${action}.`,
        action: <Button variant="outline" size="sm" onClick={() => router.push('/login')}>Login</Button>,
        duration: 5000,
      });
      router.push('/login');
      return;
    }
    toast({
      title: "Coming Soon!",
      description: `The ability to ${action} is under development.`,
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
    setReadingMode('horizontal'); // Reset to horizontal when opening new chapter
  };

  const closeChapterViewer = () => {
    setSelectedChapter(null);
  };

  const navigateImage = (direction: 'next' | 'prev') => {
    if (!selectedChapter || readingMode === 'vertical') return;
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

  const filteredChapters = chapters.filter(chapter =>
    chapter.name.toLowerCase().includes(chapterSearchTerm.toLowerCase())
  );

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
    const totalImages = selectedChapter.imageUrls.length;
    const currentImageUrl = selectedChapter.imageUrls[currentImageIndex];
    const currentChapterIndexInList = chapters.findIndex(ch => ch.id === selectedChapter.id);

    return (
      <div className="flex flex-col min-h-screen bg-black text-white">
        <nav className="fixed top-0 left-0 right-0 z-50 p-2 sm:p-3 flex justify-between items-center bg-black/80 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={closeChapterViewer} className="hover:bg-white/10">
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="sr-only">Back to Page Details</span>
          </Button>
          <div className="text-center mx-2 flex-1 min-w-0">
            <h2 className="text-xs sm:text-base font-semibold truncate " title={selectedChapter.name}>{selectedChapter.name}</h2>
            {readingMode === 'horizontal' && totalImages > 0 && <p className="text-xs text-neutral-400">Page {currentImageIndex + 1} of {totalImages}</p>}
            {readingMode === 'vertical' && totalImages > 0 && <p className="text-xs text-neutral-400">{totalImages} Pages (Scroll)</p>}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setReadingMode(readingMode === 'horizontal' ? 'vertical' : 'horizontal')}
                            className="hover:bg-white/10"
                            aria-label={readingMode === 'horizontal' ? "Switch to Vertical Reading" : "Switch to Horizontal Reading"}
                        >
                            {readingMode === 'horizontal' ? <LayoutList className="h-5 w-5 sm:h-6 sm:w-6" /> : <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-neutral-medium text-neutral-extralight border-neutral-light">
                        <p>{readingMode === 'horizontal' ? "Vertical View" : "Horizontal View"}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateChapter('prev')} 
              disabled={currentChapterIndexInList <= 0}
              className="hover:bg-white/10 text-xs sm:text-sm px-1 sm:px-2"
            >
              Prev Ch
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateChapter('next')} 
              disabled={currentChapterIndexInList >= chapters.length - 1}
              className="hover:bg-white/10 text-xs sm:text-sm px-1 sm:px-2"
            >
              Next Ch
            </Button>
          </div>
        </nav>

        <main className={`flex-grow pt-16 pb-16 sm:pt-20 sm:pb-20 overflow-hidden ${readingMode === 'vertical' ? 'overflow-y-auto' : ''}`}>
          {readingMode === 'horizontal' && totalImages > 0 && currentImageUrl && (
             <div className="flex items-center justify-center h-full">
                <Image
                key={currentImageUrl} // Re-mount image on URL change
                src={currentImageUrl}
                alt={`Page ${currentImageIndex + 1} of ${selectedChapter.name}`}
                width={800} 
                height={1200} 
                className="max-w-full max-h-full object-contain"
                data-ai-hint="manga page"
                priority={currentImageIndex < 2} // Prioritize first few images
                onError={(e) => (e.currentTarget.src = 'https://placehold.co/800x1200/000000/FFFFFF?text=Error+Loading+Image')}
                />
            </div>
          )}
          {readingMode === 'vertical' && totalImages > 0 && (
            <div className="flex flex-col items-center space-y-1 w-full px-1 sm:px-2">
              {selectedChapter.imageUrls.map((url, index) => (
                <Image
                  key={url + index}
                  src={url}
                  alt={`Page ${index + 1} of ${selectedChapter.name}`}
                  width={720} 
                  height={1080} 
                  className="object-contain w-full h-auto max-w-screen-md shadow-md"
                  data-ai-hint="manga page scroll"
                  loading={index > 2 ? "lazy" : "eager"} // Lazy load images after the first few
                  onError={(e) => (e.currentTarget.src = 'https://placehold.co/720x1080/000000/FFFFFF?text=Error+Loading+Image')}
                />
              ))}
            </div>
          )}
          {totalImages === 0 && (
            <div className="flex items-center justify-center h-full">
                <p className="text-neutral-400">No images in this chapter.</p>
            </div>
          )}
        </main>
        
        <footer className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-3 flex justify-between items-center bg-black/80 backdrop-blur-sm">
          <Button 
            variant="ghost" 
            onClick={() => navigateImage('prev')} 
            disabled={currentImageIndex <= 0 || totalImages === 0 || readingMode === 'vertical'}
            className={`hover:bg-white/10 text-sm sm:text-base ${readingMode === 'vertical' ? 'invisible' : ''}`}
          >
            Previous
          </Button>
          <Button variant="ghost" size="icon" onClick={closeChapterViewer} className="hover:bg-white/10">
            <CloseIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="sr-only">Close Viewer</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigateImage('next')} 
            disabled={currentImageIndex >= totalImages - 1 || totalImages === 0 || readingMode === 'vertical'}
            className={`hover:bg-white/10 text-sm sm:text-base ${readingMode === 'vertical' ? 'invisible' : ''}`}
          >
            Next
          </Button>
        </footer>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="flex flex-col min-h-screen bg-neutral-dark text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 flex justify-between items-center bg-transparent transition-all duration-300 hover:bg-black/30">
        <Link href="/" aria-label="Go to Homepage">
          <Home className="h-6 w-6 sm:h-7 sm:w-7 text-white hover:text-brand-primary transition-colors" />
        </Link>
        <div className="flex items-center space-x-1 sm:space-x-2">
          {showChapterSearch && (
            <Input
                type="text"
                placeholder="Search chapters..."
                value={chapterSearchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setChapterSearchTerm(e.target.value)}
                className="h-8 sm:h-9 bg-neutral-dark/70 border-neutral-light text-neutral-extralight placeholder:text-neutral-extralight/60 focus:ring-brand-primary w-32 sm:w-48 transition-all duration-300"
                aria-label="Search Chapters"
            />
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-brand-primary hover:bg-white/10" onClick={() => setShowChapterSearch(!showChapterSearch)}>
                <Search className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-neutral-medium text-neutral-extralight border-neutral-light">
                <p>Search Chapters</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-brand-primary hover:bg-white/10" onClick={handleShare}>
                <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </TooltipTrigger>
             <TooltipContent side="bottom" className="bg-neutral-medium text-neutral-extralight border-neutral-light">
                <p>Share Page</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </nav>

      <main className="relative flex-grow">
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
              <div className="flex items-center space-x-2 md:space-x-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-brand-primary p-1.5 sm:p-2 group" onClick={() => handleInteraction('like this page')} aria-label="Like this page">
                      <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-neutral-medium text-neutral-extralight border-neutral-light"><p>Like</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-brand-primary p-1.5 sm:p-2 group" onClick={() => handleInteraction('comment on this page')} aria-label="Comment on this page">
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-neutral-medium text-neutral-extralight border-neutral-light"><p>Comment</p></TooltipContent>
                </Tooltip>
                 <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="text-white hover:text-brand-primary p-1.5 sm:p-2 group" aria-label="Download chapters">
                            <DownloadCloud className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                     <TooltipContent side="bottom" className="bg-neutral-medium text-neutral-extralight border-neutral-light"><p>Download</p></TooltipContent>
                  </Tooltip>
                  <DialogContent className="bg-neutral-medium border-neutral-light text-neutral-extralight sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Download Chapters</DialogTitle>
                      <DialogDescription>
                        Select a chapter to download if a link is available.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
                      {chapters.length > 0 ? chapters.map(chapter => (
                        <div key={chapter.id} className="flex justify-between items-center p-2 bg-neutral-light rounded-md">
                          <span className="truncate" title={chapter.name}>{chapter.name}</span>
                          {chapter.downloadLink ? (
                            <Button size="sm" asChild className="bg-brand-primary hover:bg-brand-primary/80 text-white">
                              <Link href={chapter.downloadLink} target="_blank" rel="noopener noreferrer">
                                Download
                              </Link>
                            </Button>
                          ) : (
                            <span className="text-xs text-neutral-extralight/60">No link</span>
                          )}
                        </div>
                      )) : (
                        <p className="text-neutral-extralight/70">No chapters available for this page.</p>
                      )}
                    </div>
                     <DialogClose asChild>
                        <Button type="button" variant="outline" className="mt-4 w-full">
                            Close
                        </Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center text-neutral-extralight/80 p-1.5 sm:p-2 cursor-default" aria-label={`${pageData.views ?? 0} views`}>
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-1.5" />
                            <span className="text-xs sm:text-sm">{pageData.views ?? 0}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-neutral-medium text-neutral-extralight border-neutral-light"><p>Views</p></TooltipContent>
                </Tooltip>
              </div>
            </article>
          </div>
        </section>
        
        {(filteredChapters.length > 0 || chapterSearchTerm) && (
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-neutral-dark">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white font-headline section-title border-l-4 border-brand-primary pl-3">Chapters</h2>
            {isLoadingChapters ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full bg-neutral-medium rounded-lg" />)}
              </div>
            ) : filteredChapters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredChapters.map(chapter => (
                  <Card 
                    key={chapter.id} 
                    className="bg-neutral-medium border-neutral-light hover:shadow-xl transition-shadow cursor-pointer hover:border-brand-primary/50"
                    onClick={() => openChapterViewer(chapter)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openChapterViewer(chapter)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-brand-primary font-semibold truncate" title={chapter.name}>{chapter.name}</CardTitle>
                      <CardDescription className="text-neutral-extralight/70">{chapter.imageUrls?.length || 0} Pages</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
                 <p className="text-neutral-extralight/70">No chapters found matching your search "{chapterSearchTerm}".</p>
            )}
          </section>
        )}
      </main>
    </div>
    </TooltipProvider>
  );
}

    

    