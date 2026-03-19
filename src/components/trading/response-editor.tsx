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

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-card p-1">
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
        <span className="text-xs text-muted-foreground">{value.length} characters</span>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
