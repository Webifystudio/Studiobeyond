
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, ListFilter, Trash2, Link2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db, collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, query, orderBy } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Manga {
  id: string;
  title: string;
  categoryNames?: string[]; // Array of category names
}

interface Category {
  id: string;
  name: string;
}

export default function AssignMangaToCategoryPage() {
  const [selectedMangaId, setSelectedMangaId] = useState<string>('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [allMangas, setAllMangas] = useState<Manga[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoadingMangas, setIsLoadingMangas] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMangaAssignedCategories, setCurrentMangaAssignedCategories] = useState<string[]>([]);
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
        categoryNames: doc.data().categoryNames || [],
      } as Manga));
      setAllMangas(mangaslist);
    } catch (error) {
      console.error("Error fetching mangas: ", error);
      toast({ title: "Error", description: "Could not fetch mangas.", variant: "destructive" });
    }
    setIsLoadingMangas(false);
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const categoriesCollection = collection(db, 'categories');
      const q = query(categoriesCollection, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const categoriesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      } as Category));
      setAllCategories(categoriesList);
    } catch (error) {
      console.error("Error fetching categories: ", error);
      toast({ title: "Error", description: "Could not fetch categories.", variant: "destructive" });
    }
    setIsLoadingCategories(false);
  };

  useEffect(() => {
    fetchMangas();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedMangaId) {
      const manga = allMangas.find(m => m.id === selectedMangaId);
      setCurrentMangaAssignedCategories(manga?.categoryNames || []);
    } else {
      setCurrentMangaAssignedCategories([]);
    }
  }, [selectedMangaId, allMangas]);

  const handleAssign = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMangaId || !selectedCategoryName) {
      toast({ title: "Error", description: "Please select both a manga and a category.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const mangaRef = doc(db, 'mangas', selectedMangaId);
      await updateDoc(mangaRef, {
        categoryNames: arrayUnion(selectedCategoryName)
      });
      const manga = allMangas.find(m => m.id === selectedMangaId);
      toast({ title: "Success", description: `Category "${selectedCategoryName}" assigned to manga "${manga?.title || 'Selected Manga'}".` });
      
      // Optimistically update local state
      setCurrentMangaAssignedCategories(prev => [...new Set([...prev, selectedCategoryName])]);
      setAllMangas(prevMangas => prevMangas.map(m => 
        m.id === selectedMangaId ? { ...m, categoryNames: [...new Set([...(m.categoryNames || []), selectedCategoryName])] } : m
      ));
      setSelectedCategoryName(''); // Reset category selection
    } catch (error) {
      console.error("Error assigning category to manga: ", error);
      toast({ title: "Error", description: "Could not assign category to manga.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleUnassign = async (categoryNameToRemove: string) => {
     if (!selectedMangaId) return;
     setIsSubmitting(true); // Use same state for simplicity
     try {
        const mangaRef = doc(db, 'mangas', selectedMangaId);
        await updateDoc(mangaRef, {
            categoryNames: arrayRemove(categoryNameToRemove)
        });
        const manga = allMangas.find(m => m.id === selectedMangaId);
        toast({ title: "Success", description: `Category "${categoryNameToRemove}" unassigned from manga "${manga?.title || 'Selected Manga'}".` });
        
        setCurrentMangaAssignedCategories(prev => prev.filter(cat => cat !== categoryNameToRemove));
        setAllMangas(prevMangas => prevMangas.map(m => 
            m.id === selectedMangaId ? { ...m, categoryNames: (m.categoryNames || []).filter(cat => cat !== categoryNameToRemove) } : m
        ));
     } catch (error) {
        console.error("Error unassigning category: ", error);
        toast({ title: "Error", description: "Could not unassign category.", variant: "destructive" });
     }
     setIsSubmitting(false);
  };


  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white font-headline">Assign Manga to Category</h1>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <Link2 className="mr-2 h-5 w-5 text-brand-primary" /> Assign Manga
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Select a manga and a category to assign. Manga can belong to multiple categories.
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
              <Label htmlFor="categorySelect" className="text-neutral-extralight mb-1 block">Select Category to Assign</Label>
              <Select value={selectedCategoryName} onValueChange={setSelectedCategoryName} disabled={isLoadingCategories || isSubmitting || !selectedMangaId}>
                <SelectTrigger id="categorySelect" className="w-full bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary">
                  <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : (selectedMangaId ? "Select a category" : "Select manga first")} />
                </SelectTrigger>
                <SelectContent className="bg-neutral-light text-neutral-extralight border-neutral-medium">
                  {allCategories.map(category => (
                    <SelectItem key={category.id} value={category.name} className="hover:bg-neutral-medium focus:bg-neutral-medium" disabled={currentMangaAssignedCategories.includes(category.name)}>
                      {category.name} {currentMangaAssignedCategories.includes(category.name) && "(Assigned)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white w-full sm:w-auto" disabled={isLoadingMangas || isLoadingCategories || isSubmitting || !selectedMangaId || !selectedCategoryName}>
              {isSubmitting ? 'Assigning...' : 'Assign to Category'}
            </Button>
          </CardContent>
        </form>
      </Card>

      {selectedMangaId && (
        <Card className="bg-neutral-medium border-neutral-light">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
                    <ListFilter className="mr-2 h-5 w-5 text-brand-primary" /> 
                    Currently Assigned Categories for: <span className="ml-1 text-brand-primary truncate">{allMangas.find(m=>m.id === selectedMangaId)?.title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {currentMangaAssignedCategories.length > 0 ? (
                    <ul className="space-y-2">
                        {currentMangaAssignedCategories.map(catName => (
                            <li key={catName} className="flex justify-between items-center p-3 bg-neutral-light rounded-md shadow">
                                <span className="text-neutral-extralight">{catName}</span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-red-400 hover:text-red-300 hover:bg-neutral-medium/50"
                                    onClick={() => handleUnassign(catName)}
                                    disabled={isSubmitting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-neutral-extralight/70">This manga is not assigned to any categories yet.</p>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}

    