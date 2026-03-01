# Book Translator

Upload a book page photo to get instant OCR, translation, useful expressions, and Q&A — powered by Google Gemini.

## Features

- **Image OCR**: Extract text from book page photos (PNG, JPG, WebP)
- **Translation**: Translate to Korean, English, Japanese, Chinese, Spanish, French, or German
- **Useful Expressions**: Automatically extracts noteworthy idioms and vocabulary
- **Q&A Chat**: Ask questions about the translated text for deeper understanding
- **Dark/Light Mode**: Toggle between themes
- **Responsive**: Works on desktop and mobile

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd book-translator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   Get a key at https://aistudio.google.com/apikey

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Google Gemini API (gemini-2.0-flash)
