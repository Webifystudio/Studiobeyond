
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For genre selection

interface Manga {
  id: string;
  title: string;
  description: string;
  chapters: number;
  status: string; // e.g., Ongoing, Completed
  imageUrl: string;
  // genreIds: string[]; // To link to genre collection
}

export default function ManageMangasPage() {
  const [mangaDetails, setMangaDetails] = useState({
    title: '',
    description: '',
    chapters: '', // Stored as string for input, convert to number on save
    status: 'Ongoing',
    imageUrl: '',
  });
  const [mangas, setMangas] = useState<Manga[]>([]); // This will come from Firestore
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMangaDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleAddManga = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mangaDetails.title.trim() || !mangaDetails.imageUrl.trim()) {
       toast({ title: "Error", description: "Title and Image URL are required.", variant: "destructive" });
      return;
    }
    // In a real app, this would save to Firestore
    const newManga: Manga = {
      id: Date.now().toString(),
      title: mangaDetails.title,
      description: mangaDetails.description,
      chapters: parseInt(mangaDetails.chapters) || 0,
      status: mangaDetails.status,
      imageUrl: mangaDetails.imageUrl,
    };
    setMangas([...mangas, newManga]);
    toast({ title: "Manga Added (UI Only)", description: `Manga "${newManga.title}" added. Data not saved.` });
    setMangaDetails({ title: '', description: '', chapters: '', status: 'Ongoing', imageUrl: '' }); // Reset form
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white font-headline">Manage Mangas</h1>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-xl text-white font-headline flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-brand-primary" /> Add New Manga
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Add a new manga series to the catalog.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAddManga}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-neutral-extralight">Title</Label>
              <Input id="title" name="title" type="text" value={mangaDetails.title} onChange={handleChange} placeholder="Manga Title" required className="bg-neutral-light text-neutral-extralight" />
            </div>
            <div>
              <Label htmlFor="description" className="text-neutral-extralight">Description</Label>
              <Textarea id="description" name="description" value={mangaDetails.description} onChange={handleChange} placeholder="Synopsis of the manga" className="bg-neutral-light text-neutral-extralight" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chapters" className="text-neutral-extralight">Total Chapters</Label>
                <Input id="chapters" name="chapters" type="number" value={mangaDetails.chapters} onChange={handleChange} placeholder="e.g., 150" className="bg-neutral-light text-neutral-extralight" />
              </div>
              <div>
                <Label htmlFor="status" className="text-neutral-extralight">Status</Label>
                {/* Basic select for now, can be ShadCN select later */}
                <select 
                    id="status" 
                    name="status" 
                    value={mangaDetails.status} 
                    onChange={handleChange}
                    className="w-full h-10 rounded-md border border-input bg-neutral-light px-3 py-2 text-base text-neutral-extralight focus:ring-brand-primary"
                >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Hiatus">Hiatus</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="imageUrl" className="text-neutral-extralight">Image URL (Cover)</Label>
              <Input id="imageUrl" name="imageUrl" type="url" value={mangaDetails.imageUrl} onChange={handleChange} placeholder="https://placehold.co/300x450.png" required className="bg-neutral-light text-neutral-extralight" />
            </div>
            {/* Genre selection will be added later with multi-select component */}
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white">
              Add Manga
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-xl text-white font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-brand-primary" /> Existing Mangas
          </CardTitle>
           <CardDescription className="text-neutral-extralight/80">
            List of mangas. (Data persistence not yet implemented)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mangas.length === 0 ? (
            <p className="text-neutral-extralight/70">No mangas added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mangas.map((manga) => (
                <Card key={manga.id} className="bg-neutral-light overflow-hidden">
                  <img src={manga.imageUrl || 'https://placehold.co/300x450.png'} alt={manga.title} className="w-full h-48 object-cover"/>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-white truncate">{manga.title}</h3>
                    <p className="text-xs text-neutral-extralight/80">{manga.status} - {manga.chapters} Chapters</p>
                    <Button variant="link" size="sm" className="text-red-400 p-0 h-auto mt-1">Delete (UI Only)</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
