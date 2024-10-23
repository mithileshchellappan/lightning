'use client'

import { useParams } from 'next/navigation'
import { useQuestion } from '@/context/QuestionContext'
import { useTheme } from '@/context/ThemeProvider'
import { useState } from 'react'
import CodeViewer from '@/components/code-viewer'
import RevisionInput from '@/components/RevisionInput'
import VersionSidebar from '@/components/VersionSidebar'
import { Button } from "@/components/ui/button"
import { Save, RefreshCw, History } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from 'next/image'

const versions = [
  { id: 'v0', version: 'v0', prompt: 'generate a sudoku app', imageUrl: '/path/to/image0.png', timestamp: '2 hours ago' },
  { id: 'v1', version: 'v1', prompt: 'where are the numbers?', imageUrl: '/path/to/image1.png', timestamp: '2 hours ago' },
  { id: 'v2', version: 'v2', prompt: 'Delete element', imageUrl: '/path/to/image2.png', timestamp: '1 hour ago' },
  { id: 'v3', version: 'v3', prompt: 'this is good', imageUrl: '/path/to/image3.png', timestamp: '30 minutes ago' },
  { id: 'v4', version: 'v4', prompt: 'Generated UI from the prompt', imageUrl: '/path/to/image4.png', timestamp: '15 minutes ago' },
]

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

export default function ChatPage() {
  const params = useParams()
  const id = params.id
  const { question } = useQuestion()
  const { isDarkMode } = useTheme()
  const [message, setMessage] = useState('')

  const handleSend = () => {
    // Implement send logic here
    console.log('Sending message:', message)
    setMessage('')
  }

  const handleSave = () => {
    // Implement save logic here
    console.log('Saving...')
  }

  const handleRegenerate = () => {
    // Implement regenerate logic here
    console.log('Regenerating...')
  }

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
      <div className="hidden md:block">
        <VersionSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 p-2 sm:p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h1 className="text-lg sm:text-2xl font-bold truncate">Chat ID: {id}</h1>
            <TooltipProvider>
              <div className="flex box-content h-6 items-center gap-2 rounded-md border border-gs-gray-alpha-400 bg-white p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleRegenerate}>
                      <RefreshCw className="h-4 w-4" />
                      <span className="sr-only">Regenerate</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Regenerate</p>
                  </TooltipContent>
                </Tooltip>
                <div className="shrink-0 bg-gray-200 w-[1px] h-5"></div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleSave}>
                      <Save className="h-4 w-4" />
                      <span className="sr-only">Save</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save</p>
                  </TooltipContent>
                </Tooltip>
                <div className="shrink-0 bg-gray-200 w-[1px] h-5 md:hidden"></div>
                <HistorySheet />
              </div>
            </TooltipProvider>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow flex flex-col overflow-hidden p-4">
          <div className="flex-grow bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-lg">
            <div className="h-full overflow-auto p-4">
              <CodeViewer code={question} />
            </div>
          </div>
          <div className="mt-4">
            <RevisionInput
              value={message}
              onChange={setMessage}
              onSubmit={handleSend}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
