'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import { LucideIcon } from 'lucide-react'
import Image from 'next/image'
import { RainbowButton } from '@/components/ui/rainbow-button'
import FlickeringGrid from '@/components/ui/flickering-grid'
import AnimatedShinyText from '@/components/ui/animated-shiny-text'
import ChatInput from '@/components/chat-input'
import { ModeToggle } from '@/components/theme-toggle'
import GradualSpacing from '@/components/ui/gradual-spacing'
import { useClerk, UserButton, useUser } from '@clerk/nextjs'
import CodeViewer from '@/components/code-viewer'

interface PublishedApp {
  id: string;
  name: string;
  icon: string;
  code: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function AIAssistant() {
  const [question, setQuestion] = useState('')
  const [savedApps, setSavedApps] = useState<PublishedApp[]>([])
  const { resolvedTheme } = useTheme()
  const router = useRouter()
  const clerk = useClerk();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      fetchPublishedApps();
    }
  }, [isSignedIn, user]);

  const fetchPublishedApps = async () => {
    try {
      const response = await fetch(`/api/publish?userId=${user?.id}`);
      if (response.ok) {
        const apps = await response.json();
        setSavedApps(apps);
      } else {
        console.error('Failed to fetch published apps');
      }
    } catch (error) {
      console.error('Error fetching published apps:', error);
    }
  };

  const handleGenerate = () => {
    if(!isSignedIn) {
      clerk.openSignIn();
      return;
    }
    if (question.trim()) {
      const chatId = Date.now().toString() // Generate a unique ID based on timestamp
      router.push(`/chat/${chatId}?question=${encodeURIComponent(question)}`)
    }
  }

  const handleAppClick = (appId: string) => {
    router.push(`/app/${appId}`)
  }

  return (
    <div className="min-h-screen relative bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
      <FlickeringGrid
        className="absolute inset-0 z-0"
        color={resolvedTheme === "dark" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
        maxOpacity={0.1}
      />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        {/* Add the dark mode toggle button */}
        <div className="flex items-center">
        <ModeToggle
          className="fixed top-4 left-4 z-20"
        />
        <div className="fixed top-4 right-4 z-20">
        <UserButton />
        </div>
        </div>

        

        <div className="w-full max-w-4xl space-y-8">
          <div className="flex justify-center">
            <AnimatedShinyText >
              ⚡️
              <span className="ml-2">Powered by SambaNova Cloud</span>
            </AnimatedShinyText>
          </div>

          <GradualSpacing text="Generate Apps in ⚡️ Speed" className="text-4xl sm:text-5xl font-bold text-center"/>
            

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-grow">
              <ChatInput
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Generate a Sudoku App"
              />
            </div>
            <RainbowButton
              className="h-14 px-6 text-white dark:text-black text-lg font-medium sm:w-auto w-full"
              onClick={handleGenerate}
            >
              Generate
            </RainbowButton>
          </div>
          {isSignedIn && savedApps.length > 0 && (
          <div>
            <div className="flex items-center mb-4">
              <LucideIcons.Save className="w-6 h-6 mr-2 text-gray-600 dark:text-gray-400" />
              <h2 className="text-2xl font-bold">Your Saved Apps ({savedApps.length})</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedApps.map((app) => {
                const IconComponent = (LucideIcons[app.icon as keyof typeof LucideIcons] as LucideIcon) || LucideIcons.Sparkles;
                return (
                  <Button
                    key={app.id}
                    className="p-0 h-auto w-full"
                    variant="ghost"
                    onClick={() => handleAppClick(app.id)}
                  >
                    <Card className="w-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden group">
                      <div className="relative aspect-[4/3]">
                        <CodeViewer code={app.code} />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent">
                          <div className="p-3">
                            <h3 className="font-medium text-sm flex items-center text-white">
                              <IconComponent className="w-3 h-3 mr-1 text-teal-400 flex-shrink-0" />
                              <span className="truncate">{app.name}</span>
                            </h3>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 bg-white dark:bg-zinc-800 rounded-full p-1">
                          <LucideIcons.ArrowUpRight className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </Card>
                  </Button>
                );
              })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
