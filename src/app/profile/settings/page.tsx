
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db, doc, getDoc, updateDoc, type User } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  const [username, setUsername] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null); // To store Firestore user data
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
          setUserData(dbUser);
          setUsername(dbUser.username || user.displayName || '');
          setNewPhotoURL(dbUser.photoURL || user.photoURL || '');
        } else {
           // Should not happen if profile setup was completed
           toast({title: "Error", description: "User data not found.", variant: "destructive"});
           router.push('/');
        }
        setIsLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);

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
      };
      if (newPhotoURL.trim() && newPhotoURL.trim() !== (userData?.photoURL || currentUser.photoURL)) {
        updates.photoURL = newPhotoURL.trim();
        // Note: Firebase Auth profile photoURL update is separate if needed
        // await updateProfile(currentUser, { photoURL: newPhotoURL.trim() });
      }

      await updateDoc(userDocRef, updates);
      
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
      // Optionally refetch user data or rely on auth state listener to update UI if photoURL in auth object changed
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

  if (!currentUser) return null; // Should be redirected by useEffect

  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      {/* We can add a simplified header or no header if this page is modal-like */}
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
          <form onSubmit={handleProfileUpdate}>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={newPhotoURL || currentUser.photoURL || undefined} alt={username || currentUser.displayName || "User"} />
                  <AvatarFallback className="bg-brand-primary text-white text-3xl">
                    {getInitials(username || currentUser.displayName)}
                  </AvatarFallback>
                </Avatar>
                 <p className="text-xs text-neutral-extralight/70">
                    Upload image to <a href="https://imgbb.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">ImgBB</a> and paste URL below.
                </p>
              </div>
               <div>
                <Label htmlFor="newPhotoURL" className="text-neutral-extralight">Profile Picture URL</Label>
                <Input
                  id="newPhotoURL"
                  type="url"
                  value={newPhotoURL}
                  onChange={(e) => setNewPhotoURL(e.target.value)}
                  className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
                  placeholder="https://i.ibb.co/your-image.jpg"
                />
              </div>
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
            </CardContent>
            <CardContent>
              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white" disabled={isSaving}>
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  );
}
