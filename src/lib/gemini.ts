import {
  GoogleGenerativeAI,
  type ResponseSchema,
  SchemaType,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// JSON schema for structured output — Gemini guarantees valid JSON when this is set
const translationSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    originalText: {
      type: SchemaType.STRING,
      description: "The full extracted text, properly formatted with paragraph breaks",
    },
    translatedText: {
      type: SchemaType.STRING,
      description: "The full translated text with paragraph breaks",
    },
    detectedLanguage: {
      type: SchemaType.STRING,
      description: "The detected source language",
    },
    expressions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          original: {
            type: SchemaType.STRING,
            description: "The expression in the original language",
          },
          translated: {
            type: SchemaType.STRING,
            description: "Translation of the expression",
          },
          explanation: {
            type: SchemaType.STRING,
            description: "Brief explanation of usage, nuance, or cultural context",
          },
        },
        required: ["original", "translated", "explanation"],
      },
    },
  },
  required: ["originalText", "translatedText", "detectedLanguage", "expressions"],
};

export interface TranslationResult {
  pageIndex: number;
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  expressions: {
    original: string;
    translated: string;
    explanation: string;
  }[];
}

export async function translateSingleImage(
  imageBase64: string,
  mimeType: string,
  sourceLang: string,
  targetLang: string,
  pageIndex: number
): Promise<TranslationResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: translationSchema,
    },
  });

  const sourceLangInstruction =
    sourceLang === "auto"
      ? "Auto-detect the source language"
      : `Source language: ${sourceLang}`;

  const prompt = `You are a professional book translator. Analyze this book page image and perform the following tasks:

1. **OCR**: Extract all visible text from the image. IMPORTANT: Do NOT output raw OCR with broken line breaks. Reconstruct the text into natural, readable sentences and paragraphs. Each sentence should flow naturally. Use newline characters only between paragraphs or logical sections, not mid-sentence.
2. **Translation**: Translate the extracted text into ${targetLang}. Also format with proper paragraph breaks matching the original structure.
3. **Useful Expressions**: Identify 2-3 noteworthy expressions, idioms, or vocabulary from the text that would be educational for a language learner. The "translated" and "explanation" fields MUST be written in ${targetLang}.

${sourceLangInstruction}`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
    { text: prompt },
  ]);

  const response = result.response;
  const parsed = JSON.parse(response.text());

  return {
    pageIndex,
    originalText: parsed.originalText || "",
    translatedText: parsed.translatedText || "",
    detectedLanguage: parsed.detectedLanguage || "",
    expressions: parsed.expressions || [],
  };
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
