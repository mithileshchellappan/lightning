import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { ModeToggle } from './theme-toggle';
import { Version } from './version';
import CodeViewer from './code-viewer';

const VersionSidebar: React.FC<{ versions: Version[] }> = ({ versions }) => {

  return (
    <div className="w-[44px] shrink-0 select-none flex-col bg-white dark:bg-black h-full border-r border-gray-200 dark:border-zinc-800 md:flex">
      <div className="flex-grow overflow-y-auto py-2 mt-4">
        {versions.map((version,index) => (
          <HoverCard key={version.id}
          openDelay={2}
          closeDelay={0}
          >
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                className={`w-[80%] h-10 p-4 justify-center ml-1 ${
                  version.isActive ? 'text-sm font-medium bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 rounded-md hover:bg-blue-200 transition-colors' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="text-xs font-mono">v{index}</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent 
              className="w-80 p-0" 
              side="right"
              sideOffset={12} 
              align="start"
              alignOffset={-10} 
            >
              <div className="flex flex-col no-scrollbar overflow-hidden pointer-events-none">
                <CodeViewer code={version.content} />
                <div className="p-4">
                  <p className="text-sm font-semibold mb-1">{version.prompt}</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
      <div className="mt-auto ml-1 p-2 border-t border-gray-200 dark:border-zinc-800">
        <ModeToggle
          className="p-0 justify-center h-4 w-4 outline-none"/>
      </div>
    </div>
  );
};

export default VersionSidebar;
