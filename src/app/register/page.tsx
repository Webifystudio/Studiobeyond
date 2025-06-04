
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createUserWithEmailAndPasswordFirebase, auth, type User as FirebaseUserType } from '@/lib/firebase'; 
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // If user is already logged in, redirect them from register page
        router.push('/'); 
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (username.trim().length < 3) {
      toast({ title: "Error", description: "Username must be at least 3 characters.", variant: "destructive" });
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        toast({ title: "Error", description: "Username can only contain letters, numbers, and underscores.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      await createUserWithEmailAndPasswordFirebase(email, password, username.trim());
      toast({ title: "Registration Successful", description: `Welcome, ${username.trim()}! You are now logged in.` });
      router.push('/'); // Redirect to home page after successful registration and login
    } catch (error: any) {
      console.error("Registration Error:", error);
      let description = "An unexpected error occurred during registration.";
      if (error.code === 'auth/email-already-in-use') {
        description = "This email is already registered. Try logging in.";
      } else if (error.code === 'auth/weak-password') {
        description = "Password is too weak. It should be at least 6 characters.";
      } else if (error.code === 'auth/invalid-email') {
        description = "The email address is not valid.";
      }
      toast({ title: "Registration Failed", description, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-dark p-4">
      <Card className="w-full max-w-md bg-neutral-medium border-neutral-light shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-brand-primary font-headline">Create Account</CardTitle>
          <CardDescription className="text-neutral-extralight/80 pt-2">
            Join BEYOND SCANS today!
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username-register" className="text-neutral-extralight">Username</Label>
              <Input 
                id="username-register" 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                className="bg-neutral-light border-neutral-light text-neutral-extralight"
                placeholder="Choose a username"
              />
              <p className="text-xs text-neutral-extralight/70">Min 3 characters. Letters, numbers, underscores.</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email-register" className="text-neutral-extralight">Email</Label>
              <Input 
                id="email-register" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="bg-neutral-light border-neutral-light text-neutral-extralight"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password-register" className="text-neutral-extralight">Password</Label>
              <div className="relative">
                <Input 
                  id="password-register" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="bg-neutral-light border-neutral-light text-neutral-extralight"
                  placeholder="Create a password (min. 6 characters)"
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
            <div className="space-y-1">
              <Label htmlFor="confirm-password-register" className="text-neutral-extralight">Confirm Password</Label>
               <div className="relative">
                <Input 
                  id="confirm-password-register" 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  className="bg-neutral-light border-neutral-light text-neutral-extralight"
                  placeholder="Confirm your password"
                />
                 <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-neutral-extralight hover:text-brand-primary"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex-col items-center text-center">
          <p className="text-sm text-neutral-extralight/90">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-brand-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
