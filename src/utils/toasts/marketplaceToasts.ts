/**
 * 🛍️ Marketplace Toast Notifications
 * Notificaciones para interacciones sociales en el Marketplace (likes, comments, shares)
 */

import toast from 'react-hot-toast'

/**
 * 🎨 Toast Style Presets for Marketplace
 */
const marketplaceToastStyles = {
  social: {
    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(236, 72, 153, 0.3)',
    border: '1px solid rgba(236, 72, 153, 0.5)',
    icon: '❤️'
  },
  comment: {
    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(6, 182, 212, 0.3)',
    border: '1px solid rgba(6, 182, 212, 0.5)',
    icon: '💬'
  },
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
    border: '1px solid rgba(16, 185, 129, 0.5)',
    icon: '✅'
  },
  info: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
    border: '1px solid rgba(59, 130, 246, 0.5)',
    icon: 'ℹ️'
  },
  error: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '12px',
    padding: '16px 24px',
    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    icon: '⚠️'
  }
}

/**
 * Marketplace Toast Notifications
 */
export const marketplaceToasts = {
  /**
   * Notificación cuando se da like a un NFT
   * @param nftName Nombre del NFT
   * @param liked True si se añadió like, false si se quitó
   */
  likeToggled: (nftName: string, liked: boolean) => {
    const message = liked 
      ? `❤️ Te gustó "${nftName}"`
      : `💔 Ya no te gusta "${nftName}"`;
    
    toast(
      message,
      {
        duration: 3000,
        position: 'top-center',
        style: {
          background: marketplaceToastStyles.social.background,
          color: marketplaceToastStyles.social.color,
          fontSize: marketplaceToastStyles.social.fontSize,
          fontWeight: marketplaceToastStyles.social.fontWeight,
          borderRadius: marketplaceToastStyles.social.borderRadius,
          padding: marketplaceToastStyles.social.padding,
          boxShadow: marketplaceToastStyles.social.boxShadow,
          border: marketplaceToastStyles.social.border
        }
      }
    )
  },

  /**
   * Notificación cuando se añade un comentario
   * @param nftName Nombre del NFT comentado
   */
  commentAdded: (nftName: string) => {
    toast.success(
      `💬 Comentario publicado en "${nftName}"`,
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: marketplaceToastStyles.comment.background,
          color: marketplaceToastStyles.comment.color,
          fontSize: marketplaceToastStyles.comment.fontSize,
          fontWeight: marketplaceToastStyles.comment.fontWeight,
          borderRadius: marketplaceToastStyles.comment.borderRadius,
          padding: marketplaceToastStyles.comment.padding,
          boxShadow: marketplaceToastStyles.comment.boxShadow,
          border: marketplaceToastStyles.comment.border
        }
      }
    )
  },

  /**
   * Notificación cuando alguien comenta tu NFT
   * @param commenterAddress Dirección del comentarista
   * @param nftName Nombre del NFT
   */
  receivedComment: (commenterAddress: string, nftName: string) => {
    const shortAddress = `${commenterAddress.slice(0, 6)}...${commenterAddress.slice(-4)}`;
    
    toast(
      `💬 ${shortAddress} comentó en tu NFT "${nftName}"`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: marketplaceToastStyles.comment.background,
          color: marketplaceToastStyles.comment.color,
          fontSize: marketplaceToastStyles.comment.fontSize,
          fontWeight: marketplaceToastStyles.comment.fontWeight,
          borderRadius: marketplaceToastStyles.comment.borderRadius,
          padding: marketplaceToastStyles.comment.padding,
          boxShadow: marketplaceToastStyles.comment.boxShadow,
          border: marketplaceToastStyles.comment.border
        }
      }
    )
  },

  /**
   * Notificación cuando alguien da like a tu NFT
   * @param likerAddress Dirección del usuario que dio like
   * @param nftName Nombre del NFT
   */
  receivedLike: (likerAddress: string, nftName: string) => {
    const shortAddress = `${likerAddress.slice(0, 6)}...${likerAddress.slice(-4)}`;
    
    toast(
      `❤️ A ${shortAddress} le gustó tu NFT "${nftName}"`,
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: marketplaceToastStyles.social.background,
          color: marketplaceToastStyles.social.color,
          fontSize: marketplaceToastStyles.social.fontSize,
          fontWeight: marketplaceToastStyles.social.fontWeight,
          borderRadius: marketplaceToastStyles.social.borderRadius,
          padding: marketplaceToastStyles.social.padding,
          boxShadow: marketplaceToastStyles.social.boxShadow,
          border: marketplaceToastStyles.social.border
        }
      }
    )
  },

  /**
   * Notificación de NFT vendido
   * @param nftName Nombre del NFT vendido
   * @param price Precio de venta
   */
  nftSold: (nftName: string, price: string) => {
    toast.success(
      `🎉 ¡NFT Vendido!\n"${nftName}" por ${price} POL`,
      {
        duration: 6000,
        position: 'top-center',
        style: {
          background: marketplaceToastStyles.success.background,
          color: marketplaceToastStyles.success.color,
          fontSize: marketplaceToastStyles.success.fontSize,
          fontWeight: marketplaceToastStyles.success.fontWeight,
          borderRadius: marketplaceToastStyles.success.borderRadius,
          padding: marketplaceToastStyles.success.padding,
          boxShadow: marketplaceToastStyles.success.boxShadow,
          border: marketplaceToastStyles.success.border
        }
      }
    )
  },

  /**
   * Notificación de filtros aplicados
   * @param filterCount Número de filtros activos
   */
  filtersApplied: (filterCount: number) => {
    toast(
      `🔍 ${filterCount} filtro${filterCount !== 1 ? 's' : ''} aplicado${filterCount !== 1 ? 's' : ''}`,
      {
        duration: 2000,
        position: 'top-center',
        style: {
          background: marketplaceToastStyles.info.background,
          color: marketplaceToastStyles.info.color,
          fontSize: marketplaceToastStyles.info.fontSize,
          fontWeight: marketplaceToastStyles.info.fontWeight,
          borderRadius: marketplaceToastStyles.info.borderRadius,
          padding: marketplaceToastStyles.info.padding,
          boxShadow: marketplaceToastStyles.info.boxShadow,
          border: marketplaceToastStyles.info.border
        }
      }
    )
  },

  /**
   * Notificación cuando se limpia búsqueda/filtros
   */
  filtersCleared: () => {
    toast(
      `🔄 Filtros eliminados`,
      {
        duration: 2000,
        position: 'top-center',
        style: {
          background: marketplaceToastStyles.info.background,
          color: marketplaceToastStyles.info.color,
          fontSize: marketplaceToastStyles.info.fontSize,
          fontWeight: marketplaceToastStyles.info.fontWeight,
          borderRadius: marketplaceToastStyles.info.borderRadius,
          padding: marketplaceToastStyles.info.padding,
          boxShadow: marketplaceToastStyles.info.boxShadow,
          border: marketplaceToastStyles.info.border
        }
      }
    )
  },

  /**
   * Notificación de carga de datos
   */
  loadingNFTs: () => {
    return toast.loading(
      `⏳ Cargando NFTs...`,
      {
        position: 'top-center',
        style: {
          background: marketplaceToastStyles.info.background,
          color: marketplaceToastStyles.info.color,
          fontSize: marketplaceToastStyles.info.fontSize,
          fontWeight: marketplaceToastStyles.info.fontWeight,
          borderRadius: marketplaceToastStyles.info.borderRadius,
          padding: marketplaceToastStyles.info.padding,
          boxShadow: marketplaceToastStyles.info.boxShadow,
          border: marketplaceToastStyles.info.border
        }
      }
    )
  },

  /**
   * Notificación de error de conexión
   */
  connectionError: () => {
    toast.error(
      `❌ Error de Conexión\nVerifica tu conexión a Internet`,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: marketplaceToastStyles.error.background,
          color: marketplaceToastStyles.error.color,
          fontSize: marketplaceToastStyles.error.fontSize,
          fontWeight: marketplaceToastStyles.error.fontWeight,
          borderRadius: marketplaceToastStyles.error.borderRadius,
          padding: marketplaceToastStyles.error.padding,
          boxShadow: marketplaceToastStyles.error.boxShadow,
          border: marketplaceToastStyles.error.border
        }
      }
    )
  },

  /**
   * Error genérico
   */
  error: (message: string) => {
    toast.error(
      message,
      {
        duration: 5000,
        position: 'top-center',
        style: {
          background: marketplaceToastStyles.error.background,
          color: marketplaceToastStyles.error.color,
          fontSize: marketplaceToastStyles.error.fontSize,
          fontWeight: marketplaceToastStyles.error.fontWeight,
          borderRadius: marketplaceToastStyles.error.borderRadius,
          padding: marketplaceToastStyles.error.padding,
          boxShadow: marketplaceToastStyles.error.boxShadow,
          border: marketplaceToastStyles.error.border
        }
      }
    )
  }
}
