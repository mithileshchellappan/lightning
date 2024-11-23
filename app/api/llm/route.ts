import { NextResponse } from 'next/server'
import { openaiClient } from '@/utils/openai'
import { Models } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const {message} = await request.json()
    console.log("LLM call", message)
    const completion = await openaiClient.chat.completions.create({
      model: Models[0].value,
      messages: [
        {
          role: "system",
          content: "Keep your response short and very concise and to the point. Do not include any additional text or comments. Do not provide formulas and code. If asked for JSON, return the JSON only no backticks we will be directly parsing it. If you are sending list always add a comma at the end of the last item."
        },
        {
          role: "user",
          content: message
        }
      ],
    })
    console.log("LLM call response", completion.choices[0].message.content)
    return NextResponse.json({ response: completion.choices[0].message.content }, { status: 200 })
  } catch (error) {
    console.error('Error creating image:', error)
    return NextResponse.json(
      { error: 'Failed to create image' },
      { status: 500 }
    )
  }
}