"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export interface PageResult {
  pageIndex: number;
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
}

interface TranslationResultProps {
  pages: PageResult[];
  totalPages: number;
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
  pages,
  totalPages,
  isLoading,
}: TranslationResultProps) {
  if (!isLoading && pages.length === 0) return null;

  const sorted = [...pages].sort((a, b) => a.pageIndex - b.pageIndex);
  const allOriginal = sorted.map((p) => p.originalText).join("\n\n");
  const allTranslated = sorted.map((p) => p.translatedText).join("\n\n");
  const showMultiPage = totalPages > 1;
  const pendingCount = totalPages - pages.length;

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      {isLoading && showMultiPage && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>
            {pages.length}/{totalPages} pages translated
            {pendingCount > 0 && ` — ${pendingCount} remaining`}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(pages.length / totalPages) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                Original
                {sorted[0]?.detectedLanguage
                  ? ` (${sorted[0].detectedLanguage})`
                  : ""}
              </CardTitle>
              {showMultiPage && pages.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {pages.length} page{pages.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            {allOriginal && <CopyButton text={allOriginal} />}
          </CardHeader>
          <CardContent>
            {pages.length === 0 && isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-4">
                {sorted.map((page) => (
                  <div key={page.pageIndex}>
                    {showMultiPage && (
                      <p className="mb-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Page {page.pageIndex + 1}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {page.originalText}
                    </p>
                  </div>
                ))}
                {isLoading && pendingCount > 0 && (
                  <LoadingSkeleton />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Translation</CardTitle>
            {allTranslated && <CopyButton text={allTranslated} />}
          </CardHeader>
          <CardContent>
            {pages.length === 0 && isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-4">
                {sorted.map((page) => (
                  <div key={page.pageIndex}>
                    {showMultiPage && (
                      <p className="mb-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Page {page.pageIndex + 1}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {page.translatedText}
                    </p>
                  </div>
                ))}
                {isLoading && pendingCount > 0 && (
                  <LoadingSkeleton />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
