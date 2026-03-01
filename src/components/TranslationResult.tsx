"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TranslationResultProps {
  originalText: string;
  translatedText: string;
  detectedLanguage?: string;
  isLoading: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs">
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="h-4 w-full rounded bg-muted" />
      <div className="h-4 w-5/6 rounded bg-muted" />
      <div className="h-4 w-2/3 rounded bg-muted" />
    </div>
  );
}

export default function TranslationResult({
  originalText,
  translatedText,
  detectedLanguage,
  isLoading,
}: TranslationResultProps) {
  if (!isLoading && !originalText) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Original{detectedLanguage ? ` (${detectedLanguage})` : ""}
          </CardTitle>
          {originalText && <CopyButton text={originalText} />}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {originalText}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Translation</CardTitle>
          {translatedText && <CopyButton text={translatedText} />}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {translatedText}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
