interface SendMessageButtonProps {
  disabled: boolean
  isLoading: boolean
  onClick: () => void
}

export default function SendMessageButton({ disabled, isLoading, onClick }: SendMessageButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={onClick}
      className="btn-send-message"
    >
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      )}
    </button>
  )
}