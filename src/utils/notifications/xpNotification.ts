/**
 * XP & Gamification Notifications
 * Notificaciones visuales cuando el usuario gana XP o sube de nivel
 */

export interface XPNotification {
  type: 'xp_gained' | 'level_up' | 'achievement_unlocked';
  amount?: number;
  reason?: string;
  level?: number;
  nextLevelXP?: number;
}

/**
 * Muestra notificación de XP ganado
 */
export function showXPNotification(notification: XPNotification) {
  const { type, amount, reason, level, nextLevelXP } = notification;

  // Crear elemento visual
  const notifElement = document.createElement('div');
  notifElement.className = 'xp-notification';
  
  // Diferentes estilos según el tipo
  if (type === 'level_up') {
    notifElement.innerHTML = `
      <div class="xp-level-up-container">
        <div class="xp-level-up-content">
          <div class="xp-star">⭐</div>
          <div class="xp-level-text">
            <h3>¡NIVEL SUBIDO!</h3>
            <p>Ahora eres Nivel <strong>${level}</strong></p>
            <p class="xp-next-level">Próximo nivel: <strong>${nextLevelXP} XP</strong></p>
          </div>
        </div>
      </div>
    `;
    notifElement.className += ' level-up';
  } else if (type === 'achievement_unlocked') {
    notifElement.innerHTML = `
      <div class="xp-achievement-container">
        <div class="xp-achievement-content">
          <div class="xp-trophy">🏆</div>
          <div class="xp-achievement-text">
            <h3>¡LOGRO DESBLOQUEADO!</h3>
            <p>${reason}</p>
            <p class="xp-points">+${amount} XP</p>
          </div>
        </div>
      </div>
    `;
    notifElement.className += ' achievement';
  } else {
    // Default: XP ganado
    const reasonText = getReasonText(reason || 'ACTIVITY');
    notifElement.innerHTML = `
      <div class="xp-gained-container">
        <div class="xp-gained-icon">✨</div>
        <div class="xp-gained-text">
          <p class="xp-reason">${reasonText}</p>
          <p class="xp-amount">+${amount} XP</p>
        </div>
      </div>
    `;
    notifElement.className += ' gained';
  }

  // Agregar al DOM
  document.body.appendChild(notifElement);

  // Animar entrada
  setTimeout(() => {
    notifElement.classList.add('show');
  }, 10);

  // Remover después de 3 segundos
  setTimeout(() => {
    notifElement.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notifElement);
    }, 300);
  }, 3000);
}

/**
 * Convierte el código de razón a texto legible
 */
function getReasonText(reason: string): string {
  const reasonMap: Record<string, string> = {
    'NFT_CREATED': '🎨 NFT Creado',
    'NFT_LISTED': '📋 NFT Listado',
    'NFT_SOLD': '💰 NFT Vendido',
    'NFT_BOUGHT': '🛒 NFT Comprado',
    'LIKE': '❤️ Nuevo Like',
    'COMMENT': '💬 Comentario Añadido',
    'STAKING': '🔐 Staking Completado',
    'REFERRAL': '👥 Amigo Referido',
    'ACTIVITY': '⚡ Actividad',
  };

  return reasonMap[reason] || reason;
}

/**
 * Crea estilos CSS para las notificaciones
 */
export function injectXPNotificationStyles() {
  if (document.getElementById('xp-notification-styles')) {
    return; // Ya inyectados
  }

  const style = document.createElement('style');
  style.id = 'xp-notification-styles';
  style.innerHTML = `
    .xp-notification {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
    }

    .xp-notification.show {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    .xp-notification:not(.show) {
      animation: slideOut 0.3s ease-in forwards;
    }

    /* XP Ganado (Amarillo) */
    .xp-notification.gained {
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.95) 0%, rgba(202, 138, 4, 0.95) 100%);
      border: 2px solid rgba(251, 191, 36, 0.5);
      border-radius: 12px;
      padding: 1rem 1.5rem;
      box-shadow: 0 8px 32px rgba(234, 179, 8, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .xp-gained-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-weight: 600;
    }

    .xp-gained-icon {
      font-size: 1.5rem;
      animation: bounce 0.6s ease-in-out;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .xp-gained-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .xp-reason {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
    }

    .xp-amount {
      font-size: 1.25rem;
      color: #fff;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    /* Level Up (Púrpura) */
    .xp-notification.level-up {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.95) 0%, rgba(126, 34, 206, 0.95) 100%);
      border: 2px solid rgba(196, 181, 253, 0.5);
      border-radius: 16px;
      padding: 1.5rem 2rem;
      box-shadow: 0 12px 48px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      max-width: 320px;
    }

    .xp-level-up-container {
      text-align: center;
    }

    .xp-level-up-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .xp-star {
      font-size: 3rem;
      animation: spin 0.6s ease-in-out;
    }

    @keyframes spin {
      0% { transform: rotate(0deg) scale(0.5); }
      50% { transform: rotate(180deg) scale(1.1); }
      100% { transform: rotate(360deg) scale(1); }
    }

    .xp-level-text {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .xp-level-text h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #fff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      font-weight: 700;
    }

    .xp-level-text p {
      margin: 0;
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .xp-level-text .xp-next-level {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 0.5rem;
    }

    /* Achievement (Verde/Oro) */
    .xp-notification.achievement {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%);
      border: 2px solid rgba(134, 239, 172, 0.5);
      border-radius: 16px;
      padding: 1.5rem 2rem;
      box-shadow: 0 12px 48px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      max-width: 320px;
    }

    .xp-achievement-container {
      text-align: center;
    }

    .xp-achievement-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .xp-trophy {
      font-size: 2.5rem;
      animation: bounce 0.6s ease-in-out;
    }

    .xp-achievement-text {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .xp-achievement-text h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #fff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      font-weight: 700;
    }

    .xp-achievement-text p {
      margin: 0;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .xp-points {
      font-size: 1.1rem;
      font-weight: 600;
      color: #fbbf24;
      margin-top: 0.5rem;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .xp-notification {
        bottom: 1rem;
        right: 1rem;
        left: 1rem;
      }

      .xp-notification.level-up,
      .xp-notification.achievement {
        max-width: 100%;
      }
    }
  `;

  document.head.appendChild(style);
}
