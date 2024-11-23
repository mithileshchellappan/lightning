import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const Models = [
  {
    id: 0,
    name: "Meta Llama 3.1 405B Instruct",
    value: "Meta-Llama-3.1-405B-Instruct",
    isVisionEnabled: false
  },
  {
    id: 1,
    name: "Meta Llama 3.1 70B Instruct",
    value: "Meta-Llama-3.1-70B-Instruct",
    isVisionEnabled: false
  },
  {
    id: 2,
    name: "Meta Llama 3.2 3B Instruct",
    value: "Meta-Llama-3.2-3B-Instruct",
    isVisionEnabled: false
  },
  {
    id: 3,
    name: "Llama 3.2 90B Vision Instruct",
    value: "Llama-3.2-90B-Vision-Instruct",
    isVisionEnabled: true
  },
]