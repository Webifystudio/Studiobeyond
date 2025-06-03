
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { signInWithGoogle, auth } from '@/lib/firebase'; // Assuming auth is exported for onAuthStateChanged
import { useToast } from "@/hooks/use-toast";
import { ChromeIcon } from 'lucide-react'; // Or a Google G icon SVG
import Link from 'next/link'; // Added this import

// Custom Google Icon SVG
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" {...props}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If user is already logged in, redirect them from login page
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        router.push('/'); // Or to dashboard, or wherever you prefer
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      const { user, isNewUser, username } = await signInWithGoogle();
      toast({ title: "Login Successful", description: `Welcome, ${user.displayName}!` });
      if (isNewUser || !username) { // Check if username is missing even for existing user
        router.push('/profile/setup');
      } else {
        router.push('/'); // Or to a specific dashboard page
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({ title: "Login Failed", description: error.message || "Could not sign in with Google.", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-dark p-4">
      <Card className="w-full max-w-md bg-neutral-medium border-neutral-light shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-brand-primary font-headline">BEYOND SCANS</CardTitle>
          <CardDescription className="text-neutral-extralight/80 pt-2">
            Sign in to access your account and more features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full bg-white hover:bg-neutral-200 text-neutral-dark font-medium py-3"
            variant="outline"
          >
            <GoogleIcon className="mr-3 h-5 w-5" /> Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex-col items-center text-center">
           <p className="text-xs text-neutral-extralight/60 mt-4">
            By signing in, you agree to our <Link href="/terms" className="underline hover:text-brand-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-brand-primary">Privacy Policy</Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
