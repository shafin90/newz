import fetch from 'node-fetch';

const LIBRETRANSLATE_URL = 'http://localhost:5000/translate';

export async function translateText(text: string, source: string, target: string): Promise<string> {
  try {
    const response = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source,
        target,
        format: 'text'
      })
    });
    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('LibreTranslate error:', (error as any).message);
    throw new Error('Translation failed');
  }
} 