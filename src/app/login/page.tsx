
"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithEmailAndPasswordFirebase, auth, type User as FirebaseUserType } from '@/lib/firebase'; 
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, LogIn } from 'lucide-react';

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
            Sign in with your email and password.
          </CardDescription>
        </CardHeader>
        
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
                {isSubmittingEmail ? 'Signing In...' : (<><LogIn className="mr-2 h-4 w-4" /> Sign In</>)}
            </Button>
            </CardContent>
        </form>
        
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
