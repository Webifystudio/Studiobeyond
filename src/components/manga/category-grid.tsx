
import { CategoryCard } from './category-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export interface CategoryItem { 
  id: string;
  name: string;
  href: string; // Expecting /category/[slug]
}

interface CategoryGridProps {
  title: string;
  categories: CategoryItem[];
  // viewAllHref and hasMore might not be relevant for a grid of category *names*
  // unless it's a paginated list of categories. For homepage, usually shows all.
}

export function CategoryGrid({ title, categories }: CategoryGridProps) {
  if (categories.length === 0) {
     return (
        <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold section-title text-white font-headline">{title}</h2>
            </div>
            <p className="text-neutral-extralight">No categories to display yet. Add them via the admin panel.</p>
        </section>
     );
  }
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold section-title text-white font-headline">{title}</h2>
        {/* Optionally, a "View All Categories" button could go here if there was a dedicated page for all categories */}
      </div>
      <ScrollArea orientation="horizontal" className="w-full pb-3 -mb-3">
        <div className="flex space-x-4 sm:space-x-5 py-2">
          {categories.map((category) => (
            <div key={category.id} className="w-[180px] sm:w-[200px] shrink-0">
                 <CategoryCard name={category.name} href={category.href} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
