'use server';
/**
 * @fileoverview This file creates a Next.js API route handler that exposes all defined Genkit flows.
 * This allows the client-side application to call Genkit flows as serverless functions.
 */

import {createNextApiHandler} from '@genkit-ai/next';
import '@/ai/flows/summarize-reviews'; // Make sure to import all your flow files here

export const {GET, POST} = createNextApiHandler();
