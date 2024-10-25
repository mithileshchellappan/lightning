import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface RevisionInputProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const RevisionInput: React.FC<RevisionInputProps> = ({ value, onChange, onSubmit, disabled = false }) => {
  return (
    <div className="relative w-full max-w mx-auto">
      <div className="relative flex items-center">
        <Sparkles className="absolute left-3 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-20 py-6 w-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-black dark:text-white rounded-full shadow-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Add in your changes"
        />
        <Button
          onClick={onSubmit}
          disabled={disabled}
          className="absolute right-2 bg-transparent hover:bg-slate-100 dark:hover:bg-gray-800 text-black dark:text-white  rounded-full p-3"
        >
          {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="size-10" />}
        </Button>
      </div>
    </div>
  );
};

export default RevisionInput;
