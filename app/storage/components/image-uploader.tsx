'use client';

import { useState, useRef } from 'react';
import { uploadImageAction } from '../actions/upload-image';
import Image from 'next/image';

interface ImageUploaderProps {
  type?: 'profile' | 'banner';
  onUploadComplete?: (url: string) => void;
  currentImageUrl?: string;
}

export default function ImageUploader({ 
  type = 'profile', 
  onUploadComplete,
  currentImageUrl
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar o tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validar o tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size exceeds 2MB limit');
      return;
    }

    // Criar uma URL de preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Criar um FormData para enviar o arquivo
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    setIsUploading(true);
    setError(null);

    try {
      // Fazer upload da imagem
      const result = await uploadImageAction(formData);
      
      // Chamar o callback com a URL da imagem
      if (onUploadComplete && result.url) {
        onUploadComplete(result.url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview da imagem */}
      {previewUrl && (
        <div className={`relative overflow-hidden ${
          type === 'profile' 
            ? 'w-24 h-24 rounded-full' 
            : 'w-full h-32 rounded-md'
        }`}>
          <Image
            src={previewUrl}
            alt={`${type} image`}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Input de arquivo (oculto) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Botão para selecionar arquivo */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isUploading 
          ? 'Uploading...' 
          : previewUrl 
            ? `Change ${type === 'profile' ? 'Profile' : 'Banner'} Image` 
            : `Upload ${type === 'profile' ? 'Profile' : 'Banner'} Image`
        }
      </button>

      {/* Mensagem de erro */}
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
