'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface QuestionContextType {
  question: string
  setQuestion: (question: string) => void
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined)

export function QuestionProvider({ children }: { children: ReactNode }) {
  const [question, setQuestion] = useState('')

  return (
    <QuestionContext.Provider value={{ question, setQuestion }}>
      {children}
    </QuestionContext.Provider>
  )
}

export function useQuestion() {
  const context = useContext(QuestionContext)
  if (context === undefined) {
    throw new Error('useQuestion must be used within a QuestionProvider')
  }
  return context
}
