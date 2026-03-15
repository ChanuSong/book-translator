import { NextRequest } from "next/server";
import { translateSingleImage } from "@/lib/gemini";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const { image, sourceLang, targetLang, mode } = await request.json();

  if (!image || !image.base64 || !image.mimeType) {
    return Response.json({ error: "No image provided" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const result = await translateSingleImage(
      image.base64,
      image.mimeType,
      sourceLang || "auto",
      targetLang || "Japanese",
      image.pageIndex ?? 0,
      mode || "direct"
    );

    return Response.json(result);
  } catch (error) {
    console.error("Translation error:", error);
    return Response.json(
      {
        error: `Translation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
