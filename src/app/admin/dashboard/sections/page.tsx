
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, List, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { db, serverTimestamp, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from '@/lib/firebase';
import { generateSlug } from '@/lib/utils';

interface Section {
  id: string;
  name: string;
  slug: string;
  createdAt: Timestamp;
}

export default function ManageSectionsPage() {
  const [sectionName, setSectionName] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const sectionsCollection = collection(db, 'sections');
      const q = query(sectionsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const sectionsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Section));
      setSections(sectionsList);
    } catch (error) {
      console.error("Error fetching sections: ", error);
      toast({ title: "Error", description: "Could not fetch sections.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleAddSection = async (e: FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim()) {
      toast({ title: "Error", description: "Section name cannot be empty.", variant: "destructive" });
      return;
    }
    const slug = generateSlug(sectionName.trim());
    if (!slug) {
        toast({ title: "Error", description: "Could not generate a valid slug for the section name.", variant: "destructive" });
        return;
    }

    try {
      await addDoc(collection(db, 'sections'), {
        name: sectionName.trim(),
        slug: slug, // Storing slug in case it's needed later for direct linking or querying
        createdAt: serverTimestamp()
        // mangaIds: [] // Initialize as empty, to be populated later
      });
      toast({ title: "Section Added", description: `Section "${sectionName}" added successfully. You can now assign manga to it.` });
      setSectionName('');
      fetchSections(); 
    } catch (error) {
      console.error("Error adding section: ", error);
      toast({ title: "Error", description: "Could not add section.", variant: "destructive" });
    }
  };

  const handleDeleteSection = async (sectionId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete section "${name}"? This action cannot be undone.`)) {
        return;
    }
    try {
        await deleteDoc(doc(db, "sections", sectionId));
        toast({ title: "Section Deleted", description: `Section "${name}" deleted successfully.` });
        fetchSections(); 
    } catch (error) {
        console.error("Error deleting section: ", error);
        toast({ title: "Error", description: "Could not delete section.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold text-white font-headline">Manage Homepage Sections</h1>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <PlusCircle className="mr-2 h-5 w-5 text-brand-primary" /> Add New Section
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Create a new section to display on the homepage (e.g., "Staff Picks", "Award Winners"). Manga can be assigned later.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAddSection}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sectionName" className="text-neutral-extralight">Section Name</Label>
              <Input
                id="sectionName"
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g., Staff Picks, Hidden Gems"
                className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
              />
            </div>
            <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/80 text-white w-full sm:w-auto">
              Add Section
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-white font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-brand-primary" /> Existing Sections
          </CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            List of currently created homepage sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-neutral-extralight/70">Loading sections...</p>
          ) : sections.length === 0 ? (
            <p className="text-neutral-extralight/70">No sections created yet.</p>
          ) : (
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-neutral-light rounded-md shadow gap-2 sm:gap-0">
                  <div className="flex-grow">
                    <span className="text-neutral-extralight">{section.name}</span>
                    <p className="text-xs text-neutral-extralight/70">Slug: {section.slug}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-400 hover:text-red-300 hover:bg-neutral-medium/50 self-end sm:self-center"
                    onClick={() => handleDeleteSection(section.id, section.name)}
                    aria-label={`Delete ${section.name}`}
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

