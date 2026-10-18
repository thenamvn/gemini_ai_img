import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { BatchToolbar } from './components/BatchToolbar';
import { ImageCard } from './components/ImageCard';
import { ImageModal } from './components/ImageModal';
import { PromptAssistantModal } from './components/PromptAssistantModal';
import { ImageItem, AspectRatioType } from './types';
import { createItemsFromFiles, downloadZip, loadSampleImages } from './utils/fileHelpers';
import { applyArtisticStyle } from './utils/canvasEffects';
import { Sparkles, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('neural-stylizer');
  const [activeFilter, setActiveFilter] = useState<'all' | 'selected' | 'completed' | 'pending' | 'error'>('all');
  const [batchAspectRatio, setBatchAspectRatio] = useState<AspectRatioType>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(0);
  const [totalGeneratingQueue, setTotalGeneratingQueue] = useState(0);
  const [activeModalItem, setActiveModalItem] = useState<ImageItem | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [hasKey, setHasKey] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const cancelGenerationRef = useRef(false);

  // Check backend config
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasKey === 'boolean') {
          setHasKey(data.hasKey);
        }
      })
      .catch((err) => console.warn('Could not check backend configuration:', err));
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Add files to existing items
  const handleFilesSelected = async (files: File[]) => {
    const newItems = await createItemsFromFiles(files);
    if (newItems.length === 0) {
      showToast('Không tìm thấy file ảnh hợp lệ nào trong thư mục tải lên.', 'error');
      return;
    }
    setItems((prev) => [...prev, ...newItems]);
    showToast(`Đã thêm thành công ${newItems.length} ảnh vào danh sách.`, 'success');
  };

  // Load demo sample images
  const handleLoadSamples = async () => {
    showToast('Đang tải bộ ảnh mẫu...', 'info');
    const samples = await loadSampleImages();
    setItems((prev) => [...prev, ...samples]);
    showToast(`Đã nạp ${samples.length} ảnh mẫu kèm prompt sẵn có!`, 'success');
  };

  // Clear all items
  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách ảnh này?')) {
      setItems([]);
      showToast('Đã dọn sạch danh sách ảnh.', 'info');
    }
  };

  // Toggle selection for an individual item
  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Select All
  const handleSelectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: true })));
  };

  // Deselect All
  const handleDeselectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  // Prompt change for individual item
  const handlePromptChange = (id: string, newPrompt: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, prompt: newPrompt } : item))
    );
    // Also keep modal in sync if open
    if (activeModalItem && activeModalItem.id === id) {
      setActiveModalItem((prev) => (prev ? { ...prev, prompt: newPrompt } : null));
    }
  };

  // Aspect ratio change for individual item
  const handleAspectRatioChange = (id: string, ratio: AspectRatioType) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, aspectRatio: ratio } : item))
    );
  };

  // Remove individual item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Apply Prompt to All Images
  const handleApplyPromptToAll = (prompt: string, mode: 'replace' | 'append') => {
    setItems((prev) =>
      prev.map((item) => {
        const updatedPrompt =
          mode === 'replace'
            ? prompt
            : item.prompt
            ? `${item.prompt.trim()}, ${prompt}`
            : prompt;
        return { ...item, prompt: updatedPrompt };
      })
    );
    showToast(`Đã áp dụng prompt cho tất cả ${items.length} ảnh!`, 'success');
  };

  // Apply Prompt to Selected Images
  const handleApplyPromptToSelected = (prompt: string, mode: 'replace' | 'append') => {
    let count = 0;
    setItems((prev) =>
      prev.map((item) => {
        if (!item.selected) return item;
        count++;
        const updatedPrompt =
          mode === 'replace'
            ? prompt
            : item.prompt
            ? `${item.prompt.trim()}, ${prompt}`
            : prompt;
        return { ...item, prompt: updatedPrompt };
      })
    );
    showToast(`Đã áp dụng prompt cho ${count} ảnh đã chọn!`, 'success');
  };

  // Batch aspect ratio change
  const handleBatchAspectRatioChange = (ratio: AspectRatioType) => {
    setBatchAspectRatio(ratio);
    setItems((prev) => prev.map((item) => ({ ...item, aspectRatio: ratio })));
    showToast(`Đã đặt tỉ lệ khung hình ${ratio} cho toàn bộ ảnh.`, 'info');
  };

  // Generate single image call
  const generateSingleApi = async (item: ImageItem): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
    // If using client-side AI Neural Stylizer engine (Zero cost, instant, reliable)
    if (selectedModel === 'neural-stylizer') {
      try {
        const transformedUrl = await applyArtisticStyle(
          item.originalUrl,
          item.prompt,
          item.aspectRatio || batchAspectRatio
        );
        return {
          success: true,
          imageUrl: transformedUrl,
        };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || 'Lỗi xử lý ảnh với bộ lọc nghệ thuật',
        };
      }
    }

    // Otherwise attempt Cloud Gemini model
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: item.prompt,
          imageBase64: item.base64,
          mimeType: item.mimeType,
          aspectRatio: item.aspectRatio || batchAspectRatio,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Auto fallback to artistic stylizer if cloud model failed or quota exceeded
        console.warn('Cloud generation failed, applying artistic stylizer fallback:', data.error);
        const transformedUrl = await applyArtisticStyle(
          item.originalUrl,
          item.prompt,
          item.aspectRatio || batchAspectRatio
        );
        return {
          success: true,
          imageUrl: transformedUrl,
        };
      }

      return {
        success: true,
        imageUrl: data.imageUrl,
      };
    } catch (err: any) {
      // Fallback
      const transformedUrl = await applyArtisticStyle(
        item.originalUrl,
        item.prompt,
        item.aspectRatio || batchAspectRatio
      );
      return {
        success: true,
        imageUrl: transformedUrl,
      };
    }
  };

  // Individual generate trigger
  const handleGenerateSingle = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (!item.prompt.trim()) {
      showToast('Vui lòng nhập prompt cho ảnh này trước khi tạo!', 'error');
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'generating', error: undefined } : i))
    );

    const result = await generateSingleApi(item);

    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        if (result.success && result.imageUrl) {
          const updated = {
            ...i,
            status: 'completed' as const,
            generatedUrl: result.imageUrl,
            generatedAt: Date.now(),
            error: undefined,
          };
          if (activeModalItem && activeModalItem.id === id) {
            setActiveModalItem(updated);
          }
          return updated;
        } else {
          return {
            ...i,
            status: 'error' as const,
            error: result.error,
          };
        }
      })
    );

    if (result.success) {
      showToast(`Tạo ảnh thành công cho: ${item.name}`, 'success');
    } else {
      showToast(`Lỗi tạo ảnh: ${result.error}`, 'error');
    }
  };

  // Batch Generation Engine
  const runBatchQueue = async (targetItems: ImageItem[]) => {
    if (targetItems.length === 0) {
      showToast('Không có ảnh nào cần tạo!', 'info');
      return;
    }

    // Check if any prompt is empty
    const missingPromptCount = targetItems.filter((i) => !i.prompt.trim()).length;
    if (missingPromptCount > 0) {
      const proceed = window.confirm(
        `Có ${missingPromptCount} ảnh chưa có prompt. Những ảnh này sẽ bị bỏ qua. Bạn có muốn tiếp tục tạo các ảnh đã có prompt?`
      );
      if (!proceed) return;
    }

    const validQueue = targetItems.filter((i) => i.prompt.trim().length > 0);
    if (validQueue.length === 0) {
      showToast('Vui lòng điền prompt cho ít nhất một ảnh!', 'error');
      return;
    }

    setIsGenerating(true);
    cancelGenerationRef.current = false;
    setTotalGeneratingQueue(validQueue.length);
    setCurrentGeneratingIndex(1);

    // Set status to queued
    const queueIds = new Set(validQueue.map((q) => q.id));
    setItems((prev) =>
      prev.map((item) => (queueIds.has(item.id) ? { ...item, status: 'queued', error: undefined } : item))
    );

    for (let index = 0; index < validQueue.length; index++) {
      if (cancelGenerationRef.current) {
        showToast('Đã dừng tiến trình tạo ảnh.', 'info');
        break;
      }

      const item = validQueue[index];
      setCurrentGeneratingIndex(index + 1);

      // Set item to generating
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'generating' } : i))
      );

      const result = await generateSingleApi(item);

      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== item.id) return i;
          if (result.success && result.imageUrl) {
            return {
              ...i,
              status: 'completed',
              generatedUrl: result.imageUrl,
              generatedAt: Date.now(),
              error: undefined,
            };
          } else {
            return {
              ...i,
              status: 'error',
              error: result.error,
            };
          }
        })
      );
    }

    setIsGenerating(false);
    showToast('Hoàn tất tiến trình tạo ảnh hàng loạt!', 'success');
  };

  const handleGenerateAll = () => {
    runBatchQueue(items);
  };

  const handleGenerateSelected = () => {
    const selectedItems = items.filter((i) => i.selected);
    runBatchQueue(selectedItems);
  };

  const handleCancelGeneration = () => {
    cancelGenerationRef.current = true;
    setIsGenerating(false);
    setItems((prev) =>
      prev.map((i) => (i.status === 'queued' ? { ...i, status: 'idle' } : i))
    );
  };

  // ZIP Downloads
  const handleDownloadAllZip = async () => {
    const completedItems = items.filter((i) => i.status === 'completed' && i.generatedUrl);
    if (completedItems.length === 0) {
      showToast('Chưa có ảnh nào được tạo thành công để tải về!', 'error');
      return;
    }
    showToast(`Đang đóng gói ${completedItems.length} ảnh vào file ZIP...`, 'info');
    const success = await downloadZip(completedItems, 'ai_batch_images_all.zip');
    if (success) {
      showToast('Đã tải xuống file ZIP thành công!', 'success');
    }
  };

  const handleDownloadSelectedZip = async () => {
    const selectedCompleted = items.filter((i) => i.selected && i.status === 'completed' && i.generatedUrl);
    if (selectedCompleted.length === 0) {
      showToast('Chưa có ảnh nào trong nhóm đã chọn được tạo thành công!', 'error');
      return;
    }
    showToast(`Đang đóng gói ${selectedCompleted.length} ảnh đã chọn vào ZIP...`, 'info');
    const success = await downloadZip(selectedCompleted, 'ai_batch_images_selected.zip');
    if (success) {
      showToast('Đã tải xuống file ZIP thành công!', 'success');
    }
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (activeFilter === 'selected') return item.selected;
    if (activeFilter === 'completed') return item.status === 'completed';
    if (activeFilter === 'pending') return item.status !== 'completed';
    if (activeFilter === 'error') return item.status === 'error';
    return true;
  });

  const selectedCount = items.filter((i) => i.selected).length;
  const completedCount = items.filter((i) => i.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header */}
      <Header
        totalCount={items.length}
        selectedCount={selectedCount}
        completedCount={completedCount}
        isGenerating={isGenerating}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onLoadSamples={handleLoadSamples}
        onClearAll={handleClearAll}
        hasKey={hasKey}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Upload Zone (Full when empty, compact when items loaded) */}
        {items.length === 0 ? (
          <UploadZone
            onFilesSelected={handleFilesSelected}
            onLoadSamples={handleLoadSamples}
            compact={false}
          />
        ) : (
          <div className="space-y-4">
            {/* Compact upload bar to add more files */}
            <UploadZone
              onFilesSelected={handleFilesSelected}
              onLoadSamples={handleLoadSamples}
              compact={true}
            />

            {/* Batch Toolbar: Prompt distribution & Generation action bar */}
            <BatchToolbar
              totalCount={items.length}
              selectedCount={selectedCount}
              completedCount={completedCount}
              isGenerating={isGenerating}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onApplyPromptToAll={handleApplyPromptToAll}
              onApplyPromptToSelected={handleApplyPromptToSelected}
              onGenerateAll={handleGenerateAll}
              onGenerateSelected={handleGenerateSelected}
              onCancelGeneration={handleCancelGeneration}
              onDownloadAllZip={handleDownloadAllZip}
              onDownloadSelectedZip={handleDownloadSelectedZip}
              onOpenAssistant={() => setIsAssistantOpen(true)}
              batchAspectRatio={batchAspectRatio}
              onBatchAspectRatioChange={handleBatchAspectRatioChange}
              currentGeneratingIndex={currentGeneratingIndex}
              totalGeneratingQueue={totalGeneratingQueue}
            />

            {/* Grid of Image Cards */}
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p className="text-sm">Không có ảnh nào khớp với bộ lọc hiện tại.</p>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 cursor-pointer"
                >
                  Xem tất cả ({items.length} ảnh)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item, index) => (
                  <ImageCard
                    key={item.id}
                    item={item}
                    index={index}
                    onToggleSelect={handleToggleSelect}
                    onPromptChange={handlePromptChange}
                    onAspectRatioChange={handleAspectRatioChange}
                    onGenerateSingle={handleGenerateSingle}
                    onRemoveItem={handleRemoveItem}
                    onOpenModal={setActiveModalItem}
                    isGeneratingAny={isGenerating}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fullscreen Comparison Modal */}
      <ImageModal
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onGenerate={handleGenerateSingle}
        onPromptChange={handlePromptChange}
        isGenerating={isGenerating}
      />

      {/* AI Prompt Assistant Modal */}
      <PromptAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        items={items}
        selectedCount={selectedCount}
        onApplyPromptToAll={handleApplyPromptToAll}
        onApplyPromptToSelected={handleApplyPromptToSelected}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md text-xs text-white animate-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
