import { motion } from 'framer-motion';

const steps = [
  { icon: '🔗', title: 'Connect Wallets', desc: 'Connect your Polygon (MetaMask) and Solana wallets on the Portal Bridge interface.' },
  { icon: '⛓️', title: 'Select Route', desc: 'Choose Polygon → Solana or Solana → Polygon. Select the token and amount to transfer.' },
  { icon: '✅', title: 'Confirm Transfer', desc: 'Approve the transaction on-chain. Wormhole Guardians relay the message cross-chain automatically.' },
];

export default function NuxBridge() {
  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="jersey-15-regular text-4xl lg:text-7xl text-gradient mb-3">Cross-Chain Bridge</h2>
        <p className="jersey-20-regular text-white/50 text-lg lg:text-2xl max-w-2xl mx-auto">
          Move tokens natively between Polygon and Solana using Wormhole — the most secure cross-chain messaging protocol.
        </p>
      </motion.div>

      <motion.div
        className="card-unified p-6 lg:p-8"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Status notice */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-8">
          <span className="text-2xl mt-0.5">🔧</span>
          <div>
            <p className="jersey-15-regular text-amber-300 text-2xl mb-1">Native Integration Coming Soon</p>
            <p className="jersey-20-regular text-white/50 text-xl leading-relaxed">
              The Wormhole Connect widget requires dependencies that are not yet compatible with our current tech stack (React 19). 
              We are actively exploring alternatives to bring the bridge natively into NuxChain. 
              In the meantime, you can use the official Portal Bridge below — same protocol, same security.
            </p>
          </div>
        </div>

        {/* How it works */}
        <p className="jersey-15-regular text-white/70 text-2xl mb-5">How to bridge via Portal</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              className="p-4 rounded-2xl bg-white/5 border border-white/10"
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{s.icon}</span>
                <span className="jersey-20-regular text-white/40 text-xl">Step {i + 1}</span>
              </div>
              <p className="jersey-15-regular text-white text-xl mb-1">{s.title}</p>
              <p className="jersey-20-regular text-white/50 text-lg leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Supported routes */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { icon: '⛓️', label: 'Polygon ↔ Solana', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { icon: '🪙', label: 'USDC · MATIC · SOL · WETH', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { icon: '🔒', label: 'Secured by Wormhole Guardians', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
            { icon: '⚡', label: 'Native Token Transfers', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          ].map((b) => (
            <div key={b.label} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${b.bg}`}>
              <span className="text-2xl">{b.icon}</span>
              <span className={`jersey-20-regular text-lg ${b.color}`}>{b.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.a
          href="https://portalbridge.com/#/transfer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span className="text-2xl">🌉</span>
          <span className="jersey-15-regular text-white text-xl">Open Portal Bridge</span>
          <span className="jersey-20-regular text-white/60 text-base">→</span>
        </motion.a>
      </motion.div>

      <motion.p
        className="jersey-20-regular text-white/30 text-sm text-center mt-4"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ delay: 0.3 }}
      >
        Bridge powered by{' '}
        <a href="https://wormhole.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
          Wormhole
        </a>
        . Always verify contract addresses before bridging. NuxChain is not responsible for third-party bridge operations.
      </motion.p>
    </section>
  );
}
