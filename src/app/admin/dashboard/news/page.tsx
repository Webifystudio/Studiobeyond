
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List, Trash2, UploadCloud, Newspaper } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db, serverTimestamp, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from '@/lib/firebase';
import Image from 'next/image';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText?: string;
  buttonHref?: string;
  dataAiHint?: string; // Optional for image generation hints
  createdAt: Timestamp;
}

const initialItemDetails: Omit<NewsItem, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  imageUrl: '',
  buttonText: '',
  buttonHref: '',
  dataAiHint: '',
};

const IMGBB_API_KEY = "2bb2346a6a907388d8a3b0beac2bca86"; // Replace with your actual ImgBB API key if you have one

export default function ManageNewsPage() {
  const [itemDetails, setItemDetails] = useState<Omit<NewsItem, 'id' | 'createdAt'>>(initialItemDetails);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchNewsItems = async () => {
    setIsLoading(true);
    try {
      const newsCollection = collection(db, 'newsItems');
      const q = query(newsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const itemsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NewsItem));
      setNewsItems(itemsList);
    } catch (error) {
      console.error("Error fetching news items: ", error);
      toast({ title: "Error", description: "Could not fetch news items.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNewsItems();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItemDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImageFile(e.target.files[0]);
      // Clear existing imageUrl if a new file is selected, to force re-upload
      setItemDetails(prev => ({ ...prev, imageUrl: '' }));
    } else {
      setSelectedImageFile(null);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImageFile) {
      toast({ title: "No File Selected", description: "Please select an image file to upload.", variant: "default" });
      return;
    }
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', selectedImageFile);
    formData.append('key', IMGBB_API_KEY);

    try {
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setItemDetails(prev => ({ ...prev, imageUrl: result.data.display_url }));
        toast({ title: "Image Uploaded", description: "Image successfully uploaded. URL populated." });
        setSelectedImageFile(null); // Clear file input after successful upload
        // Clear the file input visually
        const fileInput = document.getElementById('newsImageFile') as HTMLInputElement | null;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(result.error?.message || 'ImgBB upload failed');
      }
    } catch (error: any) {
      console.error("Error uploading image to ImgBB: ", error);
      toast({ title: "Upload Error", description: error.message || "Could not upload image.", variant: "destructive" });
    }
    setIsUploadingImage(false);
  };

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!itemDetails.title.trim() || !itemDetails.imageUrl.trim() || !itemDetails.description.trim()) {
      toast({ title: "Validation Error", description: "Title, Image URL, and Description are required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Explicitly define the structure for Firestore, only including optional fields if they have content
      const dataToSave: {
        title: string;
        description: string;
        imageUrl: string;
        buttonText?: string;
        buttonHref?: string;
        dataAiHint?: string;
        createdAt: any; // For serverTimestamp
      } = {
        title: itemDetails.title.trim(),
        description: itemDetails.description.trim(),
        imageUrl: itemDetails.imageUrl.trim(),
        createdAt: serverTimestamp(),
      };

      const trimmedButtonText = itemDetails.buttonText?.trim();
      if (trimmedButtonText) {
        dataToSave.buttonText = trimmedButtonText;
      }

      const trimmedButtonHref = itemDetails.buttonHref?.trim();
      if (trimmedButtonHref) {
        dataToSave.buttonHref = trimmedButtonHref;
      }

      const trimmedDataAiHint = itemDetails.dataAiHint?.trim();
      if (trimmedDataAiHint) {
        dataToSave.dataAiHint = trimmedDataAiHint;
      }

      await addDoc(collection(db, 'newsItems'), dataToSave);
      toast({ title: "News Item Added", description: `"${itemDetails.title}" added successfully.` });
      setItemDetails(initialItemDetails);
      setSelectedImageFile(null);
      const fileInput = document.getElementById('newsImageFile') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      fetchNewsItems();
    } catch (error: any) {
      console.error("Error adding news item: ", error);
      toast({ title: "Error", description: error.message || "Could not add news item.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleDeleteItem = async (itemId: string, title: string) => {
     if (!confirm(`Are you sure you want to delete news item "${title}"? This action cannot be undone.`)) {
        return;
    }
    try {
        await deleteDoc(doc(db, "newsItems", itemId));
        toast({ title: "News Item Deleted", description: `Item "${title}" deleted successfully.` });
        fetchNewsItems();
    } catch (error: any) {
        console.error("Error deleting news item: ", error);
        toast({ title: "Error", description: error.message || "Could not delete news item.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white font-headline flex items-center">
        <Newspaper className="mr-3 h-7 w-7 text-brand-primary" /> Manage News & Updates
      </h1>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-brand-primary" /> Add New News Item
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Create a new news post or update for the public site.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAddItem}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-neutral-extralight">Title</Label>
              <Input id="title" name="title" type="text" value={itemDetails.title} onChange={handleChange} placeholder="News Item Title" required className="bg-neutral-light text-neutral-extralight" />
            </div>
            
            <div>
              <Label htmlFor="newsImageFile" className="text-neutral-extralight">News Image (Recommended: Landscape)</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                <Input 
                  id="newsImageFile" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageFileChange} 
                  className="bg-neutral-light text-neutral-extralight flex-grow file:text-sm file:font-medium file:text-brand-primary file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-brand-primary/20 hover:file:bg-brand-primary/30"
                />
                <Button type="button" onClick={handleImageUpload} disabled={!selectedImageFile || isUploadingImage || isSubmitting} className="bg-accent hover:bg-accent/80 text-accent-foreground shrink-0 w-full sm:w-auto">
                  <UploadCloud className="mr-2 h-4 w-4" /> {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                </Button>
              </div>
              {itemDetails.imageUrl && (
                <div className="mt-3">
                  <Label className="text-neutral-extralight text-xs">Current Image URL:</Label>
                  <Input type="text" value={itemDetails.imageUrl} readOnly className="bg-neutral-dark border-neutral-light text-neutral-extralight/70 text-xs h-8 mt-1" />
                  <div className="mt-2 relative w-full aspect-[16/9] max-w-md rounded border border-neutral-light overflow-hidden">
                    <Image src={itemDetails.imageUrl} alt="News image preview" layout="fill" objectFit="cover" />
                  </div>
                </div>
              )}
               {!itemDetails.imageUrl && !selectedImageFile && (
                 <p className="text-xs text-neutral-extralight/70 mt-1">
                    Upload an image or ensure Image URL field above is populated if pasting directly.
                 </p>
              )}
               <Label htmlFor="imageUrl" className="text-neutral-extralight mt-3 block">Or Paste Image URL Directly</Label>
              <Input id="imageUrl" name="imageUrl" type="url" value={itemDetails.imageUrl} onChange={handleChange} placeholder="https://example.com/news-image.jpg" className="bg-neutral-light text-neutral-extralight" />
            </div>

            <div>
              <Label htmlFor="description" className="text-neutral-extralight">Description</Label>
              <Textarea id="description" name="description" value={itemDetails.description} onChange={handleChange} placeholder="Detailed content of the news item..." required className="bg-neutral-light text-neutral-extralight min-h-[150px]" />
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="buttonText" className="text-neutral-extralight">Button Text (Optional)</Label>
                    <Input id="buttonText" name="buttonText" type="text" value={itemDetails.buttonText || ''} onChange={handleChange} placeholder="e.g., Read More, View Details" className="bg-neutral-light text-neutral-extralight" />
                </div>
                <div>
                    <Label htmlFor="buttonHref" className="text-neutral-extralight">Button Link (URL/Path - Optional)</Label>
                    <Input id="buttonHref" name="buttonHref" type="text" value={itemDetails.buttonHref || ''} onChange={handleChange} placeholder="/some-page or https://external.com" className="bg-neutral-light text-neutral-extralight" />
                </div>
            </div>
            <div>
              <Label htmlFor="dataAiHint" className="text-neutral-extralight">AI Image Hint (Optional)</Label>
              <Input id="dataAiHint" name="dataAiHint" type="text" value={itemDetails.dataAiHint || ''} onChange={handleChange} placeholder="e.g., announcement banner update" className="bg-neutral-light text-neutral-extralight" />
            </div>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white w-full sm:w-auto" disabled={isSubmitting || isUploadingImage}>
              {isSubmitting ? 'Adding Item...' : 'Add News Item'}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-brand-primary" /> Current News Items
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            List of published news items, newest first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-neutral-extralight/70">Loading news items...</p>
          ) : newsItems.length === 0 ? (
            <p className="text-neutral-extralight/70">No news items added yet.</p>
          ) : (
            <div className="space-y-4">
              {newsItems.map((item) => (
                <Card key={item.id} className="bg-neutral-light p-4 shadow">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full md:w-48 h-32 md:h-auto rounded overflow-hidden shrink-0 aspect-video md:aspect-auto">
                        <Image 
                            src={item.imageUrl || 'https://placehold.co/300x160.png'} 
                            alt={item.title} 
                            layout="fill" 
                            objectFit="cover"
                            data-ai-hint={item.dataAiHint || "news update image"}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate" title={item.title}>{item.title}</h3>
                        <p className="text-sm text-neutral-extralight/80 line-clamp-2" title={item.description}>{item.description}</p>
                        {item.buttonText && item.buttonHref && (
                            <p className="text-xs text-neutral-extralight/70 mt-1">Button: "{item.buttonText}" links to {item.buttonHref}</p>
                        )}
                        <p className="text-xs text-neutral-extralight/60 mt-1">
                            Published: {item.createdAt?.toDate().toLocaleDateString()}
                        </p>
                    </div>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-300 hover:bg-neutral-medium/50 self-start md:self-center shrink-0"
                        onClick={() => handleDeleteItem(item.id, item.title)}
                        aria-label={`Delete ${item.title}`}
                     >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
