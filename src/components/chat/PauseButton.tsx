import { useIsMobile } from '../../hooks/mobile/useIsMobile'

interface PauseButtonProps {
  onClick: () => void
}

export default function PauseButton({ onClick }: PauseButtonProps) {
  const isMobile = useIsMobile()

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex items-center justify-center
        ${isMobile ? 'w-12 h-12' : 'w-14 h-14'}
        rounded-full transition-all duration-300
        bg-gradient-to-r from-red-600 to-orange-500 shadow-lg shadow-red-500/50 hover:shadow-lg hover:shadow-red-500/70 active:scale-95
        cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-brand-black-DEFAULT
      `}
    >
      <svg 
        className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} text-white`}
        fill="currentColor" 
        viewBox="0 0 24 24"
        strokeWidth={0}
      >
        {/* Pause icon - two vertical bars */}
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
    </button>
  )
}
