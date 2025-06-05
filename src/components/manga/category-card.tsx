
import Link from 'next/link';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

interface CategoryCardProps {
  name: string;
  href: string;
}

export function CategoryCard({ name, href }: CategoryCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className="bg-neutral-medium border-neutral-light hover:border-brand-primary/70 hover:shadow-xl transition-all duration-300 ease-in-out transform group-hover:scale-105">
        <CardContent className="p-4 sm:p-6 flex items-center justify-center min-h-[80px] sm:min-h-[100px]">
          <CardTitle className="text-md sm:text-lg font-semibold text-brand-primary text-center truncate group-hover:text-brand-primary/80 transition-colors" title={name}>
            {name}
          </CardTitle>
        </CardContent>
      </Card>
    </Link>
  );
}

    