
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SliderItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonHref: string;
  dataAiHint?: string;
}

export default function ManageSliderPage() {
  const [itemDetails, setItemDetails] = useState<Omit<SliderItem, 'id'>>({
    title: '',
    description: '',
    imageUrl: '',
    buttonText: 'Read Now',
    buttonHref: '/',
    dataAiHint: '',
  });
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([]); // This will come from Firestore
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItemDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDetails.title.trim() || !itemDetails.imageUrl.trim()) {
      toast({ title: "Error", description: "Title and Image URL are required.", variant: "destructive" });
      return;
    }
    const newItem: SliderItem = { id: Date.now().toString(), ...itemDetails };
    setSliderItems([...sliderItems, newItem]);
    toast({ title: "Slider Item Added (UI Only)", description: `Item "${newItem.title}" added. Data not saved.` });
    setItemDetails({ title: '', description: '', imageUrl: '', buttonText: 'Read Now', buttonHref: '/', dataAiHint: '' }); // Reset form
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white font-headline">Manage Hero Slider</h1>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-xl text-white font-headline flex items-center">
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
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white">
              Add Slider Item
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-xl text-white font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-brand-primary" /> Current Slider Items
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            List of items for the hero slider. (Data persistence not yet implemented)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sliderItems.length === 0 ? (
            <p className="text-neutral-extralight/70">No slider items added yet.</p>
          ) : (
            <div className="space-y-3">
              {sliderItems.map((item) => (
                <Card key={item.id} className="bg-neutral-light p-3">
                  <div className="flex gap-3">
                    <img src={item.imageUrl || 'https://placehold.co/150x80.png'} alt={item.title} className="w-32 h-auto object-cover rounded"/>
                    <div className="flex-1">
                        <h3 className="font-semibold text-white">{item.title}</h3>
                        <p className="text-xs text-neutral-extralight/80 truncate">{item.description}</p>
                        <p className="text-xs text-neutral-extralight/70">Button: "{item.buttonText}" to {item.buttonHref}</p>
                    </div>
                     <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 self-start">Delete (UI Only)</Button>
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
