import React, { useCallback, useRef } from 'react';

interface ImageUploaderProps {
  selectedImage: string | null;
  onImageSelect: (base64: string | null) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ selectedImage, onImageSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Simple validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelect(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [disabled]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-400 mb-2">
        Reference Image (Optional for Editing)
      </label>
      
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          relative group w-full h-64 border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300
          ${selectedImage 
            ? 'border-indigo-500/50 bg-slate-800/50' 
            : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-indigo-500/50 cursor-pointer'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={disabled}
        />

        {selectedImage ? (
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <img 
              src={selectedImage} 
              alt="Reference" 
              className="max-w-full max-h-full object-contain rounded shadow-lg"
            />
            {!disabled && (
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors shadow-lg"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center text-xs text-white backdrop-blur-sm">
              Using as reference for editing
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
            <svg className="w-12 h-12 mb-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">Click to upload or drag & drop</p>
            <p className="text-xs text-slate-500 mt-1">Upload to edit an existing image</p>
          </div>
        )}
      </div>
    </div>
  );
};