import { useState } from 'react';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface MobileFriendlySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label: string;
  placeholder?: string;
  className?: string;
}

export default function MobileFriendlySelect({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select an option',
  className = ''
}: MobileFriendlySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-white/80 mb-2">
        {label}
      </label>
      
      {/* Collapsed View */}
      <div className="mb-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${value ? 'bg-purple-500/20 border-purple-500/50 text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>{selectedOption?.icon || '📁'}</span>
              <span className="text-sm font-medium">{selectedOption?.label || placeholder}</span>
            </div>
            <span className={`text-xs text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
          </div>
        </button>
      </div>
      
      {/* Expanded View */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gray-800 border border-white/20 rounded-lg shadow-lg space-y-1">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full p-3 text-left transition-all duration-200 ${value === option.value ? 'bg-purple-500/20 text-white border-l-2 border-purple-500' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center space-x-2">
                <span>{option.icon || '📁'}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}