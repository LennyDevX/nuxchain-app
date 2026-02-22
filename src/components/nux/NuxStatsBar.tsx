import { motion } from 'framer-motion';

const stats = [
  { label: 'Total Supply', value: '100,000,000', unit: 'NUX — Fixed Forever', icon: '🪙', color: 'text-amber-400' },
  { label: 'Presale Allocation', value: '15,000,000', unit: 'NUX (15%)', icon: '🚀', color: 'text-blue-400' },
  { label: 'Activity Rewards Pool', value: '20,000,000', unit: 'NUX (20%)', icon: '🎁', color: 'text-emerald-400' },
  { label: 'Ecosystem & Treasury', value: '20,000,000', unit: 'NUX (20%)', icon: '🔗', color: 'text-purple-400' },
];

export default function NuxStatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="card-stats p-4 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
        >
          <span className="text-3xl mb-2 block">{s.icon}</span>
          <p className={`jersey-15-regular text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="jersey-20-regular text-white/40 text-base mt-0.5">{s.unit}</p>
          <p className="jersey-20-regular text-white/60 text-lg mt-1">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
