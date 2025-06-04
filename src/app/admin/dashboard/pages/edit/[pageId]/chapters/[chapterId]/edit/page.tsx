
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, Trash2, UploadCloud, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db, serverTimestamp, doc, getDoc, updateDoc, arrayUnion, arrayRemove, type Timestamp } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';

interface ChapterData {
  name: string;
  imageUrls: string[];
  telegramLink?: string; // New
  discordLink?: string;  // New
  createdAt: Timestamp;
}

const IMGBB_API_KEY = "2bb2346a6a907388d8a3b0beac2bca86";

export default function EditChapterImagesPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.pageId as string;
  const chapterId = params.chapterId as string;

  const [chapterDetails, setChapterDetails] = useState<ChapterData | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [telegramUrl, setTelegramUrl] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingLinks, setIsSavingLinks] = useState(false);
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
        setTelegramUrl(data.telegramLink || '');
        setDiscordUrl(data.discordLink || '');
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImageFile(e.target.files[0]);
    } else {
      setSelectedImageFile(null);
    }
  };

  const handleImageUploadAndAdd = async () => {
    if (!selectedImageFile || !chapterDetails) {
      toast({ title: "No File Selected", description: "Please select an image file to upload.", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', selectedImageFile);
    formData.append('key', IMGBB_API_KEY);

    let imgbbUrl = '';
    try {
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        imgbbUrl = result.data.display_url;
        toast({ title: "Image Uploaded to ImgBB", description: "Image successfully uploaded. Adding to chapter..." });
      } else {
        throw new Error(result.error?.message || 'ImgBB upload failed');
      }
    } catch (error: any) {
      console.error("Error uploading image to ImgBB: ", error);
      toast({ title: "Upload Error", description: error.message || "Could not upload image.", variant: "destructive" });
      setIsUploading(false);
      return;
    }

    try {
      const chapterRef = doc(db, 'customPages', pageId, 'chapters', chapterId);
      await updateDoc(chapterRef, {
        imageUrls: arrayUnion(imgbbUrl)
      });
      toast({ title: "Image Added", description: "Image added to chapter successfully." });
      setSelectedImageFile(null); 
      const fileInput = document.getElementById('chapterImageFile') as HTMLInputElement;
      if(fileInput) fileInput.value = ''; 
      fetchChapterData(); 
    } catch (error: any) {
      console.error("Error adding image URL to chapter: ", error);
      toast({ title: "Error", description: error.message || "Could not add image to chapter.", variant: "destructive" });
    }
    setIsUploading(false);
  };


  const handleRemoveImage = async (imageUrlToRemove: string) => {
    if (!chapterDetails || !confirm("Are you sure you want to remove this image?")) return;
    // Re-use isSavingLinks or use a dedicated state for image removal if operations can overlap
    setIsSavingLinks(true); 
    try {
      const chapterRef = doc(db, 'customPages', pageId, 'chapters', chapterId);
      await updateDoc(chapterRef, {
        imageUrls: arrayRemove(imageUrlToRemove)
      });
      toast({ title: "Image Removed", description: "Image removed from chapter successfully." });
      fetchChapterData(); 
    } catch (error: any) {
      console.error("Error removing image from chapter: ", error);
      toast({ title: "Error", description: error.message || "Could not remove image.", variant: "destructive" });
    }
    setIsSavingLinks(false);
  };

  const handleSaveDownloadLinks = async (e: FormEvent) => {
    e.preventDefault();
    if (!chapterDetails) return;
    setIsSavingLinks(true);
    try {
      const chapterRef = doc(db, 'customPages', pageId, 'chapters', chapterId);
      await updateDoc(chapterRef, {
        telegramLink: telegramUrl.trim() || null,
        discordLink: discordUrl.trim() || null,
      });
      toast({ title: "Download Links Saved", description: "Download links updated successfully." });
      fetchChapterData();
    } catch (error: any) {
      console.error("Error saving download links: ", error);
      toast({ title: "Error", description: error.message || "Could not save download links.", variant: "destructive" });
    }
    setIsSavingLinks(false);
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
          <CardTitle className="text-lg md:text-xl text-white font-headline">Chapter Download Links</CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Provide optional direct download links for this chapter (e.g., Telegram, Discord).
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveDownloadLinks}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="telegramUrl" className="text-neutral-extralight">Telegram Link (Optional)</Label>
              <Input
                id="telegramUrl"
                type="url"
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
                placeholder="https://t.me/yourchannel/message_id"
                className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
              />
            </div>
            <div>
              <Label htmlFor="discordUrl" className="text-neutral-extralight">Discord Link (Optional)</Label>
              <Input
                id="discordUrl"
                type="url"
                value={discordUrl}
                onChange={(e) => setDiscordUrl(e.target.value)}
                placeholder="https://discord.com/channels/server_id/channel_id/message_id"
                className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
              />
            </div>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white" disabled={isSavingLinks}>
              <Save className="mr-2 h-4 w-4" /> {isSavingLinks ? 'Saving Links...' : 'Save Download Links'}
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
            Select an image file to upload to ImgBB and add to this chapter. Images appear in added order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
              <Label htmlFor="chapterImageFile" className="text-neutral-extralight">Image File</Label>
              <Input
                id="chapterImageFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary file:text-sm file:font-medium file:text-brand-primary file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-brand-primary/20 hover:file:bg-brand-primary/30"
              />
            </div>
            <Button 
              type="button" 
              onClick={handleImageUploadAndAdd} 
              className="bg-brand-primary hover:bg-brand-primary/80 text-white" 
              disabled={!selectedImageFile || isUploading}
            >
              <UploadCloud className="mr-2 h-4 w-4" /> {isUploading ? 'Uploading & Adding...' : 'Upload & Add Image'}
            </Button>
             {selectedImageFile && (
                <p className="text-xs text-neutral-extralight/70">Selected: {selectedImageFile.name}</p>
             )}
        </CardContent>
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
                       onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; 
                          target.src='https://placehold.co/300x450/2D3748/A0AEC0?text=Error+Loading';
                       }}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 hover:bg-red-500/90"
                    onClick={() => handleRemoveImage(url)}
                    aria-label="Remove image"
                    disabled={isSavingLinks || isUploading} 
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
