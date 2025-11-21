import { motion } from 'framer-motion'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { Link } from 'react-router-dom'
import AnimatedAILogo from '../../ui/AnimatedAILogo'

function AISection() {
  const isMobile = useIsMobile()

  return (
    <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12' : 'py-20'}`}>
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 lg:grid-cols-2 gap-12'} items-center`}>
        {/* Imagen AI - Izquierda - Solo en desktop */}
        {!isMobile && (
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="relative rounded-full overflow-hidden flex items-center justify-center">
              {/* Replaced static image with AnimatedAILogo */}
              <AnimatedAILogo className="w-64 h-64" />
            </div>
          </motion.div>
        )}

        {/* Información - Derecha */}
        <motion.div
          className={`animate-slide-up ${isMobile ? 'text-center' : ''}`}
          initial={{ opacity: 0, x: isMobile ? 0 : 30, y: isMobile ? 20 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: isMobile ? 0.1 : 0.2 }}
        >
          <motion.h2
            className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold text-white mb-6 ${isMobile ? 'text-center' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Nux - <span className="text-gradient">AI</span>
          </motion.h2>

          <motion.p
            className={`${isMobile ? 'text-base mb-6' : 'text-xl mb-8'} text-white/80 leading-relaxed ${isMobile ? 'text-center' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isMobile
              ? 'AI platform with intelligent chat for queries, analysis and personalized assistance.'
              : 'AI platform that includes an intelligent chat for queries, analysis and personalized assistance. Get real-time insights, market analysis, and smart recommendations for your crypto journey.'
            }
          </motion.p>

          <motion.div
            className={`space-y-${isMobile ? '3' : '4'} ${isMobile ? 'flex flex-col items-center' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className={`flex items-center space-x-3 ${isMobile ? 'justify-center' : ''}`}>
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className={`text-white/80 ${isMobile ? 'text-sm' : ''}`}>Intelligent market analysis</span>
            </div>
            <div className={`flex items-center space-x-3 ${isMobile ? 'justify-center' : ''}`}>
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className={`text-white/80 ${isMobile ? 'text-sm' : ''}`}>24/7 personalized assistance</span>
            </div>
            <div className={`flex items-center space-x-3 ${isMobile ? 'justify-center' : ''}`}>
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className={`text-white/80 ${isMobile ? 'text-sm' : ''}`}>Smart trading recommendations</span>
            </div>
          </motion.div>

          <motion.div
            className={`${isMobile ? 'flex justify-center' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              to="/chat"
              className={`${isMobile ? 'mt-6 px-6 py-2 text-sm' : 'mt-8 px-8 py-3'} btn-primary inline-block text-center`}
            >
              Chat with Nuxbee
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default AISection;