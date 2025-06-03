
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db, serverTimestamp, doc, getDoc, updateDoc, arrayUnion, arrayRemove, type Timestamp } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';

interface ChapterData {
  name: string;
  imageUrls: string[];
  downloadLink?: string;
  createdAt: Timestamp;
}

export default function EditChapterImagesPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.pageId as string;
  const chapterId = params.chapterId as string;

  const [chapterDetails, setChapterDetails] = useState<ChapterData | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchChapterData = async () => {
    if (!pageId || !chapterId) return;
    setIsLoading(true);
    try {
      const chapterRef = doc(db, 'customPages', pageId, 'chapters', chapterId);
      const docSnap = await getDoc(chapterRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as ChapterData;
        setChapterDetails(data);
        setDownloadUrl(data.downloadLink || '');
      } else {
        toast({ title: "Error", description: "Chapter not found.", variant: "destructive" });
        router.push(`/admin/dashboard/pages/edit/${pageId}`);
      }
    } catch (error) {
      console.error("Error fetching chapter data: ", error);
      toast({ title: "Error", description: "Could not fetch chapter data.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchChapterData();
  }, [pageId, chapterId]);

  const handleAddImage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim() || !chapterDetails) {
      toast({ title: "Error", description: "Image URL cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const chapterRef = doc(db, 'customPages', pageId, 'chapters', chapterId);
      await updateDoc(chapterRef, {
        imageUrls: arrayUnion(newImageUrl.trim())
      });
      toast({ title: "Image Added", description: "Image added to chapter successfully." });
      setNewImageUrl('');
      fetchChapterData(); 
    } catch (error) {
      console.error("Error adding image to chapter: ", error);
      toast({ title: "Error", description: "Could not add image.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleRemoveImage = async (imageUrlToRemove: string) => {
    if (!chapterDetails || !confirm("Are you sure you want to remove this image?")) return;
    setIsSaving(true);
    try {
      const chapterRef = doc(db, 'customPages', pageId, 'chapters', chapterId);
      await updateDoc(chapterRef, {
        imageUrls: arrayRemove(imageUrlToRemove)
      });
      toast({ title: "Image Removed", description: "Image removed from chapter successfully." });
      fetchChapterData(); 
    } catch (error) {
      console.error("Error removing image from chapter: ", error);
      toast({ title: "Error", description: "Could not remove image.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleSaveDownloadLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!chapterDetails) return;
    setIsSaving(true);
    try {
      const chapterRef = doc(db, 'customPages', pageId, 'chapters', chapterId);
      await updateDoc(chapterRef, {
        downloadLink: downloadUrl.trim() || null // Store null if empty
      });
      toast({ title: "Download Link Saved", description: "Download link updated successfully." });
      fetchChapterData();
    } catch (error) {
      console.error("Error saving download link: ", error);
      toast({ title: "Error", description: "Could not save download link.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  if (isLoading || !chapterDetails) {
    return <div className="text-center text-neutral-extralight p-10">Loading chapter details...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-headline">
          Manage Chapter: <span className="text-brand-primary">{chapterDetails.name}</span>
        </h1>
        <Button variant="outline" asChild>
          <Link href={`/admin/dashboard/pages/edit/${pageId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Page Config
          </Link>
        </Button>
      </div>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline">Chapter Download Link</CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Provide an optional direct download link for this chapter.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveDownloadLink}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="downloadUrl" className="text-neutral-extralight">Download URL (Optional)</Label>
              <Input
                id="downloadUrl"
                type="url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://example.com/download/chapter.zip"
                className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
              />
            </div>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white" disabled={isSaving}>
              {isSaving ? 'Saving Link...' : 'Save Download Link'}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-brand-primary" /> Add New Image
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Add image URLs one by one. Images will appear in the order they are added.
            Upload images to <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">ImgBB</a> or similar, then paste the direct image URL.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAddImage}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newImageUrl" className="text-neutral-extralight">Image URL</Label>
              <Input
                id="newImageUrl"
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://i.ibb.co/your-image.jpg"
                required
                className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
              />
            </div>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white" disabled={isSaving}>
              {isSaving ? 'Adding Image...' : 'Add Image to Chapter'}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline">Chapter Images</CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Current images for this chapter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chapterDetails.imageUrls && chapterDetails.imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {chapterDetails.imageUrls.map((url, index) => (
                <div key={index} className="relative group bg-neutral-light p-2 rounded-md shadow">
                  <div className="aspect-w-9 aspect-h-16"> 
                    <Image
                      src={url}
                      alt={`Chapter image ${index + 1}`}
                      layout="fill"
                      objectFit="contain"
                      className="rounded"
                      data-ai-hint="manga page scan"
                       onError={(e) => (e.currentTarget.src = 'https://placehold.co/300x450/2D3748/A0AEC0?text=Error')}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 hover:bg-red-500/90"
                    onClick={() => handleRemoveImage(url)}
                    aria-label="Remove image"
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <p className="text-xs text-center text-neutral-extralight/70 mt-1">Page {index + 1}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-extralight/70">No images added to this chapter yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    