import openai from '@/utils/openai';
import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import dedent from 'dedent';
import { Models } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const {code} = await request.json();
    
    var stream = await streamText({
      model: openai(Models[1].value as string),
      system: dedent(GENERATE_PROMPT),
      prompt: dedent(code),
    });
    return stream.toTextStreamResponse()
  } catch (error) {
    console.error('Error rendering code:', error);
    return new NextResponse('Error rendering the component', { status: 500 });
  }
}

const GENERATE_PROMPT = `
    You are a UI suggestions engine. You will be given a code snippet and you will need to return a list of suggestions for improvements.
    You will return a maximum of 5 suggestions.
    You will reply with a special tag <suggestion>...</suggestion> that contains the suggestions.
    Example:
       <suggestion>Add a responsive design</suggestion><suggestion>Add a dark mode</suggestion><suggestion>Add a navigation menu</suggestion><suggestion>Add a new feature</suggestion><suggestion>Fix the bugs</suggestion><suggestion>Improve the performance</suggestion><suggestion>Add a new page</suggestion>
    DO NOT RETURN ANYTHING ELSE.
    ONLY RETURN THE SUGGESTIONS.
    DO NOT RETURN ANYTHING ELSE.
    DO NOT ADD ANY MARKDOWN FORMATTING EXCEPT FOR THE LIST.
    ALWAYS RETURN 7 SUGGESTIONS.
`