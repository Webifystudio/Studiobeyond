
"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Search, Share2, ThumbsUp, MessageCircle, Eye, ArrowLeft, X as CloseIcon, DownloadCloud, LayoutGrid, LayoutList, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { db, collection, query, where, getDocs, doc, updateDoc, increment, Timestamp, orderBy, serverTimestamp, addDoc, deleteDoc, getDoc, type User, onAuthStateChanged, auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';


const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.57c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
);

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 245 240" fill="currentColor" {...props}><path d="M104.4 103.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1.1-6.1-4.5-11.1-10.2-11.1zM140.9 103.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1s-4.5-11.1-10.2-11.1z"/><path d="M189.5 20h-134C44.2 20 35 29.2 35 40.6v135.2c0 11.4 9.2 20.6 20.5 20.6h113.4l-5.3-18.5 12.8 11.9 12.1 11.2 21.5 19V40.6c0-11.4-9.2-20.6-20.5-20.6zm-38.6 130.6s-3.6-4.3-6.6-8.1c13.1-3.7 18.1-11.9 18.1-11.9-4.1 2.7-8 4.6-11.5 5.9-5 2.1-9.8 3.5-14.5 4.3-9.6 1.8-18.9 1.3-27.9-.2-7.1-1.1-13.9-3.3-20.2-6.3-.6-.3-1.2-.7-1.7-1.1-1.1-.9-2.2-1.9-3.2-3.1-1.1-1.3-2.1-2.7-3-4.2h-.1c-.1-.3-.3-.7-.4-1-.1-.5-.1-1-.2-1.5l-.1-.2c0-.2.1-.3.1-.4.1-.2.1-.3.2-.4.1-.3.2-.6.3-.9.2-.5.3-.9.5-1.4.2-.7.4-1.3.6-1.9.2-.6.5-1.2.7-1.8.2-.6.4-1.1.7-1.7.2-.5.5-1.1.7-1.6.2-.5.4-1.1.6-1.6.2-.5.4-1.1.7-1.6.2-.5.4-1 .6-1.5.2-.5.4-.9.6-1.4l.2-.5.2-.5.1-.3.2-.4.1-.3c.2-.4.3-.7.5-1.1.2-.4.3-.8.5-1.2.2-.4.3-.8.5-1.1.2-.3.4-.7.6-1 .2-.4.3-.7.5-1.1.2-.4.4-.7.6-1.1.2-.4.4-.7.6-1.1l.2-.4.1-.2.1-.2.1-.2.1-.2.1-.2c.2-.3.3-.6.5-.9.2-.3.3-.6.5-.8.1-.2.2-.4.3-.5l.1-.2.1-.2c.1-.2.1-.3.2-.4.1-.2.2-.3.3-.5.1-.2.2-.3.3-.4.1-.2.2-.3.3-.5.1-.2.2-.3.3-.4.1-.2.2-.3.3-.4l.1-.2.1-.2c.2-.3.3-.5.4-.8.1-.3.2-.5.3-.7.2-.3.3-.5.4-.8.2-.3.3-.5.4-.8.1-.2.2-.4.3-.6.1-.3.2-.5.3-.7.1-.3.2-.5.3-.7.1-.3.2-.5.3-.7.1-.3.2-.5.3-.7.1-.2.2-.4.3-.6.1-.2.2-.4.3-.6.1-.2.2-.4.3-.6.1-.2.2-.4.3-.6s.1-.2.2-.4.1-.2.2-.4.1-.2.2-.3.1-.2.2-.3.1-.2.2-.3.1-.2.2-.3c.6-1.2 1.2-2.3 1.9-3.4.2-.4.3-.7.5-1.1.2-.4.3-.7.5-1.1.2-.4.4-.7.6-1.1.2-.4.4-.7.6-1.1zm-54.5 23.1c-13.4 0-24.3-11.9-24.3-26.5s10.9-26.5 24.3-26.5c13.4 0 24.3 11.9 24.3 26.5.1 14.6-10.8 26.5-24.2 26.5z"/></svg>
);

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
  views: number;
  likes?: number; // Ensure this field can exist
  defaultReadingMode?: 'horizontal' | 'vertical';
  createdAt: Timestamp;
}

interface ChapterItem {
  id: string;
  name: string;
  imageUrls: string[];
  telegramLink?: string;
  discordLink?: string;
  createdAt: Timestamp;
}

interface CommentDoc {
  id: string;
  userId: string;
  username: string;
  userPhotoURL?: string | null;
  text: string;
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
  
  const [isChapterSelectForDownloadModalOpen, setIsChapterSelectForDownloadModalOpen] = useState(false);
  const [chapterForDownloadLinks, setChapterForDownloadLinks] = useState<ChapterItem | null>(null);
  const [isDownloadLinksModalOpen, setIsDownloadLinksModalOpen] = useState(false);

  const [readingMode, setReadingMode] = useState<'horizontal' | 'vertical'>('horizontal');

  const [showChapterSearch, setShowChapterSearch] = useState(false);
  const [chapterSearchTerm, setChapterSearchTerm] = useState('');

  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [currentViewCount, setCurrentViewCount] = useState(0);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const swipeThreshold = 50;


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []); 

  const checkIfUserLiked = useCallback(async (userId: string, pageId: string) => {
    if (!userId || !pageId) return;
    const likeRef = doc(db, 'customPages', pageId, 'likes', userId);
    try {
        const docSnap = await getDoc(likeRef);
        setHasLiked(docSnap.exists());
    } catch (error) {
        console.error("Error checking if user liked:", error);
        setHasLiked(false); // Default to not liked on error
    }
  }, []);
  
  const fetchPageAndRelatedData = useCallback(async () => {
    if (!pageSlug) return;
    setIsLoading(true);
    try {
      const pagesRef = collection(db, 'customPages');
      const q = query(pagesRef, where('pageSlug', '==', pageSlug), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = { id: docSnap.id, ...docSnap.data(), views: docSnap.data().views || 0, likes: docSnap.data().likes || 0 } as CustomPageData;
        setPageData(data);
        setCurrentViewCount(data.views); 
        setReadingMode(data.defaultReadingMode || 'horizontal');
        setLikeCount(data.likes || 0);

        if (currentUser?.uid) {
          checkIfUserLiked(currentUser.uid, data.id);
        }
        fetchComments(data.id); // Fetch comments after page data is set

        const viewedKey = `viewed-page-${data.id}`;
        if (typeof window !== 'undefined' && !localStorage.getItem(viewedKey)) { 
          const pageDocRef = doc(db, 'customPages', docSnap.id);
          await updateDoc(pageDocRef, { views: increment(1) });
          setCurrentViewCount(prev => prev + 1); 
          localStorage.setItem(viewedKey, 'true');
        }
        
        fetchChapters(docSnap.id); // Fetch chapters after page data is set

      } else {
        console.log(`No custom page found with slug: ${pageSlug}`);
        setPageData(null); 
        setLikeCount(0);
        setHasLiked(false);
      }
    } catch (error) {
      console.error("Error fetching or updating custom page data: ", error);
      toast({ title: "Error", description: "Could not load page data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [pageSlug, currentUser, checkIfUserLiked, toast]);

  useEffect(() => {
    fetchPageAndRelatedData();
  }, [fetchPageAndRelatedData]);


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
  
  const fetchComments = async (pageId: string) => {
    if (!pageId) return;
    setIsLoadingComments(true);
    try {
      const commentsQuery = query(collection(db, 'customPages', pageId, 'comments'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(commentsQuery);
      const commentsData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as CommentDoc));
      setComments(commentsData);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      toast({ title: "Error", description: error.message || "Could not load comments.", variant: "destructive"});
    }
    setIsLoadingComments(false);
  };


  const handleLike = async () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to like this page.", variant: "default" });
      router.push('/login');
      return;
    }
    if (isLiking || !pageData?.id) return;
    setIsLiking(true);

    const pageLikeRef = doc(db, 'customPages', pageData.id, 'likes', currentUser.uid);
    const pageRef = doc(db, 'customPages', pageData.id);

    try {
      if (hasLiked) {
        await deleteDoc(pageLikeRef);
        await updateDoc(pageRef, { likes: increment(-1) });
        setHasLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        toast({ title: "Unliked!" });
      } else {
        await setDoc(pageLikeRef, { userId: currentUser.uid, createdAt: serverTimestamp() });
        await updateDoc(pageRef, { likes: increment(1) });
        setHasLiked(true);
        setLikeCount(prev => prev + 1);
        toast({ title: "Liked!" });
      }
    } catch (error: any) {
      console.error("Error liking/unliking page:", error);
      toast({ title: "Error", description: error.message || "Could not update like status.", variant: "destructive" });
    }
    setIsLiking(false);
  };

  const handlePostComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to comment.", variant: "default" });
      router.push('/login');
      return;
    }
    if (!newComment.trim() || !pageData?.id) return;
    setIsPostingComment(true);

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const username = userDocSnap.exists() ? userDocSnap.data()?.username : currentUser.displayName || "Anonymous";
      
      const commentData = {
        userId: currentUser.uid,
        username: username,
        userPhotoURL: currentUser.photoURL,
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      };
      const commentsColRef = collection(db, 'customPages', pageData.id, 'comments');
      await addDoc(commentsColRef, commentData);
      
      setNewComment('');
      setShowCommentBox(false);
      toast({ title: "Comment Posted!" });
      fetchComments(pageData.id); 
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast({ title: "Error", description: error.message || "Could not post comment.", variant: "destructive" });
    }
    setIsPostingComment(false);
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "A";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || "A";
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
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
        toast({title: "Share Canceled or Failed", description: "Could not share at this moment.", variant:"default"});
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
  
  const handleChapterSelectForDownload = (chapter: ChapterItem) => {
    setChapterForDownloadLinks(chapter);
    setIsChapterSelectForDownloadModalOpen(false);
    setIsDownloadLinksModalOpen(true);
  };

  const navigateImage = useCallback((direction: 'next' | 'prev') => {
    if (!selectedChapter || readingMode === 'vertical') return;
    setCurrentImageIndex(prev => {
      const totalImages = selectedChapter.imageUrls.length;
      if (direction === 'next') {
        return prev < totalImages - 1 ? prev + 1 : prev;
      } else {
        return prev > 0 ? prev - 1 : prev;
      }
    });
  }, [selectedChapter, readingMode]);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (readingMode !== 'horizontal' || !selectedChapter?.imageUrls?.length) return;
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null); 
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (readingMode !== 'horizontal' || touchStartX === null || !selectedChapter?.imageUrls?.length) return;
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (readingMode !== 'horizontal' || touchStartX === null || touchEndX === null || !selectedChapter?.imageUrls?.length) return;

    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) { 
        navigateImage('prev');
      } else { 
        navigateImage('next');
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  useEffect(() => {
    if (!selectedChapter || readingMode !== 'horizontal' || !selectedChapter?.imageUrls?.length) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (event.key === 'ArrowRight') {
        navigateImage('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedChapter, readingMode, navigateImage]);


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
    const currentImageUrl = totalImages > 0 ? selectedChapter.imageUrls[currentImageIndex] : null;
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
            {totalImages === 0 && <p className="text-xs text-neutral-400">No Images</p>}
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

        <main 
          className={`flex-grow pt-16 pb-16 sm:pt-20 sm:pb-20 overflow-hidden ${readingMode === 'vertical' ? 'overflow-y-auto' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {readingMode === 'horizontal' && totalImages > 0 && currentImageUrl && (
             <div
                ref={imageContainerRef}
                className="flex items-center justify-center h-full w-full cursor-grab active:cursor-grabbing"
                style={{ touchAction: 'pan-y' }} 
              >
                <Image
                key={currentImageUrl} 
                src={currentImageUrl}
                alt={`Page ${currentImageIndex + 1} of ${selectedChapter.name}`}
                width={800} 
                height={1200} 
                className="max-w-full max-h-full object-contain select-none"
                data-ai-hint="manga page"
                priority={currentImageIndex < 2} 
                draggable="false" 
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
                  loading={index > 2 ? "lazy" : "eager"} 
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
        
        <footer className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-3 flex justify-center items-center bg-black/80 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={closeChapterViewer} className="hover:bg-white/10">
            <CloseIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="sr-only">Close Viewer</span>
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
              <Button variant="ghost" size="icon" className="text-white hover:text-brand-primary hover:bg-black/10 p-1.5 rounded-full" onClick={() => setShowChapterSearch(!showChapterSearch)}>
                <Search className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-neutral-medium text-neutral-extralight border-neutral-light">
                <p>Search Chapters</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-brand-primary hover:bg-black/10 p-1.5 rounded-full" onClick={handleShare}>
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
              <div className="flex items-center space-x-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        className={cn("text-white p-1.5 group rounded-full flex items-center", hasLiked ? "text-brand-primary hover:text-brand-primary/80" : "hover:text-brand-primary")} 
                        onClick={handleLike} 
                        disabled={isLiking || !pageData}
                        aria-label={hasLiked ? "Unlike this page" : "Like this page"}
                        aria-pressed={hasLiked}
                    >
                      <ThumbsUp className={cn("h-5 w-5 group-hover:scale-110 transition-transform", hasLiked && "fill-brand-primary")} />
                      <span className="ml-1.5 text-xs sm:text-sm">{likeCount}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-neutral-medium text-neutral-extralight border-neutral-light"><p>{hasLiked ? 'Unlike' : 'Like'}</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-brand-primary p-1.5 group rounded-full flex items-center" onClick={() => setShowCommentBox(!showCommentBox)} aria-label="Comment on this page">
                      <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                       <span className="ml-1.5 text-xs sm:text-sm">{comments.length}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-neutral-medium text-neutral-extralight border-neutral-light"><p>Comment</p></TooltipContent>
                </Tooltip>
                
                <Dialog open={isChapterSelectForDownloadModalOpen} onOpenChange={setIsChapterSelectForDownloadModalOpen}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="text-white hover:text-brand-primary p-1.5 group rounded-full" aria-label="Download options">
                                    <DownloadCloud className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                </Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-neutral-medium text-neutral-extralight border-neutral-light"><p>Download Chapter</p></TooltipContent>
                    </Tooltip>
                  <DialogContent className="bg-neutral-medium border-neutral-light text-neutral-extralight sm:max-w-md">
                     <DialogHeader>
                        <DialogTitle>Select Chapter to Download</DialogTitle>
                        <DialogDescription>
                            Choose a chapter from the list below to see download options.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] my-4">
                        <div className="space-y-2 pr-4">
                        {chapters.length > 0 ? chapters.map(ch => (
                            <Button 
                                key={ch.id} 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={() => handleChapterSelectForDownload(ch)}
                            >
                                {ch.name}
                            </Button>
                        )) : <p className="text-neutral-extralight/70 text-center">No chapters available.</p>}
                        </div>
                    </ScrollArea>
                     <DialogClose asChild>
                        <Button type="button" variant="secondary" className="mt-2 w-full">
                            Cancel
                        </Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>

                <Dialog open={isDownloadLinksModalOpen} onOpenChange={setIsDownloadLinksModalOpen}>
                    <DialogContent className="bg-neutral-medium border-neutral-light text-neutral-extralight sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Download: {chapterForDownloadLinks?.name || 'Chapter'}</DialogTitle>
                            <DialogDescription>
                                Choose your preferred download source.
                            </DialogDescription>
                        </DialogHeader>
                        {chapterForDownloadLinks && (chapterForDownloadLinks.telegramLink || chapterForDownloadLinks.discordLink) ? (
                            <div className="space-y-3 py-4">
                                {chapterForDownloadLinks.telegramLink && (
                                    <Button asChild className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                                        <a href={chapterForDownloadLinks.telegramLink} target="_blank" rel="noopener noreferrer">
                                            <TelegramIcon className="mr-2 h-5 w-5"/> Download via Telegram
                                        </a>
                                    </Button>
                                )}
                                {chapterForDownloadLinks.discordLink && (
                                    <Button asChild className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
                                        <a href={chapterForDownloadLinks.discordLink} target="_blank" rel="noopener noreferrer">
                                            <DiscordIcon className="mr-2 h-5 w-5"/> Download via Discord
                                        </a>
                                    </Button>
                                )}
                            </div>
                        ) : (
                             <p className="text-center text-neutral-extralight/70 py-4">No download links available for this chapter.</p>
                        )}
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="mt-2 w-full">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogContent>
                </Dialog>

                <Tooltip>
                    <TooltipTrigger asChild>
                         <div className="flex items-center text-neutral-extralight/80 p-1.5 cursor-default rounded-full" aria-label={`${currentViewCount} views`}>
                            <Eye className="h-5 w-5 mr-1 sm:mr-1.5" />
                            <span className="text-xs sm:text-sm">{currentViewCount}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-neutral-medium text-neutral-extralight border-neutral-light"><p>Views</p></TooltipContent>
                </Tooltip>
              </div>
            </article>
          </div>
        </section>
        
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-neutral-dark">
           {showCommentBox && (
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Leave a Comment</h3>
                 {currentUser ? (
                    <form onSubmit={handlePostComment} className="space-y-3 bg-neutral-medium p-4 rounded-lg shadow-md">
                        <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10 mt-1 shrink-0">
                                <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User"}/>
                                <AvatarFallback className="bg-neutral-light text-brand-primary">
                                    {getInitials(currentUser.displayName)}
                                </AvatarFallback>
                            </Avatar>
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a public comment..."
                                className="bg-neutral-light text-neutral-extralight border-neutral-light focus:ring-brand-primary flex-1"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="ghost" onClick={() => {setNewComment(''); setShowCommentBox(false);}} className="hover:bg-neutral-light">Cancel</Button>
                            <Button type="submit" disabled={isPostingComment || !newComment.trim()} className="bg-brand-primary hover:bg-brand-primary/80 text-white">
                                <Send className="mr-2 h-4 w-4"/> {isPostingComment ? 'Posting...' : 'Comment'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <p className="text-neutral-extralight/70 p-4 bg-neutral-medium rounded-lg shadow-md">
                        <Link href="/login" className="text-brand-primary hover:underline">Log in</Link> to post a comment.
                    </p>
                )}
            </div>
           )}

            <h3 className="text-xl font-semibold text-white mb-4">
                {isLoadingComments ? 'Loading Comments...' : `Comments (${comments.length})`}
            </h3>
            {isLoadingComments && comments.length === 0 ? (
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-3 bg-neutral-medium p-3 rounded-lg shadow">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length > 0 ? (
                <ScrollArea className="max-h-[60vh] pr-3">
                    <div className="space-y-4">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex items-start space-x-3 bg-neutral-medium p-3 rounded-lg shadow">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                                <AvatarImage src={comment.userPhotoURL || undefined} alt={comment.username} />
                                <AvatarFallback className="bg-neutral-light text-brand-primary text-sm">
                                    {getInitials(comment.username)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-baseline space-x-2">
                                    <p className="text-sm font-semibold text-white">{comment.username}</p>
                                    {comment.createdAt?.toDate && (
                                        <p className="text-xs text-neutral-extralight/60">
                                            {formatDistanceToNowStrict(comment.createdAt.toDate(), { addSuffix: true })}
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm text-neutral-extralight/90 whitespace-pre-line mt-1">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            ) : (
                !isLoadingComments && <p className="text-neutral-extralight/70 p-4 bg-neutral-medium rounded-lg text-center shadow-md">No comments yet. Be the first to comment!</p>
            )}
        </section>
        
        {(filteredChapters.length > 0 || chapterSearchTerm || isLoadingChapters) && (
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-neutral-dark">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white font-headline section-title border-l-4 border-brand-primary pl-3">Chapters</h2>
            {isLoadingChapters ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full bg-neutral-medium rounded-lg" />)}
              </div>
            ) : filteredChapters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredChapters.map(chapter => (
                  <Card 
                    key={chapter.id} 
                    className="bg-neutral-medium border-neutral-light hover:shadow-xl transition-shadow duration-300 ease-in-out group"
                  >
                    <CardHeader className="p-4 cursor-pointer hover:bg-neutral-light/30 rounded-t-lg" 
                      onClick={() => openChapterViewer(chapter)}
                      onKeyDown={(e) => e.key === 'Enter' && openChapterViewer(chapter)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Read chapter ${chapter.name}`}
                    >
                      <CardTitle 
                        className="text-lg text-brand-primary font-semibold truncate" 
                        title={chapter.name}
                      >
                        {chapter.name}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : chapterSearchTerm ? (
                 <p className="text-neutral-extralight/70">No chapters found matching your search "{chapterSearchTerm}".</p>
            ) : (
                 <p className="text-neutral-extralight/70">No chapters have been added to this page yet.</p>
            )}
          </section>
        )}
      </main>
    </div>
    </TooltipProvider>
  );
}

    