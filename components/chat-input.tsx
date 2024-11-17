import * as React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { X, Camera, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react';
import { RainbowButton } from './ui/rainbow-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Models } from '@/lib/utils'

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  cardClassName?: string;
  contentClassName?: string;
  imageUrl?: string;
  handleGenerate: (params: {imageId?: string, model: typeof Models[0]}) => void;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ containerClassName, cardClassName, contentClassName, className, imageUrl, handleGenerate, ...props }, ref) => {

    const [image, setImage] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [selectedModel, setSelectedModel] = useState(Models[0])
    const [isLoading, setIsLoading] = useState(false);
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setImage(result);
        };
        reader.readAsDataURL(file);
      }
    };
  
    const removeImage = () => {
      setImage(null);
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const adjustHeight = () => {
      const textarea = textareaRef.current
      if (textarea) {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto'
        // Calculate line height (assuming 1.5rem line height)
        const lineHeight = 24 // 1.5rem = 24px
        const maxHeight = lineHeight * 5 // 5 lines
        // Set new height with a maximum of 5 lines
        const newHeight = Math.min(textarea.scrollHeight, maxHeight)
        textarea.style.height = `${newHeight}px`
      }
    }

    // Adjust height on content change
    useEffect(() => {
      adjustHeight()
    }, [props.value])

    const handleModelChange = (value: string) => {
      const model = Models.find(m => m.value === value)
      if (model) {
        setSelectedModel(model)
        if (!model.isVisionEnabled && image) {
          removeImage();
        }
      }
    }

    const handlePaste = async (e: ClipboardEvent) => {
      if (!selectedModel.isVisionEnabled) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            try {
              const reader = new FileReader();
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                setImage(dataUrl);
              };
              reader.readAsDataURL(file);
            } catch (error) {
              console.error('Error processing pasted image:', error);
            }
          }
        }
      }
    };

    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.addEventListener('paste', handlePaste);
        return () => {
          textarea.removeEventListener('paste', handlePaste);
        };
      }
      if(!selectedModel.isVisionEnabled) {
        removeImage();
      }
    }, [selectedModel.isVisionEnabled]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        let imageId = null;
        if (image) {
          const response = await fetch('/api/image', {
            method: 'POST',
            body: JSON.stringify({ imageUrl: image })
          });
          imageId = (await response.json()).id;
        }
        
        handleGenerate?.({
          imageId: imageId,
          model: selectedModel
        });
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="w-full max-w-3xl mx-auto">
      <div className="flex w-full flex-col divide-zinc-600 overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-lg shadow-black/40">
        {/* Image Preview Section - Only show when image exists */}
        {image && (
          <div className="border-b border-gray-200 dark:border-zinc-800 p-3">
            <div className="group relative h-[44px] w-[48px] shrink-0 rounded-lg border border-gray-200 dark:border-zinc-800 transition-all">
              <button
                onClick={removeImage}
                className="absolute -right-1.5 -top-1.5 z-10 h-4 w-4 rounded-full border border-gray-200 bg-gray-100 text-gray-900 opacity-0 transition-opacity hover:bg-gray-200 group-hover:opacity-100 inline-flex items-center justify-center"
              >
                <span className="sr-only">Remove image</span>
                <X className="h-2.5 w-2.5" />
              </button>
              <div className="overflow-hidden rounded-lg group-hover:opacity-80">
                <img
                  src={image}
                  alt="Preview"
                  className="relative aspect-[48/44] object-cover object-center"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="relative p-3">
          <div className="flex w-full flex-col gap-6">
            <div className="relative flex w-full min-w-0 flex-1 justify-between self-start">
              <textarea
                ref={textareaRef}
                className="min-h-[1.5rem] max-h-[120px] w-full resize-none overflow-y-auto border-0 bg-transparent text-gray-900 dark:text-white text-sm leading-6 placeholder:text-gray-500 dark:placeholder:text-zinc-400 focus:outline-none"
                placeholder={selectedModel.isVisionEnabled ? "Type or paste an image..." : "Type your message..."}
                {...props}
                rows={1}
                onChange={(e) => {
                  props.onChange?.(e)
                  adjustHeight()
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row w-full gap-2">
              <div className="flex flex-1 gap-2 flex-col sm:flex-row">
                <Select
                  defaultValue={Models[0].value}
                  onValueChange={handleModelChange}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-10">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {Models.map((model) => (
                      <SelectItem key={model.id} value={model.value}>
                        {model.name} {model.isVisionEnabled ? "👁️" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <label className={cn(
                  "cursor-pointer w-full sm:w-auto",
                  !selectedModel.isVisionEnabled && "opacity-50 pointer-events-none"
                )}>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={!selectedModel.isVisionEnabled}
                  />
                  <div className="flex h-10 select-none items-center justify-center sm:justify-start gap-2 rounded-md bg-gray-100 dark:bg-zinc-800 px-4 text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-zinc-700/70 hover:text-gray-900 dark:hover:text-white w-full sm:w-auto">
                    <Camera className="h-4 w-4" />
                    <span className="block">Image</span>
                  </div>
                </label>
              </div>

              <RainbowButton
                type="submit"
                className="h-10 px-6 text-white dark:text-black text-base font-medium w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate'
                )}
              </RainbowButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
  }
)

ChatInput.displayName = 'ChatInput'

export default ChatInput
