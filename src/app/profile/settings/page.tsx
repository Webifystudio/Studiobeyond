
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
import { ArrowLeft, UploadCloud, Palette, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // For horizontal scrolling

const IMGBB_API_KEY = "2bb2346a6a907388d8a3b0beac2bca86";

export default function ProfileSettingsPage() {
  const [username, setUsername] = useState('');
  const [currentPhotoURL, setCurrentPhotoURL] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { theme: activeTheme, setThemeById, availableThemes } = useTheme();


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
           router.push('/profile/setup');
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
        setCurrentPhotoURL(newImgbbUrl); 
        
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { photoURL: newImgbbUrl });

        if (auth.currentUser) {
            await updateAuthProfile(auth.currentUser, { photoURL: newImgbbUrl });
        }

        toast({ title: "Profile Picture Updated", description: "Your new profile picture is set." });
        setSelectedFile(null);
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
      };

      await updateDoc(userDocRef, updates);
      
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">Loading profile settings...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <Card className="w-full max-w-3xl mx-auto bg-card border-border shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary font-headline">Profile Settings</CardTitle>
            <CardDescription className="text-muted-foreground pt-2">
              Manage your account details and application appearance.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-10">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4 font-headline">Account Information</h2>
              <div className="flex flex-col items-center space-y-3 mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentPhotoURL || undefined} alt={username || currentUser.displayName || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {getInitials(username || currentUser.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full space-y-2 max-w-md">
                  <Label htmlFor="profilePictureFile" className="text-foreground">Change Profile Picture</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Input
                      id="profilePictureFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="bg-input border-border text-foreground flex-grow file:text-sm file:font-medium file:text-primary file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:bg-primary/20 hover:file:bg-primary/30"
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
                  {selectedFile && <p className="text-xs text-muted-foreground">Selected: {selectedFile.name}</p>}
                </div>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md mx-auto">
                 <div>
                  <Label htmlFor="username" className="text-foreground">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    className="bg-input border-border text-foreground focus:ring-ring"
                  />
                   <p className="text-xs text-muted-foreground mt-1">
                      Min 3 characters. Letters, numbers, and underscores only.
                  </p>
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground">Email (cannot be changed)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={currentUser.email || ''}
                    disabled
                    className="bg-input border-border text-muted-foreground focus:ring-ring"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/80 text-primary-foreground" disabled={isSaving || isUploading}>
                  {isSaving ? 'Saving Username...' : 'Save Username'}
                </Button>
              </form>
            </section>

            <Separator className="my-8 bg-border" />

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-1 font-headline flex items-center">
                <Palette className="mr-3 h-6 w-6 text-primary" /> Application Theme
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Select a theme to change the application's appearance.</p>
              
              <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex space-x-4 p-1 pb-4">
                  {availableThemes.map((themeOption) => (
                    <div
                      key={themeOption.id}
                      onClick={() => setThemeById(themeOption.id)}
                      className={cn(
                        "group relative w-48 h-64 shrink-0 rounded-lg border-2 p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 ease-in-out overflow-hidden focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring",
                        activeTheme.id === themeOption.id ? 'border-primary ring-2 ring-primary shadow-lg' : 'border-border hover:border-muted-foreground/70 hover:shadow-md'
                      )}
                      style={{
                        background: themeOption.backgroundGradient || `hsl(${themeOption.colors.background})`,
                        color: `hsl(${themeOption.colors.foreground})`,
                        fontFamily: themeOption.fontFamilyBody || 'Inter, sans-serif'
                      }}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setThemeById(themeOption.id); }}
                    >
                      <div className="flex-grow">
                        <h3 
                          className="text-lg font-semibold mb-2 truncate"
                          style={{ fontFamily: themeOption.fontFamilyHeadline || 'Inter, sans-serif', color: `hsl(${themeOption.colors.primary})` }}
                        >
                          {themeOption.name}
                        </h3>
                        <p className="text-xs mb-1" style={{ fontFamily: themeOption.fontFamilyHeadline || 'Inter, sans-serif' }}>Headline: Aa Bb Cc</p>
                        <p className="text-xs" style={{ fontFamily: themeOption.fontFamilyBody || 'Inter, sans-serif' }}>Body: Lorem ipsum dolor sit.</p>
                      </div>

                      <div className="mt-auto space-y-1">
                         <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: `hsl(${themeOption.colors.primary})` }}></div>
                            <span className="text-xs opacity-80">Primary</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: `hsl(${themeOption.colors.accent})` }}></div>
                            <span className="text-xs opacity-80">Accent</span>
                        </div>
                         <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: `hsl(${themeOption.colors.card})` }}></div>
                            <span className="text-xs opacity-80">Card</span>
                        </div>
                      </div>

                      {activeTheme.id === themeOption.id && (
                        <div className="absolute top-2 right-2 p-1 bg-primary/80 text-primary-foreground rounded-full">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}

    