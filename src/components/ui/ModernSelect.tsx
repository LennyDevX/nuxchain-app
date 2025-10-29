import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface ModernSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * ModernSelect - Componente select minimalista y elegante
 * 
 * Características:
 * - Diseño clean y moderno
 * - Animaciones suaves
 * - Optimizado para mobile y desktop
 * - Accesibilidad mejorada
 * - Compatible con el sistema de diseño del proyecto
 */
export default function ModernSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  disabled = false
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, optionValue?: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (optionValue) {
        handleSelect(optionValue);
      } else {
        setIsOpen(!isOpen);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div 
      ref={selectRef} 
      className={`relative ${className}`}
    >
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => !disabled && handleKeyDown(e)}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 
          bg-white/5 backdrop-blur-md
          border border-white/10
          rounded-lg
          text-sm font-medium
          transition-all duration-300 ease-out
          flex items-center justify-between
          group
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-white/10 hover:border-white/20 cursor-pointer'
          }
          ${isOpen && !disabled
            ? 'bg-white/10 border-purple-500/50 ring-2 ring-purple-500/20' 
            : ''
          }
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-white/90">
          {selectedOption?.icon && (
            <span className="text-base">{selectedOption.icon}</span>
          )}
          <span className="truncate">
            {selectedOption?.label || placeholder}
          </span>
        </span>
        
        {/* Chevron Icon */}
        <svg 
          className={`
            w-4 h-4 text-white/60 
            transition-transform duration-300
            ${isOpen ? 'rotate-180' : 'rotate-0'}
            ${!disabled && 'group-hover:text-white/80'}
          `}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {/* Dropdown Options */}
      <div
        className={`
          absolute z-50 w-full mt-2
          bg-[#1a1a1a]/95 backdrop-blur-xl
          border border-white/15
          rounded-lg
          shadow-2xl shadow-black/40
          overflow-hidden
          transition-all duration-300 ease-out
          origin-top
          ${isOpen 
            ? 'opacity-100 scale-y-100 translate-y-0' 
            : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
          }
        `}
        role="listbox"
      >
        <div className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
          {options.map((option, index) => {
            const isSelected = option.value === value;
            
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                onKeyDown={(e) => handleKeyDown(e, option.value)}
                className={`
                  w-full px-4 py-2.5
                  text-sm font-medium text-left
                  transition-all duration-200
                  flex items-center gap-2
                  group
                  ${isSelected
                    ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/10 text-white border-l-2 border-purple-500'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                  ${index !== 0 ? 'border-t border-white/5' : ''}
                `}
                role="option"
                aria-selected={isSelected}
              >
                {option.icon && (
                  <span className="text-base flex-shrink-0">
                    {option.icon}
                  </span>
                )}
                <span className="flex-1 truncate">
                  {option.label}
                </span>
                
                {/* Selected Indicator */}
                {isSelected && (
                  <svg 
                    className="w-4 h-4 text-purple-400 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
