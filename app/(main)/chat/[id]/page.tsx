'use client'

import { useParams } from 'next/navigation'
import { useQuestion } from '@/context/QuestionContext'
import { useEffect, useState } from 'react'
import CodeViewer from '@/components/code-viewer'
import RevisionInput from '@/components/RevisionInput'
import VersionSidebar from '@/components/VersionSidebar'
import { Button } from "@/components/ui/button"
import { Save, RefreshCw, History, ArrowUpRight } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from 'next/image'
import Ripple from '@/components/ui/ripple'

const versions = [
  { id: 'v0', version: 'v0', prompt: 'generate a sudoku app', imageUrl: '/path/to/image0.png', timestamp: '2 hours ago' },
  { id: 'v1', version: 'v1', prompt: 'where are the numbers?', imageUrl: '/path/to/image1.png', timestamp: '2 hours ago' },
  { id: 'v2', version: 'v2', prompt: 'Delete element', imageUrl: '/path/to/image2.png', timestamp: '1 hour ago' },
  { id: 'v3', version: 'v3', prompt: 'this is good', imageUrl: '/path/to/image3.png', timestamp: '30 minutes ago' },
  { id: 'v4', version: 'v4', prompt: 'Generated UI from the prompt', imageUrl: '/path/to/image4.png', timestamp: '15 minutes ago' },
]

const initialCode = 'export default function App() { return <div className="h-full w-full bg-white dark:bg-black">Loading...</div> }'

export default function RenderPage() {
  const params = useParams()
  const id = params.id
  const { question } = useQuestion()
  const [message, setMessage] = useState('')
  const [code, setCode] = useState(initialCode)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([])

  async function fetchCode(query: string) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: query }] }),
      })
      const result = await response.json()
      setCode(result)
      setMessages([{ role: 'user', content: query }, { role: 'assistant', content: result }])
      fetchSuggestions(code, query)
    } catch (error) {
      console.error('Error fetching code:', error)
      setCode("<div>Error fetching code. Please try again.</div>")
    } finally {
      setIsLoading(false)
    }
  }

  async function updateCode(query: string) {
    setIsLoading(true)
    console.log("Loading" + isLoading)
    try {
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: query }] }),
      })
      const result = await response.json()
      console.log("Updating Code")
      setCode(result)
      setMessages([...messages, { role: 'assistant', content: result }])
      fetchSuggestions(code, query)
    } catch (error) {
      console.error('Error fetching code:', error)
      setCode("<div>Error fetching code. Please try again.</div>")
    } finally {
      setIsLoading(false)
    }
  }


  async function fetchSuggestions(code: string, query: string) {
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        body: JSON.stringify({ code }),
      })
      if (!response.body) return
      const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader()
      let result = ''
      while (true) {
        const { done, value } = await reader?.read()
        if (done) break
        console.log(value)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }

  }

  useEffect(() => {
    fetchCode(question)
  }, [])

  const handleSend = () => {
    updateCode(message)
    setMessage('')
    setIsLoading(true)
  }

  const handleSave = () => {
    console.log('Saving...')
  }

  const handleRegenerate = () => {
    console.log('Regenerating...')
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
  }

  const handleError = (error: string) => {
    if (messages.length > 0 && !isLoading) {
      updateCode("An error occurred: " + error)
    }
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
      <div className="hidden md:block">
        <VersionSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 p-2 sm:p-4">
          <div className="max-w-4xl mx-auto flex items-center">
            <h1 className="text-lg sm:text-2xl font-bold truncate">Chat ID: {id}</h1>
            <TooltipProvider>
              <div className="flex box-content h-6 items-center gap-2 rounded-md border border-gs-gray-alpha-400 bg-white dark:bg-zinc-800 p-1 ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleRegenerate} className="dark:text-white">
                      <RefreshCw className="h-4 w-4" />
                      <span className="sr-only">Regenerate</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Regenerate</p>
                  </TooltipContent>
                </Tooltip>
                <div className="shrink-0 bg-gray-200 dark:bg-zinc-700 w-[1px] h-5"></div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleSave} className="dark:text-white">
                      <Save className="h-4 w-4" />
                      <span className="sr-only">Save</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save</p>
                  </TooltipContent>
                </Tooltip>
                <div className="shrink-0 bg-gray-200 dark:bg-zinc-700 w-[1px] h-5 md:hidden"></div>
                <HistorySheet />
              </div>
            </TooltipProvider>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow flex flex-col overflow-hidden p-4">
          <div className="flex-grow bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-lg">
            <div className="h-full overflow-auto">
              {!isLoading ? <LoadingRipple /> : <CodeViewer code={code} onError={handleError} />}
            </div>
          </div>
          <div className="mt-4 flex flex-col space-y-2">
            {suggestions.length > 0 && (
              <div className="flex overflow-x-auto no-scrollbar">
                <div className="flex space-x-2 pb-2">
                  {suggestions.slice(0, 8).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`h-6 px-2 text-xs rounded-full bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 focus:bg-gray-100 dark:focus:bg-zinc-700 focus-visible:bg-gray-100 dark:focus-visible:bg-zinc-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-gray-400 dark:focus:border-gray-500 focus-visible:border-gray-400 dark:focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-black transition-all flex items-center gap-0.5 whitespace-nowrap flex-shrink-0 ${index >= 3 ? 'hidden sm:flex' : ''}`}
                    >
                      <span className="truncate max-w-[180px] text-black dark:text-white">{suggestion}</span>
                      <ArrowUpRight className="h-4 w-4 flex-shrink-0" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="w-full">
              <RevisionInput
                value={message}
                onChange={setMessage}
                onSubmit={handleSend}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const LoadingRipple = () => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
        <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-white darK: ">
          Generating
        </p>
        <Ripple />
      </div>
  )
}

const HistorySheet = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" className="md:hidden">
        <History className="h-4 w-4" />
        <span className="sr-only">History</span>
      </Button>
    </SheetTrigger>
    <SheetContent
      side="bottom"
      className="max-h-[80vh] overflow-y-auto rounded-t-[10px] border-t-0"
    >
      <div className="flex flex-col space-y-4">
        {versions.map((version) => (
          <div key={version.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="relative w-16 h-16">
              <Image
                src={version.imageUrl}
                alt={version.prompt}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{version.version}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{version.prompt}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{version.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </SheetContent>
  </Sheet>
)
