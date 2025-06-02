'use server';

/**
 * @fileOverview Summarizes user reviews of a manga to provide a quick overview of pros and cons.
 *
 * - summarizeReviews - A function that takes a list of reviews and returns a summarized list of pros and cons.
 * - SummarizeReviewsInput - The input type for the summarizeReviews function.
 * - SummarizeReviewsOutput - The return type for the summarizeReviews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeReviewsInputSchema = z.object({
  reviews: z
    .array(z.string())
    .describe('An array of user reviews for a manga.'),
  mangaTitle: z.string().describe('The title of the manga being reviewed.'),
});
export type SummarizeReviewsInput = z.infer<typeof SummarizeReviewsInputSchema>;

const SummarizeReviewsOutputSchema = z.object({
  pros: z.array(z.string()).describe('A list of summarized pros from the reviews.'),
  cons: z.array(z.string()).describe('A list of summarized cons from the reviews.'),
});
export type SummarizeReviewsOutput = z.infer<typeof SummarizeReviewsOutputSchema>;

export async function summarizeReviews(input: SummarizeReviewsInput): Promise<SummarizeReviewsOutput> {
  return summarizeReviewsFlow(input);
}

const summarizeReviewsPrompt = ai.definePrompt({
  name: 'summarizeReviewsPrompt',
  input: {schema: SummarizeReviewsInputSchema},
  output: {schema: SummarizeReviewsOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing user reviews for manga titles.

  Given the following reviews for the manga "{{mangaTitle}}", identify the most common pros and cons discussed by users.  Present the pros and cons as succinct bullet point lists.

  Reviews:
  {{#each reviews}}
  - {{{this}}}
  {{/each}}

  Summarize the reviews into two lists:
  - A list of pros called "pros"
  - A list of cons called "cons"
  `,
});

const summarizeReviewsFlow = ai.defineFlow(
  {
    name: 'summarizeReviewsFlow',
    inputSchema: SummarizeReviewsInputSchema,
    outputSchema: SummarizeReviewsOutputSchema,
  },
  async input => {
    const {output} = await summarizeReviewsPrompt(input);
    return output!;
  }
);
