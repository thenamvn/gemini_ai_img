import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Layers,
  CheckSquare,
  Square,
  Play,
  Download,
  SquareCheck,
  RotateCcw,
  Sliders,
  Filter,
  Wand2,
  StopCircle,
  HelpCircle,
} from 'lucide-react';
import { STYLE_PRESETS } from '../utils/presets';
import { AspectRatioType } from '../types';

interface BatchToolbarProps {
  totalCount: number;
  selectedCount: number;
  completedCount: number;
  isGenerating: boolean;
  activeFilter: 'all' | 'selected' | 'completed' | 'pending' | 'error';
  onFilterChange: (filter: 'all' | 'selected' | 'completed' | 'pending' | 'error') => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onApplyPromptToAll: (prompt: string, mode: 'replace' | 'append') => void;
  onApplyPromptToSelected: (prompt: string, mode: 'replace' | 'append') => void;
  onGenerateAll: () => void;
  onGenerateSelected: () => void;
  onCancelGeneration: () => void;
  onDownloadAllZip: () => void;
  onDownloadSelectedZip: () => void;
  onOpenAssistant: () => void;
  batchAspectRatio: AspectRatioType;
  onBatchAspectRatioChange: (ratio: AspectRatioType) => void;
  currentGeneratingIndex?: number;
  totalGeneratingQueue?: number;
}

export const BatchToolbar: React.FC<BatchToolbarProps> = ({
  totalCount,
  selectedCount,
  completedCount,
  isGenerating,
  activeFilter,
  onFilterChange,
  onSelectAll,
  onDeselectAll,
  onApplyPromptToAll,
  onApplyPromptToSelected,
  onGenerateAll,
  onGenerateSelected,
  onCancelGeneration,
  onDownloadAllZip,
  onDownloadSelectedZip,
  onOpenAssistant,
  batchAspectRatio,
  onBatchAspectRatioChange,
  currentGeneratingIndex = 0,
  totalGeneratingQueue = 0,
}) => {
  const [batchPrompt, setBatchPrompt] = useState('');
  const [applyMode, setApplyMode] = useState<'replace' | 'append'>('replace');

  const handleApplyToAll = () => {
    if (!batchPrompt.trim()) return;
    onApplyPromptToAll(batchPrompt.trim(), applyMode);
  };

  const handleApplyToSelected = () => {
    if (!batchPrompt.trim()) return;
    onApplyPromptToSelected(batchPrompt.trim(), applyMode);
  };

  const handlePresetClick = (presetPrompt: string) => {
    setBatchPrompt(presetPrompt);
  };

  const allSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <div className="space-y-4">
      {/* Main Prompt Distribution Panel */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-sm font-semibold text-white">
              Bảng điều khiển Prompt hàng loạt (Batch Prompt Control)
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Mode switch: replace or append */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              <span className="text-slate-400 text-[11px] px-1.5">Chế độ gán:</span>
              <button
                type="button"
                onClick={() => setApplyMode('replace')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  applyMode === 'replace'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ghi đè
              </button>
              <button
                type="button"
                onClick={() => setApplyMode('append')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                  applyMode === 'append'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nối thêm
              </button>
            </div>

            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Gợi ý Prompt AI</span>
            </button>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="relative mb-3">
          <textarea
            value={batchPrompt}
            onChange={(e) => setBatchPrompt(e.target.value)}
            placeholder="Nhập prompt áp dụng chung (Ví dụ: Chuyển ảnh sang phong cách cyberpunk neon, ánh sáng mưa phản chiếu điện ảnh, chi tiết cao)..."
            rows={2}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
          />
        </div>

        {/* Quick Style Presets Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs text-slate-300 mb-3">
          <span className="text-[11px] text-slate-500 shrink-0 font-medium mr-1">Phong cách nhanh:</span>
          {STYLE_PRESETS.slice(0, 7).map((p) => (
            <button
              key={p.id}
              onClick={() => handlePresetClick(p.prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 hover:text-white border border-slate-700/60 text-slate-300 shrink-0 transition cursor-pointer text-[11px]"
              title={p.prompt}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Buttons to distribute prompt to All or Selected */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            {/* Apply to Selected */}
            <button
              onClick={handleApplyToSelected}
              disabled={!batchPrompt.trim() || selectedCount === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/30 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Áp dụng cho ĐÃ CHỌN ({selectedCount} ảnh)</span>
            </button>

            {/* Apply to All */}
            <button
              onClick={handleApplyToAll}
              disabled={!batchPrompt.trim() || totalCount === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Áp dụng cho TẤT CẢ ({totalCount} ảnh)</span>
            </button>
          </div>

          {/* Aspect Ratio & Reset Prompt */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Tỉ lệ khung:</span>
            <select
              value={batchAspectRatio}
              onChange={(e) => onBatchAspectRatioChange(e.target.value as AspectRatioType)}
              className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded-lg text-xs outline-none cursor-pointer"
            >
              <option value="1:1">1:1 Vuông (Square)</option>
              <option value="16:9">16:9 Ngang (Landscape)</option>
              <option value="9:16">9:16 Dọc (Story/Portrait)</option>
              <option value="4:3">4:3 Chuẩn</option>
              <option value="3:4">3:4 Chân dung</option>
            </select>

            {batchPrompt && (
              <button
                onClick={() => setBatchPrompt('')}
                className="text-slate-500 hover:text-slate-300 text-xs px-1 cursor-pointer"
              >
                Xóa ô nhập
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action Bar & Selection Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* Left: Filter tabs & Select toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Select all / none checkbox */}
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition cursor-pointer"
          >
            {allSelected ? (
              <>
                <SquareCheck className="w-4 h-4 text-indigo-400" />
                <span>Bỏ chọn hết</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 text-slate-400" />
                <span>Chọn tất cả ({totalCount})</span>
              </>
            )}
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              onClick={() => onFilterChange('selected')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                activeFilter === 'selected'
                  ? 'bg-slate-800 text-indigo-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đã chọn ({selectedCount})
            </button>
            <button
              onClick={() => onFilterChange('completed')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                activeFilter === 'completed'
                  ? 'bg-slate-800 text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đã tạo ({completedCount})
            </button>
            <button
              onClick={() => onFilterChange('pending')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                activeFilter === 'pending'
                  ? 'bg-slate-800 text-amber-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chưa tạo ({totalCount - completedCount})
            </button>
          </div>
        </div>

        {/* Right: Primary Batch Generation & Download ZIP */}
        <div className="flex flex-wrap items-center gap-2">
          {/* If Generating: Show Cancel Button & Progress */}
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs">
                <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>
                  Đang tạo ảnh {currentGeneratingIndex}/{totalGeneratingQueue}...
                </span>
              </div>
              <button
                onClick={onCancelGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition cursor-pointer"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>Dừng lại</span>
              </button>
            </div>
          ) : (
            <>
              {/* Generate Selected */}
              <button
                onClick={onGenerateSelected}
                disabled={selectedCount === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-medium text-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Tạo ảnh cho các mục đã chọn"
              >
                <Play className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tạo Đã Chọn ({selectedCount})</span>
              </button>

              {/* Generate All */}
              <button
                onClick={onGenerateAll}
                disabled={totalCount === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-medium text-xs shadow-lg shadow-purple-600/25 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                title="Tạo ảnh cho toàn bộ danh sách"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>TẠO TẤT CẢ ({totalCount})</span>
              </button>
            </>
          )}

          {/* Download ZIP Controls */}
          {completedCount > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <button
                onClick={onDownloadAllZip}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                title="Tải tất cả các ảnh đã tạo về dưới dạng 1 file ZIP"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tất cả ({completedCount} ảnh ZIP)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
