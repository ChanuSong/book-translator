"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
  { value: "auto", label: "Auto-detect" },
  { value: "Korean", label: "한국어 (Korean)" },
  { value: "English", label: "English" },
  { value: "Japanese", label: "日本語 (Japanese)" },
  { value: "Chinese", label: "中文 (Chinese)" },
  { value: "Spanish", label: "Español (Spanish)" },
  { value: "French", label: "Français (French)" },
  { value: "German", label: "Deutsch (German)" },
];

const TARGET_LANGUAGES = LANGUAGES.filter((l) => l.value !== "auto");

interface LanguageSelectorProps {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (value: string) => void;
  onTargetChange: (value: string) => void;
}

export default function LanguageSelector({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Source
        </label>
        <Select value={sourceLang} onValueChange={onSourceChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <span className="mt-5 text-muted-foreground">→</span>

      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Target
        </label>
        <Select value={targetLang} onValueChange={onTargetChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TARGET_LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
