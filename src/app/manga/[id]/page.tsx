
"use client"; 

import { useEffect, useState } from 'react';
import { useParams, useRouter } 
from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { summarizeReviews, type SummarizeReviewsInput, type SummarizeReviewsOutput } from '@/ai/flows/summarize-reviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, ExternalLink, ThumbsUp, MessageCircle, Send, Eye } from 'lucide-react';
import { db, auth, onAuthStateChanged, type User as FirebaseUser, doc, getDoc, Timestamp, collection, getDocs, query, orderBy, limit, where, setDoc, serverTimestamp, increment, updateDoc, deleteDoc, addDoc } from '@/lib/firebase';
import type { MangaItem as MangaCardItem } from '@/components/manga/manga-grid';
import { MangaGrid } from '@/components/manga/manga-grid';
import { RecordViewHistory } from '@/components/manga/RecordViewHistory';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';

interface MangaDoc {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  dataAiHint?: string;
  chapters: number;
  status: string;
  reviews?: string[]; 
  externalReadLink?: string; 
  genres?: string[]; // Kept for related manga logic, even if not displayed directly
  createdAt: Timestamp;
  updatedAt: Timestamp;
  views?: number; 
  likes?: number; 
}

interface CommentDoc {
  id: string;
  userId: string;
  username: string;
  userPhotoURL?: string | null;
  text: string;
  createdAt: Timestamp;
}

export default function MangaDetailPage() {
  const params = useParams();
  const mangaId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const [manga, setManga] = useState<MangaDoc | null>(null);
  const [relatedManga, setRelatedManga] = useState<MangaCardItem[]>([]);
  const [reviewSummary, setReviewSummary] = useState<SummarizeReviewsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [viewCount, setViewCount] = useState(0);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && mangaId) { // Check for mangaId as well before fetching like status
        checkIfUserLiked(user.uid, mangaId);
      } else {
        setHasLiked(false); // Reset if user logs out or mangaId changes
      }
    });
    return () => unsubscribe();
  }, [mangaId]); // Add mangaId dependency
  
  const checkIfUserLiked = async (userId: string, currentMangaId: string) => {
    const likeRef = doc(db, 'mangas', currentMangaId, 'likes', userId);
    const docSnap = await getDoc(likeRef);
    setHasLiked(docSnap.exists());
  };

  useEffect(() => {
    if (!mangaId) return;

    const fetchMangaData = async () => {
      setIsLoading(true);
      try {
        const mangaRef = doc(db, 'mangas', mangaId);
        const mangaSnap = await getDoc(mangaRef);

        if (mangaSnap.exists()) {
          const mangaData = { id: mangaSnap.id, ...mangaSnap.data() } as MangaDoc;
          setManga(mangaData);
          setViewCount(mangaData.views || 0);
          setLikeCount(mangaData.likes || 0);

          if (currentUser) {
            checkIfUserLiked(currentUser.uid, mangaId);
          }

          if (mangaData.genres && mangaData.genres.length > 0) {
             const primaryGenre = mangaData.genres[0];
             const qRelated = query(
                collection(db, "mangas"),
                where("genres", "array-contains", primaryGenre),
                where("__name__", "!=", mangaId), 
                orderBy("__name__"), 
                limit(6)
            );
            const relatedSnapshot = await getDocs(qRelated);
            const relatedList = relatedSnapshot.docs.map(docSnap => {
                const data = docSnap.data() as MangaDoc;
                return {
                    id: docSnap.id,
                    title: data.title,
                    chapter: `${data.status} - ${data.chapters} Ch.`,
                    imageUrl: data.imageUrl,
                    dataAiHint: data.dataAiHint,
                };
            });
            setRelatedManga(relatedList);
          } else {
            const qFallback = query(collection(db, "mangas"), where("__name__", "!=", mangaId), orderBy("updatedAt", "desc"), limit(6));
            const fallbackSnapshot = await getDocs(qFallback);
            const fallbackList = fallbackSnapshot.docs.map(docSnap => {
                const data = docSnap.data() as MangaDoc;
                return {
                    id: docSnap.id,
                    title: data.title,
                    chapter: `${data.status} - ${data.chapters} Ch.`,
                    imageUrl: data.imageUrl,
                    dataAiHint: data.dataAiHint,
                };
            });
            setRelatedManga(fallbackList);
          }

          const reviewsToSummarize = mangaData.reviews && mangaData.reviews.length > 0 ? mangaData.reviews : ["No user reviews available for this manga yet."];
          try {
            const summary = await summarizeReviews({ reviews: reviewsToSummarize, mangaTitle: mangaData.title });
            setReviewSummary(summary);
          } catch (error) {
            console.error("Failed to summarize reviews:", error);
          }

          const viewedKey = `viewed-manga-${mangaId}`;
          if (typeof window !== 'undefined' && !sessionStorage.getItem(viewedKey)) { 
            await updateDoc(mangaRef, { views: increment(1) });
            setViewCount((prev) => prev + 1);
            sessionStorage.setItem(viewedKey, 'true');
          }

        } else {
          console.log(`No manga found with ID: ${mangaId}`);
          setManga(null);
        }
      } catch (error) {
        console.error("Error fetching manga details: ", error);
        setManga(null);
        toast({ title: "Error", description: "Could not load manga details.", variant: "destructive"});
      }
      setIsLoading(false);
    };

    fetchMangaData();
    fetchComments();
  }, [mangaId, currentUser]); // Re-fetch manga data if currentUser changes (to update like status early)


  const fetchComments = async () => {
    if (!mangaId) return;
    setIsLoadingComments(true);
    try {
      const commentsQuery = query(collection(db, 'mangas', mangaId, 'comments'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(commentsQuery);
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommentDoc));
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({ title: "Error", description: "Could not load comments.", variant: "destructive"});
    }
    setIsLoadingComments(false);
  };

  const handleLike = async () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to like this manga.", variant: "default" });
      router.push('/login');
      return;
    }
    if (isLiking || !mangaId) return;
    setIsLiking(true);

    const likeRef = doc(db, 'mangas', mangaId, 'likes', currentUser.uid);
    const mangaRef = doc(db, 'mangas', mangaId);

    try {
      if (hasLiked) {
        await deleteDoc(likeRef);
        await updateDoc(mangaRef, { likes: increment(-1) });
        setHasLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1)); // Ensure count doesn't go below 0
        toast({ title: "Unliked!" });
      } else {
        await setDoc(likeRef, { userId: currentUser.uid, createdAt: serverTimestamp() });
        await updateDoc(mangaRef, { likes: increment(1) });
        setHasLiked(true);
        setLikeCount(prev => prev + 1);
        toast({ title: "Liked!" });
      }
    } catch (error) {
      console.error("Error liking/unliking manga:", error);
      toast({ title: "Error", description: "Could not update like status.", variant: "destructive" });
    }
    setIsLiking(false);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to comment.", variant: "default" });
      router.push('/login');
      return;
    }
    if (!newComment.trim() || !mangaId) return;
    setIsPostingComment(true);

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const username = userDocSnap.exists() ? userDocSnap.data()?.username : currentUser.displayName || "Anonymous";
      
      const commentData: Omit<CommentDoc, 'id' | 'createdAt'> & { createdAt: any } = { // Type createdAt as any for serverTimestamp
        userId: currentUser.uid,
        username: username,
        userPhotoURL: currentUser.photoURL,
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      };
      const commentsColRef = collection(db, 'mangas', mangaId, 'comments');
      await addDoc(commentsColRef, commentData);
      
      setNewComment('');
      toast({ title: "Comment Posted!" });
      fetchComments(); 
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({ title: "Error", description: "Could not post comment.", variant: "destructive" });
    }
    setIsPostingComment(false);
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "A"; 
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || "A";
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  };


  if (isLoading) {
     return (
      <div className="flex flex-col min-h-screen bg-neutral-dark">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          <Skeleton className="h-10 w-24 mb-6" /> 
          <Card className="bg-neutral-medium border-neutral-light">
            <CardHeader>
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/4 mb-1" />
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <div className="md:col-span-1">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-12 w-full mt-4 rounded-lg" />
              </div>
              <div className="md:col-span-2 space-y-6">
                <div>
                  <Skeleton className="h-7 w-1/3 mb-2" />
                  <Skeleton className="h-5 w-full mb-1" />
                  <Skeleton className="h-5 w-4/5" />
                </div>
                <div>
                  <Skeleton className="h-7 w-1/2 mb-3" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

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

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <RecordViewHistory mangaId={manga.id} />
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
                  priority 
                  onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x600/2D3748/A0AEC0?text=Invalid+URL')}
                />
              </div>
              <div className="flex items-center space-x-2 mt-4">
                  <Button 
                    variant={hasLiked ? "secondary" : "outline"} 
                    onClick={handleLike} 
                    disabled={isLiking}
                    className={cn(
                        "flex-1 group", 
                        hasLiked && "bg-brand-primary/20 text-brand-primary border-brand-primary/50 hover:bg-brand-primary/30 focus-visible:ring-brand-primary",
                        !hasLiked && "hover:bg-neutral-light focus-visible:ring-foreground"
                    )}
                    aria-pressed={hasLiked}
                  >
                      <ThumbsUp className={cn("mr-2 h-5 w-5 group-hover:scale-110 transition-transform", hasLiked && "fill-brand-primary")} /> 
                      {likeCount}
                  </Button>
                  <Button variant="outline" className="flex-1 group hover:bg-neutral-light focus-visible:ring-foreground" onClick={() => document.getElementById('comment-section')?.focus()}>
                      <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> {comments.length}
                  </Button>
                  <div className="flex items-center text-neutral-extralight/80 p-2 rounded-md border border-input bg-background group h-10">
                    <Eye className="mr-2 h-5 w-5 text-neutral-extralight/70 group-hover:text-brand-primary transition-colors" /> {viewCount}
                  </div>
              </div>
              {manga.externalReadLink && (
                <Button asChild size="lg" className="w-full mt-4 bg-brand-primary hover:bg-brand-primary/80 text-white">
                  <Link href={manga.externalReadLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5" /> Read Externally
                  </Link>
                </Button>
              )}
            </div>
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2 font-headline">Description</h2>
                <p className="text-neutral-extralight/90 font-body whitespace-pre-line">{manga.description || "No description available."}</p>
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
                <div id="comment-section" className="pt-4">
                    <h2 className="text-xl font-semibold text-white mb-4 font-headline">Comments ({comments.length})</h2>
                    {currentUser ? (
                        <form onSubmit={handlePostComment} className="mb-6 space-y-3">
                            <div className="flex items-start space-x-3">
                                <Avatar className="h-10 w-10 mt-1">
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
                                    rows={2}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isPostingComment || !newComment.trim()} className="bg-brand-primary hover:bg-brand-primary/80 text-white">
                                    <Send className="mr-2 h-4 w-4"/> {isPostingComment ? 'Posting...' : 'Comment'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <p className="text-neutral-extralight/70 mb-4">
                            <Link href="/login" className="text-brand-primary hover:underline">Log in</Link> to post a comment.
                        </p>
                    )}

                    {isLoadingComments ? (
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex items-start space-x-3 bg-neutral-light p-3 rounded-md">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex items-start space-x-3 bg-neutral-light p-3 rounded-lg shadow">
                                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
                                        <AvatarImage src={comment.userPhotoURL || undefined} alt={comment.username} />
                                        <AvatarFallback className="bg-neutral-medium text-brand-primary text-sm">
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
                    ) : (
                        <p className="text-neutral-extralight/70">No comments yet. Be the first to comment!</p>
                    )}
                </div>
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

