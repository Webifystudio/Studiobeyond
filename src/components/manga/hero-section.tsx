
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  buttonHref: string;
  dataAiHint?: string;
  isHomepageHero?: boolean; 
}

export function HeroSection({ 
  title, 
  description, 
  imageUrl, 
  imageAlt, 
  buttonText, 
  buttonHref, 
  dataAiHint,
  isHomepageHero = false 
}: HeroSectionProps) {
  return (
    <section className={cn(
      "relative overflow-hidden flex items-end",
      isHomepageHero ? "min-h-screen" : "min-h-[60vh] sm:min-h-[70vh] lg:min-h-[500px] mb-12", // Full viewport height for homepage hero
      "p-6 sm:p-10" 
    )}>
      <Image
        src={imageUrl}
        alt={imageAlt}
        layout="fill"
        objectFit="cover"
        quality={isHomepageHero ? 90 : 85} 
        className="z-0"
        data-ai-hint={dataAiHint || "featured manga anime"}
        priority 
      />
      <div className={cn(
        "absolute inset-0 z-0",
        isHomepageHero ? "bg-gradient-to-t from-black/70 via-black/40 to-transparent" : "hero-gradient" 
      )}></div>
      
      <div className={cn(
        "relative z-10 text-white",
        isHomepageHero ? "container mx-auto px-4 sm:px-6 lg:px-8" : "" 
      )}>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 font-headline shadow-black [text-shadow:_2px_2px_4px_var(--tw-shadow-color)]">{title}</h1>
        <p className="text-sm sm:text-base lg:text-lg mb-6 max-w-xl text-neutral-extralight/95 font-body [text-shadow:_1px_1px_2px_rgba(0,0,0,0.7)]">
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
