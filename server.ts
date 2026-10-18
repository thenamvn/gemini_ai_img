import 'dotenv/config';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support high payload size for base64 image data
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Shared GoogleGenAI SDK client with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health & configuration check
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    defaultModel: 'gemini-3.1-flash-lite-image',
    availableModels: [
      {
        id: 'gemini-3.1-flash-lite-image',
        name: 'Gemini 3.1 Flash Lite Image',
        description: 'Fast, responsive image generation & transformation (Default)',
        recommended: true,
      },
      {
        id: 'gemini-nano-banana-2.1',
        name: 'Gemini Nano Banana 2.1',
        description: 'High-definition photo & art transformation (1K, 2K, 4K resolution)',
        recommended: false,
      },
    ],
  });
});

// Image Generation & Transformation API
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, mimeType, aspectRatio = '1:1', model = 'gemini-3.1-flash-lite-image', imageSize } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in server environment.',
      });
      return;
    }

    const parts: any[] = [];

    // If an input image was provided for Image-to-Image editing / style transfer
    if (imageBase64) {
      let cleanData = imageBase64;
      let cleanMime = mimeType || 'image/jpeg';

      if (imageBase64.includes(';base64,')) {
        const split = imageBase64.split(';base64,');
        cleanMime = split[0].replace('data:', '') || cleanMime;
        cleanData = split[1];
      }

      parts.push({
        inlineData: {
          data: cleanData,
          mimeType: cleanMime,
        },
      });
    }

    parts.push({
      text: prompt,
    });

    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio || '1:1',
      },
    };

    if (model === 'gemini-nano-banana-2.1' && imageSize) {
      config.imageConfig.imageSize = imageSize;
    }

    const selectedModel = model === 'gemini-nano-banana-2.1' 
      ? 'gemini-nano-banana-2.1' 
      : 'gemini-3.1-flash-lite-image';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: { parts },
      config,
    });

    let generatedImageUrl = '';
    let textExplanation = '';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const type = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${type};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textExplanation += part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      // Model responded with text instead of image (e.g. safety or refusal)
      const message = textExplanation.trim() || 'No image was returned by the model. Try adjusting your prompt.';
      res.status(422).json({ error: message, textResponse: textExplanation });
      return;
    }

    res.json({
      success: true,
      imageUrl: generatedImageUrl,
      textNotes: textExplanation || undefined,
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    const errorMessage = error?.message || 'Failed to generate image';
    res.status(500).json({
      error: errorMessage,
      details: error?.statusText || error?.code || undefined,
    });
  }
});

// Smart Prompt Suggestions endpoint using Gemini 3.8 Flash
app.post('/api/suggest-prompts', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, styleCategory } = req.body;

    const parts: any[] = [];
    if (imageBase64) {
      let cleanData = imageBase64;
      let cleanMime = mimeType || 'image/jpeg';
      if (imageBase64.includes(';base64,')) {
        const split = imageBase64.split(';base64,');
        cleanMime = split[0].replace('data:', '') || cleanMime;
        cleanData = split[1];
      }
      parts.push({
        inlineData: {
          data: cleanData,
          mimeType: cleanMime,
        },
      });
    }

    const promptText = `You are an expert creative AI art director and photographer.
Analyze this image (or theme: ${styleCategory || 'creative restyling'}) and generate 6 distinct, high-impact style transformation prompts in English and Vietnamese.
Return a clean JSON array with 6 objects:
[
  {
    "title": "Short title (e.g. Cyberpunk Neon)",
    "prompt": "Detailed prompt instruction for image-to-image transformation...",
    "category": "Sci-Fi | Cinematic | Anime | Watercolor | Vintage | Portrait"
  }
]
Only return valid JSON array, no markdown fences.`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
    });

    const rawText = response.text || '[]';
    // Clean potential markdown quotes
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const suggestions = JSON.parse(cleaned);

    res.json({ suggestions });
  } catch (error: any) {
    console.error('Error suggesting prompts:', error);
    // Return fallback curated prompts if network or quota issue
    res.json({
      suggestions: [
        {
          title: 'Cinematic Studio Portrait',
          prompt: 'Cinematic warm studio lighting, 85mm lens f/1.4 shallow depth of field, ultra detailed photorealistic, elegant magazine editorial',
          category: 'Cinematic',
        },
        {
          title: 'Cyberpunk Neon Glow',
          prompt: 'Futuristic cyberpunk metropolis background, vibrant neon magenta and cyan highlights, moody rain reflections, high-tech aesthetic',
          category: 'Sci-Fi',
        },
        {
          title: 'Japanese Watercolor Art',
          prompt: 'Traditional Japanese watercolor and sumi-e ink style, soft pastel washes, delicate brush strokes on textured washi paper',
          category: 'Watercolor',
        },
        {
          title: '3D Pixar Animation',
          prompt: 'Modern 3D animated movie style, charming soft lighting, expressive features, vibrant Pixar-style rendering, 8k quality',
          category: 'Anime',
        },
        {
          title: 'Vintage 1970s Film (Kodachrome)',
          prompt: 'Vintage 1970s 35mm film photograph, warm Kodachrome colors, subtle film grain, natural sunlight flare, nostalgic retro vibe',
          category: 'Vintage',
        },
        {
          title: 'Ethereal Fantasy Painting',
          prompt: 'Ethereal fantasy oil painting, glowing golden hour particles, magical twilight atmosphere, ornate brushwork, masterpiece',
          category: 'Artistic',
        },
      ],
    });
  }
});

// Vite middleware mounting or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
