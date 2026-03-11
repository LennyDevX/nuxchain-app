import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { SKILLS, type SkillId } from '../../../constants/subscription';
import { SKILL_INPUT_CONFIG, type SkillField } from './skillInputConfig';

interface SkillInputModalProps {
  skillId: SkillId | null;
  onClose: () => void;
  onSubmit: (skillId: SkillId, params: Record<string, unknown>) => void;
  isLoading?: boolean;
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: SkillField;
  value: string;
  onChange: (val: string) => void;
}) {
  const baseClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/60 focus:bg-white/8 transition-all';

  if (field.type === 'textarea') {
    return (
      <textarea
        rows={3}
        className={`${baseClass} resize-none`}
        placeholder={field.placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={field.maxLength}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <select
        className={`${baseClass} bg-[#1a1a1f]`}
        value={value || (field.options?.[0]?.value ?? '')}
        onChange={e => onChange(e.target.value)}
      >
        {field.options?.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      className={baseClass}
      placeholder={field.placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      maxLength={field.maxLength}
    />
  );
}

export function SkillInputModal({ skillId, onClose, onSubmit, isLoading }: SkillInputModalProps) {
  const { address } = useAccount();
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // Reset + auto-fill on skill change
  useEffect(() => {
    if (!skillId) return;
    const config = SKILL_INPUT_CONFIG[skillId];
    const initial: Record<string, string> = {};
    for (const field of config.fields) {
      if (field.type === 'select' && field.options?.[0]) {
        initial[field.key] = field.options[0].value;
      } else if (field.autoFillWallet && address) {
        initial[field.key] = address;
      } else {
        initial[field.key] = '';
      }
    }
    setFormValues(initial);
  }, [skillId, address]);

  const handleChange = useCallback((key: string, val: string) => {
    setFormValues(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!skillId) return;
    const config = SKILL_INPUT_CONFIG[skillId];
    // Parse abi JSON if present
    const params: Record<string, unknown> = {};
    for (const field of config.fields) {
      const raw = formValues[field.key] ?? '';
      if (field.key === 'abi' && raw) {
        try { params[field.key] = JSON.parse(raw); } catch { params[field.key] = raw; }
      } else if (field.type === 'number' && raw) {
        params[field.key] = parseFloat(raw);
      } else if (raw) {
        params[field.key] = raw;
      }
    }
    onSubmit(skillId, params);
  }, [skillId, formValues, onSubmit]);

  const isSubmittable = useCallback(() => {
    if (!skillId) return false;
    const config = SKILL_INPUT_CONFIG[skillId];
    return config.fields
      .filter(f => f.required)
      .every(f => (formValues[f.key] ?? '').trim().length > 0);
  }, [skillId, formValues]);

  if (!skillId) return null;
  const skill = SKILLS[skillId];
  const config = SKILL_INPUT_CONFIG[skillId];

  return (
    <AnimatePresence>
      {skillId && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 md:static md:flex md:items-center md:justify-center md:inset-0 md:pb-0 md:px-0"
          >
            <div className="w-full max-w-md bg-[#111116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{skill.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-base leading-tight">{skill.label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{skill.description}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/30 hover:text-white/70 transition-colors text-lg p-1"
                >
                  ✕
                </button>
              </div>

              {/* Fields */}
              <div className="px-5 py-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                {config.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <FieldInput
                      field={field}
                      value={formValues[field.key] ?? ''}
                      onChange={val => handleChange(field.key, val)}
                    />
                    {field.hint && (
                      <p className="text-[11px] text-white/30 mt-1">{field.hint}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 pb-5 pt-3 flex gap-3 border-t border-white/8">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isSubmittable() || isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="inline-block"
                      >
                        ⟳
                      </motion.span>
                      Running...
                    </>
                  ) : (
                    <>
                      <span>{skill.icon}</span>
                      Run {skill.label}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
