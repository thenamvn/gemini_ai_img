import JSZip from 'jszip';
import { ImageItem } from '../types';

/**
 * Converts a File object to Base64 string and data URL
 */
export async function fileToBase64(file: File): Promise<{ base64: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve({ base64, dataUrl });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Recursively scans FileSystemEntry from drag & drop
 */
export async function scanFilesFromEntry(entry: any, basePath = ''): Promise<File[]> {
  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file((file: File) => {
        // Only accept images
        if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name)) {
          // Attach relative path if available
          Object.defineProperty(file, 'customPath', {
            value: basePath ? `${basePath}/${file.name}` : file.name,
            writable: true,
          });
          resolve([file]);
        } else {
          resolve([]);
        }
      }, () => resolve([]));
    });
  } else if (entry.isDirectory) {
    const dirReader = entry.createReader();
    const currentPath = basePath ? `${basePath}/${entry.name}` : entry.name;
    const entries: any[] = await new Promise((resolve) => {
      const allEntries: any[] = [];
      const readEntries = () => {
        dirReader.readEntries((results: any[]) => {
          if (!results.length) {
            resolve(allEntries);
          } else {
            allEntries.push(...results);
            readEntries();
          }
        }, () => resolve(allEntries));
      };
      readEntries();
    });

    const filePromises = entries.map((childEntry) =>
      scanFilesFromEntry(childEntry, currentPath)
    );
    const filesArrays = await Promise.all(filePromises);
    return filesArrays.flat();
  }
  return [];
}

/**
 * Creates ImageItem objects from a list of files
 */
export async function createItemsFromFiles(files: File[], defaultPrompt = ''): Promise<ImageItem[]> {
  const items: ImageItem[] = [];

  for (const file of files) {
    if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name)) {
      continue;
    }

    try {
      const { base64, dataUrl } = await fileToBase64(file);
      const relativePath = (file as any).webkitRelativePath || (file as any).customPath || file.name;

      items.push({
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        relativePath,
        size: file.size,
        originalUrl: dataUrl,
        base64,
        mimeType: file.type || 'image/jpeg',
        prompt: defaultPrompt,
        status: 'idle',
        selected: true,
        aspectRatio: '1:1',
        model: 'gemini-3.1-flash-lite-image',
      });
    } catch (err) {
      console.error(`Failed to process image file ${file.name}:`, err);
    }
  }

  return items;
}

/**
 * Downloads a single data URL image
 */
export function downloadImage(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Generates and triggers download of a ZIP file containing generated images
 */
export async function downloadZip(items: ImageItem[], zipName = 'generated-ai-images.zip'): Promise<boolean> {
  const zip = new JSZip();
  let count = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.generatedUrl && item.status === 'completed') {
      const base64Data = item.generatedUrl.split(',')[1];
      if (base64Data) {
        // Clean filename
        const originalBase = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
        const filename = `${String(i + 1).padStart(3, '0')}_ai_${originalBase}.png`;
        zip.file(filename, base64Data, { base64: true });
        count++;
      }
    }
  }

  if (count === 0) return false;

  const content = await zip.generateAsync({ type: 'blob' });
  const blobUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  return true;
}

/**
 * Loads curated high-quality sample images for demo and testing
 */
export async function loadSampleImages(): Promise<ImageItem[]> {
  const samples = [
    {
      name: 'portrait_sample.jpg',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      defaultPrompt: 'Transform into a glowing cyberpunk android with subtle neon circuit lines and rainy neon Tokyo backdrop',
    },
    {
      name: 'urban_architecture.jpg',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
      defaultPrompt: 'Reimagine as a futuristic solar-punk floating utopian city with lush cascading vertical hanging gardens and clean sky',
    },
    {
      name: 'nature_forest.jpg',
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
      defaultPrompt: 'Studio Ghibli mystical enchanted forest aesthetic, glowing spirit orbs, soft dreamy watercolor palette',
    },
    {
      name: 'vintage_car.jpg',
      url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
      defaultPrompt: '3D Pixar animated movie render, adorable stylized proportions, vibrant sunset glossy reflections',
    },
  ];

  const items: ImageItem[] = [];

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    try {
      const res = await fetch(s.url);
      const blob = await res.blob();
      const file = new File([blob], s.name, { type: blob.type || 'image/jpeg' });
      const { base64, dataUrl } = await fileToBase64(file);

      items.push({
        id: `sample_${i}_${Date.now()}`,
        file,
        name: s.name,
        relativePath: `demo_folder/${s.name}`,
        size: blob.size,
        originalUrl: dataUrl,
        base64,
        mimeType: blob.type || 'image/jpeg',
        prompt: s.defaultPrompt,
        status: 'idle',
        selected: true,
        aspectRatio: '1:1',
        model: 'gemini-3.1-flash-lite-image',
      });
    } catch (e) {
      console.warn('Failed to load sample image:', e);
    }
  }

  return items;
}
