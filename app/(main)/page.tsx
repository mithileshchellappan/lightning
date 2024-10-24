'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuestion } from '@/context/QuestionContext'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import { LucideIcon } from 'lucide-react'
import Image from 'next/image'
import { RainbowButton } from '@/components/ui/rainbow-button'
import FlickeringGrid from '@/components/ui/flickering-grid'
import AnimatedShinyText from '@/components/ui/animated-shiny-text'
import ChatInput from '@/components/chat-input'
import { ModeToggle } from '@/components/theme-toggle'

export default function AIAssistant() {
  const { question, setQuestion } = useQuestion()
  const [savedApps, setSavedApps] = useState([
    { name: "Onboarding Flow", description: "A multi-step onboarding process", image: "/placeholder.jpg", icon: "Sparkles" },
    { name: "Cron Job Scheduler", description: "An interface to schedule cron jobs", image: "/placeholder.jpg", icon: "Clock" },
    { name: "Array Flattener", description: "A function to flatten nested arrays", image: "/placeholder.jpg", icon: "Layers" },
  ])
  const { resolvedTheme } = useTheme()
  const router = useRouter()

  const handleGenerate = () => {
    if (question.trim()) {
      const chatId = Date.now().toString() // Generate a unique ID based on timestamp
      router.push(`/chat/${chatId}`)
    }
  }

  const handleAppClick = (appName: string) => {
    console.log(`Clicked on app: ${appName}`)
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
        <ModeToggle
          className="fixed top-4 right-4 z-20"
        />

        <div className="w-full max-w-4xl space-y-8">
          <div className="flex justify-center">
            <AnimatedShinyText >
              ⚡️
              <span className="ml-2">Powered by SambaNova Cloud</span>
            </AnimatedShinyText>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-center">
            Start generating your Instant App
          </h1>

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

          <div>
            <div className="flex items-center mb-4">
              <LucideIcons.Save className="w-6 h-6 mr-2 text-gray-600 dark:text-gray-400" />
              <h2 className="text-2xl font-bold">Your Saved Apps</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedApps.map((app, index) => {
                const IconComponent = (LucideIcons[app.icon as keyof typeof LucideIcons] as LucideIcon) || LucideIcons.Sparkles;
                return (
                  <Button
                    key={index}
                    className="p-0 h-auto w-full"
                    variant="ghost"
                    onClick={() => handleAppClick(app.name)}
                  >
                    <Card className="w-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden group">
                      <div className="relative aspect-[4/3]">
                        <Image
                          // src="https://sambanova.ai/hubfs/sambanova-x-li-card-1104x552.png"
                          src={app.image}
                          alt={app.name}
                          layout="fill"
                          objectFit="cover"
                        />
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
        </div>
      </div>
    </div>
  )
}
