import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const Models = [
  {
    name: "Llama 3.2 90B Vision Instruct",
    value: "Llama-3.2-90B-Vision-Instruct",
    isVisionEnabled: true
  },
  {
    name: "Meta Llama 3.1 405B Instruct",
    value: "Meta-Llama-3.1-405B-Instruct",
    isVisionEnabled: false
  },
  {
    name: "Meta Llama 3.1 70B Instruct",
    value: "Meta-Llama-3.1-70B-Instruct",
    isVisionEnabled: false
  },
  {
    name: "Meta Llama 3.2 3B Instruct",
    value: "Meta-Llama-3.2-3B-Instruct",
    isVisionEnabled: false
  },
]