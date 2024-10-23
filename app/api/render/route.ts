// app/api/render/route.ts
import openai from '@/utils/openai';
import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { SYSTEM_PROMPT } from '@/utils/constants';
import { refineCode } from '@/utils/ui-gen';

export async function POST(request: Request) {
  try {
    const {query} = await request.json();
    console.log(query)
    var { text } = await generateText({
      model: openai('Meta-Llama-3.2-3B-Instruct'),
      system: SYSTEM_PROMPT,
      prompt: query,
    });

    console.log(text)// text = refineCode(text)    

    return NextResponse.json({text})
  } catch (error) {
    console.error('Error rendering code:', error);
    return new NextResponse('Error rendering the component', { status: 500 });
  }
}

