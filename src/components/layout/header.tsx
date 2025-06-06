
"use client";

import Link from 'next/link';
import { useState, useEffect, type KeyboardEvent } from 'react';
import { Search, Menu as MenuIcon, X, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { auth, signOut, onAuthStateChanged, type User as FirebaseUser } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItemsBase = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
  { href: '/popular', label: 'Popular' },
  { href: '/news', label: 'News' },
];

interface HeaderProps {
  transparentOnTop?: boolean;
}

export function Header({ transparentOnTop = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false); // Only used if transparentOnTop is false
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

  useEffect(() => {
    if (transparentOnTop) {
      // For always transparent header, scroll state doesn't change background
      setIsScrolled(false); // Keep it false so dynamic classes for text/icons use "transparent" state
      return;
    }

    // Original scroll logic for non-transparentOnTop headers
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll(); 
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparentOnTop]);

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
    if ((e as KeyboardEvent<HTMLInputElement>).key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (searchTerm.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm('');
      }
    }
  };
  
  const handleMobileSearchSubmit = () => {
     if (searchTerm.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm(''); 
        setIsMobileMenuOpen(false);
      }
  }

  const currentNavItems = currentUser 
    ? [...navItemsBase, { href: '/profile/settings', label: 'Profile' }]
    : navItemsBase;

  // Determine classes based on transparency and scroll state
  const isEffectivelyTransparent = transparentOnTop; // Always transparent if transparentOnTop is true

  const headerBgClass = isEffectivelyTransparent ? "bg-transparent" : "bg-neutral-medium shadow-lg";
  const textColorClass = isEffectivelyTransparent ? "text-white" : "text-neutral-extralight";
  const searchBgClass = isEffectivelyTransparent ? "bg-white/20 placeholder-white/70 text-white focus:bg-white/30" : "bg-neutral-light text-neutral-extralight placeholder-neutral-extralight/70";
  const searchIconColorClass = isEffectivelyTransparent ? "text-white/80" : "text-neutral-extralight";
  const userButtonHoverClass = isEffectivelyTransparent ? "hover:bg-white/20" : "hover:bg-neutral-light";
  const mobileMenuBgClass = isEffectivelyTransparent ? "bg-black/80 backdrop-blur-md" : "bg-neutral-medium";


  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
      headerBgClass
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className={cn("text-3xl font-bold text-brand-primary font-inter whitespace-nowrap", textColorClass)}>
            BEYOND SCANS
          </Link>

          <nav className="hidden md:flex space-x-6 items-center">
            {currentNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "hover:text-brand-primary transition duration-300 font-inter",
                  textColorClass, 
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
                className={cn(
                  "placeholder-neutral-extralight/70 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-300 w-40 lg:w-64 h-10",
                  searchBgClass
                )}
              />
              <Search className={cn(
                "w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none",
                 searchIconColorClass
                )} 
              />
            </div>
            
            {isLoadingAuth ? (
              <div className={cn("h-10 w-10 rounded-full animate-pulse", isEffectivelyTransparent ? "bg-white/20" : "bg-neutral-light")} />
            ) : currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className={cn("relative h-9 w-9 rounded-full p-0", userButtonHoverClass)}>
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
                    <UserIcon className="mr-2 h-4 w-4" /> Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:!bg-neutral-light focus:!bg-neutral-light text-red-400 hover:!text-red-300 focus:!text-red-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild className={cn(
                "hover:text-brand-primary",
                textColorClass,
                userButtonHoverClass
                )}>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
            )}
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu" className={cn(
                  "rounded-full p-0 hover:text-brand-primary",
                   textColorClass,
                   userButtonHoverClass
                  )}>
                  {isMobileMenuOpen ? <X className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="top" 
                className={cn(
                  "text-neutral-extralight p-0 h-auto border-b-neutral-light",
                  mobileMenuBgClass
                  )}
                onInteractOutside={(e) => {
                    if ((e.target as HTMLElement)?.closest('[aria-label="Open menu"]')) {
                        e.preventDefault();
                    }
                }}
              >
                <SheetHeader className="p-4 border-b border-neutral-light sr-only">
                  <SheetTitle>Main Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="p-4 pt-2">
                   <div className="flex justify-between items-center mb-6 px-2">
                        <Link href="/" className="text-2xl font-bold text-brand-primary font-inter whitespace-nowrap" onClick={() => setIsMobileMenuOpen(false)}>
                            BEYOND SCANS
                        </Link>
                        <SheetClose asChild>
                            <Button variant="ghost" size="icon" aria-label="Close menu" className={cn("rounded-full text-neutral-extralight hover:text-brand-primary p-0", isEffectivelyTransparent ? "hover:bg-white/10" : "hover:bg-neutral-light")}>
                                <X className="w-7 h-7" />
                            </Button>
                        </SheetClose>
                   </div>
                  <nav className="flex flex-col space-y-1 items-center">
                    {currentNavItems.map((item) => (
                       <SheetClose asChild key={item.label}>
                          <Link
                              href={item.href}
                              className={cn(
                                  "block py-3 px-4 rounded-md text-neutral-extralight hover:text-brand-primary transition duration-300 font-inter text-lg w-full text-center",
                                  isEffectivelyTransparent ? "hover:bg-white/10" : "hover:bg-neutral-light",
                                  pathname === item.href && (isEffectivelyTransparent ? "bg-white/10 text-brand-primary" : "bg-neutral-light text-brand-primary")
                              )}
                          >
                          {item.label}
                          </Link>
                      </SheetClose>
                    ))}
                    <div className="relative mt-4 w-full max-w-xs px-2">
                      <Input
                        type="text"
                        placeholder="Search manga..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleMobileSearchSubmit(); }}
                        className={cn(
                           "rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-brand-primary transition duration-300 w-full h-10",
                           searchBgClass
                           )}
                      />
                      <Search className={cn("w-5 h-5 absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none", searchIconColorClass)} />
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

