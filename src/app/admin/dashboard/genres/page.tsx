
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db, serverTimestamp } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, Timestamp } from 'firebase/firestore';
import { generateSlug } from '@/lib/utils';

interface Genre {
  id: string;
  name: string;
  slug: string;
  createdAt: Timestamp;
}

export default function ManageGenresPage() {
  const [genreName, setGenreName] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchGenres = async () => {
    setIsLoading(true);
    try {
      const genresCollection = collection(db, 'genres');
      const q = query(genresCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const genresList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Genre));
      setGenres(genresList);
    } catch (error) {
      console.error("Error fetching genres: ", error);
      toast({ title: "Error", description: "Could not fetch genres.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleAddGenre = async (e: FormEvent) => {
    e.preventDefault();
    if (!genreName.trim()) {
      toast({ title: "Error", description: "Genre name cannot be empty.", variant: "destructive" });
      return;
    }
    const slug = generateSlug(genreName.trim());
    if (!slug) {
        toast({ title: "Error", description: "Could not generate a valid slug for the genre name.", variant: "destructive" });
        return;
    }

    try {
      await addDoc(collection(db, 'genres'), {
        name: genreName.trim(),
        slug: slug,
        createdAt: serverTimestamp()
      });
      toast({ title: "Genre Added", description: `Genre "${genreName}" added successfully.` });
      setGenreName('');
      fetchGenres(); 
    } catch (error) {
      console.error("Error adding genre: ", error);
      toast({ title: "Error", description: "Could not add genre.", variant: "destructive" });
    }
  };

  const handleDeleteGenre = async (genreId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete genre "${name}"? This action cannot be undone.`)) {
        return;
    }
    try {
        await deleteDoc(doc(db, "genres", genreId));
        toast({ title: "Genre Deleted", description: `Genre "${name}" deleted successfully.` });
        fetchGenres(); 
    } catch (error) {
        console.error("Error deleting genre: ", error);
        toast({ title: "Error", description: "Could not delete genre.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white font-headline">Manage Genres</h1>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-brand-primary" /> Add New Genre
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Create a new genre category for mangas.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAddGenre}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="genreName" className="text-neutral-extralight">Genre Name</Label>
              <Input
                id="genreName"
                type="text"
                value={genreName}
                onChange={(e) => setGenreName(e.target.value)}
                placeholder="e.g., Action, Romance, Sci-Fi"
                className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
              />
            </div>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white w-full sm:w-auto">
              Add Genre
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-brand-primary" /> Existing Genres
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            List of currently available genres.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-neutral-extralight/70">Loading genres...</p>
          ) : genres.length === 0 ? (
            <p className="text-neutral-extralight/70">No genres added yet.</p>
          ) : (
            <ul className="space-y-2">
              {genres.map((genre) => (
                <li key={genre.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-neutral-light rounded-md shadow gap-2 sm:gap-0">
                  <div className="flex-grow">
                    <span className="text-neutral-extralight">{genre.name}</span>
                    <p className="text-xs text-neutral-extralight/70">Slug: {genre.slug}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-400 hover:text-red-300 hover:bg-neutral-medium/50 self-end sm:self-center"
                    onClick={() => handleDeleteGenre(genre.id, genre.name)}
                    aria-label={`Delete ${genre.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
