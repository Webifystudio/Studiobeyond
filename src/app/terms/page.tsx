import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold text-brand-primary mb-6 font-headline">Terms of Service</h1>
          <div className="space-y-4 text-neutral-extralight/90 font-body">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the MangaFluent website (the "Service") operated by MangaFluent ("us", "we", or "our").</p>
            <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.</p>
            <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

            <h2 className="text-xl font-semibold text-white mt-4 mb-2 font-headline">Content</h2>
            <p>Our Service allows you to discover manga titles and may link to third-party web sites or services that are not owned or controlled by MangaFluent. MangaFluent has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that MangaFluent shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>
            
            <h2 className="text-xl font-semibold text-white mt-4 mb-2 font-headline">Intellectual Property</h2>
            <p>The Service and its original content (excluding content provided by users or linked from third parties), features and functionality are and will remain the exclusive property of MangaFluent and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of MangaFluent.</p>

            <h2 className="text-xl font-semibold text-white mt-4 mb-2 font-headline">Changes</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>

            <h2 className="text-xl font-semibold text-white mt-4 mb-2 font-headline">Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
