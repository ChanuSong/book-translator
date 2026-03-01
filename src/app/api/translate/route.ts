import { NextRequest, NextResponse } from "next/server";
import { translateImages } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { images, sourceLang, targetLang } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const result = await translateImages(
      images,
      sourceLang || "auto",
      targetLang || "Japanese"
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate image" },
      { status: 500 }
    );
  }
}
