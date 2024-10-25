import openai from '@/utils/openai';
import { NextResponse } from 'next/server';
import { generateText, StreamingTextResponse, streamText } from 'ai';
import shadcnComponents from '@/utils/shadcn-ai-extract';
import dedent from 'dedent';

export async function POST(request: Request) {
  try {
    const {messages} = await request.json();
    console.log(messages)
    var {text} = await generateText({
      model: openai('Meta-Llama-3.1-405B-Instruct'),
      system: dedent(GENERATE_PROMPT),
      messages: messages.map((message: any)=>({
        ...message,
        content: message.role ==='user' ? message.content + "\n PLEASE ONLY RETURN CODE, NO NEED BACKTICKS WITH LANGUAGE NAME" : message.content
      }))
    });

    text = dedent(text)
    console.log(text)
    console.log("GENERATED AI Response")
    return NextResponse.json(text)
  } catch (error) {
    console.error('Error rendering code:', error);
    return NextResponse.json({ error: 'Error rendering the component', status: 500 });
  }
}

var GENERATE_PROMPT = `
    You are an expert frontend React engineer who is also a great UI/UX designer. Follow the instructions carefully

    - DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\`. DO NOT USE MARKDOWN CODE BLOCKS
    - Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export
    - DO NOT START WITH BACKTICKS 
    - Make sure the React app is interactive and functional by creating state when needed and having no required props
    - You should add support for dark mode and light mode through tailwind classes. DO NOT ADD A DARK MODE TOGGLE AS THIS WILL BE HANDLED EXTERNALLY
    - YOUR APP SHOULD ALWAYS TAKE UP THE ENTIRE SCREEN. USE h-full AND w-full IN THE ROOT DIV
    - YOUR APP SHOULD BE FULLY RESPONSIVE IN MOBILE, TABLET AND DESKTOP
    - If you use any imports from React like useState or useEffect, make sure to import them directly
    - Use TypeScript as the language for the React component
    - Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette.
    - Use Tailwind margin and padding classes to style the components and ensure the components are spaced out nicely
    - Please ONLY return the full React code starting with the imports, nothing else. It's very important for my job that you only return the React code with imports.
    - ONLY IF the user asks for a dashboard, graph or chart, the recharts library is available to be imported, e.g. \`import { LineChart, XAxis, ... } from "recharts"\` & \`<LineChart ...><XAxis dataKey="name"> ...\`. Please only use this when needed.
  There are some prestyled components available for use. Please use your best judgement to use any of these components if the app calls for one.

    Here are the components that are available, along with how to import them, and how to use them:
    NOTE: Whem importing these components do not import them all in one import statement. Import them line by line
    Example: 
    \`\`\`typescript
    import { Button } from "/components/ui/button"
    import { Input } from "/components/ui/input"
    \`\`\`

    ${shadcnComponents
      .map(
        (component) => `
          <component>
          <name>
          ${component.name}
          </name>
          <import-instructions>
          ${component.importDocs}
          </import-instructions>
          <usage-instructions>
          ${component.usageDocs}
          </usage-instructions>
          </component>
        `,
      )
      .join("\n")}    

    `

  