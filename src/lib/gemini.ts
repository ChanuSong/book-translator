import {
  GoogleGenerativeAI,
  type ResponseSchema,
  SchemaType,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type TranslationMode = "direct" | "summary";

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

const summarySchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    originalText: {
      type: SchemaType.STRING,
      description: "The full extracted text, properly formatted with paragraph breaks",
    },
    summaryTranslation: {
      type: SchemaType.STRING,
      description: "A concise, easy-to-read translation that summarizes the core content in slightly simpler language",
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
  required: ["originalText", "summaryTranslation", "detectedLanguage", "expressions"],
};

export interface TranslationResult {
  pageIndex: number;
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  summaryTranslation?: string;
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
  pageIndex: number,
  mode: TranslationMode = "direct"
): Promise<TranslationResult> {
  const schema = mode === "summary" ? summarySchema : translationSchema;

  const modelWithSchema = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const modelWithoutSchema = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const sourceLangInstruction =
    sourceLang === "auto"
      ? "Auto-detect the source language"
      : `Source language: ${sourceLang}`;

  const styleGuide = `
## Translation Style Rules (MUST follow for consistency across all pages):
- **Tone**: Use plain/casual register (e.g. Japanese: だ/である体, Korean: 해체/한다체). This is not rude — it is the neutral literary style used in books and essays. Never mix with polite forms (です/ます, 합니다).
- **Paragraph breaks**: Separate paragraphs with a single blank line (\\n\\n). Do NOT use single line breaks (\\n) within a paragraph — each paragraph should be a continuous block of text.
- **Sentence endings**: Keep sentence endings consistent throughout. Do not alternate between styles.
- **Person**: Use third-person narrative unless the original text is in first person. Stay consistent with the original.
- **Numbers and proper nouns**: Keep numbers in their original format. Transliterate proper nouns consistently.`;

  const prompt = mode === "summary"
    ? `You are a professional book translator and summarizer. Analyze this book page image and perform the following tasks:

1. **OCR**: Extract all visible text from the image. IMPORTANT: Do NOT output raw OCR with broken line breaks. Reconstruct the text into natural, readable sentences and paragraphs. Each sentence should flow naturally. Use newline characters only between paragraphs or logical sections, not mid-sentence.
2. **Summary Translation**: Translate the core content into ${targetLang} using slightly simpler, easy-to-understand language. This is NOT a literal translation — condense and summarize the key points while keeping it readable as a coherent text. Omit minor details and focus on the essential meaning. The result should read like a concise, natural summary written in easy ${targetLang}.
3. **Useful Expressions**: Identify 2-3 noteworthy expressions, idioms, or vocabulary from the text that would be educational for a language learner. The "translated" and "explanation" fields MUST be written in ${targetLang}.
${styleGuide}

${sourceLangInstruction}`
    : `You are a professional book translator. Analyze this book page image and perform the following tasks:

1. **OCR**: Extract all visible text from the image. IMPORTANT: Do NOT output raw OCR with broken line breaks. Reconstruct the text into natural, readable sentences and paragraphs. Each sentence should flow naturally. Use newline characters only between paragraphs or logical sections, not mid-sentence.
2. **Translation**: Translate the extracted text into ${targetLang}. Also format with proper paragraph breaks matching the original structure.
3. **Useful Expressions**: Identify 2-3 noteworthy expressions, idioms, or vocabulary from the text that would be educational for a language learner. The "translated" and "explanation" fields MUST be written in ${targetLang}.
${styleGuide}

${sourceLangInstruction}`;

  const contentParts = [
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
    { text: prompt },
  ];

  let parsed;
  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const useSchema = attempt < MAX_RETRIES;
      const model = useSchema ? modelWithSchema : modelWithoutSchema;
      const result = await model.generateContent(contentParts);
      parsed = JSON.parse(result.response.text());
      break;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      const isSchemaError = msg.includes("did not match the expected pattern") ||
        msg.includes("schema");
      if (attempt === MAX_RETRIES || !isSchemaError) {
        throw error;
      }
    }
  }

  return {
    pageIndex,
    originalText: parsed.originalText || "",
    translatedText: mode === "direct" ? (parsed.translatedText || "") : "",
    detectedLanguage: parsed.detectedLanguage || "",
    ...(mode === "summary" && {
      summaryTranslation: parsed.summaryTranslation || "",
    }),
    expressions: parsed.expressions || [],
  };
}

export async function chat(
  messages: { role: string; content: string }[],
  context: { originalText: string; translatedText: string }
) {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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
