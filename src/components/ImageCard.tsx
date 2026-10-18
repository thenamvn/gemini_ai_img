import React, { useState } from 'react';
import {
  Check,
  Play,
  RotateCcw,
  Download,
  Maximize2,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  Eye,
  Columns,
  Layers,
} from 'lucide-react';
import { ImageItem } from '../types';
import { downloadImage } from '../utils/fileHelpers';

interface ImageCardProps {
  item: ImageItem;
  index: number;
  onToggleSelect: (id: string) => void;
  onPromptChange: (id: string, prompt: string) => void;
  onAspectRatioChange: (id: string, ratio: ImageItem['aspectRatio']) => void;
  onGenerateSingle: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onOpenModal: (item: ImageItem) => void;
  isGeneratingAny: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  item,
  index,
  onToggleSelect,
  onPromptChange,
  onAspectRatioChange,
  onGenerateSingle,
  onRemoveItem,
  onOpenModal,
  isGeneratingAny,
}) => {
  // If completed, viewMode can be 'generated' | 'original'
  const [viewMode, setViewMode] = useState<'generated' | 'original'>('generated');
  const [isHovered, setIsHovered] = useState(false);

  const isCurrentGenerating = item.status === 'generating';
  const isQueued = item.status === 'queued';
  const isDone = item.status === 'completed';
  const isError = item.status === 'error';

  const currentDisplayImage =
    isDone && viewMode === 'generated' && item.generatedUrl
      ? item.generatedUrl
      : item.originalUrl;

  const handleDownloadSingle = () => {
    if (item.generatedUrl) {
      const cleanBase = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      downloadImage(item.generatedUrl, `ai_${cleanBase}.png`);
    }
  };

  return (
    <div
      className={`group relative rounded-2xl bg-slate-900 border transition-all duration-200 flex flex-col overflow-hidden ${
        item.selected
          ? 'border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
          : 'border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      {/* Card Header & Preview Image */}
      <div
        className="relative w-full aspect-square bg-slate-950 overflow-hidden cursor-pointer select-none"
        onClick={() => onOpenModal(item)}
      >
        <img
          src={currentDisplayImage}
          alt={item.name}
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Checkbox & Status Badges */}
        <div
          className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Select Checkbox */}
          <button
            onClick={() => onToggleSelect(item.id)}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition cursor-pointer shadow-md ${
              item.selected
                ? 'bg-indigo-600 text-white'
                : 'bg-black/60 text-transparent border border-white/40 hover:border-white'
            }`}
            title={item.selected ? 'Bỏ chọn ảnh' : 'Chọn ảnh này'}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            {isCurrentGenerating && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/90 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wide animate-pulse shadow-md">
                <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo...
              </span>
            )}
            {isQueued && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 backdrop-blur-sm text-slate-950 text-[10px] font-bold shadow-md">
                <Clock className="w-3 h-3" />
                Chờ...
              </span>
            )}
            {isDone && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-md">
                <Check className="w-3 h-3 stroke-[2.5]" />
                Hoàn thành
              </span>
            )}
            {isError && (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold shadow-md"
                title={item.error || 'Lỗi tạo ảnh'}
              >
                <AlertCircle className="w-3 h-3" />
                Lỗi
              </span>
            )}
          </div>
        </div>

        {/* Completed Toggle Button (Before/After toggle directly on preview) */}
        {isDone && (
          <div
            className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-md p-0.5 rounded-lg border border-white/20 text-[10px] text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewMode('original')}
              className={`px-2 py-0.5 rounded transition ${
                viewMode === 'original' ? 'bg-indigo-600 font-bold text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Gốc
            </button>
            <button
              onClick={() => setViewMode('generated')}
              className={`px-2 py-0.5 rounded transition ${
                viewMode === 'generated' ? 'bg-emerald-600 font-bold text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              AI Tạo
            </button>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(item);
            }}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white shadow-lg border border-white/20 transition transform hover:scale-110 cursor-pointer"
            title="Xem chi tiết & So sánh ảnh gốc"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          {isDone && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadSingle();
              }}
              className="p-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-lg border border-emerald-400/40 transition transform hover:scale-110 cursor-pointer"
              title="Tải ảnh AI này về"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* File index and name badge */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-slate-300 border border-white/10 truncate max-w-[140px]">
          #{index + 1} {item.name}
        </div>
      </div>

      {/* Card Content & Individual Prompt Editing */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        {/* Relative path and size */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate max-w-[180px]" title={item.relativePath || item.name}>
            📁 {item.relativePath || item.name}
          </span>
          <span className="text-[10px] text-slate-500 shrink-0">
            {(item.size / 1024).toFixed(0)} KB
          </span>
        </div>

        {/* Prompt Input Area */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <label className="text-slate-300 font-medium flex items-center gap-1">
              <span>Prompt cho ảnh này:</span>
            </label>
            <span className="text-[10px] text-slate-500">
              {item.prompt ? `${item.prompt.length} ký tự` : 'Chưa có prompt'}
            </span>
          </div>

          <textarea
            value={item.prompt}
            onChange={(e) => onPromptChange(item.id, e.target.value)}
            placeholder="Nhập prompt chuyển đổi riêng cho ảnh này..."
            rows={3}
            className="w-full rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 placeholder-slate-600 p-2.5 resize-none transition"
          />
        </div>

        {/* Error message display if failed */}
        {isError && item.error && (
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{item.error}</span>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          {/* Aspect ratio */}
          <select
            value={item.aspectRatio}
            onChange={(e) => onAspectRatioChange(item.id, e.target.value as ImageItem['aspectRatio'])}
            className="bg-slate-950 border border-slate-800 text-[11px] text-slate-400 rounded-lg px-2 py-1 outline-none cursor-pointer"
            title="Tỉ lệ khung hình"
          >
            <option value="1:1">1:1</option>
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
            <option value="4:3">4:3</option>
            <option value="3:4">3:4</option>
          </select>

          <div className="flex items-center gap-1.5">
            {/* Remove */}
            <button
              onClick={() => onRemoveItem(item.id)}
              disabled={isCurrentGenerating}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              title="Xóa khỏi danh sách"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Individual Generate / Regenerate */}
            <button
              onClick={() => onGenerateSingle(item.id)}
              disabled={isCurrentGenerating || !item.prompt.trim()}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-medium text-xs transition cursor-pointer ${
                isDone
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isDone ? 'Tạo lại ảnh' : 'Tạo ảnh này'}
            >
              {isCurrentGenerating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang tạo</span>
                </>
              ) : isDone ? (
                <>
                  <RotateCcw className="w-3 h-3" />
                  <span>Tạo lại</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Tạo ảnh</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
