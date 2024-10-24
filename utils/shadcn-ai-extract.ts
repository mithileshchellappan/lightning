type ShadcnComponent = {
    name: string;
    importDocs: string;
    usageDocs: string;
}

const shadcnComponents: ShadcnComponent[] = [
    {
        name: "Avatar",
        importDocs: `
import { Avatar, AvatarFallback, AvatarImage } from "/components/ui/avatar";
        `,
        usageDocs: `
<Avatar>
  <AvatarImage src="https://github.com/nutlope.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
        `
    },
    {
        name: "Button",
        importDocs: `
import { Button } from "/components/ui/button"
        `,
        usageDocs: `
<Button>A normal button</Button>
<Button variant='secondary'>Button</Button>
<Button variant='destructive'>Button</Button>
<Button variant='outline'>Button</Button>
<Button variant='ghost'>Button</Button>
<Button variant='link'>Button</Button>
        `
    },
    {
        name: "Card",
        importDocs: `
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "/components/ui/card"
        `,
        usageDocs: `
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
        `
    },
    {
        name: "Checkbox",
        importDocs: `
import { Checkbox } from "/components/ui/checkbox"
        `,
        usageDocs: `
<Checkbox />
        `
    },
    {
        name: "Input",
        importDocs: `
import { Input } from "/components/ui/input"
        `,
        usageDocs: `
<Input />
        `
    },
    {
        name: "Label",
        importDocs: `
import { Label } from "/components/ui/label"
        `,
        usageDocs: `
<Label htmlFor="email">Your email address</Label>
        `
    },
    {
        name: "RadioGroup",
        importDocs: `
import { Label } from "/components/ui/label"
import { RadioGroup, RadioGroupItem } from "/components/ui/radio-group"
        `,
        usageDocs: `
<RadioGroup defaultValue="option-one">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-one" id="option-one" />
    <Label htmlFor="option-one">Option One</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-two" id="option-two" />
    <Label htmlFor="option-two">Option Two</Label>
  </div>
</RadioGroup>
        `
    },
    {
        name: "Select",
        importDocs: `
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
        `,
        usageDocs: `
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
    <SelectItem value="system">System</SelectItem>
  </SelectContent>
</Select>
        `
    },
    {
        name: "Textarea",
        importDocs: `
import { Textarea } from "@/components/ui/textarea"
        `,
        usageDocs: `
<Textarea />
        `
    }
];

export default shadcnComponents;
