import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-brand-primary mb-6 font-headline">Privacy Policy</h1>
          <div className="space-y-4 text-neutral-extralight/90 font-body">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>MangaFluent ("us", "we", or "our") operates the MangaFluent website (the "Service").</p>
            <p>This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
            
            <h2 className="text-xl font-semibold text-white mt-4 mb-2 font-headline">Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
            
            <h2 className="text-xl font-semibold text-white mt-4 mb-2 font-headline">Types of Data Collected</h2>
            <p>Personal Data: While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to, email address, cookies and usage data.</p>
            <p>Usage Data: We may also collect information how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>

            <h2 className="text-xl font-semibold text-white mt-4 mb-2 font-headline">Use of Data</h2>
            <p>MangaFluent uses the collected data for various purposes: to provide and maintain the Service, to notify you about changes to our Service, to allow you to participate in interactive features of our Service when you choose to do so, to provide customer care and support, to provide analysis or valuable information so that we can improve the Service, to monitor the usage of the Service, to detect, prevent and address technical issues.</p>

            <h2 className="text-xl font-semibold text-white mt-4 mb-2 font-headline">Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

            <h2 className="text-xl font-semibold text-white mt-4 mb-2 font-headline">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us through our contact page.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
