
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List, Trash2 } from 'lucide-react';
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

export default function ManageSliderPage() {
  const [itemDetails, setItemDetails] = useState<Omit<SliderItem, 'id' | 'createdAt'>>(initialItemDetails);
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    } catch (error) {
      console.error("Error adding slider item: ", error);
      toast({ title: "Error", description: "Could not add slider item.", variant: "destructive" });
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
    } catch (error) {
        console.error("Error deleting slider item: ", error);
        toast({ title: "Error", description: "Could not delete slider item.", variant: "destructive" });
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
              <Label htmlFor="imageUrl" className="text-neutral-extralight">Image URL (Large Landscape)</Label>
              <Input id="imageUrl" name="imageUrl" type="url" value={itemDetails.imageUrl} onChange={handleChange} placeholder="https://placehold.co/1200x500.png" required className="bg-neutral-light text-neutral-extralight" />
              <p className="text-xs text-neutral-extralight/70 mt-1">
                Upload your image to a service like <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">ImgBB</a> and paste the direct image URL here.
              </p>
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
                    <div className="flex-1 min-w-0"> {/* Added min-w-0 for better truncation */}
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
