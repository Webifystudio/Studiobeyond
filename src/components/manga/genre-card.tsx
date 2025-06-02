import Link from 'next/link';

interface GenreCardProps {
  name: string;
  href: string;
}

export function GenreCard({ name, href }: GenreCardProps) {
  return (
    <Link
      href={href}
      className="block bg-neutral-medium hover:bg-brand-secondary text-white text-center py-6 px-4 rounded-xl shadow-lg transition duration-300"
    >
      <span className="text-lg font-semibold font-inter">{name}</span>
    </Link>
  );
}
