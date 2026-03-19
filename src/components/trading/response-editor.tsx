"use client";

import { useState } from "react";

interface ResponseEditorProps {
  onSubmit: (response: string) => void;
  disabled?: boolean;
}

export function ResponseEditor({ onSubmit, disabled = false }: ResponseEditorProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value);
    }
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-background p-1">
        <textarea
          className="w-full resize-none bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          rows={8}
          placeholder="Write your analysis and response here..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {value.length} characters &middot; {wordCount} words
        </span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="gradient-primary-btn rounded-md px-4 py-2 text-sm font-medium text-white border-0 transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
