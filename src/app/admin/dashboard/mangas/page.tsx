
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

interface Manga {
  id: string;
  title: string;
  description: string;
  chapters: number;
  status: string;
  imageUrl: string;
  genres: string[]; // Storing genre names as an array of strings for simplicity
  dataAiHint?: string;
  createdAt: Timestamp;
}

const initialMangaDetails = {
  title: '',
  description: '',
  chapters: '',
  status: 'Ongoing',
  imageUrl: '',
  genresInput: '', // For comma-separated genre string input
  dataAiHint: '',
};

export default function ManageMangasPage() {
  const [mangaDetails, setMangaDetails] = useState(initialMangaDetails);
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMangas = async () => {
    setIsLoading(true);
    try {
      const mangasCollection = collection(db, 'mangas');
      const q = query(mangasCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const mangaslist = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Manga));
      setMangas(mangaslist);
    } catch (error) {
      console.error("Error fetching mangas: ", error);
      toast({ title: "Error", description: "Could not fetch mangas.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMangas();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMangaDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleAddManga = async (e: FormEvent) => {
    e.preventDefault();
    if (!mangaDetails.title.trim() || !mangaDetails.imageUrl.trim()) {
       toast({ title: "Error", description: "Title and Image URL are required.", variant: "destructive" });
      return;
    }
    
    const genresArray = mangaDetails.genresInput.split(',').map(g => g.trim()).filter(g => g);

    try {
      await addDoc(collection(db, 'mangas'), {
        title: mangaDetails.title.trim(),
        description: mangaDetails.description.trim(),
        chapters: parseInt(mangaDetails.chapters) || 0,
        status: mangaDetails.status,
        imageUrl: mangaDetails.imageUrl.trim(),
        genres: genresArray,
        dataAiHint: mangaDetails.dataAiHint.trim() || undefined,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(), // Keep updatedAt for sorting/filtering later
      });
      toast({ title: "Manga Added", description: `Manga "${mangaDetails.title}" added successfully.` });
      setMangaDetails(initialMangaDetails); // Reset form
      fetchMangas(); // Refresh list
    } catch (error) {
      console.error("Error adding manga: ", error);
      toast({ title: "Error", description: "Could not add manga.", variant: "destructive" });
    }
  };
  
  const handleDeleteManga = async (mangaId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete manga "${title}"? This action cannot be undone.`)) {
        return;
    }
    try {
        await deleteDoc(doc(db, "mangas", mangaId));
        toast({ title: "Manga Deleted", description: `Manga "${title}" deleted successfully.` });
        fetchMangas(); // Refresh list
    } catch (error) {
        console.error("Error deleting manga: ", error);
        toast({ title: "Error", description: "Could not delete manga.", variant: "destructive" });
    }
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
             <div>
              <Label htmlFor="genresInput" className="text-neutral-extralight">Genres (comma-separated)</Label>
              <Input id="genresInput" name="genresInput" type="text" value={mangaDetails.genresInput} onChange={handleChange} placeholder="e.g., Action, Fantasy, Adventure" className="bg-neutral-light text-neutral-extralight" />
            </div>
            <div>
              <Label htmlFor="dataAiHint" className="text-neutral-extralight">AI Image Hint (Optional)</Label>
              <Input id="dataAiHint" name="dataAiHint" type="text" value={mangaDetails.dataAiHint} onChange={handleChange} placeholder="e.g., epic battle anime" className="bg-neutral-light text-neutral-extralight" />
            </div>
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
            List of mangas currently in the catalog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <p className="text-neutral-extralight/70">Loading mangas...</p>
          ) : mangas.length === 0 ? (
            <p className="text-neutral-extralight/70">No mangas added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mangas.map((manga) => (
                <Card key={manga.id} className="bg-neutral-light overflow-hidden shadow-md">
                  <div className="relative w-full h-48">
                    <Image 
                        src={manga.imageUrl || 'https://placehold.co/300x450.png'} 
                        alt={manga.title} 
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={manga.dataAiHint || "manga cover"}
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-white truncate" title={manga.title}>{manga.title}</h3>
                    <p className="text-xs text-neutral-extralight/80">{manga.status} - {manga.chapters} Chapters</p>
                    <p className="text-xs text-neutral-extralight/70 truncate" title={manga.genres.join(', ')}>Genres: {manga.genres.join(', ')}</p>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-neutral-medium/50 p-1 mt-1 h-auto w-auto"
                        onClick={() => handleDeleteManga(manga.id, manga.title)}
                        aria-label={`Delete ${manga.title}`}
                    >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
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
