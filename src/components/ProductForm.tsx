import React, { useState } from 'react';
import type { SingleRawInput, PostLanguage, PostLengthPreference, ImageInput } from '../types';
import { Languages, Link as LinkIcon, Store, Square, AlignLeft, Send, UploadCloud, X, Layers } from 'lucide-react';
import { BannerStudioModal } from './BannerStudioModal';
import Swal from 'sweetalert2';

interface ProductFormProps {
  input: SingleRawInput;
  setInput: React.Dispatch<React.SetStateAction<SingleRawInput>>;
  onGenerate: () => void;
  onStop: () => void;
  isLoading: boolean;
  progressState: {
    current: number;
    total: number;
    percentage: number;
    strategyName: string;
  } | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  input,
  setInput,
  onGenerate,
  onStop,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedStudioImg, setSelectedStudioImg] = useState<{ id: string; url: string } | null>(null);

  const processImageFiles = (files: File[]) => {
    const validImages = files.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) return;

    const newImages: ImageInput[] = [];
    let processed = 0;

    validImages.forEach((file) => {
      const mimeType = file.type || 'image/jpeg';
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          base64,
          mimeType,
          previewUrl: result,
        });

        processed++;
        if (processed === validImages.length) {
          setInput((prev) => ({
            ...prev,
            imageFiles: [...(prev.imageFiles || []), ...newImages],
          }));

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Added ${newImages.length} ${newImages.length === 1 ? 'Product Photo' : 'Product Photos'}!`,
            showConfirmButton: false,
            timer: 2000,
            background: '#1e293b',
            color: '#fff',
          });
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processImageFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardFiles: File[] = [];

    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      Array.from(e.clipboardData.files).forEach((f) => {
        if (f.type.startsWith('image/')) {
          clipboardFiles.push(f);
        }
      });
    }

    if (clipboardFiles.length > 0) {
      processImageFiles(clipboardFiles);
    }
  };

  const handleRemoveSingleImage = (idToRemove: string) => {
    setInput((prev) => ({
      ...prev,
      imageFiles: prev.imageFiles?.filter((img) => img.id !== idToRemove),
    }));
  };

  return (
    <div
      className="card-glass form-container compact-padding full-width-card"
      onPaste={handlePaste}
    >
      <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }} className="form-body">
        {/* MANDATORY FIELD 1: Page Name */}
        <div className="form-group">
          <label className="form-label">
            <Store size={14} className="icon-indigo" />
            <span>Facebook Page / Business Name (Default: gadgetbro)</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="gadgetbro"
            value={input.pageName}
            onChange={(e) => setInput((prev) => ({ ...prev, pageName: e.target.value }))}
            disabled={isLoading}
          />
        </div>

        {/* REDESIGNED DRAG & DROP + CLIPBOARD IMAGE UPLOAD FIELD */}
        <div className="form-group">
          <div className="label-row-with-badge">
            <label className="form-label">
              <UploadCloud size={15} className="icon-indigo" />
              <span>Product Photos</span>
            </label>
            {input.imageFiles && input.imageFiles.length > 0 && (
              <span className="badge-photo-count">
                {input.imageFiles.length} {input.imageFiles.length === 1 ? 'Photo' : 'Photos'}
              </span>
            )}
          </div>

          <div
            className={`modern-dropzone ${isDragging ? 'dragging-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImageUpload}
              disabled={isLoading}
              id="multi-product-image-input"
              className="file-input-hidden"
            />

            <label htmlFor="multi-product-image-input" className="dropzone-inner-content">
              <div className="dropzone-icon-ring">
                <UploadCloud size={24} className="icon-cloud-pulse" />
              </div>
              <div className="dropzone-text-group">
                <span className="dropzone-main-text">
                  <strong>Click to upload</strong> or drag & drop product photos
                </span>
                <span className="dropzone-sub-text">
                  Supports PNG, JPG, WEBP • Press <strong>Ctrl + V</strong> anywhere to paste images from clipboard
                </span>
              </div>
            </label>
          </div>

          {/* Uploaded Images Preview Gallery */}
          {input.imageFiles && input.imageFiles.length > 0 && (
            <div className="modern-preview-gallery">
              {input.imageFiles.map((img, idx) => (
                <div key={img.id} className="preview-thumb-card card-glass">
                  <img src={img.previewUrl} alt={`Product photo ${idx + 1}`} className="preview-thumb-img" />
                  <div className="thumb-overlay">
                    <button
                      type="button"
                      className="btn-studio-thumb"
                      onClick={() => setSelectedStudioImg({ id: img.id, url: img.previewUrl })}
                      disabled={isLoading}
                      title="Make Promo Banner / Add Code"
                    >
                      <span>Banner</span>
                    </button>

                    <button
                      type="button"
                      className="btn-delete-thumb"
                      onClick={() => handleRemoveSingleImage(img.id)}
                      disabled={isLoading}
                      title="Delete photo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <span className="thumb-idx-badge">#{idx + 1}</span>
                </div>
              ))}
            </div>
          )}

          {/* Promo Banner Studio Modal */}
          {selectedStudioImg && (
            <BannerStudioModal
              isOpen={!!selectedStudioImg}
              onClose={() => setSelectedStudioImg(null)}
              imageUrl={selectedStudioImg.url}
              onSaveBanner={(newUrl) => {
                setInput((prev) => ({
                  ...prev,
                  imageFiles: prev.imageFiles?.map((f) =>
                    f.id === selectedStudioImg.id ? { ...f, previewUrl: newUrl } : f
                  ),
                }));
              }}
            />
          )}
        </div>

        {/* OPTIONAL FIELD 3: Raw Product Details Textarea */}
        <div className="form-group">
          <label className="form-label">
            <span>Product Details / Raw Notes (Optional - Paste product details, prices, specs)</span>
          </label>
          <textarea
            className="form-textarea raw-input-textarea"
            rows={10}
            placeholder="Paste or type raw product specs, offer price, delivery notes, or press Ctrl+V to paste content..."
            value={input.rawText}
            onChange={(e) => {
              setInput((prev) => ({ ...prev, rawText: e.target.value }));
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.max(280, e.target.scrollHeight)}px`;
            }}
            disabled={isLoading}
          />
        </div>

        {/* Controls Grid */}
        <div className="form-grid-4">
          <div className="form-group">
            <label className="form-label">
              <Layers size={14} /> <span>Number of Posts</span>
            </label>
            <select
              className="form-select"
              value={input.postCount || 1}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, postCount: parseInt(e.target.value, 10) || 1 }))
              }
              disabled={isLoading}
            >
              <option value={1}>1 Post (Default)</option>
              <option value={2}>2 Posts</option>
              <option value={3}>3 Posts</option>
              <option value={4}>4 Posts</option>
              <option value={5}>5 Posts</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <AlignLeft size={14} /> <span>Post Length</span>
            </label>
            <select
              className="form-select"
              value={input.postLength || 'short'}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, postLength: e.target.value as PostLengthPreference }))
              }
              disabled={isLoading}
            >
              <option value="short">Short & Punchy (4-5 lines)</option>
              <option value="balanced">Balanced Mix</option>
              <option value="detailed">Detailed & In-Depth</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Languages size={14} /> <span>Language</span>
            </label>
            <select
              className="form-select"
              value={input.language}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, language: e.target.value as PostLanguage }))
              }
              disabled={isLoading}
            >
              <option value="bn">Bengali (বাংলা)</option>
              <option value="bn-en-mix">Bangla & English Mix</option>
              <option value="banglish">Banglish</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <LinkIcon size={14} /> <span>Contact / Link</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. m.me/page, WhatsApp, website URL"
              value={input.ctaValue || ''}
              onChange={(e) => setInput((prev) => ({ ...prev, ctaValue: e.target.value }))}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Action Row */}
        <div className="action-row">
          {!isLoading ? (
            <button
              type="submit"
              className="btn-primary btn-generate"
            >
              <Send size={16} />
              <span>Generate {input.postCount || 1} {input.postCount === 1 ? 'Post' : 'Posts'}</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-danger btn-stop"
              onClick={onStop}
            >
              <Square size={16} fill="currentColor" />
              <span>Stop Generation (Cancel)</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
