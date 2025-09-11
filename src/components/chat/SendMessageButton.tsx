interface SendMessageButtonProps {
  disabled: boolean
  isLoading: boolean
  onClick: () => void
  hasText?: boolean
}

export default function SendMessageButton({ disabled, isLoading, onClick, hasText = false }: SendMessageButtonProps) {

  
  // Usar diferentes estilos según si hay texto o no
  const buttonClass = hasText 
    ? 'btn-send-message' // Estilo con gradiente cuando hay texto
    : 'btn-send-message opacity-50' // Estilo normal cuando no hay texto
  
  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={onClick}
      className={buttonClass}
    >
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : (
        <svg 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      )}
    </button>
  )
}