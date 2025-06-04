
"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db, doc, getDoc, updateDoc, updateAuthProfile, type User } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, UploadCloud } from 'lucide-react';
import Link from 'next/link';

const IMGBB_API_KEY = "2bb2346a6a907388d8a3b0beac2bca86";

export default function ProfileSettingsPage() {
  const [username, setUsername] = useState('');
  const [currentPhotoURL, setCurrentPhotoURL] = useState(''); // For displaying current/new photo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const dbUser = userDocSnap.data();
          setUsername(dbUser.username || user.displayName || '');
          setCurrentPhotoURL(dbUser.photoURL || user.photoURL || '');
        } else {
           toast({title: "Error", description: "User data not found. Please complete profile setup if you haven't.", variant: "destructive"});
           router.push('/profile/setup'); // Or redirect to home if setup is assumed
        }
        setIsLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Optionally, show a local preview if desired, though ImgBB is quick
      // setCurrentPhotoURL(URL.createObjectURL(e.target.files[0]));
    } else {
      setSelectedFile(null);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !currentUser) {
      toast({ title: "No File", description: "Please select an image file first.", variant: "default" });
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('key', IMGBB_API_KEY);

    try {
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        const newImgbbUrl = result.data.display_url;
        setCurrentPhotoURL(newImgbbUrl); // Update display immediately
        
        // Update Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { photoURL: newImgbbUrl });

        // Optionally, update Firebase Auth user profile (less critical if app reads from Firestore)
        if (auth.currentUser) {
            await updateAuthProfile(auth.currentUser, { photoURL: newImgbbUrl });
        }

        toast({ title: "Profile Picture Updated", description: "Your new profile picture is set." });
        setSelectedFile(null); // Clear selected file
        const fileInput = document.getElementById('profilePictureFile') as HTMLInputElement | null;
        if (fileInput) fileInput.value = '';

      } else {
        throw new Error(result.error?.message || 'ImgBB upload failed');
      }
    } catch (error: any) {
      console.error("Error uploading image to ImgBB: ", error);
      toast({ title: "Upload Error", description: error.message || "Could not upload image.", variant: "destructive" });
    }
    setIsUploading(false);
  };


  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!username.trim() || username.trim().length < 3) {
      toast({ title: "Error", description: "Username must be at least 3 characters.", variant: "destructive" });
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        toast({ title: "Error", description: "Username can only contain letters, numbers, and underscores.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const updates: any = {
        username: username.trim(),
        // photoURL is handled by handleImageUpload now
      };

      await updateDoc(userDocRef, updates);
      
      // Optionally, update Firebase Auth displayName if it's different
      if (auth.currentUser && auth.currentUser.displayName !== username.trim()) {
        await updateAuthProfile(auth.currentUser, { displayName: username.trim() });
      }
      
      toast({ title: "Profile Updated", description: "Your username has been updated successfully." });
    } catch (error: any) {
      console.error("Error updating profile: ", error);
      toast({ title: "Error", description: error.message || "Could not update profile.", variant: "destructive" });
    }
    setIsSaving(false);
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || "?";
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-dark">
        <p className="text-white">Loading profile settings...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <Card className="w-full max-w-lg mx-auto bg-neutral-medium border-neutral-light shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-brand-primary font-headline">Profile Settings</CardTitle>
            <CardDescription className="text-neutral-extralight/80 pt-2">
              Update your username and profile picture.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src={currentPhotoURL || undefined} alt={username || currentUser.displayName || "User"} />
                <AvatarFallback className="bg-brand-primary text-white text-3xl">
                  {getInitials(username || currentUser.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="w-full space-y-2">
                <Label htmlFor="profilePictureFile" className="text-neutral-extralight">Change Profile Picture</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Input
                    id="profilePictureFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-neutral-light border-neutral-light text-neutral-extralight flex-grow file:text-sm file:font-medium file:text-brand-primary file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-brand-primary/20 hover:file:bg-brand-primary/30"
                  />
                  <Button 
                    type="button" 
                    onClick={handleImageUpload} 
                    disabled={!selectedFile || isUploading || isSaving} 
                    className="bg-accent hover:bg-accent/80 text-accent-foreground shrink-0 w-full sm:w-auto"
                  >
                    <UploadCloud className="mr-2 h-4 w-4" /> {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
                {selectedFile && <p className="text-xs text-neutral-extralight/70">Selected: {selectedFile.name}</p>}
              </div>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
               <div>
                <Label htmlFor="username" className="text-neutral-extralight">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
                />
                 <p className="text-xs text-neutral-extralight/70 mt-1">
                    Min 3 characters. Letters, numbers, and underscores only.
                </p>
              </div>
              <div>
                <Label htmlFor="email" className="text-neutral-extralight">Email (cannot be changed)</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentUser.email || ''}
                  disabled
                  className="bg-neutral-light border-neutral-light text-neutral-extralight/70 focus:ring-brand-primary"
                />
              </div>
              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white" disabled={isSaving || isUploading}>
                {isSaving ? 'Saving Username...' : 'Save Username'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
