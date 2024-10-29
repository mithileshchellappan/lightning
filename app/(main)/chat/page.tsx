'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import CodeViewer from '@/components/code-viewer'
import RevisionInput from '@/components/RevisionInput'
import VersionSidebar from '@/components/VersionSidebar'
import { Button } from "@/components/ui/button"
import { History, ArrowUpRight, Code } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Ripple from '@/components/ui/ripple'
import ShinyButton from '@/components/ui/shiny-button'
import { useUser } from '@clerk/nextjs'
import { Version } from '@/components/version'
import placeholder from '@/public/placeholder.svg'
import Image from 'next/image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChatCompletionContentPart, ChatCompletionMessageParam } from 'openai/resources/index.mjs'

const errorCode = `export default function App() {
  return (
    <div>Something went wrong. Please try again.</div>
  );
}`


export default function RenderPage() {
  const searchParams = useSearchParams()
  let question = searchParams.get('question') || ''
  let imageId = searchParams.get('imageId')
  let model = searchParams.get('model')
  let isVision = searchParams.get('isVision')
  const [message, setMessage] = useState('')
  const [code, setCode] = useState<{ code: string, name?: string, icon?: string }>({ code: '', name: undefined, icon: undefined })
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([])
  const [viewCode, setViewCode] = useState(false)
  const [versions, setVersions] = useState<Version[]>([])
  const { user } = useUser();
  const router = useRouter();
  const [showPublishAlert, setShowPublishAlert] = useState(false)

  async function getImage(imageId: string) {
    const fetchedImage = await fetch(`/api/image?id=${imageId}`).then(res => res.json())
    return fetchedImage.imageUrl
  }


  async function handleCodeRequest(query: string, imageId?: string, isUpdate = false) {
    setIsLoading(true);
    try {
      const userContent: ChatCompletionContentPart[] = [{ type: 'text', text: query + `\n Reply only the react component starting with <lightningArtifact and ending with </lightningArtifact>. IMPORTANT: DO NOT REPLY IN PLAIN TEXT. DO NOT ADD ANY COMMENTS. ONLY REPLY THE FULL EXPORTED REACT CODE. REACT CODE MUST BE A FULL COMPONENT, LIKE export default function GeneratedApp() { ... }` }]
      if(imageId) {
        const imageUrl = await getImage(imageId)
        userContent.push({ type: 'image_url', image_url: {url: imageUrl, detail: 'auto'}  })
      }
      const userMessage: ChatCompletionMessageParam = { role: 'user', content: userContent }
     
      const requestMessages: ChatCompletionMessageParam[] = isUpdate
        ? [...messages, userMessage]
        : [userMessage];

      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: requestMessages, model, isVision }),
      });

      if (!response.ok || !response.body || response.status !== 200) {
        throw new Error('No response body');
      }

      const result = await response.json();
      console.log("result", result);

      setCode(result);
      setMessage('');
      setMessages([...messages, { role: 'assistant', content: [{ type: 'text', text: result.code }] }]);
      // fetchSuggestions(result.code);

      setVersions(prevVersions => [
        ...prevVersions,
        {
          id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          content: result.code,
          prompt: query,
        },
      ]);

      if (isUpdate) {
        setViewCode(false);
      }
    } catch (error) {
      console.error('Error fetching code:', error);
      setCode({ code: errorCode, name: 'Error occurred', icon: '' });
    } finally {
      setIsLoading(false);
    }
  }

  function fetchCode(query: string, imageId?: string) {
    handleCodeRequest(query, imageId);
  }

  function updateCode(query: string, imageId?: string) {
    handleCodeRequest(query, imageId, true);
  }

  async function fetchSuggestions(code: string) {
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
    if (!user) {
      router.push('/')
      return;
    }
    if (question) {
      fetchCode(question, imageId)
      setMessage(question)
      question = ''
    }
    console.log('running effect')
  }, [question])

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

  const errorCallback = (errorMessage: string) => {
    console.log("errorMessage", errorMessage)
    setMessage(`Error Occured: ${errorMessage}`)
  }

  const screenShotCallback = (imageUrl: string) => {
    console.log("imageUrl", imageUrl)
    let lastVersion = versions[versions.length - 1]
    versions[versions.length - 1] = { ...lastVersion, imageUrl }
    setVersions([...versions])
  }

  const handlePublish = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    if (!code.code || !code.name || !code.icon) {
      console.error('Missing required data for publishing');
      return;
    }

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: code.name,
          code: code.code,
          icon: code.icon,
          userId: user.id,
          imageUrl: versions[versions.length - 1].imageUrl
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish app');
      }

      const result = await response.json();
      console.log('App published successfully:', result);

      const appUrl = `${window.location.origin}/app/${result.id}`;
      await navigator.clipboard.writeText(appUrl);

      setShowPublishAlert(true);
    } catch (error) {
      console.error('Error publishing app:', error);
    }
  };
  return (
    <div className="h-screen flex bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
      <div className="hidden md:block">
        <VersionSidebar versions={versions} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white flex dark:bg-black border-b border-gray-200 dark:border-zinc-800 p-2 sm:p-4 justify-between ">
          <h1 className="text-lg ml-6 sm:text-2xl font-bold truncate">{code.name ?? ''}</h1>
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
                <div className="shrink-0 bg-gray-200 dark:bg-zinc-700 w-[1px] h-5 md:hidden"></div>
                <HistorySheet versions={versions} />
              </div>
            </TooltipProvider>
            {/* @ts-ignore */}
            <ShinyButton className='ml-5' onClick={handlePublish}>Publish</ShinyButton>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow flex flex-col overflow-hidden p-4">
          <div className="flex-grow bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-lg relative">
            {isLoading ?
              <LoadingRipple /> :
              (
                <div className="h-full w-full scroll-auto">
                  <CodeViewer errorCallback={errorCallback} code={code.code} viewCode={viewCode} screenShotCallback={screenShotCallback} />
                </div>
              )}
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

      <AlertDialog open={showPublishAlert} onOpenChange={setShowPublishAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>App Published Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              Your app has been published and is now available in your saved apps. 
              The app URL has been copied to your clipboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPublishAlert(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const LoadingRipple = () => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
        <p className="z-10 whitespace-pre-wrap text-center text-5xl font-mono font-medium tracking-tighter text-white darK: ">
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
          <div key={version.id} className="flex items-center pb-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="relative w-16 h-16">
              <Image src={version.imageUrl ?? placeholder} alt={version.prompt} fill className="object-cover" />
            </div>
            <div className="flex-1 pl-2">
              <p className="font-semibold">v{index}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{version.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </SheetContent>
  </Sheet>
)
