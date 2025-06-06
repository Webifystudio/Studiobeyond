
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, BookOpen, Image as ImageIcon, LogOut, Home, FileText, Settings, Menu as MenuIcon, Tag, ListChecks, LayoutGrid as SectionsIcon, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/dashboard/categories', label: 'Manage Categories', icon: ListChecks },
  { href: '/admin/dashboard/mangas', label: 'Manage Mangas', icon: BookOpen },
  { href: '/admin/dashboard/genres', label: 'Manage Genres', icon: Tag },
  { href: '/admin/dashboard/news', label: 'Manage News', icon: Newspaper },
  { href: '/admin/dashboard/slider', label: 'Manage Slider', icon: ImageIcon },
  { href: '/admin/dashboard/pages', label: 'Manage Pages', icon: FileText },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined' && localStorage.getItem('isAdminAuthenticated') !== 'true') {
      router.replace('/admin/login');
    }
  }, [router]);

   useEffect(() => {
    setIsMobileMenuOpen(false); 
  }, [pathname]);


  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdminAuthenticated');
    }
    router.push('/admin/login');
  };

  if (!isMounted || (typeof window !== 'undefined' && localStorage.getItem('isAdminAuthenticated') !== 'true' && !pathname.endsWith('/admin/login'))) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-dark">
            <p className="text-white">Loading or redirecting...</p>
        </div>
    );
  }

  const sidebarContent = (isMobile: boolean = false) => (
    <>
      <div className="mb-8 px-4 pt-4 md:pt-0">
        <Link href="/admin/dashboard" className="text-2xl font-bold text-brand-primary font-inter">
          BEYOND SCANS Admin
        </Link>
      </div>
      <ScrollArea className="flex-grow px-2 md:px-0">
        <nav className="space-y-2">
          {navItems.map((item) => (
             isMobile ? (
                <SheetClose asChild key={`${item.label}-mobile`}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center w-full justify-start p-3 rounded-md",
                      (pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))) ? "bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30" : "hover:bg-neutral-light hover:text-white text-neutral-extralight"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </SheetClose>
              ) : (
              <Button
                key={item.label}
                variant={pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href)) ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start",
                  (pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))) ? "bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30" : "hover:bg-neutral-light hover:text-white"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
              )
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto space-y-2 p-4 md:p-0 md:pt-4">
           {isMobile ? (
             <>
                <SheetClose asChild>
                    <Link href="/" className="flex items-center w-full justify-start p-3 rounded-md hover:bg-neutral-light hover:text-white text-neutral-extralight border border-neutral-light">
                        <Home className="mr-2 h-4 w-4" />
                        Back to Site
                    </Link>
                </SheetClose>
                <Button
                    variant="destructive"
                    className="w-full justify-start bg-red-600/80 hover:bg-red-500/80 text-white p-3"
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
             </>
           ) : (
             <>
                <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-neutral-light hover:text-white"
                    asChild
                >
                    <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Site
                    </Link>
                </Button>
                <Button
                    variant="destructive"
                    className="w-full justify-start bg-red-600/80 hover:bg-red-500/80 text-white"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
             </>
           )}
      </div>
    </>
  );


  return (
    <div className="flex min-h-screen bg-neutral-dark text-neutral-extralight">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-neutral-medium border-r border-neutral-light p-4 flex-col hidden md:flex">
        {sidebarContent()}
      </aside>

      {/* Mobile Header & Sidebar Toggle */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-neutral-medium border-b border-neutral-light h-16">
        <Link href="/admin/dashboard" className="text-xl font-bold text-brand-primary font-inter">
          B.S. Admin
        </Link>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-neutral-extralight hover:text-brand-primary">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-neutral-medium border-r-neutral-light p-0 flex flex-col w-64 text-neutral-extralight">
            <SheetHeader className="p-4 border-b border-neutral-light">
                <SheetTitle className="sr-only">Admin Menu</SheetTitle>
            </SheetHeader>
             {sidebarContent(true)}
          </SheetContent>
        </Sheet>
      </header>
      
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto pt-20 md:pt-4 sm:md:pt-6 lg:md:pt-10"> {/* Added pt-20 for mobile header */}
        {children}
      </main>
    </div>
  );
}

