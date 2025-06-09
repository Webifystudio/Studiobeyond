
"use client";

import { useState, useEffect, useCallback } from 'react';
import { MangaGrid, type MangaItem } from './manga-grid';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ListFilter } from 'lucide-react';
import { db, collection, getDocs, query, orderBy, limit, where, Timestamp } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
}

interface MangaDoc {
  id: string;
  title: string;
  chapters: number;
  status: string;
  imageUrl: string;
  dataAiHint?: string;
  categoryNames?: string[];
  updatedAt: Timestamp;
  createdAt: Timestamp;
}

const ALL_CATEGORIES_ID = "__ALL__"; // Special ID for "All Categories" / "New Releases"

export function DynamicMangaSection() {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDoc | { id: string; name: string; slug: string }>(
    { id: ALL_CATEGORIES_ID, name: "New Releases", slug: "latest" } // Default to "New Releases"
  );
  const [displayedManga, setDisplayedManga] = useState<MangaItem[]>([]);
  const [isLoadingManga, setIsLoadingManga] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [hasMoreManga, setHasMoreManga] = useState(false);

  const MANGA_DISPLAY_LIMIT = 7; // Fetch 7 to determine if "View All" is needed for the first 6

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const categoriesSnapshot = await getDocs(query(collection(db, 'categories'), orderBy('name', 'asc')));
        const fetchedCategories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryDoc));
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
      setIsLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  // Fetch manga based on selected category
  const fetchMangaForFilter = useCallback(async (filterCategory: CategoryDoc | { id: string; name: string; slug: string }) => {
    setIsLoadingManga(true);
    setDisplayedManga([]); // Clear previous manga
    try {
      let mangaQuery;
      if (filterCategory.id === ALL_CATEGORIES_ID) {
        // Fetch latest overall (New Releases)
        mangaQuery = query(
          collection(db, 'mangas'),
          orderBy('updatedAt', 'desc'),
          limit(MANGA_DISPLAY_LIMIT)
        );
      } else {
        // Fetch manga for a specific category
        mangaQuery = query(
          collection(db, 'mangas'),
          where('categoryNames', 'array-contains', filterCategory.name),
          orderBy('updatedAt', 'desc'),
          limit(MANGA_DISPLAY_LIMIT)
        );
      }
      const mangaSnapshot = await getDocs(mangaQuery);
      const fetchedManga = mangaSnapshot.docs.map(doc => {
        const data = doc.data() as MangaDoc;
        return {
          id: doc.id,
          title: data.title,
          chapter: `${data.status} - ${data.chapters} Ch.`,
          imageUrl: data.imageUrl,
          dataAiHint: data.dataAiHint,
        };
      });
      setDisplayedManga(fetchedManga.slice(0, 6)); // Display up to 6
      setHasMoreManga(fetchedManga.length >= MANGA_DISPLAY_LIMIT);

    } catch (error) {
      console.error(`Error fetching manga for ${filterCategory.name}:`, error);
      setDisplayedManga([]);
      setHasMoreManga(false);
    }
    setIsLoadingManga(false);
  }, []);

  useEffect(() => {
    fetchMangaForFilter(selectedCategory);
  }, [selectedCategory, fetchMangaForFilter]);

  const handleCategorySelect = (category: CategoryDoc | { id: string; name: string; slug: string }) => {
    setSelectedCategory(category);
  };

  const gridTitle = selectedCategory.name;
  const viewAllHref = selectedCategory.id === ALL_CATEGORIES_ID ? '/latest' : `/category/${selectedCategory.slug}`;

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h2 className="text-2xl sm:text-3xl font-bold section-title text-white font-headline order-1 sm:order-none">
          {isLoadingManga && selectedCategory.id !== ALL_CATEGORIES_ID ? `Loading ${selectedCategory.name}...` : gridTitle}
          {isLoadingManga && selectedCategory.id === ALL_CATEGORIES_ID ? `Loading New Releases...` : ''}
        </h2>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[180px] order-none sm:order-1">
              <ListFilter className="mr-2 h-4 w-4" />
              Sort by: {selectedCategory.name}
              <ChevronDown className="ml-auto h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-neutral-medium border-neutral-light text-neutral-extralight">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-light" />
            <DropdownMenuItem
              onSelect={() => handleCategorySelect({ id: ALL_CATEGORIES_ID, name: "New Releases", slug: "latest" })}
              className={cn("cursor-pointer hover:!bg-neutral-light focus:!bg-neutral-light", selectedCategory.id === ALL_CATEGORIES_ID && "!bg-brand-primary/20 !text-brand-primary")}
            >
              New Releases
            </DropdownMenuItem>
            {isLoadingCategories ? (
              <DropdownMenuItem disabled>Loading categories...</DropdownMenuItem>
            ) : (
              categories.map(cat => (
                <DropdownMenuItem
                  key={cat.id}
                  onSelect={() => handleCategorySelect(cat)}
                  className={cn("cursor-pointer hover:!bg-neutral-light focus:!bg-neutral-light", selectedCategory.id === cat.id && "!bg-brand-primary/20 !text-brand-primary")}
                >
                  {cat.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoadingManga ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-medium rounded-xl overflow-hidden shadow-lg">
              <Skeleton className="aspect-[2/3] w-full bg-neutral-light" />
              <div className="p-3 sm:p-4">
                <Skeleton className="h-5 w-3/4 mb-1 bg-neutral-light" />
                <Skeleton className="h-4 w-1/2 bg-neutral-light" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedManga.length > 0 ? (
        <MangaGrid
          title="" // Title is handled above
          mangaList={displayedManga}
          viewAllHref={viewAllHref}
          hasMore={hasMoreManga}
        />
      ) : (
        <p className="text-neutral-extralight/70 text-center py-6">
          No manga found for "{selectedCategory.name}".
        </p>
      )}
    </section>
  );
}
