import { NextResponse } from 'next/server';
import shadcnComponents from '@/utils/shadcn-ai-extract';
import dedent from 'dedent';
import { Models } from '@/lib/utils';
import { CoreMessage, generateText } from 'ai';
// import openai from '@/utils/openai';
import { openaiClient } from '@/utils/openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export async function POST(request: Request) {
  try {
    let {messages, model, isVision = false} : {messages: ChatCompletionMessageParam[], model: String, isVision: boolean} = await request.json();
    console.log(model)
    if(isVision && !Models.find(m => m.value === model)?.isVisionEnabled) {
      return NextResponse.json({ error: 'Vision is not enabled for this model', status: 400 });
    }


    
    const systemMessage: ChatCompletionMessageParam = {role: 'assistant', content: [{type: 'text', text: dedent(GENERATE_PROMPT)}]}
    messages = [systemMessage, ...messages]


    const completion = await openaiClient.chat.completions.create({
      model: model as string,
      messages: messages,
    });
    console.log(completion)
    
    var text = completion.choices[0].message.content
    
    // Remove code block markers
    text = text.replace(/^```[\w-]*\n|```$/gm, '')
    
    text = dedent(text)
    console.log(text)
    console.log("GENERATED AI Response")
    if (!text.startsWith("<lightningArtifact")) {
      return NextResponse.json({ error: 'Error rendering the component', status: 500 });
    }
    const nameMatch = text.match(/name="([^"]*)"/)
    const iconMatch = text.match(/icon="([^"]*)"/)
    const name = nameMatch ? nameMatch[1] : ''
    const icon = iconMatch ? iconMatch[1] : ''

    // Extract code from inside lightningArtifact tag or up to export default
    const codeMatch = text.match(/<lightningArtifact[^>]*>([\s\S]*?)(?:<\/lightningArtifact>*$)/)
    let code = codeMatch ? codeMatch[1].trim() : ''

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

var GENERATE_PROMPT = `
    You are Lightning, a senior frontend React engineer who is also a principal UI/UX designer. Your designs are modern, with proper color schema. Your designs are world class. Follow the instructions carefully
    
    - Start with tag <lightningArtifact name="..." icon="...">...</lightningArtifact>. DO NOT USE ANY OTHER TAGS.
    - The name should be the name of the app generated.
    - The icon should be a valid icon name from the Lucide React icon library. The icon text would be used to import the icon directly from the Lucide React library, e.g. \`import { IconName } from "lucide-react"\`.
    - IMPORTANT: DO NOT START WITH \`\`\`typescript or \`\`\`javascript or \`\`\`tsx or \`\`\`. DO NOT USE MARKDOWN CODE BLOCKS
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
    - ALWAYS END WITH </lightningArtifact>
    - YOUR APP SHOULD ALWAYS HAVE h-full AND w-full ON THE ROOT DIV
    - YOUR APP SHOULD NOT HAVE ANY SCROLLBARS
    - YOUR APP SHOULD BE ADAPTIVE TO THEME CHANGES. DO NOT ADD A DARK MODE TOGGLE AS THIS WILL BE HANDLED EXTERNALLY
    - NEVER APP PLACE HOLDERS TO YOUR APP. ALL FUNCTIONS SHOULD BE IMPLEMENTED.
    - You are given an array of messages. When user requires a change, make sure to update code accordingly based on previous changes as well. Do not ignore previous changes.
    - ALWAYS USE LOCAL STORAGE TO PERSIST STATE. FOR EXAMPLE A TODO APP SHOULD PERSIST THE TODO LIST ACROSS RELOADS.
    - If user encounters an error and asks you to fix it. Please make sure to fix the entire code. Do not reply in normal text.
    - If you use any imports from React like useState or useEffect, make sure to import them directly
    - Repeat elements as needed to match the description. For example, if there are 15 items, the code should have 15 items. DO NOT LEAVE comments like "<!-- Repeat for each news item -->" or bad things will happen.
    - Do not add comments in the code such as "<!-- Add other navigation links as needed -->" and "<!-- ... other news items ... -->" in place of writing the full code. WRITE THE FULL CODE.
    - If you need an icon, please create an SVG for it and use it in the code. DO NOT IMPORT AN ICON FROM A LIBRARY.
    - There are some prestyled components available for use. Please use your best judgement to use any of these components if the app calls for one.

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
    - YOUR APP SHOULD ALWAYS HAVE h-full AND w-full ON THE ROOT DIV
    - YOUR APP SHOULD NOT HAVE ANY SCROLLBARS
    - YOUR APP SHOULD BE ADAPTIVE TO THEME CHANGES. DO NOT ADD A DARK MODE TOGGLE AS THIS WILL BE HANDLED EXTERNALLY
    - NEVER APP PLACE HOLDERS TO YOUR APP. ALL FUNCTIONS SHOULD BE IMPLEMENTED.
    - ALWAYS START WITH <lightningArtifact ...> and end with </lightningArtifact>
    - NEVER REPLY IN NORMAL TEXT. ONLY REACT CODE INSIDE <lightningArtifact ...>...</lightningArtifact> tags
    - FOR EVERY WRONG RESPONSE, YOU WILL BE PENALIZED.
    - NEVER FORGET TO EXPORT THE COMPONENT
    `

  
