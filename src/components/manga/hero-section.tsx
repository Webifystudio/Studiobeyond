import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  buttonHref: string;
  dataAiHint?: string;
}

export function HeroSection({ title, description, imageUrl, imageAlt, buttonText, buttonHref, dataAiHint }: HeroSectionProps) {
  return (
    <section className="relative rounded-2xl overflow-hidden mb-12 h-[60vh] max-h-[500px] flex items-end p-6 sm:p-10">
      <Image
        src={imageUrl}
        alt={imageAlt}
        layout="fill"
        objectFit="cover"
        quality={85}
        className="z-0"
        data-ai-hint={dataAiHint || "featured manga anime"}
      />
      <div className="absolute inset-0 hero-gradient z-0"></div>
      <div className="relative z-10 text-white">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 font-headline">{title}</h1>
        <p className="text-sm sm:text-base lg:text-lg mb-6 max-w-xl text-neutral-extralight/90 font-body">
          {description}
        </p>
        <Button asChild size="lg" className="bg-brand-primary hover:bg-brand-primary/80 text-white font-semibold py-3 px-6 rounded-lg text-sm sm:text-base transition duration-300">
          <Link href={buttonHref} className="inline-flex items-center">
            {buttonText}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
