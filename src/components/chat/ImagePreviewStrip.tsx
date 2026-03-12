/**
 * ImagePreviewStrip — horizontal strip of locally-previewed images above the textarea.
 * Shown when the user selects images; actual upload happens only on Send.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { formatFileSize } from '../../utils/image/compressImage'
import type { PendingImage } from '../../utils/image/compressImage'

interface ImagePreviewStripProps {
  images:       PendingImage[]
  onRemove:     (id: string) => void
  isUploading?: boolean
}

const MAX = 3

export default function ImagePreviewStrip({
  images,
  onRemove,
  isUploading = false,
}: ImagePreviewStripProps) {
  if (images.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 px-3 py-2 flex-wrap"
      aria-label="Attached images"
    >
      <AnimatePresence initial={false}>
        {images.map((img) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="relative group flex-shrink-0"
          >
            {/* Thumbnail — uses local data URL for instant display */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <img
                src={img.dataUrl}
                alt={img.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Hover overlay with file size */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-end justify-center pb-1">
                <span className="text-[9px] text-white/80 font-mono leading-tight text-center px-1">
                  {formatFileSize(img.size)}
                </span>
              </div>
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(img.id)}
              disabled={isUploading}
              aria-label={`Remove ${img.name}`}
              className="
                absolute -top-1.5 -right-1.5
                w-4 h-4 rounded-full
                bg-black/80 border border-white/20
                text-white/70 hover:text-white hover:bg-red-500/80
                flex items-center justify-center
                transition-all duration-150
                opacity-0 group-hover:opacity-100
                focus:opacity-100
              "
            >
              <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M2 2l6 6M8 2l-6 6" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Count badge */}
      <div className="ml-auto flex items-center gap-1.5 text-[11px] text-white/40 font-medium">
        <span>{images.length}/{MAX}</span>
        {images.length >= MAX && (
          <span className="text-amber-400/70">• max</span>
        )}
      </div>
    </motion.div>
  )
}
