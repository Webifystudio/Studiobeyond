
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db, doc, getDoc, updateDoc, setDoc } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import type { User } from 'firebase/auth';

export default function ProfileSetupPage() {
  const [username, setUsername] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        // Check if user already has a username
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data()?.username) {
          // User already has a username, redirect away from setup
          router.push('/');
        } else {
          setIsLoading(false);
        }
      } else {
        // No user logged in, redirect to login
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSetupProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !username.trim()) {
      toast({ title: "Error", description: "Username cannot be empty.", variant: "destructive" });
      return;
    }
    if (username.trim().length < 3) {
      toast({ title: "Error", description: "Username must be at least 3 characters.", variant: "destructive" });
      return;
    }
    // Basic alphanumeric check for username (can be expanded)
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        toast({ title: "Error", description: "Username can only contain letters, numbers, and underscores.", variant: "destructive" });
        return;
    }


    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, {
          username: username.trim(),
          // photoURL: currentUser.photoURL, // Optionally update photoURL if it changed
        });
      } else {
         // This case should ideally be handled by the initial Google Sign-in user creation
         // but as a fallback:
        await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            username: username.trim(),
            createdAt: serverTimestamp(),
        });
      }
      
      toast({ title: "Profile Setup Complete", description: `Welcome, ${username.trim()}!` });
      router.push('/'); 
    } catch (error: any) {
      console.error("Error setting up profile: ", error);
      toast({ title: "Error", description: error.message || "Could not set up profile.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-dark">
        <p className="text-white">Loading profile setup...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-dark p-4">
      <Card className="w-full max-w-md bg-neutral-medium border-neutral-light shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brand-primary font-headline">Setup Your Profile</CardTitle>
          <CardDescription className="text-neutral-extralight/80 pt-2">
            Choose a unique username to get started.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSetupProfile}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-neutral-extralight">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
                placeholder="e.g., MangaMaster"
              />
              <p className="text-xs text-neutral-extralight/70">
                Min 3 characters. Letters, numbers, and underscores only.
              </p>
            </div>
          </CardContent>
          <CardContent>
            <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Complete Setup'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
