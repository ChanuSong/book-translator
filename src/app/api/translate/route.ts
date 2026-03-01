import { NextRequest } from "next/server";
import { translateSingleImage } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const { images, sourceLang, targetLang } = await request.json();

  if (!images || !Array.isArray(images) || images.length === 0) {
    return Response.json({ error: "No images provided" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send total count first
      controller.enqueue(
        encoder.encode(JSON.stringify({ type: "start", total: images.length }) + "\n")
      );

      // Process all images in parallel, stream each result as it completes
      const promises = images.map(
        (img: { base64: string; mimeType: string }, index: number) =>
          translateSingleImage(
            img.base64,
            img.mimeType,
            sourceLang || "auto",
            targetLang || "Japanese",
            index
          )
            .then((result) => {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({ type: "page", data: result }) + "\n"
                )
              );
            })
            .catch((error) => {
              console.error(`Translation error for page ${index + 1}:`, error);
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: "error",
                    pageIndex: index,
                    message: `Page ${index + 1} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                  }) + "\n"
                )
              );
            })
      );

      await Promise.allSettled(promises);

      controller.enqueue(
        encoder.encode(JSON.stringify({ type: "done" }) + "\n")
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
