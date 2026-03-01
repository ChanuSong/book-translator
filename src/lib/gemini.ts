import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface ImageInput {
  base64: string;
  mimeType: string;
}

export async function translateImages(
  images: ImageInput[],
  sourceLang: string,
  targetLang: string
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const sourceLangInstruction =
    sourceLang === "auto" ? "Auto-detect the source language" : `Source language: ${sourceLang}`;

  const pageCount = images.length;
  const pageNote =
    pageCount > 1
      ? `There are ${pageCount} page images. Process them in order (page 1, page 2, ...) and combine all text as one continuous passage.`
      : "There is one page image.";

  const prompt = `You are a professional book translator. Analyze the book page image(s) and perform the following tasks:

${pageNote}

1. **OCR**: Extract all visible text from the image(s) in page order. IMPORTANT: Do NOT output raw OCR with broken line breaks. Reconstruct the text into natural, readable sentences and paragraphs. Each sentence should flow naturally. Use line breaks only between paragraphs or logical sections, not mid-sentence.
2. **Translation**: Translate the extracted text into ${targetLang}. Also format with proper paragraph breaks matching the original structure.
3. **Useful Expressions**: Identify 3-5 noteworthy expressions, idioms, or vocabulary from the text that would be educational for a language learner. The "translated" and "explanation" fields MUST be written in ${targetLang}.

${sourceLangInstruction}

Respond in the following JSON format ONLY (no markdown code blocks):
{
  "originalText": "the full extracted text, properly formatted with paragraph breaks",
  "translatedText": "the full translated text in ${targetLang}, with paragraph breaks",
  "detectedLanguage": "the detected source language",
  "expressions": [
    {
      "original": "the expression in the original language",
      "translated": "translation of the expression in ${targetLang}",
      "explanation": "brief explanation in ${targetLang} of usage, nuance, or cultural context"
    }
  ]
}`;

  const imageParts = images.map((img) => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.base64,
    },
  }));

  const result = await model.generateContent([...imageParts, { text: prompt }]);

  const response = result.response;
  const text = response.text();

  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export async function chat(
  messages: { role: string; content: string }[],
  context: { originalText: string; translatedText: string }
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const systemPrompt = `You are a helpful language learning assistant. The user is reading a book and has translated a page. Here is the context:

**Original Text:**
${context.originalText}

**Translated Text:**
${context.translatedText}

Help the user understand the text better. Answer questions about vocabulary, grammar, cultural context, or anything related to the text. Be concise and educational. Respond in the same language the user asks in.`;

  const chatHistory = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const chatSession = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [
          {
            text: "I understand. I'll help with questions about this text. Feel free to ask anything!",
          },
        ],
      },
      ...chatHistory.slice(0, -1),
    ],
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chatSession.sendMessage(lastMessage.content);
  return result.response.text();
}
