"use client";

import { useState, useCallback } from "react";
import ImageUploader, { ImageData } from "@/components/ImageUploader";
import LanguageSelector from "@/components/LanguageSelector";
import TranslationResult from "@/components/TranslationResult";
import ExpressionPanel from "@/components/ExpressionPanel";
import ChatPanel from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";

interface Expression {
  original: string;
  translated: string;
  explanation: string;
}

export default function Home() {
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("Japanese");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [expressions, setExpressions] = useState<Expression[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingImages, setPendingImages] = useState<ImageData[]>([]);

  const handleImagesSelect = useCallback((images: ImageData[]) => {
    setPendingImages(images);
    setError(null);
  }, []);

  const handleTranslate = async () => {
    if (pendingImages.length === 0) return;

    setIsLoading(true);
    setError(null);
    setOriginalText("");
    setTranslatedText("");
    setExpressions([]);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: pendingImages.map((img) => ({
            base64: img.base64,
            mimeType: img.mimeType,
          })),
          sourceLang,
          targetLang,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setOriginalText(data.originalText || "");
      setTranslatedText(data.translatedText || "");
      setDetectedLanguage(data.detectedLanguage || "");
      setExpressions(data.expressions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const chatContext =
    originalText && translatedText
      ? { originalText, translatedText }
      : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Book Translator
            </h1>
            <p className="text-xs text-muted-foreground">
              Upload book pages — get OCR, translation & useful expressions
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left column */}
          <div className="space-y-6">
            <div className="space-y-4">
              <LanguageSelector
                sourceLang={sourceLang}
                targetLang={targetLang}
                onSourceChange={setSourceLang}
                onTargetChange={setTargetLang}
              />
              <ImageUploader
                onImagesSelect={handleImagesSelect}
                isLoading={isLoading}
              />
              <Button
                onClick={handleTranslate}
                disabled={pendingImages.length === 0 || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Translating {pendingImages.length} page
                    {pendingImages.length > 1 ? "s" : ""}...
                  </span>
                ) : (
                  `Translate${pendingImages.length > 1 ? ` (${pendingImages.length} pages)` : ""}`
                )}
              </Button>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <TranslationResult
              originalText={originalText}
              translatedText={translatedText}
              detectedLanguage={detectedLanguage}
              isLoading={isLoading}
            />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <ExpressionPanel
              expressions={expressions}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      <ChatPanel context={chatContext} />
    </div>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  const toggle = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove("dark");
    } else {
      html.classList.add("dark");
    }
    setIsDark(!isDark);
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="h-8 w-8 p-0">
      {isDark ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </Button>
  );
}
