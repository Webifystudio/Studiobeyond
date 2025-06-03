
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List, Trash2, UploadCloud } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db, serverTimestamp } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import Image from 'next/image';

interface SliderItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonHref: string;
  dataAiHint?: string;
  createdAt: Timestamp;
}

const initialItemDetails: Omit<SliderItem, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  imageUrl: '',
  buttonText: 'Read Now',
  buttonHref: '/',
  dataAiHint: '',
};

const IMGBB_API_KEY = "2bb2346a6a907388d8a3b0beac2bca86";

export default function ManageSliderPage() {
  const [itemDetails, setItemDetails] = useState<Omit<SliderItem, 'id' | 'createdAt'>>(initialItemDetails);
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toast } = useToast();

  const fetchSliderItems = async () => {
    setIsLoading(true);
    try {
      const sliderCollection = collection(db, 'sliderItems');
      const q = query(sliderCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const itemsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SliderItem));
      setSliderItems(itemsList);
    } catch (error) {
      console.error("Error fetching slider items: ", error);
      toast({ title: "Error", description: "Could not fetch slider items.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSliderItems();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItemDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImageFile(e.target.files[0]);
    } else {
      setSelectedImageFile(null);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImageFile) {
      toast({ title: "No File Selected", description: "Please select an image file to upload.", variant: "destructive" });
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
        toast({ title: "Image Uploaded", description: "Image successfully uploaded to ImgBB." });
        setSelectedImageFile(null);
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
    if (!itemDetails.title.trim() || !itemDetails.imageUrl.trim()) {
      toast({ title: "Error", description: "Title and Image URL are required.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(db, 'sliderItems'), {
        ...itemDetails,
        dataAiHint: itemDetails.dataAiHint?.trim() || undefined,
        createdAt: serverTimestamp()
      });
      toast({ title: "Slider Item Added", description: `Item "${itemDetails.title}" added successfully.` });
      setItemDetails(initialItemDetails); 
      fetchSliderItems(); 
    } catch (error: any) {
      console.error("Error adding slider item: ", error);
      toast({ title: "Error", description: error.message || "Could not add slider item.", variant: "destructive" });
    }
  };

  const handleDeleteItem = async (itemId: string, title: string) => {
     if (!confirm(`Are you sure you want to delete slider item "${title}"? This action cannot be undone.`)) {
        return;
    }
    try {
        await deleteDoc(doc(db, "sliderItems", itemId));
        toast({ title: "Slider Item Deleted", description: `Item "${title}" deleted successfully.` });
        fetchSliderItems(); 
    } catch (error: any) {
        console.error("Error deleting slider item: ", error);
        toast({ title: "Error", description: error.message || "Could not delete slider item.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white font-headline">Manage Hero Slider</h1>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-brand-primary" /> Add New Slider Item
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Configure items for the homepage hero slider/featured section.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAddItem}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-neutral-extralight">Title</Label>
              <Input id="title" name="title" type="text" value={itemDetails.title} onChange={handleChange} placeholder="Featured Item Title" required className="bg-neutral-light text-neutral-extralight" />
            </div>
            <div>
              <Label htmlFor="description" className="text-neutral-extralight">Description</Label>
              <Textarea id="description" name="description" value={itemDetails.description} onChange={handleChange} placeholder="Short description for the slider item" className="bg-neutral-light text-neutral-extralight" />
            </div>
            <div>
              <Label htmlFor="sliderImageFile" className="text-neutral-extralight">Slider Image (Large Landscape)</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1">
                <Input 
                  id="sliderImageFile" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageFileChange} 
                  className="bg-neutral-light text-neutral-extralight flex-grow file:text-sm file:font-medium file:text-brand-primary file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-brand-primary/20 hover:file:bg-brand-primary/30"
                />
                <Button type="button" onClick={handleImageUpload} disabled={!selectedImageFile || isUploadingImage} className="bg-accent hover:bg-accent/80 text-accent-foreground shrink-0 w-full sm:w-auto">
                  <UploadCloud className="mr-2 h-4 w-4" /> {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                </Button>
              </div>
              {itemDetails.imageUrl && (
                <div className="mt-3">
                  <Label className="text-neutral-extralight text-xs">Current Image URL:</Label>
                  <Input type="text" value={itemDetails.imageUrl} readOnly className="bg-neutral-dark border-neutral-light text-neutral-extralight/70 text-xs h-8 mt-1" />
                  <div className="mt-2 relative w-full aspect-[16/7] max-w-md rounded border border-neutral-light overflow-hidden">
                    <Image src={itemDetails.imageUrl} alt="Slider image preview" layout="fill" objectFit="cover" />
                  </div>
                </div>
              )}
              {!itemDetails.imageUrl && !selectedImageFile && (
                <p className="text-xs text-neutral-extralight/70 mt-1">
                  Select an image file (e.g., 1200x500px) and click "Upload Image".
                </p>
              )}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="buttonText" className="text-neutral-extralight">Button Text</Label>
                    <Input id="buttonText" name="buttonText" type="text" value={itemDetails.buttonText} onChange={handleChange} placeholder="e.g., Read Now, View Details" className="bg-neutral-light text-neutral-extralight" />
                </div>
                <div>
                    <Label htmlFor="buttonHref" className="text-neutral-extralight">Button Link (URL/Path)</Label>
                    <Input id="buttonHref" name="buttonHref" type="text" value={itemDetails.buttonHref} onChange={handleChange} placeholder="/manga/some-id or https://example.com" className="bg-neutral-light text-neutral-extralight" />
                </div>
            </div>
            <div>
              <Label htmlFor="dataAiHint" className="text-neutral-extralight">AI Image Hint (Optional)</Label>
              <Input id="dataAiHint" name="dataAiHint" type="text" value={itemDetails.dataAiHint} onChange={handleChange} placeholder="e.g., epic battle anime" className="bg-neutral-light text-neutral-extralight" />
            </div>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white w-full sm:w-auto">
              Add Slider Item
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-brand-primary" /> Current Slider Items
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            List of items for the hero slider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-neutral-extralight/70">Loading slider items...</p>
          ) : sliderItems.length === 0 ? (
            <p className="text-neutral-extralight/70">No slider items added yet.</p>
          ) : (
            <div className="space-y-3">
              {sliderItems.map((item) => (
                <Card key={item.id} className="bg-neutral-light p-3 shadow">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="relative w-full sm:w-32 md:w-40 h-20 sm:h-auto rounded overflow-hidden shrink-0 aspect-[16/9] sm:aspect-auto">
                        <Image 
                            src={item.imageUrl || 'https://placehold.co/150x80.png'} 
                            alt={item.title} 
                            layout="fill" 
                            objectFit="cover"
                            data-ai-hint={item.dataAiHint || "slider image"}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate" title={item.title}>{item.title}</h3>
                        <p className="text-xs text-neutral-extralight/80 truncate" title={item.description}>{item.description}</p>
                        <p className="text-xs text-neutral-extralight/70">Button: "{item.buttonText}" to {item.buttonHref}</p>
                        {item.dataAiHint && <p className="text-xs text-neutral-extralight/60 truncate">AI Hint: {item.dataAiHint}</p>}
                    </div>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-300 hover:bg-neutral-medium/50 self-end sm:self-center shrink-0"
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

    