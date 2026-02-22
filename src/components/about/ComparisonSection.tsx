import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

const comparisonData = [
  { feature: 'Fees', nux: '< $0.01', sea: '$5–20', rar: '$3–15' },
  { feature: 'Speed', nux: '~2 sec', sea: '~15 sec', rar: '~10 sec' },
  { feature: 'Royalties', nux: 'Up to 10%', sea: 'Up to 10%', rar: 'Up to 50%' },
  { feature: 'Staking', nux: '✓ 15% APY', sea: '✗', rar: '✓ Variable' },
  { feature: 'Airdrops', nux: '✓ Frequent', sea: '✗', rar: '✗' },
  { feature: 'NUX Rewards', nux: '✓ Monthly', sea: '✗', rar: '✗' },
  { feature: 'NFT Utility', nux: '✓ Custom', sea: '✗', rar: '✗' },
  { feature: 'AI Features', nux: '✓ Built-in', sea: '✗', rar: '✗' },
  { feature: 'Blockchain', nux: 'Polygon', sea: 'Ethereum', rar: 'Multi-chain' },
  { feature: 'Support', nux: '24/7', sea: 'Email', rar: 'Ticket' },
];

export function ComparisonSection() {
  const isMobile = useIsMobile();

  return (
    <section className="py-16 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <span className="jersey-20-regular text-blue-400 text-lg uppercase tracking-widest">⚖️ Competitive Edge</span>
          <h2 className={`jersey-15-regular text-gradient mt-2 ${isMobile ? 'text-4xl' : 'text-5xl'}`}>Nuxchain vs Marketplaces</h2>
          <p className={`jersey-20-regular text-white/60 max-w-2xl mx-auto mt-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Why Nuxchain is the smartest choice for creators and traders who value speed, low fees, and real rewards.
          </p>
        </motion.div>
        
        <motion.div {...fadeUp(0.1)} className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="jersey-20-regular text-white/50 text-left text-lg py-4 px-5">Feature</th>
                {[
                  { name: 'Nuxchain', highlight: true },
                  { name: 'OpenSea', highlight: false },
                  { name: 'Rarible', highlight: false },
                ].map((p, i) => (
                  <th key={i} className={`jersey-15-regular text-center py-4 px-5 ${isMobile ? 'text-xl' : 'text-2xl'} ${p.highlight ? 'text-purple-300' : 'text-white/60'}`}>
                    {p.highlight && <div className="text-xs jersey-20-regular bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full px-3 py-1 mb-1 inline-block">⭐ Best</div>}
                    <div>{p.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className={`jersey-20-regular text-white/50 py-3 px-5 ${isMobile ? 'text-base' : 'text-lg'}`}>{row.feature}</td>
                  <td className={`jersey-20-regular text-center py-3 px-5 font-bold ${isMobile ? 'text-base' : 'text-lg'} ${row.nux.includes('✓') ? 'text-green-400' : row.nux.includes('✗') ? 'text-red-400' : 'text-purple-300'}`}>{row.nux}</td>
                  <td className={`jersey-20-regular text-center py-3 px-5 ${isMobile ? 'text-base' : 'text-lg'} ${row.sea.includes('✓') ? 'text-green-500' : row.sea.includes('✗') ? 'text-red-500/60' : 'text-white/50'}`}>{row.sea}</td>
                  <td className={`jersey-20-regular text-center py-3 px-5 ${isMobile ? 'text-base' : 'text-lg'} ${row.rar.includes('✓') ? 'text-green-500' : row.rar.includes('✗') ? 'text-red-500/60' : 'text-white/50'}`}>{row.rar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
