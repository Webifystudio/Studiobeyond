
"use client";

import Link from 'next/link';
import { useState, useEffect, type KeyboardEvent } from 'react'; // Added KeyboardEvent
import { Search, Menu as MenuIcon, X, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation'; // useRouter imported
import { auth, signOut, onAuthStateChanged, type User } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
  { href: '/genres', label: 'Genres' },
  { href: '/latest', label: 'Latest Updates' },
  { href: '/popular', label: 'Popular' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false); 
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    router.push('/'); 
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase() || "?";
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  };

  const handleSearch = (e: KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    // Check if it's a KeyboardEvent and if 'Enter' was pressed, or if it's a MouseEvent (for a potential future search button)
    if ((e as KeyboardEvent<HTMLInputElement>).key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (searchTerm.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm(''); // Optionally clear search term after navigation
      }
    }
  };
  
  const handleMobileSearchSubmit = () => {
     if (searchTerm.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm(''); 
        setIsMobileMenuOpen(false); // Close mobile menu
      }
  }


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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                className="bg-neutral-light text-neutral-extralight placeholder-neutral-extralight/70 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-300 w-40 lg:w-64 h-10"
              />
              <Search className="w-5 h-5 text-neutral-extralight absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            
            {isLoadingAuth ? (
              <div className="h-10 w-10 rounded-full bg-neutral-light animate-pulse" />
            ) : currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User"} />
                      <AvatarFallback className="bg-brand-primary text-white">
                        {getInitials(currentUser.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-neutral-medium border-neutral-light text-neutral-extralight" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">
                        {currentUser.displayName || "User"}
                      </p>
                      <p className="text-xs leading-none text-neutral-extralight/70">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-neutral-light" />
                  <DropdownMenuItem onClick={() => router.push('/profile/settings')} className="cursor-pointer hover:!bg-neutral-light focus:!bg-neutral-light">
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:!bg-neutral-light focus:!bg-neutral-light text-red-400 hover:!text-red-300 focus:!text-red-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild className="text-neutral-extralight hover:text-brand-primary hover:bg-neutral-light">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
            )}
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu" className="rounded-full hover:bg-neutral-light text-neutral-extralight hover:text-brand-primary p-0">
                  {isMobileMenuOpen ? <X className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="top" 
                className="bg-neutral-medium text-neutral-extralight p-0 h-auto border-b-neutral-light"
                onInteractOutside={(e) => {
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleMobileSearchSubmit(); }}
                        className="bg-neutral-light text-neutral-extralight placeholder-neutral-extralight/70 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-300 w-full h-10"
                      />
                      <Search className="w-5 h-5 text-neutral-extralight absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                       {/* Optional: Add a search button for mobile if Enter key is not intuitive enough */}
                       {/* <Button onClick={handleMobileSearchSubmit} size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                           <Search className="w-5 h-5" />
                       </Button> */}
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
