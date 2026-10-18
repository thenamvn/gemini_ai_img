import React, { useState } from 'react';
import { X, Sparkles, Wand2, ArrowRight, Check, Send, Layers } from 'lucide-react';
import { ImageItem } from '../types';

interface SuggestionItem {
  title: string;
  prompt: string;
  category: string;
}

interface PromptAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ImageItem[];
  selectedCount: number;
  onApplyPromptToAll: (prompt: string, mode: 'replace' | 'append') => void;
  onApplyPromptToSelected: (prompt: string, mode: 'replace' | 'append') => void;
}

export const PromptAssistantModal: React.FC<PromptAssistantModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedCount,
  onApplyPromptToAll,
  onApplyPromptToSelected,
}) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([
    {
      title: 'Cinematic Studio Portrait (Chân dung studio)',
      prompt: 'High-end cinematic studio lighting, 85mm portrait lens f/1.4 shallow depth of field, warm golden rim light, ultra detailed editorial magazine quality',
      category: 'Portrait',
    },
    {
      title: 'Cyberpunk Tokyo Neon (Thành phố Cyberpunk)',
      prompt: 'Futuristic cyberpunk neon metropolis, vibrant violet and cyan neon lights, rainy reflective streets, high-tech cyber aesthetics, cinematic 8k',
      category: 'Sci-Fi',
    },
    {
      title: 'Studio Ghibli Anime (Hoạt hình Ghibli)',
      prompt: 'Hayao Miyazaki Studio Ghibli style, soft painted gouache textures, gentle afternoon sunshine, whimsical nostalgic atmosphere, hand-drawn anime aesthetic',
    },
    {
      title: '3D Pixar Animation (Hoạt hình 3D)',
      prompt: 'Modern 3D animated character render, charming expressive stylized features, soft raytraced studio bounce light, Pixar Disney 3D movie render',
      category: '3D Art',
    },
    {
      title: 'Vintage 1970s Kodachrome (Phim cổ điển)',
      prompt: 'Authentic 1970s Kodachrome 35mm film photograph, warm analog color palette, slight grain and lens flare, nostalgic vintage aesthetic',
      category: 'Vintage',
    },
    {
      title: 'Japanese Watercolor (Tranh màu nước Nhật)',
      prompt: 'Traditional Japanese watercolor and sumi-e ink wash, fluid translucent brushstrokes, delicate paper texture, minimalist serene mood',
      category: 'Artistic',
    },
  ]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [appliedPrompt, setAppliedPrompt] = useState<string | null>(null);

  const referenceItem = items[selectedImageIndex] || items[0];

  const handleFetchAiSuggestions = async () => {
    if (!referenceItem) return;
    setLoading(true);
    try {
      const res = await fetch('/api/suggest-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: referenceItem.base64,
          mimeType: referenceItem.mimeType,
          styleCategory: 'creative batch transformation',
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      console.error('Error fetching suggestions:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (prompt: string, target: 'selected' | 'all') => {
    if (target === 'selected') {
      onApplyPromptToSelected(prompt, 'replace');
    } else {
      onApplyPromptToAll(prompt, 'replace');
    }
    setAppliedPrompt(prompt);
    setTimeout(() => {
      setAppliedPrompt(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Wand2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Trợ lý gợi ý Prompt AI (Prompt Assistant)</h3>
              <p className="text-xs text-slate-400">
                Phân tích ảnh và gợi ý các phong cách biến đổi ấn tượng nhất để áp dụng hàng loạt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* Reference Image Picker */}
          {items.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {referenceItem && (
                  <img
                    src={referenceItem.originalUrl}
                    alt="Reference"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-md"
                  />
                )}
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">
                    Ảnh mẫu phân tích: {referenceItem?.name || 'Chưa chọn'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Gemini sẽ phân tích bố cục & chủ thể của ảnh này để tạo prompt phù hợp
                  </p>
                </div>
              </div>

              <button
                onClick={handleFetchAiSuggestions}
                disabled={loading || !referenceItem}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-purple-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang suy nghĩ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Phân tích ảnh & Tạo gợi ý mới</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Suggestions List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Danh sách Prompt phong cách gợi ý:
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {suggestions.map((s, idx) => {
                const isSelected = appliedPrompt === s.prompt;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 shadow-md'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{s.title}</span>
                        {s.category && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-purple-300 border border-slate-700">
                            {s.category}
                          </span>
                        )}
                      </div>

                      {/* Fast Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApply(s.prompt, 'selected')}
                          disabled={selectedCount === 0}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition cursor-pointer disabled:opacity-40"
                          title="Áp dụng cho các ảnh đang chọn"
                        >
                          <Send className="w-3 h-3" />
                          <span>Gán cho Đã Chọn ({selectedCount})</span>
                        </button>

                        <button
                          onClick={() => handleApply(s.prompt, 'all')}
                          disabled={items.length === 0}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition cursor-pointer"
                          title="Áp dụng cho tất cả ảnh"
                        >
                          <Layers className="w-3 h-3 text-purple-400" />
                          <span>Gán cho Tất Cả ({items.length})</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-900 select-all">
                      {s.prompt}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
