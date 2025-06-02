
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Genre {
  id: string;
  name: string;
}

export default function ManageGenresPage() {
  const [genreName, setGenreName] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]); // This will come from Firestore
  const { toast } = useToast();

  const handleAddGenre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genreName.trim()) {
      toast({ title: "Error", description: "Genre name cannot be empty.", variant: "destructive" });
      return;
    }
    // In a real app, this would save to Firestore
    const newGenre = { id: Date.now().toString(), name: genreName };
    setGenres([...genres, newGenre]);
    toast({ title: "Genre Added (UI Only)", description: `Genre "${genreName}" added to the list. Data not saved.` });
    setGenreName('');
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white font-headline">Manage Genres</h1>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-xl text-white font-headline flex items-center">
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
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white">
              Add Genre
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-xl text-white font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-brand-primary" /> Existing Genres
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            List of currently available genres. (Data persistence not yet implemented)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {genres.length === 0 ? (
            <p className="text-neutral-extralight/70">No genres added yet.</p>
          ) : (
            <ul className="space-y-2">
              {genres.map((genre) => (
                <li key={genre.id} className="flex justify-between items-center p-2 bg-neutral-light rounded-md">
                  <span className="text-neutral-extralight">{genre.name}</span>
                  {/* Add Edit/Delete buttons here later */}
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">Delete (UI Only)</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
