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
    <div className={cn('manga-card-base manga-card-hover')}>
      <Link href={`/manga/${id}`}>
        <div className="aspect-[2/3] relative w-full">
          <Image
            src={imageUrl}
            alt={title}
            layout="fill"
            objectFit="cover"
            className="w-full h-full"
            data-ai-hint={dataAiHint || "manga cover anime"}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; 
              target.src='https://placehold.co/300x450/2D3748/A0AEC0?text=Error';
            }}
          />
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-base font-semibold text-white truncate font-headline">{title}</h3>
          <p className="text-xs sm:text-sm text-neutral-extralight/80 font-body">{chapter}</p>
        </div>
      </Link>
    </div>
  );
}
