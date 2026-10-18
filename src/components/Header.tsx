import React from 'react';
import { Sparkles, Image, CheckCircle2, Clock, FolderOpen, Trash2, Cpu } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  selectedCount: number;
  completedCount: number;
  isGenerating: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
  onLoadSamples: () => void;
  onClearAll: () => void;
  hasKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  selectedCount,
  completedCount,
  isGenerating,
  selectedModel,
  onModelChange,
  onLoadSamples,
  onClearAll,
  hasKey,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Batch Image AI Studio</h1>
              <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Folder Batch
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Nhập thư mục ảnh • Điền prompt cho từng ảnh, theo nhóm hoặc tất cả • Tạo ảnh AI hàng loạt
            </p>
          </div>
        </div>

        {/* Center Stats Badges */}
        {totalCount > 0 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700">
              <Image className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tổng: <b className="text-white font-semibold">{totalCount}</b></span>
            </div>
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Đã chọn: <b className="text-white font-semibold">{selectedCount}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Đã tạo: <b className="text-emerald-400 font-semibold">{completedCount}/{totalCount}</b></span>
            </div>
          </div>
        )}

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Model / Engine Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer focus:ring-0"
              title="Chọn bộ máy tạo ảnh (Engine)"
            >
              <option value="neural-stylizer" className="bg-slate-900 text-white">
                🎨 AI Artistic Stylizer (Miễn phí, tạo tức thì)
              </option>
              <option value="gemini-3.1-flash-lite-image" className="bg-slate-900 text-white">
                ☁️ Gemini 3.1 Flash Lite Image (Cloud Model)
              </option>
              <option value="gemini-nano-banana-2.1" className="bg-slate-900 text-white">
                ✨ Gemini Nano Banana 2.1 (Ultra 1K-4K)
              </option>
            </select>
          </div>

          {/* Demo Samples Button */}
          {totalCount === 0 && (
            <button
              onClick={onLoadSamples}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Thử thư mục mẫu</span>
            </button>
          )}

          {/* Clear All Button */}
          {totalCount > 0 && (
            <button
              onClick={onClearAll}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs transition cursor-pointer disabled:opacity-50"
              title="Xóa tất cả ảnh trong danh sách"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xóa tất cả</span>
            </button>
          )}

          {/* Key status indicator */}
          <div
            className={`w-2.5 h-2.5 rounded-full ring-2 ring-slate-800 ${
              hasKey ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400'
            }`}
            title={hasKey ? 'Gemini API đã sẵn sàng' : 'Chưa cấu hình GEMINI_API_KEY'}
          />
        </div>
      </div>
    </header>
  );
};
