
import { LoadingTips } from '@/components/layout/loading-tips';

const tips = [
  "Tip: You can change the application's theme in your Profile Settings!",
  "Tip: Many pages support horizontal and vertical reading modes for chapters.",
  "Tip: Explore different genres to find your next favorite manga!",
  "Tip: Use the search bar in the header to quickly find specific manga titles.",
  "Tip: Check out the 'Popular' section for trending manga.",
  "Tip: Visit the Admin Panel to add new manga, chapters, and slider items.",
  "Tip: AI Summaries can give you a quick idea of a manga's pros and cons before diving in.",
  "Tip: Look for download links on chapter pages for Telegram or Discord!"
];

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-dark text-neutral-extralight p-6 overflow-hidden">
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-8">
        {/* Animated SVG Logo */}
        <svg 
          viewBox="0 0 120 120" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full animate-pulseSlowLogo"
        >
          {/* Outer spinning arcs */}
          <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="15 15" className="animate-spinLogo" style={{transformOrigin: 'center'}} />
          <circle cx="60" cy="60" r="40" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" strokeDasharray="10 10" className="animate-spinLogoReverse" style={{transformOrigin: 'center', animationDelay: '0.2s'}} />
          
          {/* Central Static Text "BS" - Fade In */}
          <text 
            x="50%" 
            y="50%" 
            dy=".3em" 
            textAnchor="middle" 
            fontSize="40" 
            fontWeight="bold" 
            fill="hsl(var(--foreground))"
            className="opacity-0 animate-fadeIn"
            style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
          >
            BS
          </text>
        </svg>
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary mb-3 font-headline opacity-0 animate-fadeIn" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
        BEYOND SCANS
      </h1>
      <p className="text-base sm:text-lg text-neutral-extralight/90 mb-10 opacity-0 animate-fadeIn" style={{ animationDelay: '1.1s', animationFillMode: 'forwards' }}>
        Loading your next adventure...
      </p>
      
      <div className="w-full max-w-md opacity-0 animate-fadeIn" style={{ animationDelay: '1.4s', animationFillMode: 'forwards' }}>
        <LoadingTips tips={tips} interval={4000} />
      </div>
    </div>
  );
}
