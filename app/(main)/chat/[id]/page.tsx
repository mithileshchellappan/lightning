'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import CodeViewer from '@/components/code-viewer'
import RevisionInput from '@/components/RevisionInput'
import VersionSidebar, { Version } from '@/components/VersionSidebar'
import { Button } from "@/components/ui/button"
import { History, ArrowUpRight, Code, RefreshCcw } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from 'next/image'
import Ripple from '@/components/ui/ripple'
import { SandpackPreviewRef } from '@codesandbox/sandpack-react/unstyled'
import ShinyButton from '@/components/ui/shiny-button'

const mockVersions = [
  { id: 'v0', version: 'v0', content: 'generate a sudoku app', imageUrl: '/path/to/image0.png', timestamp: '2 hours ago' },
  { id: 'v1', version: 'v1', content: 'where are the numbers?', imageUrl: '/path/to/image1.png', timestamp: '2 hours ago' },
  { id: 'v2', version: 'v2', content: 'Delete element', imageUrl: '/path/to/image2.png', timestamp: '1 hour ago' },
  { id: 'v3', version: 'v3', content: 'this is good', imageUrl: '/path/to/image3.png', timestamp: '30 minutes ago' },
  { id: 'v4', version: 'v4', content: 'Generated UI from the prompt', imageUrl: '/path/to/image4.png', timestamp: '15 minutes ago' },
]

const errorCode = 'export default function App() { return (<div>Error Fetching Code</div>) }'

export default function RenderPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id
  var question = searchParams.get('question') || ''
  const [message, setMessage] = useState('')
  const [code, setCode] = useState<{code: string, name?: string, icon?: string}>({code: '', name: undefined, icon: undefined})
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([])
  const [viewCode, setViewCode] = useState(false)
  const [versions, setVersions] = useState<Version[]>(mockVersions)
  const iframeRef = useRef<SandpackPreviewRef>(null)


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
      console.log("result", result)
      setCode(result)
      setMessages([{ role: 'user', content: query }, { role: 'assistant', content: result }])
      fetchSuggestions(result.code, query)
    } catch (error) {
      console.error('Error fetching code:', error)
      setCode({code: errorCode, name: 'Error occurred', icon: ''})
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
      setCode(result)
      setMessage('')
      console.log("Updating Code")
      setViewCode(false)
      setMessages([...messages, { role: 'assistant', content: code.code }])
      fetchSuggestions(code.code, query)
    } catch (error) {
      console.error('Error fetching code:', error)
      setCode({code: errorCode, name: code.name, icon: code.icon})
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
      let previousLine = ''
      while (true) {
        const { done, value } = await reader?.read()
        if (done) break
        console.log(`value: ${value} previousLine: ${previousLine}`)
        previousLine += value
        if (previousLine.includes('<suggestion>') && previousLine.includes('</suggestion>')) {
          const suggestion = previousLine.substring(
            previousLine.indexOf('<suggestion>') + '<suggestion>'.length,
            previousLine.indexOf('</suggestion>')
          )
          setSuggestions(prevSuggestions => [...prevSuggestions, suggestion])
          previousLine = previousLine.substring(previousLine.indexOf('</suggestion>') + '</suggestion>'.length)
        }
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  useEffect(() => {
    if (question) {
      fetchCode(question)
      question = ''
    }
    console.log('running effect')
  }, [question])

  useEffect(() => {
    console.log("ver",versions)
  }, [versions])

  const handleSend = () => {
    updateCode(message)
    setIsLoading(true)
    setSuggestions([])
  }

  const handleViewCode = () => {
    setViewCode(!viewCode)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
  }

  const handleUpdate = (error: string) => {
    // if (errorCount < 4) {
    //   setErrorCount(prevCount => prevCount + 1);
    //   if (messages.length > 0 && !isLoading) {
    //     updateCode("An error occurred: " + error);
    //   }
    // }
  };

  const handleError = (error: string) => {
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white flex dark:bg-black border-b border-gray-200 dark:border-zinc-800 p-2 sm:p-4 justify-between ">
            <h1 className="text-lg ml-6 sm:text-2xl font-bold truncate">{code.name ?? 'Lightning'}</h1>
            <div className='flex items-center'>
            <TooltipProvider>
              <div className="flex box-content h-6 items-center gap-2 rounded-md border border-gs-gray-alpha-400 bg-white dark:bg-zinc-800 p-1 ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleViewCode} className="dark:text-white">
                      <Code className="h-4 w-4" />
                      <span className="sr-only">View Code</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Code</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            <ShinyButton className='ml-5' >Publish</ShinyButton>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow flex flex-col overflow-hidden p-4">
          <div className="flex-grow bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-lg">
            <div className="h-full overflow-auto">
              {(isLoading) ? <LoadingRipple /> : <CodeViewer ref={iframeRef} code={code.code} viewCode={viewCode} />}
            </div>
          </div>
          <div className="mt-4 flex flex-col space-y-2">
            {suggestions.length > 0 && (
              <div className="flex overflow-x-auto no-scrollbar">
                <div className="flex space-x-2 pb-2">
                  {suggestions.slice(0, 7).map((suggestion, index) => (
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
                disabled={isLoading}
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

const HistorySheet = ({versions}: {versions: Version[]}) => (
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
        {versions.map((version,index) => (
          <div key={version.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="relative w-16 h-16">
              {version.imageUrl.startsWith('data:image/png;base64,') ? (
                <img
                  src={version.imageUrl}
                  alt={version.content}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <Image
                  src={version.imageUrl}
                  alt={version.content}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">v{index}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{version.content}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{version.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </SheetContent>
  </Sheet>
)
