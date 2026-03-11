/**
 * FileUploadButton — 📎 attachment button that sits next to the send button.
 * Compresses the selected file client-side and returns a PendingImage for
 * an instant local preview. The actual upload to Vercel Blob happens only
 * when the user hits Send (inside handleSendMessage in Chat.tsx).
 */

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { compressImage, formatFileSize, type PendingImage } from '../../utils/image/compressImage'

export type { PendingImage }

const MAX_IMAGES_PER_MESSAGE = 3
const MAX_FILE_MB = 10

interface FileUploadButtonProps {
  onImageSelected: (img: PendingImage) => void
  currentCount:    number
  isDisabled?:     boolean
}

export default function FileUploadButton({
  onImageSelected,
  currentCount,
  isDisabled = false,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isCompressing, setIsCompressing] = useState(false)

  const handleClick = () => {
    if (isDisabled || isCompressing) return
    if (currentCount >= MAX_IMAGES_PER_MESSAGE) {
      toast.error(`Max ${MAX_IMAGES_PER_MESSAGE} images per message`)
      return
    }
    inputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset so the same file can be re-selected later
    e.target.value = ''

    if (!file) return

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`Image too large (max ${MAX_FILE_MB} MB)`)
      return
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP, or HEIC images are supported')
      return
    }

    setIsCompressing(true)
    try {
      const compressed = await compressImage(file)
      const savedPct = Math.round((1 - compressed.sizeAfter / compressed.sizeBefore) * 100)
      console.log(
        `[FileUpload] Compressed ${formatFileSize(compressed.sizeBefore)} → ` +
        `${formatFileSize(compressed.sizeAfter)} (${savedPct}% smaller)`
      )

      const pending: PendingImage = {
        id:      crypto.randomUUID(),
        blob:    compressed.blob,
        dataUrl: compressed.dataUrl,
        name:    file.name,
        size:    compressed.sizeAfter,
        width:   compressed.width,
        height:  compressed.height,
      }

      onImageSelected(pending)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not process image'
      toast.error(msg)
      console.error('[FileUpload]', err)
    } finally {
      setIsCompressing(false)
    }
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {/* Visible button */}
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={isDisabled || isCompressing || currentCount >= MAX_IMAGES_PER_MESSAGE}
        aria-label={
          currentCount >= MAX_IMAGES_PER_MESSAGE ? `Max ${MAX_IMAGES_PER_MESSAGE} images per message` :
          isCompressing ? 'Processing image…' :
          'Attach image'
        }
        whileHover={!isDisabled && !isCompressing && currentCount < MAX_IMAGES_PER_MESSAGE ? { scale: 1.1 } : {}}
        whileTap={!isDisabled && !isCompressing && currentCount < MAX_IMAGES_PER_MESSAGE ? { scale: 0.95 } : {}}
        className={`
          flex items-center justify-center w-9 h-9 rounded-xl
          transition-all duration-200 flex-shrink-0
          ${(isDisabled || isCompressing || currentCount >= MAX_IMAGES_PER_MESSAGE)
            ? 'opacity-40 cursor-not-allowed text-white/30'
            : 'text-white/50 hover:text-white/80 hover:bg-white/10 cursor-pointer'
          }
        `}
      >
        {isCompressing ? (
          /* Spinner */
          <svg
            className="w-4 h-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        ) : (
          /* Paperclip icon */
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        )}
      </motion.button>
    </>
  )
}
