'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"

interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 z-20"
        onClick={toggleDarkMode}
      >
        {isDarkMode ? <LucideIcons.Sun className="h-[1.2rem] w-[1.2rem]" /> : <LucideIcons.Moon className="h-[1.2rem] w-[1.2rem]" />}
      </Button>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
