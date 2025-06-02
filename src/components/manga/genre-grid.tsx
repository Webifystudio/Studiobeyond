import { GenreCard } from './genre-card';

interface GenreItem {
  name: string;
  href: string;
}

interface GenreGridProps {
  title: string;
  genres: GenreItem[];
}

export function GenreGrid({ title, genres }: GenreGridProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 section-title text-white font-headline">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {genres.map((genre) => (
          <GenreCard key={genre.name} name={genre.name} href={genre.href} />
        ))}
      </div>
    </section>
  );
}
