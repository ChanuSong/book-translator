"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface Expression {
  original: string;
  translated: string;
  explanation: string;
}

interface ExpressionPanelProps {
  expressions: Expression[];
  isLoading: boolean;
}

export default function ExpressionPanel({
  expressions,
  isLoading,
}: ExpressionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isLoading && expressions.length === 0) return null;

  return (
    <Card>
      <CardHeader
        className="cursor-pointer pb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Useful Expressions
          </CardTitle>
          <div className="flex items-center gap-2">
            {expressions.length > 0 && (
              <Badge variant="secondary">{expressions.length}</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {isExpanded ? "▲" : "▼"}
            </span>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg bg-muted p-3">
                  <div className="h-4 w-1/2 rounded bg-muted-foreground/10" />
                  <div className="mt-2 h-3 w-3/4 rounded bg-muted-foreground/10" />
                </div>
              ))}
            </div>
          ) : (
            expressions.map((expr, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card/50 p-3 backdrop-blur-sm transition-colors hover:bg-accent/50"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-medium text-sm">{expr.original}</span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-sm text-primary">{expr.translated}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {expr.explanation}
                </p>
              </div>
            ))
          )}
        </CardContent>
      )}
    </Card>
  );
}
