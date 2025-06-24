// ai/advisor.js
import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

// Configure Genkit
const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});

// Define and export the flow
export const getAdviceFromText = ai.defineFlow('getAdviceFromText', async (input) => {
  const { text } = await ai.generate(`Explain this to a 5-year-old: ${input}`);
  return text;
});
