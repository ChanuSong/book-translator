import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    if (!messages || !context) {
      return NextResponse.json(
        { error: "Messages and context are required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const response = await chat(messages, context);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
