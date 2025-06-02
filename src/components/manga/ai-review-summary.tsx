// This component is illustrative. The actual display logic is currently within src/app/manga/[id]/page.tsx
// It can be refactored into this component later if needed.

import type { SummarizeReviewsOutput } from '@/ai/flows/summarize-reviews';

interface AiReviewSummaryProps {
  summary: SummarizeReviewsOutput | null;
  mangaTitle: string;
}

export function AiReviewSummary({ summary, mangaTitle }: AiReviewSummaryProps) {
  if (!summary) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-white mb-3 font-headline">AI Review Summary for {mangaTitle}</h2>
        <p className="text-neutral-extralight/70">Could not generate review summary at this time.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-3 font-headline">AI Review Summary for {mangaTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-light p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-400 mb-2 font-headline">Pros</h3>
          {summary.pros.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-neutral-extralight/90 font-body">
              {summary.pros.map((pro, index) => <li key={`pro-${index}`}>{pro}</li>)}
            </ul>
          ) : (
            <p className="text-neutral-extralight/70 font-body">No specific pros highlighted in reviews.</p>
          )}
        </div>
        <div className="bg-neutral-light p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-400 mb-2 font-headline">Cons</h3>
          {summary.cons.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-neutral-extralight/90 font-body">
              {summary.cons.map((con, index) => <li key={`con-${index}`}>{con}</li>)}
            </ul>
          ) : (
            <p className="text-neutral-extralight/70 font-body">No specific cons highlighted in reviews.</p>
          )}
        </div>
      </div>
    </div>
  );
}
