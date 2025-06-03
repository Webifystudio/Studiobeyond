
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db, serverTimestamp } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import Link from 'next/link';

interface CustomPageData {
  pageName: string;
  pageSlug: string;
  title: string;
  description: string;
  author: string;
  category: string;
  landingImageUrl: string;
  dataAiHint: string;
  views: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const initialPageDetails: CustomPageData = {
  pageName: '',
  pageSlug: '',
  title: '',
  description: '',
  author: '',
  category: '',
  landingImageUrl: '',
  dataAiHint: '',
  views: 0,
};

export default function EditCustomPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.pageId as string;

  const [pageDetails, setPageDetails] = useState<CustomPageData>(initialPageDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (pageId) {
      const fetchPageData = async () => {
        setIsLoading(true);
        try {
          const pageRef = doc(db, 'customPages', pageId);
          const docSnap = await getDoc(pageRef);
          if (docSnap.exists()) {
            setPageDetails(docSnap.data() as CustomPageData);
          } else {
            toast({ title: "Error", description: "Page not found.", variant: "destructive" });
            router.push('/admin/dashboard/pages');
          }
        } catch (error) {
          console.error("Error fetching page data: ", error);
          toast({ title: "Error", description: "Could not fetch page data.", variant: "destructive" });
        }
        setIsLoading(false);
      };
      fetchPageData();
    }
  }, [pageId, toast, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPageDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const pageRef = doc(db, 'customPages', pageId);
      await updateDoc(pageRef, {
        ...pageDetails,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Page Updated", description: `Page "${pageDetails.title}" updated successfully.` });
      router.push('/admin/dashboard/pages');
    } catch (error) {
      console.error("Error updating page: ", error);
      toast({ title: "Error", description: "Could not update page.", variant: "destructive" });
    }
    setIsSaving(false);
  };
  
  if (isLoading) {
    return <div className="text-center text-neutral-extralight p-10">Loading page details...</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-headline flex items-center">
           Configure Page: <span className="text-brand-primary ml-2 truncate max-w-xs sm:max-w-md">{pageDetails.pageName}</span>
        </h1>
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href="/admin/dashboard/pages">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pages
                </Link>
            </Button>
             <Button variant="outline" asChild>
                <Link href={`/p/${pageDetails.pageSlug}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" /> View Public Page
                </Link>
            </Button>
        </div>
      </div>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline">Page Settings</CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Modify the content and appearance of this custom page.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveChanges}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-neutral-extralight">Page Title</Label>
              <Input id="title" name="title" type="text" value={pageDetails.title} onChange={handleChange} placeholder="Title displayed on the page" required className="bg-neutral-light text-neutral-extralight" />
            </div>
            <div>
              <Label htmlFor="description" className="text-neutral-extralight">Description</Label>
              <Textarea id="description" name="description" value={pageDetails.description} onChange={handleChange} placeholder="Page content or summary" className="bg-neutral-light text-neutral-extralight min-h-[120px]" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="author" className="text-neutral-extralight">Author (Optional)</Label>
                    <Input id="author" name="author" type="text" value={pageDetails.author} onChange={handleChange} placeholder="e.g., John Doe" className="bg-neutral-light text-neutral-extralight" />
                </div>
                <div>
                    <Label htmlFor="category" className="text-neutral-extralight">Category (Optional)</Label>
                    <Input id="category" name="category" type="text" value={pageDetails.category} onChange={handleChange} placeholder="e.g., Featured, Announcement" className="bg-neutral-light text-neutral-extralight" />
                </div>
            </div>
            <div>
              <Label htmlFor="landingImageUrl" className="text-neutral-extralight">Landing Image URL (Optional)</Label>
              <Input id="landingImageUrl" name="landingImageUrl" type="url" value={pageDetails.landingImageUrl} onChange={handleChange} placeholder="https://placehold.co/1200x600.png" className="bg-neutral-light text-neutral-extralight" />
               <p className="text-xs text-neutral-extralight/70 mt-1">
                Upload your image to a service like <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">ImgBB</a> and paste the direct image URL here.
              </p>
            </div>
            <div>
              <Label htmlFor="dataAiHint" className="text-neutral-extralight">AI Image Hint (Optional)</Label>
              <Input id="dataAiHint" name="dataAiHint" type="text" value={pageDetails.dataAiHint} onChange={handleChange} placeholder="e.g., epic battle scene anime" className="bg-neutral-light text-neutral-extralight" />
            </div>
            
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white w-full sm:w-auto" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
