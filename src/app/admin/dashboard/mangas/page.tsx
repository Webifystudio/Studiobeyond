
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List, Trash2, ExternalLink, UploadCloud } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db, serverTimestamp, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from '@/lib/firebase';
import Image from 'next/image';
import { Checkbox } from "@/components/ui/checkbox";

interface Manga {
  id: string;
  title: string;
  description:string;
  chapters: number;
  status: string;
  imageUrl: string;
  categoryNames?: string[];
  dataAiHint?: string;
  externalReadLink?: string;
  genres?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
}

const initialMangaDetails = {
  title: '',
  description: '',
  chapters: '',
  status: 'Ongoing',
  imageUrl: '',
  dataAiHint: '',
  externalReadLink: '',
  selectedCategoryNames: [] as string[],
  // selectedSectionId: '', // Removed sectionId
};

const IMGBB_API_KEY = "2bb2346a6a907388d8a3b0beac2bca86";

export default function ManageMangasPage() {
  const [mangaDetails, setMangaDetails] = useState(initialMangaDetails);
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingManga, setIsSubmittingManga] = useState(false);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const { toast } = useToast();

  const fetchMangas = async () => {
    setIsLoading(true);
    try {
      const mangasCollection = collection(db, 'mangas');
      const q = query(mangasCollection, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const mangaslist = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Manga));
      setMangas(mangaslist);
    } catch (error) {
      console.error("Error fetching mangas: ", error);
      toast({ title: "Error", description: "Could not fetch mangas.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const categoriesCollectionRef = collection(db, 'categories');
      const q = query(categoriesCollectionRef, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const categoriesList = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        name: docSnap.data().name,
        slug: docSnap.data().slug,
      } as CategoryDoc));
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMangaDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryName: string) => {
    setMangaDetails(prev => {
      const newSelectedCategories = prev.selectedCategoryNames.includes(categoryName)
        ? prev.selectedCategoryNames.filter(name => name !== categoryName)
        : [...prev.selectedCategoryNames, categoryName];
      return { ...prev, selectedCategoryNames: newSelectedCategories };
    });
  };

  const handleCoverFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedCoverFile(e.target.files[0]);
    } else {
      setSelectedCoverFile(null);
    }
  };

  const handleCoverUpload = async () => {
    if (!selectedCoverFile) {
      toast({ title: "No File Selected", description: "Please select an image file to upload.", variant: "default" });
      return;
    }
    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append('image', selectedCoverFile);
    formData.append('key', IMGBB_API_KEY);

    try {
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setMangaDetails(prev => ({ ...prev, imageUrl: result.data.display_url }));
        toast({ title: "Cover Image Uploaded", description: "Image successfully uploaded. URL populated." });
        setSelectedCoverFile(null);
        const fileInput = document.getElementById('coverImageFile') as HTMLInputElement | null;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(result.error?.message || 'ImgBB upload failed');
      }
    } catch (error: any) {
      console.error("Error uploading image to ImgBB: ", error);
      toast({ title: "Upload Error", description: error.message || "Could not upload cover image.", variant: "destructive" });
    }
    setIsUploadingCover(false);
  };

  const handleAddManga = async (e: FormEvent) => {
    e.preventDefault();
    if (!mangaDetails.title.trim() || !mangaDetails.imageUrl.trim()) {
       toast({ title: "Validation Error", description: "Title and Cover Image URL are required.", variant: "destructive" });
      return;
    }

    setIsSubmittingManga(true);
    try {
      const dataToSave: Partial<Omit<Manga, 'id' | 'createdAt' | 'updatedAt' | 'genres'>> & { createdAt: any, updatedAt: any, genres?: string[], categoryNames?: string[] } = {
        title: mangaDetails.title.trim(),
        description: mangaDetails.description.trim(),
        chapters: parseInt(mangaDetails.chapters) || 0,
        status: mangaDetails.status,
        imageUrl: mangaDetails.imageUrl.trim(),
        categoryNames: mangaDetails.selectedCategoryNames, // Save selected category names
        genres: [], // Initialize genres if not handled elsewhere
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (mangaDetails.dataAiHint.trim()) {
        dataToSave.dataAiHint = mangaDetails.dataAiHint.trim();
      }
      if (mangaDetails.externalReadLink.trim()) {
        dataToSave.externalReadLink = mangaDetails.externalReadLink.trim();
      }

      await addDoc(collection(db, 'mangas'), dataToSave);

      toast({ title: "Manga Added", description: `Manga "${mangaDetails.title}" added successfully.` });
      setMangaDetails(initialMangaDetails);
      const fileInput = document.getElementById('coverImageFile') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      setSelectedCoverFile(null);
      fetchMangas();
    } catch (error: any) {
      console.error("Error adding manga: ", error);
      toast({ title: "Error Adding Manga", description: error.message || "Could not add manga.", variant: "destructive" });
    } finally {
      setIsSubmittingManga(false);
    }
  };

  const handleDeleteManga = async (mangaId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete manga "${title}"? This action cannot be undone.`)) {
        return;
    }
    try {
        await deleteDoc(doc(db, "mangas", mangaId));
        toast({ title: "Manga Deleted", description: `Manga "${title}" deleted successfully.` });
        fetchMangas();
    } catch (error: any) {
        console.error("Error deleting manga: ", error);
        toast({ title: "Error Deleting Manga", description: error.message || "Could not delete manga.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white font-headline">Manage Mangas</h1>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
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
                    className="w-full h-10 rounded-md border border-input bg-neutral-light px-3 py-2 text-sm md:text-base text-neutral-extralight focus:ring-brand-primary"
                >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Hiatus">Hiatus</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-neutral-extralight mb-2 block">Categories (Optional)</Label>
              {isLoadingCategories ? (
                <p className="text-neutral-extralight/70">Loading categories...</p>
              ) : allCategories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-neutral-light rounded-md border border-neutral-light">
                  {allCategories.map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={mangaDetails.selectedCategoryNames.includes(category.name)}
                        onCheckedChange={() => handleCategoryChange(category.name)}
                        className="border-neutral-extralight data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                      />
                      <Label htmlFor={`category-${category.id}`} className="text-sm text-neutral-extralight font-normal cursor-pointer">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-extralight/70">No categories created yet. Add them in "Manage Categories".</p>
              )}
            </div>

            <div>
              <Label htmlFor="imageUrl" className="text-neutral-extralight">Cover Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={mangaDetails.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg or upload below"
                className="bg-neutral-light text-neutral-extralight"
              />
              <p className="text-xs text-neutral-extralight/70 mt-1">
                Paste an image URL directly, or upload an image:
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
                <Input
                    id="coverImageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="bg-neutral-light text-neutral-extralight flex-grow file:text-sm file:font-medium file:text-brand-primary file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-brand-primary/20 hover:file:bg-brand-primary/30"
                />
                <Button type="button" onClick={handleCoverUpload} disabled={!selectedCoverFile || isUploadingCover || isSubmittingManga} className="bg-accent hover:bg-accent/80 text-accent-foreground shrink-0 w-full sm:w-auto">
                  <UploadCloud className="mr-2 h-4 w-4" /> {isUploadingCover ? 'Uploading...' : 'Upload & Use Image'}
                </Button>
              </div>
              {mangaDetails.imageUrl && (
                <div className="mt-3">
                  <Label className="text-neutral-extralight text-xs">Image Preview:</Label>
                  <div className="mt-2 relative w-32 h-48 rounded border border-neutral-light overflow-hidden">
                    <Image
                        src={mangaDetails.imageUrl}
                        alt="Cover preview"
                        fill
                        objectFit="cover"
                        key={mangaDetails.imageUrl}
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/300x450/2D3748/A0AEC0?text=Invalid+URL')}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="externalReadLink" className="text-neutral-extralight">External Read Link (Optional)</Label>
              <Input id="externalReadLink" name="externalReadLink" type="url" value={mangaDetails.externalReadLink} onChange={handleChange} placeholder="https://example.com/read/manga-title" className="bg-neutral-light text-neutral-extralight" />
            </div>
            <div>
              <Label htmlFor="dataAiHint" className="text-neutral-extralight">AI Image Hint (Optional)</Label>
              <Input id="dataAiHint" name="dataAiHint" type="text" value={mangaDetails.dataAiHint} onChange={handleChange} placeholder="e.g., epic battle anime" className="bg-neutral-light text-neutral-extralight" />
            </div>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white w-full sm:w-auto" disabled={isSubmittingManga || isUploadingCover }>
              {isSubmittingManga ? 'Adding Manga...' : 'Add Manga'}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-brand-primary" /> Existing Mangas
          </CardTitle>
           <CardDescription className="text-neutral-extralight/80">
            List of mangas currently in the catalog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && mangas.length === 0 ? (
             <p className="text-neutral-extralight/70">Loading mangas...</p>
          ) : mangas.length === 0 ? (
            <p className="text-neutral-extralight/70">No mangas added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mangas.map((manga) => (
                <Card key={manga.id} className="bg-neutral-light overflow-hidden shadow-md">
                  <div className="relative w-full h-48">
                    <Image
                        src={manga.imageUrl || 'https://placehold.co/300x450.png'}
                        alt={manga.title}
                        fill
                        objectFit="cover"
                        data-ai-hint={manga.dataAiHint || "manga cover"}
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/300x450.png')}
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-white truncate text-sm md:text-base" title={manga.title}>{manga.title}</h3>
                    <p className="text-xs text-neutral-extralight/80">{manga.status} - {manga.chapters} Chapters</p>
                    {manga.categoryNames && manga.categoryNames.length > 0 && (
                       <p className="text-xs text-neutral-extralight/70 truncate" title={manga.categoryNames.join(', ')}>Categories: {manga.categoryNames.join(', ')}</p>
                    )}
                    {manga.genres && manga.genres.length > 0 && (
                       <p className="text-xs text-neutral-extralight/70 truncate" title={manga.genres.join(', ')}>Genres: {manga.genres.join(', ')}</p>
                    )}
                    {manga.externalReadLink && (
                      <a href={manga.externalReadLink} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline flex items-center mt-1">
                         <ExternalLink className="h-3 w-3 mr-1" /> Read Externally
                      </a>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-neutral-medium/50 p-1 mt-2 h-auto w-auto self-end"
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
    

    