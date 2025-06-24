// genkit.config.js
import { defineConfig } from 'genkit';
import '@genkit-ai/googleai/setup';

export default defineConfig({
  plugins: ['@genkit-ai/googleai'],
  flows: ['./ai/advisor.js'], // ensures flows are registered
});
