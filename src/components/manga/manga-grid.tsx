
import { MangaCard } from './manga-card';

export interface MangaItem { // Exporting for use in pages
  id: string;
  title: string;
  chapter: string; // Could be "Chapter X" or "Ongoing - X Chapters"
  imageUrl: string;
  dataAiHint?: string;
}

interface MangaGridProps {
  title: string;
  mangaList: MangaItem[];
}

export function MangaGrid({ title, mangaList }: MangaGridProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 section-title text-white font-headline">{title}</h2>
      {mangaList.length === 0 ? (
        <p className="text-neutral-extralight">No manga to display in this section yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {mangaList.map((manga) => (
            <MangaCard
              key={manga.id}
              id={manga.id}
              title={manga.title}
              chapter={manga.chapter}
              imageUrl={manga.imageUrl}
              dataAiHint={manga.dataAiHint}
            />
          ))}
        </div>
      )}
    </section>
  );
}
