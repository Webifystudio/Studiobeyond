import Link from 'next/link';
import { FacebookIcon, TwitterIcon, InstagramIcon } from '@/components/icons';

export function Footer() {
  return (
    <footer className="bg-neutral-medium border-t border-neutral-light mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-brand-primary mb-4 font-inter">MangaFluent</h3>
            <p className="text-neutral-extralight/80 text-sm max-w-xs font-inter">
              Your ultimate destination for reading the latest and greatest manga series online.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 font-inter">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-neutral-extralight/80 hover:text-brand-primary text-sm transition duration-300 font-inter">About Us</Link></li>
              <li><Link href="/contact" className="text-neutral-extralight/80 hover:text-brand-primary text-sm transition duration-300 font-inter">Contact</Link></li>
              <li><Link href="/privacy" className="text-neutral-extralight/80 hover:text-brand-primary text-sm transition duration-300 font-inter">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-neutral-extralight/80 hover:text-brand-primary text-sm transition duration-300 font-inter">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 font-inter">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-neutral-extralight/80 hover:text-brand-primary transition duration-300">
                <FacebookIcon className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Twitter" className="text-neutral-extralight/80 hover:text-brand-primary transition duration-300">
                <TwitterIcon className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Instagram" className="text-neutral-extralight/80 hover:text-brand-primary transition duration-300">
                <InstagramIcon className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-light pt-8 text-center">
          <p className="text-neutral-extralight/70 text-sm font-inter">&copy; {new Date().getFullYear()} MangaFluent. All Rights Reserved. Designed with ❤️.</p>
        </div>
      </div>
    </footer>
  );
}
