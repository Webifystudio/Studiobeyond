
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, Tag, BookOpen, Image as ImageIcon, LogOut, Home, FileText, Link2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/dashboard/genres', label: 'Manage Genres', icon: Tag },
  { href: '/admin/dashboard/mangas', label: 'Manage Mangas', icon: BookOpen },
  { href: '/admin/dashboard/assign-manga-genre', label: 'Assign Manga to Genre', icon: Link2 },
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

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined' && localStorage.getItem('isAdminAuthenticated') !== 'true') {
      router.replace('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdminAuthenticated');
    }
    router.push('/admin/login');
  };

  if (!isMounted || (typeof window !== 'undefined' && localStorage.getItem('isAdminAuthenticated') !== 'true')) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-dark">
            <p className="text-white">Loading or redirecting...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-dark text-neutral-extralight">
      <aside className="w-64 bg-neutral-medium border-r border-neutral-light p-4 flex flex-col hidden md:flex">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-2xl font-bold text-brand-primary font-inter">
            BEYOND SCANS Admin
          </Link>
        </div>
        <ScrollArea className="flex-grow">
          <nav className="space-y-2">
            {navItems.map((item) => (
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
            ))}
          </nav>
        </ScrollArea>
        <div className="mt-auto space-y-2">
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
        </div>
      </aside>
      {/* TODO: Add a mobile menu toggle for admin sidebar if desired in future */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
