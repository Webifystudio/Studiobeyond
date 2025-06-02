import { MangaCard } from './manga-card';

interface MangaItem {
  id: string;
  title: string;
  chapter: string;
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
    </section>
  );
}
