import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-dark">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <div className="bg-neutral-medium p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-brand-primary mb-6 text-center font-headline">Contact Us</h1>
          <p className="text-neutral-extralight/80 mb-8 text-center font-body">
            Have questions, suggestions, or just want to say hi? Fill out the form below and we'll get back to you as soon as possible.
          </p>
          <form className="space-y-6">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-neutral-extralight mb-1">Full Name</Label>
              <Input type="text" id="name" name="name" className="bg-neutral-light" />
            </div>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-neutral-extralight mb-1">Email Address</Label>
              <Input type="email" id="email" name="email" className="bg-neutral-light" />
            </div>
            <div>
              <Label htmlFor="subject" className="block text-sm font-medium text-neutral-extralight mb-1">Subject</Label>
              <Input type="text" id="subject" name="subject" className="bg-neutral-light" />
            </div>
            <div>
              <Label htmlFor="message" className="block text-sm font-medium text-neutral-extralight mb-1">Message</Label>
              <Textarea id="message" name="message" rows={4} className="bg-neutral-light" />
            </div>
            <div>
              <Button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white">
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
