"use client";

import { Button } from "@/components/ui/button";

export type TranslationMode = "direct" | "summary";

interface ModeSelectorProps {
  mode: TranslationMode;
  onModeChange: (mode: TranslationMode) => void;
}

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      <Button
        variant={mode === "direct" ? "default" : "ghost"}
        size="sm"
        className="flex-1 text-xs"
        onClick={() => onModeChange("direct")}
      >
        직역 (Direct)
      </Button>
      <Button
        variant={mode === "summary" ? "default" : "ghost"}
        size="sm"
        className="flex-1 text-xs"
        onClick={() => onModeChange("summary")}
      >
        요약 (Summary)
      </Button>
    </div>
  );
}
