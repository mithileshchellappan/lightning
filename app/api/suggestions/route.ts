import openai from '@/utils/openai';
import { NextResponse } from 'next/server';
import { StreamingTextResponse, streamText } from 'ai';
import shadcnComponents from '@/utils/shadcn-ai-extract';
import dedent from 'dedent';

export async function POST(request: Request) {
  try {
    const {code} = await request.json();
    
    var stream = await streamText({
      model: openai('Meta-Llama-3.2-1B-Instruct'),
      system: dedent(GENERATE_PROMPT),
      prompt: code,
    });

    return stream.toTextStreamResponse()
  } catch (error) {
    console.error('Error rendering code:', error);
    return new NextResponse('Error rendering the component', { status: 500 });
  }
}

const GENERATE_PROMPT = `
    You are a suggestions engine. You will be given a code snippet and you will need to return a list of suggestions for improvements.
    You will return a list of suggestions in markdown format.
    You will return a maximum of 5 suggestions.
    Example:
    - Add a responsive design
    - Add a dark mode
    - Add a navigation menu
    DO NOT RETURN ANYTHING ELSE.
    ONLY RETURN THE SUGGESTIONS.
    DO NOT RETURN ANYTHING ELSE.
    DO NOT ADD ANY MARKDOWN FORMATTING EXCEPT FOR THE LIST.
`