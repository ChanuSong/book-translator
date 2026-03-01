"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  context: { originalText: string; translatedText: string } | null;
}

export default function ChatPanel({ context }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !context || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, an error occurred. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!context) return null;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg sm:bottom-6 sm:right-6"
        size="icon"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </Button>
    );
  }

  return (
    <Card className="fixed inset-x-0 bottom-0 z-50 rounded-b-none shadow-xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96 sm:rounded-b-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Ask about this text</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0">
          ✕
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScrollArea className="h-64" ref={scrollRef}>
          <div className="space-y-3 pr-3">
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                Ask questions about the translated text — vocabulary, grammar, context, etc.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "ml-4 bg-primary text-primary-foreground sm:ml-8"
                    : "mr-4 bg-muted sm:mr-8"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="mr-4 rounded-lg bg-muted px-3 py-2 sm:mr-8">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="min-h-[40px] resize-none text-sm"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="shrink-0"
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
