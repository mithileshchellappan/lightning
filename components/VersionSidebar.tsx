import React from 'react';
import { Button } from "@/components/ui/button";
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import Image from 'next/image';

interface Version {
  id: string;
  version: string;
  prompt: string;
  isActive: boolean;
  imageUrl: string;
  timestamp: string;
}

const VersionSidebar: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const versions: Version[] = [
    { id: 'v0', version: 'v0', prompt: 'generate a sudoku app', isActive: false, imageUrl: '/path/to/image0.png', timestamp: '2 hours ago' },
    { id: 'v1', version: 'v1', prompt: 'where are the numbers?', isActive: true, imageUrl: '/path/to/image1.png', timestamp: 'about 2 hours ago' },
    { id: 'v2', version: 'v2', prompt: 'Delete element', isActive: false, imageUrl: '/path/to/image2.png', timestamp: '1 hour ago' },
    { id: 'v3', version: 'v3', prompt: 'this is good', isActive: false, imageUrl: '/path/to/image3.png', timestamp: '30 minutes ago' },
    { id: 'v4', version: 'v4', prompt: 'Generated UI from the prompt', isActive: false, imageUrl: '/path/to/image4.png', timestamp: '15 minutes ago' },
  ];

  return (
    <div className="w-[44px] shrink-0 select-none flex flex-col bg-white dark:bg-zinc-900 h-full border-r border-gray-200 dark:border-zinc-800 hidden md:flex">
      <div className="flex-grow overflow-y-auto py-2">
        {versions.map((version) => (
          <HoverCard key={version.id}
          openDelay={2}
          closeDelay={0}
          >
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                className={`w-[80%] h-10 p-4 justify-center ${
                  version.isActive ? 'text-sm font-medium bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 rounded-md hover:bg-blue-200 transition-colors' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="text-xs font-mono">{version.version}</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent 
              className="w-80 p-0" 
              side="right"
              sideOffset={12} 
              align="start"
              alignOffset={-10} 
            >
              <div className="flex flex-col">
                <Image
                  src={version.imageUrl}
                  alt={version.prompt}
                  width={320}
                  height={180}
                  className="rounded-t-md"
                />
                <div className="p-4">
                  <p className="text-sm font-semibold mb-1">{version.prompt}</p>
                  <p className="text-xs text-gray-500">{version.timestamp}</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
      <div className="mt-auto p-2 border-t border-gray-200 dark:border-zinc-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="w-full p-0 justify-center"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default VersionSidebar;
