/**
 * ImageLightbox — full-screen image viewer for chat attachments.
 * Supports multi-image navigation, keyboard arrows, and Escape to close.
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ImageAttachment } from '../../../api/types/index.js'
import { formatFileSize } from '../../utils/image/compressImage'

interface ImageLightboxProps {
  images:        ImageAttachment[]
  initialIndex?: number
  onClose:       () => void
}

export default function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(Math.max(0, Math.min(initialIndex, images.length - 1)))
  const prevIndex = useRef(index)

  const current = images[index]
  const hasMultiple = images.length > 1

  const go = useCallback((delta: 1 | -1) => {
    setIndex((i) => (i + delta + images.length) % images.length)
  }, [images.length])

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowRight')  go(1)
      if (e.key === 'ArrowLeft')   go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  // Trap scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const direction = index > prevIndex.current ? 1 : -1
  useEffect(() => { prevIndex.current = index }, [index])

  if (!current) return null

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
        aria-label="Image viewer"
      >
        {/* Header */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe-top py-3 select-none pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col pointer-events-none">
            <span className="text-white/80 text-sm font-medium truncate max-w-xs">{current.name}</span>
            <span className="text-white/40 text-xs">
              {formatFileSize(current.size)}
              {current.metadata && ` · ${current.metadata.width} × ${current.metadata.height}`}
            </span>
          </div>
          {hasMultiple && (
            <span className="text-white/40 text-sm font-mono">{index + 1} / {images.length}</span>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className="
            absolute top-3 right-3
            w-9 h-9 rounded-full bg-white/10 hover:bg-white/20
            flex items-center justify-center
            text-white/70 hover:text-white
            transition-all duration-150
            pointer-events-auto
          "
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Image container */}
        <div
          className="relative flex items-center justify-center w-full h-full px-16"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={current.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 40 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              src={current.url}
              alt={current.name}
              draggable={false}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl select-none"
            />
          </AnimatePresence>
        </div>

        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(-1) }}
              aria-label="Previous image"
              className="
                absolute left-2 top-1/2 -translate-y-1/2
                w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                flex items-center justify-center text-white/70 hover:text-white
                transition-all duration-150 pointer-events-auto
              "
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); go(1) }}
              aria-label="Next image"
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                flex items-center justify-center text-white/70 hover:text-white
                transition-all duration-150 pointer-events-auto
              "
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicator */}
        {hasMultiple && (
          <div
            className="absolute bottom-5 flex gap-1.5 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`
                  w-2 h-2 rounded-full transition-all duration-200
                  ${i === index ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'}
                `}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
