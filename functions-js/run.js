// run.js
import { advisorFlow } from './ai/advisor.js';

const response = await advisorFlow('Explain Bitcoin to a 5-year-old');
console.log('🧠 Gemini says:', response);
