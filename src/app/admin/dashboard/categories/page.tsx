
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List, Trash2, Edit3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db, serverTimestamp, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, Timestamp } from '@/lib/firebase';
import { generateSlug } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: Timestamp;
}

export default function ManageCategoriesPage() {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { toast } = useToast();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const categoriesCollection = collection(db, 'categories');
      const q = query(categoriesCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const categoriesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
      setCategories(categoriesList);
    } catch (error) {
      console.error("Error fetching categories: ", error);
      toast({ title: "Error", description: "Could not fetch categories.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast({ title: "Error", description: "Category name cannot be empty.", variant: "destructive" });
      return;
    }
    const slug = generateSlug(categoryName.trim());
    if (!slug) {
        toast({ title: "Error", description: "Could not generate a valid slug for the category name.", variant: "destructive" });
        return;
    }

    try {
      await addDoc(collection(db, 'categories'), {
        name: categoryName.trim(),
        slug: slug,
        createdAt: serverTimestamp()
      });
      toast({ title: "Category Added", description: `Category "${categoryName}" added successfully.` });
      setCategoryName('');
      fetchCategories(); 
    } catch (error) {
      console.error("Error adding category: ", error);
      toast({ title: "Error", description: "Could not add category.", variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (categoryId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? This action cannot be undone.`)) {
        return;
    }
    try {
        await deleteDoc(doc(db, "categories", categoryId));
        toast({ title: "Category Deleted", description: `Category "${name}" deleted successfully.` });
        fetchCategories(); 
    } catch (error) {
        console.error("Error deleting category: ", error);
        toast({ title: "Error", description: "Could not delete category.", variant: "destructive" });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
  };

  const handleUpdateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !newCategoryName.trim()) {
      toast({ title: "Error", description: "New category name cannot be empty.", variant: "destructive" });
      return;
    }
    const newSlug = generateSlug(newCategoryName.trim());
     if (!newSlug) {
        toast({ title: "Error", description: "Could not generate a valid slug for the new category name.", variant: "destructive" });
        return;
    }

    try {
      const categoryRef = doc(db, "categories", editingCategory.id);
      await updateDoc(categoryRef, {
        name: newCategoryName.trim(),
        slug: newSlug
      });
      toast({ title: "Category Updated", description: `Category "${editingCategory.name}" updated to "${newCategoryName}".` });
      setEditingCategory(null);
      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      console.error("Error updating category: ", error);
      toast({ title: "Error", description: "Could not update category.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white font-headline">Manage Categories</h1>
      
      {!editingCategory ? (
        <Card className="bg-neutral-medium border-neutral-light">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
              <PlusCircle className="mr-2 h-5 w-5 text-brand-primary" /> Add New Category
            </CardTitle>
            <CardDescription className="text-neutral-extralight/80">
              Create a new category for organizing mangas.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAddCategory}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoryName" className="text-neutral-extralight">Category Name</Label>
                <Input
                  id="categoryName"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Featured, New Arrivals, Staff Picks"
                  className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
                />
              </div>
              <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white w-full sm:w-auto">
                Add Category
              </Button>
            </CardContent>
          </form>
        </Card>
      ) : (
        <Card className="bg-neutral-medium border-neutral-light">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
              <Edit3 className="mr-2 h-5 w-5 text-brand-primary" /> Edit Category: {editingCategory.name}
            </CardTitle>
            <CardDescription className="text-neutral-extralight/80">
              Update the name for this category. Note: Renaming a category does not automatically update manga already assigned to the old name.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateCategory}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newCategoryName" className="text-neutral-extralight">New Category Name</Label>
                <Input
                  id="newCategoryName"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white">
                  Update Category
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}


      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-brand-primary" /> Existing Categories
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            List of currently available categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-neutral-extralight/70">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-neutral-extralight/70">No categories added yet.</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-neutral-light rounded-md shadow gap-2 sm:gap-0">
                  <div className="flex-grow">
                    <span className="text-neutral-extralight">{category.name}</span>
                    <p className="text-xs text-neutral-extralight/70">Slug: {category.slug}</p>
                  </div>
                  <div className="flex space-x-2 self-end sm:self-center">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-blue-400 hover:text-blue-300 hover:bg-neutral-medium/50"
                        onClick={() => handleEditCategory(category)}
                        aria-label={`Edit ${category.name}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-400 hover:text-red-300 hover:bg-neutral-medium/50"
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    