export type GenerationStatus = 'idle' | 'queued' | 'generating' | 'completed' | 'error';

export type AspectRatioType = '1:1' | '16:9' | '4:3' | '3:4' | '9:16';

export interface ImageItem {
  id: string;
  file?: File;
  name: string;
  relativePath?: string;
  size: number;
  originalUrl: string;
  base64: string;
  mimeType: string;
  prompt: string;
  status: GenerationStatus;
  generatedUrl?: string;
  error?: string;
  selected: boolean;
  aspectRatio: AspectRatioType;
  model: string;
  generatedAt?: number;
}

export interface StylePreset {
  id: string;
  name: string;
  prompt: string;
  category: 'Realistic' | 'Artistic' | 'Anime & 3D' | 'Retro & Film' | 'Fantasy & Sci-Fi';
  icon?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
}
