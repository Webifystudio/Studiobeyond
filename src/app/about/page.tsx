
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <div className="bg-neutral-medium p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-brand-primary mb-6 font-headline">About BEYOND SCANS</h1>
          <p className="text-neutral-extralight/90 mb-4 font-body">
            BEYOND SCANS is your ultimate destination for discovering and tracking your favorite manga series. Our mission is to provide a seamless and enjoyable experience for manga enthusiasts worldwide.
          </p>
          <p className="text-neutral-extralight/90 mb-4 font-body">
            We offer a vast collection of titles across various genres, from action-packed adventures to heartwarming slice-of-life stories. Our platform features AI-powered review summaries to help you quickly gauge community sentiment and decide what to read next.
          </p>
          <p className="text-neutral-extralight/90 font-body">
            Thank you for choosing BEYOND SCANS. We are constantly working to improve our service and bring you the best manga reading experience.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
