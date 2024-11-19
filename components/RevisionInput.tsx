import React, { useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Sparkles, Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

interface RevisionInputProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onImageUpload?: (file: File) => void;
  onImageRemove?: () => void;
  imageUrl?: string;
  isVisionEnabled?: boolean;
}

const RevisionInput: React.FC<RevisionInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  onImageUpload,
  onImageRemove,
  imageUrl,
  isVisionEnabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative w-full max-w mx-auto">
      <div className="relative flex items-center">
        <Sparkles className="absolute left-3 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-32 py-6 w-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-black dark:text-white rounded-full shadow-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Add in your changes"
        />
        <div className="absolute right-2 flex items-center gap-2">
          {isVisionEnabled && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {imageUrl ? (
                <div className="relative h-8 w-8 rounded-lg border border-gray-200 dark:border-zinc-800">
                  <HoverCard
                    openDelay={2}
                    closeDelay={0}
                  >
                    <HoverCardTrigger>
                      <button
                        onClick={onImageRemove}
                        className="absolute -right-1 -top-1 z-10 h-4 w-4 rounded-full border border-gray-200 bg-white text-gray-900 hover:bg-gray-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 flex items-center justify-center"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="h-full w-full rounded-lg object-cover"
                      />
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="w-[320px] p-2"
                      side="top"
                      align="start"
                    >
                      <div className="aspect-[4/3] w-full relative rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleImageClick}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    !isVisionEnabled && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!isVisionEnabled}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
          <Button
            onClick={onSubmit}
            disabled={disabled}
            className="bg-transparent hover:bg-slate-100 dark:hover:bg-gray-800 text-black dark:text-white rounded-full p-3"
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="size-10" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RevisionInput;
