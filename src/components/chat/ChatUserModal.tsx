import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../context/SubscriptionContext';

interface ChatUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoChange?: (url: string) => void;
  currentPhoto?: string | null;
  isWalletSigned?: boolean;
  onDisconnectContext?: () => void;
}

export const PROFILE_PHOTO_KEY = 'nuxbee_user_photo';

export const ChatUserModal: React.FC<ChatUserModalProps> = ({
  isOpen,
  onClose,
  onPhotoChange,
  currentPhoto,
  isWalletSigned,
  onDisconnectContext,
}) => {
  const navigate = useNavigate();
  const { tier, isPaid, isExpiringSoon, dailyUsed, dailyLimit, daysRemaining, expiryDate } =
    useSubscription();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localPhoto, setLocalPhoto] = useState<string | null>(
    currentPhoto ?? localStorage.getItem(PROFILE_PHOTO_KEY)
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setLocalPhoto(url);
      localStorage.setItem(PROFILE_PHOTO_KEY, url);
      onPhotoChange?.(url);
    };
    reader.readAsDataURL(file);
  };

  const goToProfile = () => {
    onClose();
    navigate('/profile');
  };

  const usagePercent = dailyLimit > 0 ? Math.min(100, (dailyUsed / dailyLimit) * 100) : 0;

  const expiryLabel = (() => {
    if (!isPaid || !expiryDate) return null;
    if (daysRemaining <= 0) return 'Subscription expired';
    if (daysRemaining === 1) return '1 day remaining';
    return `${daysRemaining} days remaining`;
  })();

  const tierColor =
    tier === 'premium'
      ? 'from-purple-600 to-pink-600'
      : tier === 'pro'
      ? 'from-blue-600 to-cyan-600'
      : 'from-zinc-600 to-zinc-700';

  const tierIcon = tier === 'premium' ? '💎' : tier === 'pro' ? '⚡' : '🤖';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90]"
          />

          {/* Modal panel — anchored top-right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="fixed top-20 right-3 z-[91] w-80 bg-[#16161f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* ── Avatar section ── */}
            <div className="pt-5 pb-4 px-5 flex flex-col items-center gap-2 border-b border-white/[0.06]">
              <div className="relative">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  aria-label="Change profile photo"
                >
                  {localPhoto ? (
                    <img
                      src={localPhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${tierColor} flex items-center justify-center`}
                    >
                      <svg
                        className="w-8 h-8 text-white/80"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </button>
                {/* Edit badge */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#2a2a38] border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors text-[10px]"
                  aria-label="Upload photo"
                >
                  ✏️
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <p className="text-sm text-white/40">Tap avatar to change photo</p>

              {/* Personalized context status */}
              {isWalletSigned ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-900/25 border border-green-500/20 text-xs text-green-400">
                  <span>✅</span>
                  <span className="font-medium">Personalized context active</span>
                  <button
                    type="button"
                    onClick={onDisconnectContext}
                    className="ml-auto text-white/25 hover:text-white/60 transition-colors px-1"
                    title="Disconnect AI context"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-xs text-white/35">
                  <span>🔒</span>
                  <span>Context not linked</span>
                </div>
              )}
            </div>

            {/* ── Plan & usage ── */}
            <div className="px-5 py-4 border-b border-white/[0.06] space-y-3">
              {/* Tier badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tierIcon}</span>
                  <span className="text-base font-semibold capitalize text-white">{tier} Plan</span>
                </div>
                {isExpiringSoon && isPaid && (
                  <span className="text-xs font-medium text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full">
                    Expiring soon
                  </span>
                )}
              </div>

              {/* Expiry */}
              {expiryLabel && (
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <span>📅</span>
                  <span>{expiryLabel}</span>
                </div>
              )}

              {/* Rate limit bar */}
              {dailyLimit === -1 ? (
                <div className="flex items-center gap-2 text-sm text-green-400/80">
                  <span>∞</span>
                  <span>Unlimited requests</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-white/50">
                    <span>Daily requests</span>
                    <span className="font-semibold text-white/70">
                      {dailyUsed} / {dailyLimit}
                    </span>
                  </div>
                  {/* Bar with glow effect */}
                  <div className="relative h-2">
                    {/* Glow bloom layer (not clipped) */}
                    {usagePercent > 0 && (
                      <motion.div
                        animate={{ opacity: [0.35, 0.85, 0.35] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-y-0 left-0 rounded-full blur-[5px] pointer-events-none"
                        style={{
                          width: `${usagePercent}%`,
                          background: usagePercent > 80 ? '#ef4444' : usagePercent > 50 ? '#eab308' : '#22c55e',
                        }}
                      />
                    )}
                    {/* Track + fill */}
                    <div className="relative h-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePercent}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          usagePercent > 80 ? 'bg-red-500/80' : usagePercent > 50 ? 'bg-yellow-400/80' : 'bg-green-500/80'
                        }`}
                      />
                    </div>
                  </div>
                  {usagePercent >= 100 && (
                    <p className="text-xs text-red-400/80">Limit reached. Resets at midnight.</p>
                  )}
                </div>
              )}
            </div>

            {/* ── Action links ── */}
            <div className="py-1.5 px-2">
              <button
                onClick={goToProfile}
                className="flex w-full items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.1] transition-colors text-left"
              >
                <span className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-base flex-shrink-0">
                  👤
                </span>
                <div>
                  <p className="text-[15px] font-medium text-white/90">View Profile</p>
                  <p className="text-xs text-white/40">Edit info, wallet & settings</p>
                </div>
              </button>

              {!isPaid && (
                <button
                  onClick={() => {
                    onClose();
                    navigate('/subscriptions');
                  }}
                  className="flex w-full items-center gap-3 px-3 py-3 rounded-xl hover:bg-purple-900/30 active:bg-purple-900/50 transition-colors text-left"
                >
                  <span className="w-9 h-9 rounded-lg bg-purple-600/20 flex items-center justify-center text-base flex-shrink-0">
                    ✨
                  </span>
                  <div>
                    <p className="text-[15px] font-medium text-purple-300">Upgrade Plan</p>
                    <p className="text-xs text-white/40">Unlock skills & unlimited AI</p>
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
