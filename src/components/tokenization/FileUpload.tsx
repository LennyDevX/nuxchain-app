import { useRef } from 'react';
import { motion } from 'framer-motion';
import { tokenizationToasts } from '../../utils/toasts';

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      tokenizationToasts.fileSelected(file.name, sizeInMB);
    }
    onFileSelect(event);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8"
    >
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="jersey-15-regular text-3xl md:text-4xl font-bold text-white mb-6"
      >
        Upload Artwork
      </motion.h2>
      
      {/* File Upload Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-all duration-300 group hover:shadow-lg hover:shadow-purple-500/20"
        onClick={() => fileInputRef.current?.click()}
      >
        {imagePreview ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <motion.img 
              src={imagePreview} 
              alt="Preview"
              layoutId="preview-image"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              ×
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className="group-hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </motion.div>
            <motion.p 
              className="jersey-20-regular text-white/80 mb-2 font-medium text-base md:text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Click to upload or drag and drop
            </motion.p>
            <motion.p 
              className="jersey-20-regular text-white/50 text-sm md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              PNG, JPG, GIF up to 10MB
            </motion.p>
            <motion.p 
              className="jersey-20-regular text-purple-400 text-xs md:text-sm mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              High quality images work best
            </motion.p>
          </motion.div>
        )}
      </motion.div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File Info */}
      {selectedFile && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="jersey-20-regular text-white font-medium">{selectedFile.name}</p>
              <p className="jersey-20-regular text-white/60 text-sm">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <motion.div 
              className="flex items-center gap-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.25 }}
            >
              <motion.div 
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="jersey-20-regular text-green-400 text-sm">Ready</span>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && error.includes('select') && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4"
        >
          <p className="jersey-20-regular text-red-300">{error}</p>
        </motion.div>
      )}
    </motion.div>
  );
}