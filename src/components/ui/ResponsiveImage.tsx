import { useState } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  mobileSize?: string;      // Tamaño móvil (e.g., 'w-64 h-64')
  tabletSize?: string;      // Tamaño tablet
  desktopSize?: string;     // Tamaño desktop
  placeholderSrc?: string;  // Imagen placeholder
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  priority?: boolean;       // Si es importante, no usar lazy load
  srcSet?: string;          // Para imagen responsiva
  sizes?: string;           // Media query sizes
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * 🖼️ Componente de imagen responsiva con optimizaciones para mobile
 * Features:
 * - Lazy loading automático
 * - Placeholders con blur effect
 * - Fallback para errores
 * - Skeleton loading
 * - Responsive sizes por breakpoint
 * 
 * @example
 * <ResponsiveImage
 *   src="/nft.webp"
 *   alt="NFT Artwork"
 *   mobileSize="w-48 h-48"
 *   tabletSize="md:w-64 md:h-64"
 *   desktopSize="lg:w-96 lg:h-96"
 *   placeholderSrc="/nft-thumbnail.webp"
 *   sizes="(max-width: 640px) 192px, (max-width: 1024px) 256px, 384px"
 * />
 */
export function ResponsiveImage({
  src,
  alt,
  mobileSize = 'w-48 h-48',
  tabletSize = 'md:w-64 md:h-64',
  desktopSize = 'lg:w-80 lg:h-80',
  placeholderSrc,
  className = '',
  objectFit = 'cover',
  priority = false,
  srcSet,
  sizes,
  onLoad,
  onError
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    'scale-down': 'object-scale-down'
  }[objectFit];

  const sizeClasses = `${mobileSize} ${tabletSize} ${desktopSize}`;

  return (
    <div className={`relative overflow-hidden rounded-lg ${sizeClasses} ${className}`}>
      {/* Placeholder (opcional) - Mostrar mientras carga */}
      {placeholderSrc && !isLoaded && !hasError && (
        <img
          src={placeholderSrc}
          alt={`${alt} placeholder`}
          className={`
            absolute inset-0 w-full h-full ${objectFitClass}
            blur-md scale-110 opacity-50
          `}
          aria-hidden="true"
        />
      )}

      {/* Imagen principal */}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          srcSet={srcSet}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          className={`
            w-full h-full ${objectFitClass}
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Error fallback - Mostrar si falla la carga */}
      {hasError && (
        <div className="
          absolute inset-0 flex items-center justify-center
          bg-white/5 border border-white/10 rounded-lg
        ">
          <div className="text-center p-4">
            <span className="text-3xl mb-2 block">🖼️</span>
            <p className="text-xs text-white/60">Image not available</p>
          </div>
        </div>
      )}

      {/* Loading skeleton - Mostrar mientras carga */}
      {!isLoaded && !hasError && (
        <div className="
          absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5
          animate-pulse rounded-lg
        " />
      )}
    </div>
  );
}

/**
 * 🖼️ Variante para avatares circulares
 * 
 * @example
 * <AvatarImage
 *   src="/avatar.webp"
 *   alt="User Avatar"
 *   size="lg"
 * />
 */
interface AvatarImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  placeholderSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function AvatarImage({
  src,
  alt,
  size = 'md',
  placeholderSrc,
  onLoad,
  onError
}: AvatarImageProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      mobileSize={sizeMap[size]}
      tabletSize={sizeMap[size]}
      desktopSize={sizeMap[size]}
      placeholderSrc={placeholderSrc}
      className="rounded-full ring-2 ring-white/10"
      objectFit="cover"
      onLoad={onLoad}
      onError={onError}
    />
  );
}
