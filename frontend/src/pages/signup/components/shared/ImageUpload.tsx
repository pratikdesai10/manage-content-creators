import { useRef, useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  shape?: 'circle' | 'square';
  error?: string;
  label?: string;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageUpload({
  value,
  onChange,
  shape = 'circle',
  error,
  label = 'Click or drag to upload',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      setSizeError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setSizeError('Please upload a JPEG, PNG, or WebP image.');
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        setSizeError('Image must be smaller than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => {
        setSizeError('Failed to read the image file.');
      };
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  const isCircle = shape === 'circle';
  const displayError = sizeError || error;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        /* Preview */
        <div
          className={cn(
            'relative group cursor-pointer overflow-hidden',
            isCircle ? 'w-32 h-32 rounded-full' : 'w-40 h-40 rounded-xl',
          )}
          onClick={() => inputRef.current?.click()}
        >
          <img
            src={value}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm font-medium">Change</span>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'flex flex-col items-center justify-center cursor-pointer border-2 border-dashed transition-colors',
            isCircle ? 'w-32 h-32 rounded-full' : 'w-40 h-40 rounded-xl',
            isDragging
              ? 'border-indigo-500/30 bg-indigo-500/10'
              : 'border-white/10 hover:border-indigo-500/30 bg-white/[0.02]',
          )}
        >
          <Upload className="w-6 h-6 text-gray-500 mb-2" />
          <span className="text-xs text-gray-400 text-center px-2">{label}</span>
        </div>
      )}

      {displayError && <p className="mt-1.5 text-sm text-red-400">{displayError}</p>}
    </div>
  );
}
