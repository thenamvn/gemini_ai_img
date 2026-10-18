import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  Columns,
  Eye,
  Check,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { ImageItem } from '../types';
import { downloadImage } from '../utils/fileHelpers';

interface ImageModalProps {
  item: ImageItem | null;
  onClose: () => void;
  onGenerate: (id: string) => void;
  onPromptChange: (id: string, prompt: string) => void;
  isGenerating: boolean;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  item,
  onClose,
  onGenerate,
  onPromptChange,
  isGenerating,
}) => {
  if (!item) return null;

  const [compareMode, setCompareMode] = useState<'slider' | 'side-by-side' | 'generated' | 'original'>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [copied, setCopied] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  const isDone = item.status === 'completed' && Boolean(item.generatedUrl);

  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleSliderMove(e.clientX);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (item.generatedUrl) {
      const cleanBase = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      downloadImage(item.generatedUrl, `ai_${cleanBase}.png`);
    } else {
      downloadImage(item.originalUrl, item.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center gap-3 truncate">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Eye className="w-4 h-4" />
            </span>
            <div className="truncate">
              <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>
              <p className="text-[11px] text-slate-400 truncate">
                {item.relativePath} • {(item.size / 1024).toFixed(0)} KB • Model: {item.model}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDone && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => setCompareMode('slider')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 text-[11px] ${
                    compareMode === 'slider' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>Kéo trượt so sánh</span>
                </button>
                <button
                  onClick={() => setCompareMode('side-by-side')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 text-[11px] ${
                    compareMode === 'side-by-side' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Columns className="w-3 h-3" />
                  <span>Song song</span>
                </button>
              </div>
            )}

            {isDone && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md shadow-emerald-600/30 transition cursor-pointer"
                title="Tải ảnh AI về máy"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tải về</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison / Preview Viewport */}
        <div className="flex-1 min-h-[320px] max-h-[56vh] bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative select-none">
          {!isDone ? (
            // Only original image available
            <div className="relative max-h-full max-w-full flex flex-col items-center justify-center">
              <img
                src={item.originalUrl}
                alt={item.name}
                className="max-h-[50vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
              />
              <span className="absolute bottom-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-xs text-white border border-white/20">
                Ảnh Gốc (Chưa tạo AI)
              </span>
            </div>
          ) : compareMode === 'slider' ? (
            // Interactive Before/After Split Slider
            <div
              ref={sliderContainerRef}
              onMouseDown={(e) => handleSliderMove(e.clientX)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative max-h-[52vh] aspect-square sm:aspect-auto sm:h-[50vh] max-w-full rounded-2xl overflow-hidden border border-slate-800 cursor-ew-resize select-none shadow-2xl"
            >
              {/* After Image (Generated) - Full width background */}
              <img
                src={item.generatedUrl}
                alt="AI Generated"
                className="w-full h-full object-contain pointer-events-none"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-600/85 backdrop-blur-md text-[11px] font-bold text-white shadow-md">
                ✨ Ảnh AI Tạo
              </span>

              {/* Before Image (Original) - Clipped by sliderPosition */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={item.originalUrl}
                  alt="Original"
                  className="w-full h-full object-contain max-w-none"
                  style={{
                    width: sliderContainerRef.current ? `${sliderContainerRef.current.clientWidth}px` : '100%',
                    height: '100%',
                  }}
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-bold text-white shadow-md">
                  📷 Ảnh Gốc
                </span>
              </div>

              {/* Slider Line & Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-900 border border-slate-300">
                  <Sliders className="w-4 h-4" />
                </div>
              </div>
            </div>
          ) : (
            // Side-by-side mode
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] w-full max-w-4xl">
              <div className="relative flex flex-col items-center justify-center bg-slate-900/60 rounded-2xl p-2 border border-slate-800">
                <img
                  src={item.originalUrl}
                  alt="Original"
                  className="max-h-[42vh] max-w-full object-contain rounded-xl"
                />
                <span className="mt-2 text-xs font-semibold text-slate-300">📷 Ảnh Gốc</span>
              </div>
              <div className="relative flex flex-col items-center justify-center bg-slate-900/60 rounded-2xl p-2 border border-slate-800">
                <img
                  src={item.generatedUrl}
                  alt="Generated"
                  className="max-h-[42vh] max-w-full object-contain rounded-xl"
                />
                <span className="mt-2 text-xs font-semibold text-emerald-400">✨ Ảnh AI Tạo</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Prompt & Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Prompt cho ảnh này:
            </span>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép prompt'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              value={item.prompt}
              onChange={(e) => onPromptChange(item.id, e.target.value)}
              placeholder="Chỉnh sửa prompt cho ảnh này..."
              rows={2}
              className="flex-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />

            <button
              onClick={() => onGenerate(item.id)}
              disabled={isGenerating || !item.prompt.trim()}
              className="self-end sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {item.status === 'generating' ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : isDone ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tạo lại (Regenerate)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tạo ảnh AI ngay</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
