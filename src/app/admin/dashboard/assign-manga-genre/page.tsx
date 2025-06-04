
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, query, orderBy } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Manga {
  id: string;
  title: string;
}

interface Genre {
  id: string;
  name: string;
}

export default function AssignMangaToGenrePage() {
  const [selectedMangaId, setSelectedMangaId] = useState<string>('');
  const [selectedGenreName, setSelectedGenreName] = useState<string>('');
  const [allMangas, setAllMangas] = useState<Manga[]>([]);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [isLoadingMangas, setIsLoadingMangas] = useState(true);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchMangas = async () => {
    setIsLoadingMangas(true);
    try {
      const mangasCollection = collection(db, 'mangas');
      const q = query(mangasCollection, orderBy('title', 'asc'));
      const querySnapshot = await getDocs(q);
      const mangaslist = querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
      } as Manga));
      setAllMangas(mangaslist);
    } catch (error) {
      console.error("Error fetching mangas: ", error);
      toast({ title: "Error", description: "Could not fetch mangas.", variant: "destructive" });
    }
    setIsLoadingMangas(false);
  };

  const fetchGenres = async () => {
    setIsLoadingGenres(true);
    try {
      const genresCollection = collection(db, 'genres');
      const q = query(genresCollection, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const genresList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      } as Genre));
      setAllGenres(genresList);
    } catch (error) {
      console.error("Error fetching genres: ", error);
      toast({ title: "Error", description: "Could not fetch genres.", variant: "destructive" });
    }
    setIsLoadingGenres(false);
  };

  useEffect(() => {
    fetchMangas();
    fetchGenres();
  }, []);

  const handleAssign = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMangaId || !selectedGenreName) {
      toast({ title: "Error", description: "Please select both a manga and a genre.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const mangaRef = doc(db, 'mangas', selectedMangaId);
      await updateDoc(mangaRef, {
        genres: arrayUnion(selectedGenreName)
      });
      const manga = allMangas.find(m => m.id === selectedMangaId);
      toast({ title: "Success", description: `Genre "${selectedGenreName}" assigned to manga "${manga?.title || 'Selected Manga'}".` });
      // Reset selections after successful assignment
      setSelectedMangaId('');
      setSelectedGenreName('');
    } catch (error) {
      console.error("Error assigning genre to manga: ", error);
      toast({ title: "Error", description: "Could not assign genre to manga. Ensure the manga and genre exist and try again.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white font-headline">Assign Manga to Genre</h1>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <Link2 className="mr-2 h-5 w-5 text-brand-primary" /> Assign Manga
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Select a manga and a genre to assign the manga to that genre. The genre page should update automatically after assignment.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAssign}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="mangaSelect" className="text-neutral-extralight mb-1 block">Select Manga</Label>
              <Select value={selectedMangaId} onValueChange={setSelectedMangaId} disabled={isLoadingMangas || isSubmitting}>
                <SelectTrigger id="mangaSelect" className="w-full bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary">
                  <SelectValue placeholder={isLoadingMangas ? "Loading mangas..." : "Select a manga"} />
                </SelectTrigger>
                <SelectContent className="bg-neutral-light text-neutral-extralight border-neutral-medium">
                  {allMangas.map(manga => (
                    <SelectItem key={manga.id} value={manga.id} className="hover:bg-neutral-medium focus:bg-neutral-medium">
                      {manga.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="genreSelect" className="text-neutral-extralight mb-1 block">Select Genre</Label>
              <Select value={selectedGenreName} onValueChange={setSelectedGenreName} disabled={isLoadingGenres || isSubmitting}>
                <SelectTrigger id="genreSelect" className="w-full bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary">
                  <SelectValue placeholder={isLoadingGenres ? "Loading genres..." : "Select a genre"} />
                </SelectTrigger>
                <SelectContent className="bg-neutral-light text-neutral-extralight border-neutral-medium">
                  {allGenres.map(genre => (
                    <SelectItem key={genre.id} value={genre.name} className="hover:bg-neutral-medium focus:bg-neutral-medium">
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white w-full sm:w-auto" disabled={isLoadingMangas || isLoadingGenres || isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign to Genre'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
