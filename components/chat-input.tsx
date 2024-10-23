import * as React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  cardClassName?: string;
  contentClassName?: string;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ containerClassName, cardClassName, contentClassName, className, ...props }, ref) => {
    return (
      <div className={cn("w-full", containerClassName)}>
        <Card className={cn("w-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800", cardClassName)}>
          <CardContent className={cn("p-0 flex items-center", contentClassName)}>
            <textarea
              className={cn(
                "bg-transparent border-none text-lg w-full px-4 py-3 resize-none",
                "min-h-[56px] max-h-[200px] overflow-y-auto",
                "focus:outline-none focus:ring-0",
                className
              )}
              ref={ref}
              rows={1}
              {...props}
            />
          </CardContent>
        </Card>
      </div>
    )
  }
)

ChatInput.displayName = 'ChatInput'

export default ChatInput
