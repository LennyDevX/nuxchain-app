import React from 'react';
import { useTapFeedback } from '../../hooks/mobile/useTapFeedback';
import { BORDER_RADIUS, TRANSITIONS } from '../../constants/tailwindClasses';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  haptic?: 'light' | 'medium' | 'strong' | 'none';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * 🎯 Botón optimizado para dispositivos táctiles
 * Features:
 * - Feedback háptico configurable
 * - Touch target size optimizado (min 44x44px)
 * - Estados visuales mejorados (hover, active, disabled)
 * - Loading state integrado
 * - Variantes de estilo predefinidas
 * 
 * @example
 * <TouchButton
 *   variant="primary"
 *   size="md"
 *   haptic="medium"
 *   onClick={handleClick}
 *   icon={<StarIcon />}
 * >
 *   Claim Airdrop
 * </TouchButton>
 */
export function TouchButton({
  variant = 'primary',
  size = 'md',
  haptic = 'medium',
  fullWidth = false,
  isLoading = false,
  icon,
  children,
  onClick,
  disabled,
  className = '',
  ...props
}: TouchButtonProps) {
  const triggerHaptic = useTapFeedback();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs md:text-sm min-h-[44px]',
    md: 'px-4 py-2 text-sm md:text-base min-h-[44px]',
    lg: 'px-6 py-3 text-base md:text-lg min-h-[48px]'
  }[size];

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-purple-500 to-purple-600
      text-white font-semibold
      hover:from-purple-600 hover:to-purple-700
      active:from-purple-700 active:to-purple-800
      disabled:from-purple-500/50 disabled:to-purple-600/50
      disabled:text-white/50
      shadow-lg shadow-purple-500/20
    `,
    secondary: `
      bg-white/10 border border-white/20
      text-white font-medium
      hover:bg-white/20 hover:border-white/30
      active:bg-white/30
      disabled:bg-white/5 disabled:border-white/10
      disabled:text-white/50
    `,
    tertiary: `
      bg-transparent
      text-white font-medium
      hover:bg-white/5
      active:bg-white/10
      disabled:text-white/50
    `,
    ghost: `
      bg-transparent text-white/80
      hover:text-white hover:bg-white/5
      active:bg-white/10
      disabled:text-white/50
    `,
    danger: `
      bg-red-500/20 border border-red-500/50
      text-red-300 font-semibold
      hover:bg-red-500/30 hover:border-red-500/70
      active:bg-red-500/40
      disabled:bg-red-500/10 disabled:border-red-500/20
      shadow-lg shadow-red-500/10
    `
  }[variant];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading && haptic !== 'none') {
      triggerHaptic(haptic);
    }
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        ${BORDER_RADIUS.button}
        ${sizeClasses}
        ${variantClasses}
        ${TRANSITIONS.normal}
        ${fullWidth ? 'w-full' : ''}
        inline-flex items-center justify-center gap-2
        font-medium whitespace-nowrap
        active:scale-95
        disabled:cursor-not-allowed
        disabled:scale-100
        focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-transparent
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

/**
 * 🎯 Botón de icono circular para acciones rápidas
 * Ideal para: like, share, delete, etc.
 * 
 * @example
 * <IconButton
 *   icon={<HeartIcon />}
 *   variant="ghost"
 *   size="md"
 *   haptic="light"
 *   onClick={handleLike}
 *   aria-label="Like NFT"
 * />
 */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  haptic?: 'light' | 'medium' | 'strong' | 'none';
  isLoading?: boolean;
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  haptic = 'light',
  isLoading = false,
  onClick,
  disabled,
  className = '',
  ...props
}: IconButtonProps) {
  const triggerHaptic = useTapFeedback();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  }[size];

  const variantClasses = {
    primary: `
      bg-purple-500/20 text-purple-300
      hover:bg-purple-500/30
      active:bg-purple-500/40
      disabled:bg-purple-500/10 disabled:text-purple-500/50
    `,
    secondary: `
      bg-white/10 text-white
      hover:bg-white/20
      active:bg-white/30
      disabled:bg-white/5 disabled:text-white/50
    `,
    ghost: `
      bg-transparent text-white/80
      hover:bg-white/5 hover:text-white
      active:bg-white/10
      disabled:text-white/50
    `,
    danger: `
      bg-red-500/20 text-red-300
      hover:bg-red-500/30
      active:bg-red-500/40
      disabled:bg-red-500/10 disabled:text-red-500/50
    `
  }[variant];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading && haptic !== 'none') {
      triggerHaptic(haptic);
    }
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        ${sizeClasses}
        ${variantClasses}
        ${TRANSITIONS.fast}
        rounded-full
        inline-flex items-center justify-center
        active:scale-90
        disabled:cursor-not-allowed
        disabled:scale-100
        focus:outline-none focus:ring-2 focus:ring-purple-500/50
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon
      )}
    </button>
  );
}
