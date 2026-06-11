'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: 'video' | 'square';
}

export function ImageUpload({ value, onChange, label, aspect = 'video' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
      {value ? (
        <div className={`relative rounded-lg overflow-hidden ${aspect === 'video' ? 'aspect-video' : 'aspect-square'}`}>
          <Image src={value} alt="Uploaded image" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`${aspect === 'video' ? 'aspect-video' : 'aspect-square'} rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors`}
        >
          {uploading ? (
            <>
              <Loader2 className="size-8 text-primary animate-spin mb-2" />
              <p className="text-sm text-slate-500">Uploading...</p>
            </>
          ) : (
            <>
              <ImageIcon className="size-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Click or drag to upload</p>
              <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP — max 5MB</p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-black text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Upload className="size-3" />
                Choose File
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}

export function MultiImageUpload({ value, onChange, label }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setUploading(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        newUrls.push(data.url);
      }
      onChange([...value, ...newUrls]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {value.map((url, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden">
              <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center py-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
      >
        {uploading ? (
          <>
            <Loader2 className="size-6 text-primary animate-spin mb-1" />
            <p className="text-sm text-slate-500">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="size-6 text-slate-400 mb-1" />
            <p className="text-sm text-slate-500">Click or drag images here</p>
            <p className="text-xs text-slate-400">Multiple files supported</p>
          </>
        )}
      </div>
    </div>
  );
}
