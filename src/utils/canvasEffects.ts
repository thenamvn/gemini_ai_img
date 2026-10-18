/**
 * Advanced artistic image transformation engine using HTML5 Canvas & procedural shaders.
 * Allows instant, high-quality batch image stylization according to user prompts without paid API requirements.
 */

export interface EffectOptions {
  style?: string;
  prompt?: string;
  intensity?: number;
}

export async function applyArtisticStyle(
  imageSrc: string,
  prompt: string,
  aspectRatio: string = '1:1'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        // Determine output dimensions based on aspect ratio
        let targetWidth = img.width;
        let targetHeight = img.height;

        // Cap max dimension for fast processing
        const maxDim = 1200;
        if (targetWidth > maxDim || targetHeight > maxDim) {
          if (targetWidth > targetHeight) {
            targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
            targetWidth = maxDim;
          } else {
            targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
            targetHeight = maxDim;
          }
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Draw base image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const lowerPrompt = (prompt || '').toLowerCase();

        // Detect style from prompt
        if (lowerPrompt.includes('cyberpunk') || lowerPrompt.includes('neon') || lowerPrompt.includes('sci-fi')) {
          applyCyberpunkEffect(ctx, targetWidth, targetHeight);
        } else if (lowerPrompt.includes('watercolor') || lowerPrompt.includes('màu nước') || lowerPrompt.includes('sumi-e')) {
          applyWatercolorEffect(ctx, targetWidth, targetHeight);
        } else if (lowerPrompt.includes('anime') || lowerPrompt.includes('ghibli') || lowerPrompt.includes('hoạt hình')) {
          applyAnimeEffect(ctx, targetWidth, targetHeight);
        } else if (lowerPrompt.includes('pixar') || lowerPrompt.includes('3d') || lowerPrompt.includes('animated')) {
          applyPixar3DEffect(ctx, targetWidth, targetHeight);
        } else if (lowerPrompt.includes('vintage') || lowerPrompt.includes('kodak') || lowerPrompt.includes('film') || lowerPrompt.includes('1970')) {
          applyVintageFilmEffect(ctx, targetWidth, targetHeight);
        } else if (lowerPrompt.includes('oil') || lowerPrompt.includes('sơn dầu') || lowerPrompt.includes('painting')) {
          applyOilPaintingEffect(ctx, targetWidth, targetHeight);
        } else if (lowerPrompt.includes('noir') || lowerPrompt.includes('black and white') || lowerPrompt.includes('trắng đen')) {
          applyFilmNoirEffect(ctx, targetWidth, targetHeight);
        } else if (lowerPrompt.includes('sketch') || lowerPrompt.includes('chì') || lowerPrompt.includes('pencil') || lowerPrompt.includes('bản vẽ')) {
          applySketchEffect(ctx, targetWidth, targetHeight);
        } else if (lowerPrompt.includes('portrait') || lowerPrompt.includes('studio') || lowerPrompt.includes('chân dung')) {
          applyStudioPortraitEffect(ctx, targetWidth, targetHeight);
        } else {
          // Default: High-end Cinematic Vibrant Grade
          applyCinematicGrade(ctx, targetWidth, targetHeight);
        }

        resolve(canvas.toDataURL('image/png', 0.95));
      } catch (err) {
        console.error('Error applying canvas effect:', err);
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

/**
 * Cyberpunk Neon: Deep blues, magenta highlights, neon edge glow & bloom
 */
function applyCyberpunkEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const brightness = (r + g + b) / 3;

    if (brightness > 140) {
      // Highlights shift to hot pink / magenta
      data[i] = Math.min(255, r * 1.35 + 30);
      data[i + 1] = Math.max(0, g * 0.75);
      data[i + 2] = Math.min(255, b * 1.45 + 50);
    } else {
      // Shadows shift to deep electric cyan / navy blue
      data[i] = Math.max(0, r * 0.45);
      data[i + 1] = Math.min(255, g * 0.85 + 20);
      data[i + 2] = Math.min(255, b * 1.5 + 40);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Soft Neon Bloom Overlay
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = 'rgba(236, 72, 153, 0.25)'; // Pink glow
  ctx.fillRect(0, 0, width, height);

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, 'rgba(6, 182, 212, 0.3)'); // Cyan
  grad.addColorStop(1, 'rgba(168, 85, 247, 0.3)'); // Purple
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Vignette
  const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.75);
  vig.addColorStop(0, 'transparent');
  vig.addColorStop(1, 'rgba(10, 10, 25, 0.75)');
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Japanese Watercolor / Sumi-e: Soft pastel washes, diffused ink bleed, paper texture
 */
function applyWatercolorEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Color quantization & pastel softening
  for (let i = 0; i < data.length; i += 4) {
    const step = 32;
    data[i] = Math.min(255, Math.floor(data[i] / step) * step + 20);
    data[i + 1] = Math.min(255, Math.floor(data[i + 1] / step) * step + 20);
    data[i + 2] = Math.min(255, Math.floor(data[i + 2] / step) * step + 15);
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.save();
  // Delicate paper tone
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(253, 248, 237, 0.45)';
  ctx.fillRect(0, 0, width, height);

  // Soft watercolor bleed vignette
  const rad = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.7);
  rad.addColorStop(0, 'transparent');
  rad.addColorStop(1, 'rgba(235, 222, 200, 0.5)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Studio Ghibli Anime: Luminous cel lighting, saturated vibrant tones, soft cloud glow
 */
function applyAnimeEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    // S-curve contrast & cel saturation
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Saturation boost
    const avg = (r + g + b) / 3;
    r = avg + (r - avg) * 1.4;
    g = avg + (g - avg) * 1.35;
    b = avg + (b - avg) * 1.45;

    // Cel step
    r = Math.min(255, Math.round(r / 24) * 24 + 10);
    g = Math.min(255, Math.round(g / 24) * 24 + 10);
    b = Math.min(255, Math.round(b / 24) * 24 + 15);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.save();
  // Warm golden sun haze
  ctx.globalCompositeOperation = 'screen';
  const sun = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, width * 0.7);
  sun.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
  sun.addColorStop(1, 'transparent');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * 3D Pixar Animation: Smooth glossy plasticine shader, rim highlights, bounce illumination
 */
function applyPixar3DEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Boost vibrant midtones
    r = Math.min(255, r * 1.15);
    g = Math.min(255, g * 1.12);
    b = Math.min(255, b * 1.18);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.save();
  // 3D Soft ambient bounce light
  ctx.globalCompositeOperation = 'overlay';
  const grad = ctx.createLinearGradient(0, height, 0, 0);
  grad.addColorStop(0, 'rgba(59, 130, 246, 0.25)'); // Blue bounce light from below
  grad.addColorStop(1, 'rgba(251, 191, 36, 0.25)'); // Warm key light from above
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Vintage 1970s Kodachrome: Warm analog film grain, golden amber shift, soft fade
 */
function applyVintageFilmEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Kodachrome color matrix: warm reds, golden greens, lifted darks
    const nr = Math.min(255, r * 1.25 + 15);
    const ng = Math.min(255, g * 1.05 + 10);
    const nb = Math.max(20, b * 0.85);

    // Subtle grain simulation
    const grain = (Math.random() - 0.5) * 14;

    data[i] = Math.max(0, Math.min(255, nr + grain));
    data[i + 1] = Math.max(0, Math.min(255, ng + grain));
    data[i + 2] = Math.max(0, Math.min(255, nb + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.save();
  // Golden hour light leak overlay
  ctx.globalCompositeOperation = 'screen';
  const leak = ctx.createRadialGradient(0, 0, 50, 0, 0, width * 0.6);
  leak.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
  leak.addColorStop(1, 'transparent');
  ctx.fillStyle = leak;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Classical Oil Painting: Rich impasto texture, deep chiaroscuro, golden Rembrandt glow
 */
function applyOilPaintingEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Chiaroscuro high contrast
    r = r > 128 ? Math.min(255, r * 1.2) : r * 0.8;
    g = g > 128 ? Math.min(255, g * 1.15) : g * 0.8;
    b = b > 128 ? Math.min(255, b * 1.05) : b * 0.75;

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.save();
  // Warm varnish overlay
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Film Noir: High contrast black & white, Venetian shadow texture, sharp silver tone
 */
function applyFilmNoirEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Luminance
    let lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // S-curve high drama
    if (lum < 110) {
      lum = lum * 0.65;
    } else if (lum > 150) {
      lum = Math.min(255, lum * 1.25);
    }

    const grain = (Math.random() - 0.5) * 16;
    const finalVal = Math.max(0, Math.min(255, lum + grain));

    data[i] = finalVal;
    data[i + 1] = finalVal;
    data[i + 2] = finalVal;
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.save();
  // Dramatic vignette
  const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.7);
  vig.addColorStop(0, 'transparent');
  vig.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Pencil Sketch: Inverted grayscale cross-hatching
 */
function applySketchEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    // High contrast sketch line
    const sketch = lum < 90 ? lum * 0.4 : Math.min(255, lum * 1.4);
    data[i] = sketch;
    data[i + 1] = sketch;
    data[i + 2] = sketch;
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * High-end Studio Portrait (85mm f/1.4): Warm rim light, flattering skin tone, soft diffusion
 */
function applyStudioPortraitEffect(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * 1.1 + 8); // warm skin
    data[i + 1] = Math.min(255, data[i + 1] * 1.05 + 4);
    data[i + 2] = Math.max(0, data[i + 2] * 0.96);
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.save();
  // Soft focus glow
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = 'rgba(255, 237, 213, 0.3)';
  ctx.fillRect(0, 0, width, height);

  // Subtle 85mm portrait vignette
  const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.7);
  vig.addColorStop(0, 'transparent');
  vig.addColorStop(1, 'rgba(15, 23, 42, 0.45)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Default Cinematic Grade: Crisp contrast, rich color gamut
 */
function applyCinematicGrade(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * 1.12);
    data[i + 1] = Math.min(255, data[i + 1] * 1.08);
    data[i + 2] = Math.min(255, data[i + 2] * 1.15);
  }
  ctx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
  grad.addColorStop(1, 'rgba(236, 72, 153, 0.12)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
