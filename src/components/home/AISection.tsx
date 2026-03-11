import { motion } from 'framer-motion'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { Link } from 'react-router-dom'
import AnimatedAILogo from '../../ui/AnimatedAILogo'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
})

const aiFeatures = [
  { icon: '🧠', title: 'Market Analysis', desc: 'Real-time insights on NFT prices, staking yields, and on-chain trends.' },
  { icon: '💬', title: '24/7 Chat Assistant', desc: 'Ask anything about Nuxchain — Nuxbee AI answers instantly.' },
  { icon: '📊', title: 'Smart Recommendations', desc: 'Personalized suggestions based on your activity and portfolio.' },
  { icon: '⚡', title: 'Powered by Gemini', desc: 'Built on Google Gemini for state-of-the-art AI responses.' },
]

function AISection() {
  const isMobile = useIsMobile()

  return (
    <section className={`relative z-10 border-t border-white/5 ${isMobile ? 'py-14' : 'py-24'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-10' : 'lg:grid-cols-2 gap-16'} items-center`}>

          {/* Left — AI Logo visual */}
          <motion.div {...fadeUp()} className={`flex flex-col items-center gap-6 ${isMobile ? 'order-2' : 'order-1'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl scale-150" />
              <AnimatedAILogo className="relative w-48 h-48 md:w-64 md:h-64" />
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {[
                { label: 'Response Time', value: '< 1s' },
                { label: 'Languages', value: '50+' },
                { label: 'Uptime', value: '99.9%' },
                { label: 'Model', value: 'Gemini' },
              ].map((stat, i) => (
                <div key={i} className="card-unified p-3 text-center">
                  <div className={`jersey-15-regular text-cyan-300 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>{stat.value}</div>
                  <div className={`jersey-20-regular text-white/50 ${isMobile ? 'text-lg' : 'text-xl'}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Content */}
          <div className={isMobile ? 'order-1' : 'order-2'}>
            <motion.div {...fadeUp(0.05)}>
              <span className="jersey-20-regular text-cyan-400 text-2xl uppercase tracking-widest">AI-Powered</span>
              <h2 className={`jersey-15-regular text-white mt-2 mb-4 ${isMobile ? 'text-5xl' : 'text-6xl lg:text-7xl'}`}>
                Nux <span className="text-gradient">AI</span>
              </h2>
              <p className={`jersey-20-regular text-white/60 mb-8 leading-relaxed ${isMobile ? 'text-2xl' : 'text-2xl'}`}>
                Nuxchain integrates AI to assist creators, analyze on-chain activity, and power the NUX Rewards Engine.
                Your intelligent companion for every step of your Web3 journey.
              </p>
            </motion.div>

            <div className={`space-y-4 mb-8 ${isMobile ? 'grid grid-cols-2 gap-4 space-y-0' : ''}`}>
              {aiFeatures.map((f, i) => (
                <motion.div key={i} {...fadeUp(0.1 + i * 0.08)} className={`card-unified p-4 ${isMobile ? 'flex flex-col items-center text-center gap-3' : 'flex gap-3 items-start'}`}>
                  <span className={`${isMobile ? 'text-5xl' : 'text-4xl'} flex-shrink-0`}>{f.icon}</span>
                  <div className={isMobile ? 'w-full' : ''}>
                    <h3 className={`jersey-15-regular text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>{f.title}</h3>
                    <p className={`jersey-20-regular text-white/55 ${isMobile ? 'text-lg' : 'text-xl'}`}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div {...fadeUp(0.4)} className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
              <Link to="/chat" className="btn-primary jersey-20-regular text-2xl px-8 py-4 rounded-xl inline-flex items-center gap-2 justify-center">
                🤖 Chat with Nuxbee
              </Link>
              <Link to="/about" className="jersey-20-regular text-2xl px-8 py-4 rounded-xl inline-flex items-center gap-2 justify-center border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all text-cyan-300">
                Learn More →
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AISection;
