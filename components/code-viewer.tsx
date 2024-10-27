"use client";

import { useEffect } from "react"
import * as shadcnComponents from "@/utils/shadcn-ui-extract";
import { SandpackLogLevel } from "@codesandbox/sandpack-client";
import { atomDark } from '@codesandbox/sandpack-themes'

import {
  SandpackCodeEditor,
  SandpackCodeViewer,
  // Sandpack,
  SandpackInternalOptions,
  SandpackLayout,
  SandpackPreview,
  SandpackPreviewRef,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react/unstyled";
import dedent from "dedent";
import "./code-viewer.css";
import ErrorDialogue from "./error-dialogue";

export default function CodeViewer({
  code,
  viewCode = false,
  errorCallback,
}: {
  code: string;
  viewCode?: boolean;
  errorCallback?: (error: string) => void;
}) {

  return (
    <SandpackProvider
      theme={atomDark}
      files={{
        "App.tsx": `
        import {useEffect, useState} from "react"
        import GeneratedApp from "./GeneratedApp.tsx"

        export default function App() {
          const [isDarkMode, setIsDarkMode] = useState(false)
          useEffect(() => {
            const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            setIsDarkMode(darkModeMediaQuery.matches)

            const listener = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
            darkModeMediaQuery.addEventListener('change', listener)
            console.log("isDarkMode", isDarkMode)
            return () => darkModeMediaQuery.removeEventListener('change', listener)
          }, [])
          return <div className="h-screen w-screen \${isDarkMode ? 'dark' : ''}">
            <GeneratedApp />
          </div>
        }
        `,
        "GeneratedApp.tsx": code,
        "tailwind.config.js": dedent`
          module.exports = {
            content: [
              "./src/**/*.{js,ts,jsx,tsx}",
            ],
            darkMode: "class",
          }
        `,
        ...sharedFiles,
      }}
      className="flex h-full w-full grow flex-col justify-center"
      // @ts-ignore
      options={{ ...sharedOptions }}
      {...sharedProps}
    >
      <SandpackLayout className="h-full w-full">
        {viewCode &&
          <SandpackCodeEditor
            showTabs={false}
            showLineNumbers
            closableTabs={true}
            wrapContent={true}
          />}
        <BaseSandpack viewCode={viewCode} errorCallback={errorCallback} className={viewCode ? 'hidden' : 'flex h-full w-full grow flex-col'} />
      </SandpackLayout>

    </SandpackProvider>
  );
}

function BaseSandpack({
  className,
  viewCode,
  errorCallback
}: {
  className: string;
  viewCode: boolean;
  errorCallback?: (error: string) => void;
}) {
  const { sandpack } = useSandpack()

  useEffect(() => {
    console.log("viewCode", viewCode)
    if (!viewCode) {
      sandpack.setActiveFile('GeneratedApp.tsx')

    }
  }, [viewCode])

  return (
    <>
      {sandpack.error && sandpack.error.message !== '' && (
        <div className="absolute bottom-4 right-4 z-10">
          <ErrorDialogue errorMessage={sandpack.error.message.split('\n')[0]} onClick={() => { errorCallback(sandpack.error.message.split('\n')[0]) }} />
        </div>
      )}
      <SandpackPreview
        className={className}
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
      />
    </>
  )
}


let sharedOptions: SandpackInternalOptions = {
  externalResources: [
    "https://cdn.tailwindcss.com",
  ],
  // autoReload: true,
  recompileMode: "immediate",
  logLevel: SandpackLogLevel.None,
  activeFile: "GeneratedApp.tsx",
  initMode: "immediate",
};

let sharedProps = {
  template: "react-ts",
  customSetup: {
    dependencies: {
      "lucide-react": "latest",
      recharts: "2.9.0",
      "react-router-dom": "latest",
      //MARK: Radix UI
      "@radix-ui/react-accordion": "^1.2.0",
      "@radix-ui/react-alert-dialog": "^1.1.1",
      "@radix-ui/react-aspect-ratio": "^1.1.0",
      "@radix-ui/react-avatar": "^1.1.0",
      "@radix-ui/react-checkbox": "^1.1.1",
      "@radix-ui/react-collapsible": "^1.1.0",
      "@radix-ui/react-dialog": "^1.1.1",
      "@radix-ui/react-dropdown-menu": "^2.1.1",
      "@radix-ui/react-hover-card": "^1.1.1",
      "@radix-ui/react-label": "^2.1.0",
      "@radix-ui/react-menubar": "^1.1.1",
      "@radix-ui/react-navigation-menu": "^1.2.0",
      "@radix-ui/react-popover": "^1.1.1",
      "@radix-ui/react-progress": "^1.1.0",
      "@radix-ui/react-radio-group": "^1.2.0",
      "@radix-ui/react-select": "^2.1.1",
      "@radix-ui/react-separator": "^1.1.0",
      "@radix-ui/react-slider": "^1.2.0",
      "@radix-ui/react-slot": "^1.1.0",
      "@radix-ui/react-switch": "^1.1.0",
      "@radix-ui/react-tabs": "^1.1.0",
      "@radix-ui/react-toast": "^1.2.1",
      "@radix-ui/react-toggle": "^1.1.0",
      "@radix-ui/react-toggle-group": "^1.1.0",
      "@radix-ui/react-tooltip": "^1.1.2",
      "class-variance-authority": "^0.7.0",
      clsx: "^2.1.1",
      "date-fns": "^3.6.0",
      "embla-carousel-react": "^8.1.8",
      "react-day-picker": "^8.10.1",
      "tailwind-merge": "^2.4.0",
      "tailwindcss-animate": "^1.0.7",
      "next-themes": "^0.3.0",
      vaul: "^0.9.1",
    },
  },
} as const;


//MARK: SHADCN COMPONENTS
let sharedFiles = {
  "/lib/utils.ts": shadcnComponents.utils,
  "/components/ui/accordion.tsx": shadcnComponents.accordian,
  "/components/ui/alert-dialog.tsx": shadcnComponents.alertDialog,
  "/components/ui/alert.tsx": shadcnComponents.alert,
  "/components/ui/avatar.tsx": shadcnComponents.avatar,
  "/components/ui/badge.tsx": shadcnComponents.badge,
  "/components/ui/breadcrumb.tsx": shadcnComponents.breadcrumb,
  "/components/ui/button.tsx": shadcnComponents.button,
  "/components/ui/calendar.tsx": shadcnComponents.calendar,
  "/components/ui/card.tsx": shadcnComponents.card,
  "/components/ui/carousel.tsx": shadcnComponents.carousel,
  "/components/ui/checkbox.tsx": shadcnComponents.checkbox,
  "/components/ui/collapsible.tsx": shadcnComponents.collapsible,
  "/components/ui/dialog.tsx": shadcnComponents.dialog,
  "/components/ui/drawer.tsx": shadcnComponents.drawer,
  "/components/ui/dropdown-menu.tsx": shadcnComponents.dropdownMenu,
  "/components/ui/input.tsx": shadcnComponents.input,
  "/components/ui/label.tsx": shadcnComponents.label,
  "/components/ui/menubar.tsx": shadcnComponents.menuBar,
  "/components/ui/navigation-menu.tsx": shadcnComponents.navigationMenu,
  "/components/ui/pagination.tsx": shadcnComponents.pagination,
  "/components/ui/popover.tsx": shadcnComponents.popover,
  "/components/ui/progress.tsx": shadcnComponents.progress,
  "/components/ui/radio-group.tsx": shadcnComponents.radioGroup,
  "/components/ui/select.tsx": shadcnComponents.select,
  "/components/ui/separator.tsx": shadcnComponents.separator,
  "/components/ui/skeleton.tsx": shadcnComponents.skeleton,
  "/components/ui/slider.tsx": shadcnComponents.slider,
  "/components/ui/switch.tsx": shadcnComponents.switchComponent,
  "/components/ui/table.tsx": shadcnComponents.table,
  "/components/ui/tabs.tsx": shadcnComponents.tabs,
  "/components/ui/textarea.tsx": shadcnComponents.textarea,
  "/components/ui/toast.tsx": shadcnComponents.toast,
  "/components/ui/toaster.tsx": shadcnComponents.toaster,
  "/components/ui/toggle-group.tsx": shadcnComponents.toggleGroup,
  "/components/ui/toggle.tsx": shadcnComponents.toggle,
  "/components/ui/tooltip.tsx": shadcnComponents.tooltip,
  "/components/ui/use-toast.tsx": shadcnComponents.useToast,
  "/public/index.html": dedent`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root" class="dark"></div>
      </body>
    </html>
  `,
};
