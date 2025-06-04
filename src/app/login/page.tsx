
"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInWithGoogle, signInWithEmailAndPasswordFirebase, auth, type User as FirebaseUserType } from '@/lib/firebase'; 
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, LogIn } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        router.push('/'); 
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      const signInResult = await signInWithGoogle();
      if (!signInResult) {
        toast({
          title: "Login Canceled",
          description: "You closed the Google Sign-In window.",
          variant: "default",
        });
        return;
      }
      const { user, isNewUser, username } = signInResult;
      toast({ title: "Login Successful", description: `Welcome, ${user.displayName || 'User'}!` });
      if (isNewUser || !username) { 
        router.push('/profile/setup');
      } else {
        router.push('/'); 
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({ 
        title: "Login Failed", 
        description: error.message || "An unexpected error occurred during Google sign-in.", 
        variant: "destructive" 
      });
    }
  };

  const handleEmailPasswordSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingEmail(true);
    try {
      await signInWithEmailAndPasswordFirebase(email, password);
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push('/');
    } catch (error: any) {
      console.error("Email/Password Sign-In Error:", error);
      let description = "An unexpected error occurred.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Invalid email or password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        description = "The email address is not valid.";
      }
      toast({ title: "Login Failed", description, variant: "destructive" });
    }
    setIsSubmittingEmail(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-dark p-4">
      <Card className="w-full max-w-md bg-neutral-medium border-neutral-light shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-brand-primary font-headline">BEYOND SCANS</CardTitle>
          <CardDescription className="text-neutral-extralight/80 pt-2">
            Sign in or create an account to continue.
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-neutral-light mb-6">
            <TabsTrigger value="google" className="data-[state=active]:bg-brand-primary/20 data-[state=active]:text-brand-primary">Google</TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-brand-primary/20 data-[state=active]:text-brand-primary">Email/Password</TabsTrigger>
          </TabsList>

          <TabsContent value="google">
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGoogleSignIn} 
                className="w-full bg-white hover:bg-neutral-200 text-neutral-dark font-medium py-3"
                variant="outline"
              >
                <GoogleIcon className="mr-3 h-5 w-5" /> Sign in with Google
              </Button>
            </CardContent>
          </TabsContent>

          <TabsContent value="email">
            <form onSubmit={handleEmailPasswordSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email-login" className="text-neutral-extralight">Email</Label>
                  <Input 
                    id="email-login" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="bg-neutral-light border-neutral-light text-neutral-extralight"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password-login" className="text-neutral-extralight">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password-login" 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="bg-neutral-light border-neutral-light text-neutral-extralight"
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-neutral-extralight hover:text-brand-primary"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white" disabled={isSubmittingEmail}>
                  {isSubmittingEmail ? 'Signing In...' : 'Sign In'}
                </Button>
              </CardContent>
            </form>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4 bg-neutral-light" />

        <CardFooter className="flex-col items-center text-center space-y-3">
          <p className="text-sm text-neutral-extralight/90">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-brand-primary hover:underline">
              Register here
            </Link>
          </p>
           <p className="text-xs text-neutral-extralight/60">
            By signing in or creating an account, you agree to our <Link href="/terms" className="underline hover:text-brand-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-brand-primary">Privacy Policy</Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
