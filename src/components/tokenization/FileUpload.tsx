import { useRef } from 'react';

interface FileUploadProps {
  selectedFile: File | null;
  imagePreview: string | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
  error: string | null;
}

export default function FileUpload({
  selectedFile,
  imagePreview,
  onFileSelect,
  onFileRemove,
  error
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Upload Artwork</h2>
      
      {/* File Upload Area */}
      <div 
        className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors group"
        onClick={() => fileInputRef.current?.click()}
      >
        {imagePreview ? (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="group-hover:scale-105 transition-transform">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-white/80 mb-2 font-medium">Click to upload or drag and drop</p>
            <p className="text-white/50 text-sm">PNG, JPG, GIF up to 10MB</p>
            <p className="text-purple-400 text-xs mt-2">High quality images work best</p>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
      />

      {/* File Info */}
      {selectedFile && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-white/60 text-sm">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm">Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && error.includes('select') && (
        <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}