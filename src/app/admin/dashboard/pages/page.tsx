
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List, Trash2, ExternalLink, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db, serverTimestamp } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { generateSlug } from '@/lib/utils';
import Link from 'next/link';

interface CustomPage {
  id: string;
  pageName: string;
  pageSlug: string;
  title?: string;
  description?: string;
  author?: string;
  category?: string;
  landingImageUrl?: string;
  dataAiHint?: string;
  views?: number;
  createdAt: Timestamp;
}

export default function ManagePagesPage() {
  const [newPageName, setNewPageName] = useState('');
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const pagesCollection = collection(db, 'customPages');
      const q = query(pagesCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const pagesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CustomPage));
      setPages(pagesList);
    } catch (error) {
      console.error("Error fetching pages: ", error);
      toast({ title: "Error", description: "Could not fetch pages.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleAddPage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) {
      toast({ title: "Error", description: "Page name cannot be empty.", variant: "destructive" });
      return;
    }
    const slug = generateSlug(newPageName.trim());
    if (!slug) {
        toast({ title: "Error", description: "Could not generate a valid slug for the page name.", variant: "destructive" });
        return;
    }

    try {
      await addDoc(collection(db, 'customPages'), {
        pageName: newPageName.trim(),
        pageSlug: slug,
        createdAt: serverTimestamp(),
        title: newPageName.trim(), 
        description: "",
        author: "",
        category: "",
        landingImageUrl: "",
        dataAiHint: "",
        views: 0,
      });
      toast({ title: "Page Created", description: `Page "${newPageName}" created successfully.` });
      setNewPageName('');
      fetchPages(); 
    } catch (error) {
      console.error("Error adding page: ", error);
      toast({ title: "Error", description: "Could not create page.", variant: "destructive" });
    }
  };

  const handleDeletePage = async (pageId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete page "${name}"? This action cannot be undone.`)) {
        return;
    }
    try {
        await deleteDoc(doc(db, "customPages", pageId));
        toast({ title: "Page Deleted", description: `Page "${name}" deleted successfully.` });
        fetchPages(); 
    } catch (error) {
        console.error("Error deleting page: ", error);
        toast({ title: "Error", description: "Could not delete page.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white font-headline">Manage Custom Pages</h1>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-brand-primary" /> Create New Page
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Create a new custom page for your site. Configure its content after creation.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAddPage}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newPageName" className="text-neutral-extralight">Page Name</Label>
              <Input
                id="newPageName"
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="e.g., Summer Collection, Top 10 Beginners"
                className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
              />
            </div>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white w-full sm:w-auto">
              Create Page
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-brand-primary" /> Existing Custom Pages
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            List of currently created custom pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-neutral-extralight/70">Loading pages...</p>
          ) : pages.length === 0 ? (
            <p className="text-neutral-extralight/70">No custom pages created yet.</p>
          ) : (
            <ul className="space-y-2">
              {pages.map((page) => (
                <li key={page.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-neutral-light rounded-md shadow gap-2">
                  <div className="flex-grow">
                    <span className="text-neutral-extralight font-semibold">{page.pageName}</span>
                    <p className="text-xs text-neutral-extralight/70">Slug: {page.pageSlug}</p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button variant="outline" size="sm" asChild className="text-xs">
                      <Link href={`/admin/dashboard/pages/edit/${page.id}`}>
                        <Edit className="mr-1 h-3 w-3" /> Configure
                      </Link>
                    </Button>
                     <Link href={`/p/${page.pageSlug}`} target="_blank" legacyBehavior>
                        <a className="text-brand-primary hover:underline text-xs flex items-center">
                            <ExternalLink className="h-3 w-3 mr-1" /> View
                        </a>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-400 hover:text-red-300 hover:bg-neutral-medium/50"
                      onClick={() => handleDeletePage(page.id, page.pageName)}
                      aria-label={`Delete ${page.pageName}`}
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
