
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Tag, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Genres", value: "0", icon: Tag, href: "/admin/dashboard/genres", description: "Manage all manga genres.", color: "text-blue-400" },
    { title: "Total Mangas", value: "0", icon: BookOpen, href: "/admin/dashboard/mangas", description: "Manage all manga entries.", color: "text-green-400" },
    { title: "Slider Items", value: "0", icon: ImageIcon, href: "/admin/dashboard/slider", description: "Manage hero slider content.", color: "text-purple-400" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white font-headline">Admin Dashboard</h1>
      <p className="text-neutral-extralight/80">Welcome to the MangaFluent Admin Panel. Manage your site's content from here.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-neutral-medium border-neutral-light hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-extralight/90">{stat.title}</CardTitle>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-neutral-extralight/70 pt-1">{stat.description}</p>
              <Link href={stat.href} className="text-sm text-brand-primary hover:underline mt-2 block">
                Manage {stat.title.replace("Total ", "").replace("Items","")} &rarr;
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-neutral-medium border-neutral-light">
        <CardHeader>
          <CardTitle className="text-xl text-white font-headline">Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-neutral-extralight/80 space-y-2">
          <p>1. <Link href="/admin/dashboard/genres" className="text-brand-primary hover:underline">Manage Genres</Link>: Add or edit manga genres.</p>
          <p>2. <Link href="/admin/dashboard/mangas" className="text-brand-primary hover:underline">Manage Mangas</Link>: Add new manga series, chapters, and details.</p>
          <p>3. <Link href="/admin/dashboard/slider" className="text-brand-primary hover:underline">Manage Slider</Link>: Update the hero section/image slider on the homepage.</p>
          <p className="pt-2">Data entered here will be (eventually) stored in Firebase Firestore and displayed on the public website.</p>
          <p className="text-yellow-400/80 text-sm">Note: Currently, forms are for UI demonstration. Data saving to database is not yet implemented.</p>
        </CardContent>
      </Card>
    </div>
  );
}
