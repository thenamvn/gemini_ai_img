import React, { useRef, useState } from 'react';
import { FolderUp, UploadCloud, FolderOpen, ImagePlus, Sparkles, CheckCircle } from 'lucide-react';
import { scanFilesFromEntry } from '../utils/fileHelpers';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSamples: () => void;
  compact?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  onLoadSamples,
  compact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    setIsProcessing(true);
    const gatheredFiles: File[] = [];

    try {
      const scanPromises: Promise<File[]>[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (typeof item.webkitGetAsEntry === 'function') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            scanPromises.push(scanFilesFromEntry(entry));
          }
        } else {
          const file = item.getAsFile();
          if (file && file.type.startsWith('image/')) {
            gatheredFiles.push(file);
          }
        }
      }

      if (scanPromises.length > 0) {
        const results = await Promise.all(scanPromises);
        results.forEach((files) => gatheredFiles.push(...files));
      }

      if (gatheredFiles.length > 0) {
        onFilesSelected(gatheredFiles);
      }
    } catch (err) {
      console.error('Error scanning dropped files/folder:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  // Compact bar when images are already loaded
  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-3 rounded-xl border border-dashed transition flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-slate-700/80 bg-slate-900/60 hover:border-slate-600'
        }`}
      >
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory="true"
          directory="true"
          multiple
          className="hidden"
          onChange={handleFolderChange}
        />
        <input
          ref={filesInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />

        <div className="flex items-center gap-2.5 text-slate-300">
          <FolderUp className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            Thêm ảnh mới vào danh sách:{' '}
            <span className="text-slate-400">Kéo thả folder ảnh vào đây, hoặc chọn nút bên phải</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer shadow-sm shadow-indigo-600/30"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Thêm thư mục</span>
          </button>
          <button
            onClick={() => filesInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            <span>Thêm file ảnh</span>
          </button>
        </div>
      </div>
    );
  }

  // Full drop zone view when empty
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all ${
        isDragging
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.005]'
          : 'border-slate-700/80 bg-slate-900/40 hover:border-indigo-500/50 hover:bg-slate-900/60'
      }`}
    >
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={handleFolderChange}
      />
      <input
        ref={filesInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesChange}
      />

      <div className="max-w-xl mx-auto flex flex-col items-center">
        {/* Animated Icon Glow */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            {isProcessing ? (
              <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FolderUp className="w-10 h-10 text-indigo-400 animate-pulse" />
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
          Chọn hoặc kéo thả Thư mục ảnh vào đây
        </h3>
        <p className="text-sm text-slate-400 mb-6 max-w-md">
          Hỗ trợ tải toàn bộ folder ảnh (subfolder tự động quét). Sau khi tải lên, bạn có thể điền prompt riêng cho từng ảnh, theo nhóm đã chọn hoặc áp dụng cho toàn bộ.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <button
            onClick={() => folderInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Chọn Thư Mục Ảnh (Folder)</span>
          </button>

          <button
            onClick={() => filesInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition cursor-pointer"
          >
            <ImagePlus className="w-4 h-4" />
            <span>Chọn nhiều file ảnh</span>
          </button>

          <button
            onClick={onLoadSamples}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-sm font-medium transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Thử bộ ảnh mẫu (Demo)</span>
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left text-xs text-slate-400 pt-6 border-t border-slate-800/80">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>Tùy biến prompt cho từng ảnh riêng lẻ hoặc hàng loạt</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>Tạo ảnh AI trực tiếp bằng Gemini Image Models</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Tải về từng ảnh hoặc đóng gói toàn bộ file ZIP 1 click</span>
          </div>
        </div>
      </div>
    </div>
  );
};
