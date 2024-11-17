import { NextResponse } from 'next/server';
import shadcnComponents from '@/utils/shadcn-ai-extract';
import dedent from 'dedent';
import { Models } from '@/lib/utils';
import { CoreMessage, generateText } from 'ai';
// import openai from '@/utils/openai';
import { openaiClient } from '@/utils/openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

async function completeUnfinishedCode(unfinishedCode: string, model: string) {
  const completionMessage: ChatCompletionMessageParam = {
    role: 'user',
    content: `Complete this React component code. Add any missing functionality and make sure to end with </lightningArtifact>:\n\n${unfinishedCode}`
  }
  
  const completion = await openaiClient.chat.completions.create({
    model: model as string,
    messages: [
      { role: 'system', content: 'You are a React expert. Complete the unfinished component code and make sure it ends with </lightningArtifact>. DO NOT REPLY WITH ANYTHING OTHER THAN THE COMPLETED CODE. DO NOT USE BACKTICKS. DO NOT PROVIDE ANY EXPLANATION. JUST THE COMPLETED CODE.' },
      completionMessage
    ],
    temperature: 0.1,
    top_p: 0.3
  });

  return completion.choices[0].message.content;
}

export async function POST(request: Request) {
  try {
    let {messages, model, isVision = false} : {messages: ChatCompletionMessageParam[], model: String, isVision: boolean} = await request.json();
    console.log(model)
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
    const systemMessage: ChatCompletionMessageParam = {role: 'assistant', content: [{type: 'text', text: dedent(GENERATE_PROMPT)}]}
    messages = [systemMessage, ...messages]


    const completion = await openaiClient.chat.completions.create({
      model: model as string,
      messages: messages,
      temperature: 0.1,
      top_p: 0.3
    });
    
    var text = completion.choices[0].message.content
    // var text = EXAMPLE_UNFINISHED_CODE
    // Remove code block markers
    text = text.replace(/^```[\w-]*\n|```$/gm, '')
    
    text = dedent(text)

    // Check if code has opening tag but no closing tag
    if (text.includes('<lightningArtifact') && !text.includes('</lightningArtifact>')) {
      console.log("Detected unfinished code, attempting to complete it...")
      text = await completeUnfinishedCode(text, model as string)
    }

    console.log(text)
    console.log("GENERATED AI Response")
    if (!text.startsWith("<lightningArtifact")) {
      return NextResponse.json({ error: 'Error rendering the component' }, {status: 500});
    }
    const nameMatch = text.match(/name="([^"]*)"/)
    const iconMatch = text.match(/icon="([^"]*)"/)
    const name = nameMatch ? nameMatch[1] : ''
    const icon = iconMatch ? iconMatch[1] : ''
    text = text.replaceAll(/<script[^>]*>([\s\S]*?)<\/script>/g, '')
    text = text.replaceAll(/<script>|<\/script>/g, '')
    // Extract code from inside lightningArtifact tag or up to export default
    const codeMatch = text.match(/<lightningArtifact[^>]*>([\s\S]*?)(?:<\/lightningArtifact>[\s\S]*$)/)
    let code = codeMatch ? codeMatch[1].trim() : ''
    
    // Remove script tags but keep their content
 
    code = code.replaceAll('\\n', '\n')

    const result = {
      code,
      name,
      icon
    }
    console.log(result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error rendering code:', error);
    return NextResponse.json({ error: 'Error rendering the component', status: 500 }, {status: 500});
  }
}

const EXAMPLE_CODE = `<lightningArtifact name="todo" icon="Puzzle">  import { useState } from 'react';\nimport { Input } from \"/components/ui/input\";\nimport { Button } from \"/components/ui/button\";\nimport { Card, CardContent, CardHeader, CardTitle } from \"/components/ui/card\";\n\nconst TodoApp = () => {\nconst [todos, setTodos] = useState([]);\nconst [newTodo, setNewTodo] = useState('');\n\nconst handleSubmit = (e) => {\n  e.preventDefault();\n  if (newTodo.trim() !== '') {\n    setTodos([...todos, { text: newTodo, completed: false }]);\n    setNewTodo('');\n  }\n};\n\nconst handleToggleCompleted = (index) => {\n  setTodos(todos.map((todo, i) => {\n    if (i === index) {\n      return { ...todo, completed: !todo.completed };\n    }\n    return todo;\n  }));\n};\n\nconst handleDelete = (index) => {\n  setTodos(todos.filter((todo, i) => i !== index));\n};\n\nreturn (\n  <Card className=\"max-w-md mx-auto mt-10\">\n    <CardHeader>\n      <CardTitle>Todo App</CardTitle>\n    </CardHeader>\n    <CardContent>\n      <form onSubmit={handleSubmit} className=\"flex space-x-2 mb-4\">\n        <Input\n          type=\"text\"\n          value={newTodo}\n          onChange={(e) => setNewTodo(e.target.value)}\n          placeholder=\"Add new todo\"\n          className=\"w-full\"\n        />\n        <Button type=\"submit\">Add</Button>\n      </form>\n      <ul>\n        {todos.map((todo, index) => (\n          <li key={index} className=\"flex items-center space-x-2 mb-2\">\n            <input\n              type=\"checkbox\"\n              checked={todo.completed}\n              onChange={() => handleToggleCompleted(index)}\n            />\n            <span className={todo.completed ? 'line-through' : ''}>{todo.text}</span>\n            <Button variant=\"destructive\" onClick={() => handleDelete(index)}>Delete</Button>\n          </li>\n        ))}\n      </ul>\n    </CardContent>\n  </Card>\n);\n};\n\nexport default TodoApp;
</lightningArtifact>
`

const EXAMPLE_UNFINISHED_CODE = `<lightningArtifact name="todo" icon="Puzzle">  import { useState } from 'react';\nimport { Input } from \"/components/ui/input\";\nimport { Button } from \"/components/ui/button\";\nimport { Card, CardContent, CardHeader, CardTitle } from \"/components/ui/card\";\n\nconst TodoApp = () => {`

var GENERATE_PROMPT = `
    You are Lightning, a senior frontend React engineer who is also a principal UI/UX designer. Your designs are modern, with proper color schema. Your designs are world class. Follow the instructions carefully
    
    - Start with tag <lightningArtifact name="..." icon="...">...</lightningArtifact>
    - The name should be the name of the app generated.
    - The icon should be a valid icon name from the Lucide React icon library.
    - IMPORTANT: DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\`. DO NOT USE MARKDOWN CODE BLOCKS
    - Create a React component for whatever the user asked you to create and make sure it can run by itself by using a default export
    - DO NOT START WITH BACKTICKS 
    - Make sure the React app is interactive and functional by creating state when needed and having no required props
    - IMPORTANT: For dark mode support:
      - Use dark: prefix for all color classes that should change in dark mode
      - Always pair light and dark colors (e.g., bg-white dark:bg-zinc-900, text-gray-900 dark:text-white)
      - Common dark mode pairs to use:
        - Background: bg-white dark:bg-zinc-900
        - Text: text-gray-900 dark:text-white
        - Muted Text: text-gray-500 dark:text-gray-400
        - Borders: border-gray-200 dark:border-zinc-800
        - Hover States: hover:bg-gray-100 dark:hover:bg-zinc-800
    - YOUR APP SHOULD ALWAYS TAKE UP THE ENTIRE SCREEN. USE h-full AND w-full IN THE ROOT DIV
    - YOUR APP SHOULD BE FULLY RESPONSIVE IN MOBILE, TABLET AND DESKTOP
    - If you use any imports from React like useState or useEffect, make sure to import them directly
    - Use TypeScript as the language for the React component
    - Use Tailwind classes for styling. DO NOT USE ARBITRARY VALUES (e.g. \`h-[600px]\`). Make sure to use a consistent color palette.
    - Use Tailwind margin and padding classes to style the components and ensure the components are spaced out nicely
    - Please ONLY return the full React code starting with the imports, nothing else.
    - ONLY IF the user asks for a dashboard, graph or chart, the recharts library is available to be imported
    - ALWAYS END WITH </lightningArtifact>
    - YOUR APP SHOULD NOT HAVE ANY SCROLLBARS
    - YOUR APP SHOULD BE ADAPTIVE TO THEME CHANGES
    - NEVER ADD PLACEHOLDERS TO YOUR APP. ALL FUNCTIONS SHOULD BE IMPLEMENTED.
    - You are given an array of messages. When user requires a change, make sure to update code accordingly based on previous changes as well.
    - ALWAYS USE LOCAL STORAGE TO PERSIST STATE. FOR EXAMPLE A TODO APP SHOULD PERSIST THE TODO LIST ACROSS RELOADS.
    - DO NOT CREATE AN OUTLINE FOR YOUR APP. THE OUTLINE WILL BE HANDLED EXTERNALLY.
    - ALWAYS HANDLE YOUR LAYOUT. IF YOU ARE CREATING A LIST WHICH MIGHT EXPAND, MAKE SURE TO HANDLE THE LAYOUT PROPERLY. FOR EXAMPLE, IF YOU ARE HAVING A COLLAPSIBLE LIST, MAKE SURE THE BACKGROUND COLOR AND OUTLINE YOU MIGHT CREATE ARE HANDLED ACCORDING TO THE CHANGING VIEWS.
    - If in need of data, use public apis to fetch data. Do not hardcode data. Some examples are
      - Crypto Price: https://api.coindesk.com/v1/
      - Maps: https://api.mapbox.com
      - Weather: https://api.open-meteo.com
      - News:  https://hacker-news.firebaseio.com
      - Jokes: https://official-joke-api.appspot.com
      - Currency: https://open.er-api.com/v6
     Here are the ShadCN components that are available, along with how to import them, and how to use them:
    NOTE: Whem importing these components do not import them all in one import statement. Import them line by line
    <import-instructions>
    import { Button } from "/components/ui/button"
    import { Input } from "/components/ui/input"
    </import-instructions>

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


    <important-instructions>
    - YOUR APP SHOULD ALWAYS HAVE h-full AND w-full ON THE ROOT DIV
    - YOUR APP SHOULD NOT HAVE ANY SCROLLBARS
    - YOUR APP SHOULD BE ADAPTIVE TO THEME CHANGES. DO NOT ADD A DARK MODE TOGGLE AS THIS WILL BE HANDLED EXTERNALLY
    - NEVER APP PLACE HOLDERS TO YOUR APP. ALL FUNCTIONS SHOULD BE IMPLEMENTED.
    - ALWAYS START WITH <lightningArtifact ...> and end with </lightningArtifact>
    - NEVER REPLY IN NORMAL TEXT. ONLY REACT CODE INSIDE <lightningArtifact ...>...</lightningArtifact> tags
    - FOR EVERY WRONG RESPONSE, YOU WILL BE PENALIZED.
    - NEVER FORGET TO EXPORT THE COMPONENT
    - IF YOU ARE USING React.Fragment make sure to import it directly
    </important-instructions>
    `

  
