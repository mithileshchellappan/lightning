import { NextRequest, NextResponse } from 'next/server'
import shadcnComponents from '@/utils/shadcn-ai-extract';
import dedent from 'dedent';
import { Models } from '@/lib/utils';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

const llmEndpoint = `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://lightning.notagodzilla.wtf'}/api/llm`

async function completeUnfinishedCode(unfinishedCode: string,  apiKey: string) {
  const completionMessage: ChatCompletionMessageParam = {
    role: 'user',
    content: `Complete this React component code. Add any missing functionality and make sure to end with </lightningArtifact>:\n\n${unfinishedCode}`
  }
  
  const response = await fetch(`${process.env.SAMBANOVA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: Models[1].value,
      messages: [
        { role: 'system', content: 'You are a React expert. Complete the unfinished component code and make sure it starts with <lightningArtifact name="APP_NAME" icon="ICON_NAME">and ends with </lightningArtifact>. DO NOT REPLY WITH ANYTHING OTHER THAN THE COMPLETED CODE. DO NOT USE BACKTICKS. DO NOT PROVIDE ANY EXPLANATION. JUST THE COMPLETED CODE.' },
        completionMessage
      ],
      temperature: 0.1,
      top_p: 0.3
    })
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  const completion = await response.json();
  return completion.choices[0].message.content;
}

export async function POST(req: NextRequest) {
  try {
    let { messages, model: modelId, isVision = false } : {messages: ChatCompletionMessageParam[], model: number, isVision: boolean} = await req.json()
    const model = Models.find(m => m.id === modelId)?.value
    const customApiKey = req.headers.get('X-SambaNovaAPI-Key')
    const apiKey = customApiKey || process.env.SAMBANOVA_API_KEY

    if(isVision && !Models.find(m => m.value === model)?.isVisionEnabled) {
      console.log("Removing image from messages")
      messages = messages.map(message => {
        if (message.role === 'user' && Array.isArray(message.content)) {
          return {
            ...message,
            content: message.content.filter(
              content => content.type !== 'image_url'
            )
          };
        }
        return message;
      });
    }    
    const systemMessage: ChatCompletionMessageParam = {role: 'user', content: [{type: 'text', text: dedent(GENERATE_PROMPT)}]}
    messages = [systemMessage, ...messages]

    const response = await fetch(`${process.env.SAMBANOVA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const completion = await response.json();
    var text = completion.choices[0].message.content;

    // var text = EXAMPLE_CODE
    text = text.replace(/^```[\w-]*\n|```$/gm, '')
    
    text = dedent(text)

    if (text.includes('<lightningArtifact') && !text.includes('</lightningArtifact>')) {
      console.log("Detected unfinished code, attempting to complete it...")
      text = await completeUnfinishedCode(text, apiKey)
    }

    console.log("GENERATED AI Response")
    if (!text.includes("<lightningArtifact")) {
      console.log("Error rendering the component", text)
      return NextResponse.json({ error: 'Error rendering the component' }, {status: 500});
    }
    text = text.replaceAll("\'", "'")

    const nameMatch = text.match(/name="([^"]*)"/)
    const iconMatch = text.match(/icon="([^"]*)"/)
    const name = nameMatch ? nameMatch[1] : ''
    const icon = iconMatch ? iconMatch[1] : ''
    text = text.replaceAll(/<script[^>]*>([\s\S]*?)<\/script>/g, '')
    text = text.replaceAll(/<script>|<\/script>/g, '')
    // Extract code from inside lightningArtifact tag or up to export default
    const codeMatch = text.match(/<lightningArtifact[^>]*>([\s\S]*?)(?:<\/lightningArtifact>[\s\S]*$)/)
    let code = codeMatch ? codeMatch[1].trim() : ''
    
 
    code = code.replaceAll('\\n', '\n')

    const result = {
      code,
      name,
      icon
    }
    console.log(result)
    return NextResponse.json(result)
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: `${error.message}` }, {status: 500});
  }
}

const EXAMPLE_CODE = `<lightningArtifact name="todo" icon="Puzzle">  export default () => <button onClick={() => fetch('${llmEndpoint}', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message: 'Hello LLM!'})}).then(res => res.json()).then(data => console.log(data)).catch(err => console.error(err))} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Call LLM API</button>
</lightningArtifact>
`

const EXAMPLE_UNFINISHED_CODE = `<lightningArtifact name="todo" icon="Puzzle">  import { useState } from 'react';\nimport { Input } from \"/components/ui/input\";\nimport { Button } from \"/components/ui/button\";\nimport { Card, CardContent, CardHeader, CardTitle } from \"/components/ui/card\";\n\nconst TodoApp = () => {`

var GENERATE_PROMPT = `
    You are Lightning, an expert React developer and UI/UX designer who creates modern, production-ready components with elegant design systems and proper color schemes.

# Component Structure
- Every component must be wrapped in <lightningArtifact name="APP_NAME" icon="ICON_NAME">...</lightningArtifact>
- The name should reflect the app's purpose (e.g., "todo-app", "weather-dashboard")
- The icon must be a valid Lucide React icon name
- Components must use TypeScript
- Components must have a default export
- All components must be self-contained with no required props

# Core Requirements
1. Layout & Responsiveness
   - Root div must have h-full w-full classes
   - Must be fully responsive (mobile, tablet, desktop)
   - No scrollbars allowed
   - Handle expanding/collapsing content properly
   - Full background color (not just for inner content)

2. Styling
   - Use only Tailwind's core utility classes
   - NO arbitrary values (e.g., NO h-[600px])
   - NO custom CSS
   - NO outlines (handled externally)
   - Use consistent color palette
   - Proper spacing with Tailwind margin/padding classes
   - Full use of available space

3. Dark Mode Support
   - Must support theme changes (no theme toggle needed)
   - Always pair light/dark colors:
     Background: bg-white dark:bg-zinc-900
     Text: text-gray-900 dark:text-white
     Muted Text: text-gray-500 dark:text-gray-400
     Borders: border-gray-200 dark:border-zinc-800
     Hover: hover:bg-gray-100 dark:hover:bg-zinc-800

4. State Management
   - Persist state in localStorage where appropriate
   - All interactive features must be fully implemented
   - NO placeholder functionality

5. LLM AI Integration
    - If the user requests an AI integration, you must use the LLM endpoint provided: ${llmEndpoint}
    - The endpoint expects a JSON body with a "message" field
    - Example request body: {"message": "What is the weather in Tokyo?"}
    - IMPORTANT: ALWAYS PROVIDE A SCHEMA FOR JSON OUTPUT.ß
    - Use fetch to call the LLM endpoint.
    - You should parse the response from the LLM api call as data.response
    - Make sure you prompt the LLM in a way you need your output to be formatted. If you want long form text, ask for it, if you want short messages, ask for it.
    - Make the AI button standout from other buttons
    - IMPORTANT: Always add a loading state to the button when calling the LLM endpoint and disable while loading
   

# Available Resources

1. UI Components (import individually):
import { Button } from "/components/ui/button"
import { Input } from "/components/ui/input"

2. External APIs for Data:
- Crypto: https://api.coindesk.com/v1/
- Weather: https://api.open-meteo.com
- News: https://hacker-news.firebaseio.com
- Jokes: https://official-joke-api.appspot.com
- Currency: https://open.er-api.com/v6

3. Libraries:
- Recharts (only for dashboards/charts)
- Lucide React (for icons)

# Important Rules
1. NO markdown code blocks or backticks
2. NO JSON responses
3. Import React utilities directly: import { useState, useEffect, Fragment } from 'react'
4. If provided with images/sketches, use them for layout/styling guidance
5. Always update code based on all previous changes in the conversation

# Response Format
Components must be provided as plain text within Lightning artifact tags:
<lightningArtifact name="app-name" icon="icon-name">
[TypeScript React code with imports]
</lightningArtifact>

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

    <example>
    <input>
    Create a todo app
    </input>
    <output>
    ${EXAMPLE_CODE}
    </output>
    </example>
    `

  
