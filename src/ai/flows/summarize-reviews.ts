'use server';

/**
 * @fileOverview Summarizes user reviews of a manga to provide a quick overview of pros and cons.
 * This flow is exposed as an API endpoint via the Genkit Next.js handler.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SummarizeReviewsInputSchema = z.object({
  reviews: z
    .array(z.string())
    .describe('An array of user reviews for a manga.'),
  mangaTitle: z.string().describe('The title of the manga being reviewed.'),
});
export type SummarizeReviewsInput = z.infer<typeof SummarizeReviewsInputSchema>;

export const SummarizeReviewsOutputSchema = z.object({
  pros: z.array(z.string()).describe('A list of summarized pros from the reviews.'),
  cons: z.array(z.string()).describe('A list of summarized cons from the reviews.'),
});
export type SummarizeReviewsOutput = z.infer<typeof SummarizeReviewsOutputSchema>;

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

ai.defineFlow(
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
