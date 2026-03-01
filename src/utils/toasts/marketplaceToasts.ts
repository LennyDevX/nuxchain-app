/**
 * 🛍️ Marketplace Toast Notifications
 * Notificaciones para interacciones sociales en el Marketplace (likes, comments, shares)
 */

import toast from 'react-hot-toast'
import { makeToastStyle, toastDurations, DEFAULT_POSITION } from './toastStyles'

const s = {
  social:  makeToastStyle('social'),
  comment: makeToastStyle('comment'),
  success: makeToastStyle('success'),
  info:    makeToastStyle('info'),
  error:   makeToastStyle('error'),
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
    const message = liked ? `❤️ Te gustó "${nftName}"` : `💔 Ya no te gusta "${nftName}"`
    toast(message, { duration: toastDurations.default, position: DEFAULT_POSITION, style: s.social })
  },

  /**
   * Notificación cuando se añade un comentario
   * @param nftName Nombre del NFT comentado
   */
  commentAdded: (nftName: string) => {
    toast.success(`💬 Comentario publicado en "${nftName}"`, { duration: toastDurations.medium, position: DEFAULT_POSITION, style: s.comment })
  },

  /**
   * Notificación cuando alguien comenta tu NFT
   * @param commenterAddress Dirección del comentarista
   * @param nftName Nombre del NFT
   */
  receivedComment: (commenterAddress: string, nftName: string) => {
    const shortAddress = `${commenterAddress.slice(0, 6)}...${commenterAddress.slice(-4)}`
    toast(`💬 ${shortAddress} comentó en tu NFT "${nftName}"`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.comment })
  },

  /**
   * Notificación cuando alguien da like a tu NFT
   * @param likerAddress Dirección del usuario que dio like
   * @param nftName Nombre del NFT
   */
  receivedLike: (likerAddress: string, nftName: string) => {
    const shortAddress = `${likerAddress.slice(0, 6)}...${likerAddress.slice(-4)}`
    toast(`❤️ A ${shortAddress} le gustó tu NFT "${nftName}"`, { duration: toastDurations.medium, position: DEFAULT_POSITION, style: s.social })
  },

  /**
   * Notificación de NFT vendido
   * @param nftName Nombre del NFT vendido
   * @param price Precio de venta
   */
  nftSold: (nftName: string, price: string) => {
    toast.success(`🎉 ¡NFT Vendido!\n"${nftName}" por ${price} POL`, { duration: toastDurations.long, position: DEFAULT_POSITION, style: s.success })
  },

  /**
   * Notificación de filtros aplicados
   * @param filterCount Número de filtros activos
   */
  filtersApplied: (filterCount: number) => {
    toast(`🔍 ${filterCount} filtro${filterCount !== 1 ? 's' : ''} aplicado${filterCount !== 1 ? 's' : ''}`, { duration: toastDurations.short, position: DEFAULT_POSITION, style: s.info })
  },

  /**
   * Notificación cuando se limpia búsqueda/filtros
   */
  filtersCleared: () => {
    toast(`🔄 Filtros eliminados`, { duration: toastDurations.short, position: DEFAULT_POSITION, style: s.info })
  },

  /**
   * Notificación de carga de datos
   */
  loadingNFTs: () => {
    return toast.loading(`⏳ Cargando NFTs...`, { position: DEFAULT_POSITION, style: s.info })
  },

  /**
   * Notificación de error de conexión
   */
  connectionError: () => {
    toast.error(`❌ Error de Conexión\nVerifica tu conexión a Internet`, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  },

  /**
   * Error genérico
   */
  error: (message: string) => {
    toast.error(message, { duration: toastDurations.error, position: DEFAULT_POSITION, style: s.error })
  }
}
