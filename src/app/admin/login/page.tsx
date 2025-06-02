
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const ADMIN_PASSWORD = "085608"; // Highly insecure, for prototype only!

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('isAdminAuthenticated') === 'true') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('isAdminAuthenticated', 'true');
      }
      router.push('/admin/dashboard');
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-dark p-4">
      <Card className="w-full max-w-md bg-neutral-medium border-neutral-light shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-brand-primary font-headline">BEYOND SCANS Admin</CardTitle>
          <CardDescription className="text-neutral-extralight/80">
            Please enter the password to access the admin area.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-extralight">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-neutral-light border-neutral-light text-neutral-extralight focus:ring-brand-primary"
                  placeholder="Enter admin password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-neutral-extralight hover:text-brand-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
             <p className="text-xs text-neutral-extralight/60">
              Note: For prototype purposes, the password is '085608'. In a real application, use a secure authentication system.
            </p>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
