import {createOpenAI} from '@ai-sdk/openai';
import OpenAI from 'openai';

const openai = createOpenAI({
    baseURL: process.env.SAMBANOVA_BASE_URL,
    apiKey: process.env.SAMBANOVA_API_KEY,
});

export const openaiClient = new OpenAI({
    baseURL: process.env.SAMBANOVA_BASE_URL,
    apiKey: process.env.SAMBANOVA_API_KEY,
  });

export default openai;