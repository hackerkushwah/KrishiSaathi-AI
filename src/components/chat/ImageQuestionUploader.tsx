import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface ImageQuestionUploaderProps {
  imagePreview: string | null;
  onImageSelected: (base64: string, mimeType: string) => void;
  onImageRemoved: () => void;
  disabled?: boolean;
}

export const ImageQuestionUploader: React.FC<ImageQuestionUploaderProps> = ({
  imagePreview,
  onImageSelected,
  onImageRemoved,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Compress and resize image using HTML5 Canvas to ensure fast transmission
  const processAndCompressFile = (file: File) => {
    setError(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    // Validate size (< 15MB raw input)
    if (file.size > 15 * 1024 * 1024) {
      setError('Image file is too large (> 15MB). Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.72);
          onImageSelected(compressedBase64, 'image/jpeg');
        } else {
          onImageSelected(event.target?.result as string, file.type || 'image/jpeg');
        }
      };
      img.onerror = () => {
        setError('Failed to process image. Please try another file.');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setError('Could not read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndCompressFile(file);
    }
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-2">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-2.5 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview container if image is selected */}
      {imagePreview && (
        <div className="relative inline-block group">
          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-sm max-w-[140px] max-h-[100px] bg-slate-900">
            <img
              src={imagePreview}
              alt="Crop upload preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <button
              type="button"
              id="btn-remove-chat-image"
              onClick={onImageRemoved}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 hover:bg-red-600 text-white transition-colors"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block mt-1">
            ✓ Leaf attached
          </span>
        </div>
      )}

      {/* Trigger Buttons */}
      {!imagePreview && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-open-camera"
            disabled={disabled}
            onClick={() => cameraInputRef.current?.click()}
            className="p-2.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            title="Take photo with camera"
          >
            <Camera className="w-5 h-5" />
          </button>

          <button
            type="button"
            id="btn-open-gallery"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            title="Upload image from gallery"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
