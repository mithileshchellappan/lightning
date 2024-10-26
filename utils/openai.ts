import {createOpenAI} from '@ai-sdk/openai';
import OpenAI from 'openai';

const openai = createOpenAI({
    baseURL: 'https://api.sambanova.ai/v1',
    apiKey: process.env.SAMBANOVA_API_KEY,
});

export default openai;