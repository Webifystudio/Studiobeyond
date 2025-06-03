
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft, ExternalLink, PlusCircle, Trash2, Edit3, ImageIcon, UploadCloud } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db, serverTimestamp } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp, addDoc, collection, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';

interface CustomPageData {
  pageName: string;
  pageSlug: string;
  title: string;
  description: string;
  author: string;
  category: string;
  landingImageUrl: string;
  dataAiHint: string;
  views: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface ChapterData {
  id: string;
  name: string;
  createdAt: Timestamp;
  imageUrls?: string[];
}

const initialPageDetails: CustomPageData = {
  pageName: '',
  pageSlug: '',
  title: '',
  description: '',
  author: '',
  category: '',
  landingImageUrl: '',
  dataAiHint: '',
  views: 0,
};

const IMGBB_API_KEY = "2bb2346a6a907388d8a3b0beac2bca86";

export default function EditCustomPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.pageId as string;

  const [pageDetails, setPageDetails] = useState<CustomPageData>(initialPageDetails);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [newChapterName, setNewChapterName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [selectedLandingImageFile, setSelectedLandingImageFile] = useState<File | null>(null);
  const [isUploadingLandingImage, setIsUploadingLandingImage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (pageId) {
      const fetchPageData = async () => {
        setIsLoading(true);
        try {
          const pageRef = doc(db, 'customPages', pageId);
          const docSnap = await getDoc(pageRef);
          if (docSnap.exists()) {
            setPageDetails(docSnap.data() as CustomPageData);
          } else {
            toast({ title: "Error", description: "Page not found.", variant: "destructive" });
            router.push('/admin/dashboard/pages');
          }
        } catch (error) {
          console.error("Error fetching page data: ", error);
          toast({ title: "Error", description: "Could not fetch page data.", variant: "destructive" });
        }
        setIsLoading(false);
      };
      fetchPageData();
      fetchChapters();
    }
  }, [pageId, toast, router]);

  const fetchChapters = async () => {
    if (!pageId) return;
    setIsLoadingChapters(true);
    try {
      const chaptersRef = collection(db, 'customPages', pageId, 'chapters');
      const q = query(chaptersRef, orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);
      const fetchedChapters = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChapterData));
      setChapters(fetchedChapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      toast({ title: "Error", description: "Could not fetch chapters.", variant: "destructive" });
    }
    setIsLoadingChapters(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPageDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleLandingImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedLandingImageFile(e.target.files[0]);
    } else {
      setSelectedLandingImageFile(null);
    }
  };

  const handleLandingImageUpload = async () => {
    if (!selectedLandingImageFile) {
      toast({ title: "No File Selected", description: "Please select a landing image file.", variant: "destructive" });
      return;
    }
    setIsUploadingLandingImage(true);
    const formData = new FormData();
    formData.append('image', selectedLandingImageFile);
    formData.append('key', IMGBB_API_KEY);

    try {
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setPageDetails(prev => ({ ...prev, landingImageUrl: result.data.display_url }));
        toast({ title: "Landing Image Uploaded", description: "Image successfully uploaded." });
        setSelectedLandingImageFile(null);
      } else {
        throw new Error(result.error?.message || 'ImgBB upload failed');
      }
    } catch (error: any) {
      console.error("Error uploading landing image: ", error);
      toast({ title: "Upload Error", description: error.message || "Could not upload landing image.", variant: "destructive" });
    }
    setIsUploadingLandingImage(false);
  };

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const pageRef = doc(db, 'customPages', pageId);
      await updateDoc(pageRef, {
        ...pageDetails,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Page Updated", description: `Page "${pageDetails.title}" updated successfully.` });
    } catch (error: any) {
      console.error("Error updating page: ", error);
      toast({ title: "Error", description: error.message || "Could not update page.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleAddChapter = async (e: FormEvent) => {
    e.preventDefault();
    if (!newChapterName.trim()) {
      toast({ title: "Error", description: "Chapter name cannot be empty.", variant: "destructive" });
      return;
    }
    try {
      const chaptersRef = collection(db, 'customPages', pageId, 'chapters');
      await addDoc(chaptersRef, {
        name: newChapterName.trim(),
        imageUrls: [],
        createdAt: serverTimestamp(),
      });
      toast({ title: "Chapter Added", description: `Chapter "${newChapterName}" added.` });
      setNewChapterName('');
      fetchChapters();
    } catch (error: any) {
      console.error("Error adding chapter:", error);
      toast({ title: "Error", description: error.message || "Could not add chapter.", variant: "destructive" });
    }
  };

  const handleDeleteChapter = async (chapterId: string, chapterName: string) => {
    if (!confirm(`Are you sure you want to delete chapter "${chapterName}"? This will also delete all its images.`)) return;
    try {
      const chapterRef = doc(db, 'customPages', pageId, 'chapters', chapterId);
      await deleteDoc(chapterRef);
      toast({ title: "Chapter Deleted", description: `Chapter "${chapterName}" deleted.` });
      fetchChapters();
    } catch (error: any) {
      console.error("Error deleting chapter:", error);
      toast({ title: "Error", description: error.message || "Could not delete chapter.", variant: "destructive" });
    }
  };
  
  if (isLoading) {
    return <div className="text-center text-neutral-extralight p-10">Loading page details...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-headline flex items-center">
           Configure Page: <span className="text-brand-primary ml-2 truncate max-w-xs sm:max-w-md">{pageDetails.pageName}</span>
        </h1>
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href="/admin/dashboard/pages">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pages
                </Link>
            </Button>
             <Button variant="outline" asChild>
                <Link href={`/p/${pageDetails.pageSlug}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" /> View Public Page
                </Link>
            </Button>
        </div>
      </div>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline">Page Settings</CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Modify the content and appearance of this custom page.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveChanges}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-neutral-extralight">Page Title</Label>
              <Input id="title" name="title" type="text" value={pageDetails.title} onChange={handleChange} placeholder="Title displayed on the page" required className="bg-neutral-light text-neutral-extralight" />
            </div>
            <div>
              <Label htmlFor="description" className="text-neutral-extralight">Description</Label>
              <Textarea id="description" name="description" value={pageDetails.description} onChange={handleChange} placeholder="Page content or summary" className="bg-neutral-light text-neutral-extralight min-h-[120px]" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="author" className="text-neutral-extralight">Author (Optional)</Label>
                    <Input id="author" name="author" type="text" value={pageDetails.author} onChange={handleChange} placeholder="e.g., John Doe" className="bg-neutral-light text-neutral-extralight" />
                </div>
                <div>
                    <Label htmlFor="category" className="text-neutral-extralight">Category (Optional)</Label>
                    <Input id="category" name="category" type="text" value={pageDetails.category} onChange={handleChange} placeholder="e.g., Featured, Announcement" className="bg-neutral-light text-neutral-extralight" />
                </div>
            </div>
            <div>
              <Label htmlFor="landingImageFile" className="text-neutral-extralight">Landing Image</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                <Input 
                  id="landingImageFile" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLandingImageFileChange} 
                  className="bg-neutral-light text-neutral-extralight flex-grow file:text-sm file:font-medium file:text-brand-primary file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-brand-primary/20 hover:file:bg-brand-primary/30"
                />
                <Button type="button" onClick={handleLandingImageUpload} disabled={!selectedLandingImageFile || isUploadingLandingImage} className="bg-accent hover:bg-accent/80 text-accent-foreground shrink-0 w-full sm:w-auto">
                  <UploadCloud className="mr-2 h-4 w-4" /> {isUploadingLandingImage ? 'Uploading...' : 'Upload Landing Image'}
                </Button>
              </div>
              {pageDetails.landingImageUrl && (
                <div className="mt-3">
                  <Label className="text-neutral-extralight text-xs">Current Landing Image URL:</Label>
                  <Input type="text" value={pageDetails.landingImageUrl} readOnly className="bg-neutral-dark border-neutral-light text-neutral-extralight/70 text-xs h-8 mt-1" />
                   <div className="mt-2 relative w-full aspect-[16/9] max-w-md rounded border border-neutral-light overflow-hidden">
                    <Image src={pageDetails.landingImageUrl} alt="Landing image preview" layout="fill" objectFit="cover" />
                  </div>
                </div>
              )}
               {!pageDetails.landingImageUrl && !selectedLandingImageFile && (
                 <p className="text-xs text-neutral-extralight/70 mt-1">
                    Select an image file (e.g., 1200x600px) and click "Upload Landing Image".
                 </p>
              )}
            </div>
            <div>
              <Label htmlFor="dataAiHint" className="text-neutral-extralight">AI Image Hint (Optional)</Label>
              <Input id="dataAiHint" name="dataAiHint" type="text" value={pageDetails.dataAiHint} onChange={handleChange} placeholder="e.g., epic battle scene anime" className="bg-neutral-light text-neutral-extralight" />
            </div>
            
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white w-full sm:w-auto" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving Page Settings...' : 'Save Page Settings'}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-brand-primary" /> Manage Chapters
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Add or edit chapters for this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAddChapter} className="space-y-4">
            <div>
              <Label htmlFor="newChapterName" className="text-neutral-extralight">New Chapter Name</Label>
              <Input
                id="newChapterName"
                type="text"
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                placeholder="e.g., Chapter 1: The Beginning"
                className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
              />
            </div>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Chapter
            </Button>
          </form>

          <div>
            <h3 className="text-md font-semibold text-white mb-2 font-headline">Existing Chapters</h3>
            {isLoadingChapters ? (
              <p className="text-neutral-extralight/70">Loading chapters...</p>
            ) : chapters.length === 0 ? (
              <p className="text-neutral-extralight/70">No chapters added yet for this page.</p>
            ) : (
              <ul className="space-y-2">
                {chapters.map((chapter) => (
                  <li key={chapter.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-neutral-light rounded-md shadow gap-2">
                    <span className="text-neutral-extralight flex-grow">{chapter.name}</span>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button variant="outline" size="sm" asChild className="text-xs">
                        <Link href={`/admin/dashboard/pages/edit/${pageId}/chapters/${chapter.id}/edit`}>
                          <ImageIcon className="mr-1 h-3 w-3" /> Manage Images
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-300 hover:bg-neutral-medium/50"
                        onClick={() => handleDeleteChapter(chapter.id, chapter.name)}
                        aria-label={`Delete ${chapter.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    