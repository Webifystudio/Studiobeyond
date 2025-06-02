
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, UserCircle2, Menu as MenuIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
  { href: '/genres', label: 'Genres' },
  { href: '/latest', label: 'Latest Updates' },
  { href: '/popular', label: 'Popular' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false); // Close mobile menu on route change
  }, [pathname]);

  return (
    <header className="bg-neutral-medium shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-3xl font-bold text-brand-primary font-inter">
            BEYOND SCANS
          </Link>

          <nav className="hidden md:flex space-x-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "text-neutral-extralight hover:text-brand-primary transition duration-300 font-inter",
                  pathname === item.href && "text-brand-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative hidden sm:block">
              <Input
                type="text"
                placeholder="Search manga..."
                className="bg-neutral-light text-neutral-extralight placeholder-neutral-extralight/70 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-300 w-40 lg:w-64 h-10"
              />
              <Search className="w-5 h-5 text-neutral-extralight absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            <Button variant="ghost" size="icon" aria-label="User Profile" className="rounded-full hover:bg-neutral-light text-neutral-extralight hover:text-brand-primary p-0">
              <UserCircle2 className="w-7 h-7" />
            </Button>
            
            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu" className="rounded-full hover:bg-neutral-light text-neutral-extralight hover:text-brand-primary p-0">
                  {isMobileMenuOpen ? <X className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="top" 
                className="bg-neutral-medium text-neutral-extralight p-0 h-auto border-b-neutral-light"
                // Remove default close button from SheetContent as we handle it with SheetClose and X icon
                onInteractOutside={(e) => {
                    // Prevent closing on click outside if menu icon was clicked
                    if ((e.target as HTMLElement)?.closest('[aria-label="Open menu"]')) {
                        e.preventDefault();
                    }
                }}
              >
                <div className="p-4 pt-6">
                   <div className="flex justify-between items-center mb-6 px-2">
                        <Link href="/" className="text-2xl font-bold text-brand-primary font-inter" onClick={() => setIsMobileMenuOpen(false)}>
                            BEYOND SCANS
                        </Link>
                        <SheetClose asChild>
                            <Button variant="ghost" size="icon" aria-label="Close menu" className="rounded-full hover:bg-neutral-light text-neutral-extralight hover:text-brand-primary p-0">
                                <X className="w-7 h-7" />
                            </Button>
                        </SheetClose>
                   </div>
                <nav className="flex flex-col space-y-1 items-center">
                  {navItems.map((item) => (
                     <SheetClose asChild key={item.label}>
                        <Link
                            href={item.href}
                            className={cn(
                                "block py-3 px-4 rounded-md text-neutral-extralight hover:bg-neutral-light hover:text-brand-primary transition duration-300 font-inter text-lg w-full text-center",
                                pathname === item.href && "bg-neutral-light text-brand-primary"
                            )}
                        >
                        {item.label}
                        </Link>
                    </SheetClose>
                  ))}
                  <div className="relative mt-4 w-full max-w-xs sm:hidden px-2">
                    <Input
                      type="text"
                      placeholder="Search manga..."
                      className="bg-neutral-light text-neutral-extralight placeholder-neutral-extralight/70 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-300 w-full h-10"
                    />
                    <Search className="w-5 h-5 text-neutral-extralight absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
