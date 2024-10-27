import { AlertCircle, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ErrorDialogue({errorMessage, onClick}: {errorMessage: string, onClick: () => void}) {
  return (
    <Card className="w-[300px] bg-[#1c1c1c] text-white border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          Error running artifact
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-400">
          An error occurred while trying to run the generated artifact.
        </p>
        <p className="mt-2 text-xs font-mono bg-[#252525] p-2 rounded">
          {errorMessage}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={onClick} className="w-full bg-[#252525] hover:bg-[#2a2a2a] text-white border border-gray-700">
          <Wand2 className="mr-2 h-4 w-4" />
          Try fixing with Lightning
        </Button>
      </CardFooter>
    </Card>
  )
}