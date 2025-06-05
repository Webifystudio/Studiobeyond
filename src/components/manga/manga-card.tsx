
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MangaCardProps {
  id: string;
  title: string;
  chapter: string;
  imageUrl: string;
  dataAiHint?: string;
}

export function MangaCard({ id, title, chapter, imageUrl, dataAiHint }: MangaCardProps) {
  return (
    <div className={cn('manga-card-base manga-card-hover h-full flex flex-col')}>
      <Link href={`/manga/${id}`} className="flex flex-col h-full">
        <div className="aspect-[2/3] relative w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover"
            data-ai-hint={dataAiHint || "manga cover anime"}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; 
              target.src='https://placehold.co/300x450/2D3748/A0AEC0?text=Error';
            }}
          />
        </div>
        <div className="p-3 sm:p-4 mt-auto"> {/* mt-auto pushes text to bottom if card is taller */}
          <h3 className="text-sm sm:text-base font-semibold text-white truncate font-headline" title={title}>{title}</h3>
          <p className="text-xs sm:text-sm text-neutral-extralight/80 font-body">{chapter}</p>
        </div>
      </Link>
    </div>
  );
}

    