
"use client"; 

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Tag, Image as ImageIcon, Users, FileText, Eye, BarChart3, Layers } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { db, collection, getDocs } from '@/lib/firebase';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'; // Shadcn chart components

interface StatItem {
  title: string;
  value: string;
  icon: React.ElementType;
  href: string;
  description: string;
  color: string;
}

interface DashboardStats {
  genres: number;
  mangas: number;
  sliderItems: number;
  customPages: number;
  users: number;
  totalViews: number;
  totalChapters: number;
}

async function getStatsData(): Promise<DashboardStats> {
  try {
    const [
      genresSnap, 
      mangasSnap, 
      sliderItemsSnap, 
      customPagesSnap, 
      usersSnap
    ] = await Promise.all([
      getDocs(collection(db, "genres")),
      getDocs(collection(db, "mangas")),
      getDocs(collection(db, "sliderItems")),
      getDocs(collection(db, "customPages")),
      getDocs(collection(db, "users")),
    ]);

    let totalViews = 0;
    customPagesSnap.forEach(doc => {
      totalViews += doc.data().views || 0;
    });

    let totalChapters = 0;
    for (const pageDoc of customPagesSnap.docs) {
        const chaptersSnap = await getDocs(collection(db, "customPages", pageDoc.id, "chapters"));
        totalChapters += chaptersSnap.size;
    }

    return {
      genres: genresSnap.size,
      mangas: mangasSnap.size,
      sliderItems: sliderItemsSnap.size,
      customPages: customPagesSnap.size,
      users: usersSnap.size,
      totalViews: totalViews,
      totalChapters: totalChapters,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { genres: 0, mangas: 0, sliderItems: 0, customPages: 0, users: 0, totalViews: 0, totalChapters: 0 };
  }
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--primary))",
  },
} satisfies import('@/components/ui/chart').ChartConfig;


export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getStatsData();
      setStatsData(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading || !statsData) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white font-headline">Admin Dashboard</h1>
        <p className="text-neutral-extralight/80">Loading dashboard data...</p>
        {/* Add Skeleton loaders here if desired */}
      </div>
    );
  }

  const statCards: StatItem[] = [
    { title: "Total Genres", value: statsData.genres.toString(), icon: Tag, href: "/admin/dashboard/genres", description: "Manage all manga genres.", color: "text-blue-400" },
    { title: "Total Mangas", value: statsData.mangas.toString(), icon: BookOpen, href: "/admin/dashboard/mangas", description: "Manage all manga entries.", color: "text-green-400" },
    { title: "Slider Items", value: statsData.sliderItems.toString(), icon: ImageIcon, href: "/admin/dashboard/slider", description: "Manage hero slider content.", color: "text-purple-400" },
    { title: "Custom Pages", value: statsData.customPages.toString(), icon: FileText, href: "/admin/dashboard/pages", description: "Manage custom site pages.", color: "text-yellow-400" },
    { title: "Total Users", value: statsData.users.toString(), icon: Users, href: "#", description: "View registered users (TBD).", color: "text-pink-400" },
    { title: "Total Page Views", value: statsData.totalViews.toString(), icon: Eye, href: "#", description: "Across all custom pages.", color: "text-teal-400" },
    { title: "Total Chapters", value: statsData.totalChapters.toString(), icon: Layers, href: "/admin/dashboard/pages", description: "Across all custom pages.", color: "text-orange-400" },
  ];

  const chartData = [
    { item: "Genres", count: statsData.genres },
    { item: "Mangas", count: statsData.mangas },
    { item: "Pages", count: statsData.customPages },
    { item: "Users", count: statsData.users },
    { item: "Chapters", count: statsData.totalChapters },
  ];


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white font-headline">Admin Dashboard</h1>
      <p className="text-neutral-extralight/80">Welcome to the BEYOND SCANS Admin Panel. Manage your site's content from here.</p>
      
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-neutral-medium border-neutral-light hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-extralight/90">{stat.title}</CardTitle>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-neutral-extralight/70 pt-1 truncate">{stat.description}</p>
              {stat.href !== "#" ? (
                <Link href={stat.href} className="text-xs text-brand-primary hover:underline mt-2 block">
                  Manage &rarr;
                </Link>
              ) : <div className="h-6 mt-2"></div>}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-xl text-white font-headline flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-brand-primary" /> Content Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] sm:h-[350px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                <XAxis dataKey="item" tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} allowDecimals={false}/>
                <RechartsTooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }} 
                  content={<ChartTooltipContent />} 
                />
                <Legend content={({ payload }) => (
                  <div className="flex justify-center space-x-4 mt-2">
                    {payload?.map((entry: any, index: number) => (
                      <div key={`item-${index}`} className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-xs text-neutral-extralight">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-xl text-white font-headline">Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-neutral-extralight/80 space-y-2">
          <p>1. <Link href="/admin/dashboard/genres" className="text-brand-primary hover:underline">Manage Genres</Link>: Add or edit manga genres.</p>
          <p>2. <Link href="/admin/dashboard/mangas" className="text-brand-primary hover:underline">Manage Mangas</Link>: Add new manga series, chapters, and details.</p>
          <p>3. <Link href="/admin/dashboard/slider" className="text-brand-primary hover:underline">Manage Slider</Link>: Update the hero section/image slider on the homepage.</p>
          <p>4. <Link href="/admin/dashboard/pages" className="text-brand-primary hover:underline">Manage Pages</Link>: Create and configure custom content pages with chapters.</p>
          <p className="pt-2">Data entered here will be stored in Firebase Firestore and displayed on the public website.</p>
        </CardContent>
      </Card>
    </div>
  );
}

    