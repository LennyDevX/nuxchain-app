import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { useNavigate } from 'react-router-dom'
import AnimatedAILogo from '../../ui/AnimatedAILogo' // add import

function AISection() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  
  return (
    <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12' : 'py-20'}`}>
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 lg:grid-cols-2 gap-12'} items-center`}>
        {/* Imagen AI - Izquierda - Solo en desktop */}
        {!isMobile && (
          <div className="flex justify-center">
            <div className="relative rounded-full overflow-hidden flex items-center justify-center">
              {/* Replaced static image with AnimatedAILogo */}
              <AnimatedAILogo className="w-54 h-54" />
            </div>
          </div>
        )}
        
        {/* Información - Derecha */}
        <div className={`animate-slide-up ${isMobile ? 'text-center' : ''}`}>
          <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold text-white mb-6 ${isMobile ? 'text-center' : ''}`}>
            Nux - <span className="text-gradient">AI</span>
          </h2>
          
          <p className={`${isMobile ? 'text-base mb-6' : 'text-xl mb-8'} text-white/80 leading-relaxed ${isMobile ? 'text-center' : ''}`}>
            {isMobile 
              ? 'AI platform with intelligent chat for queries, analysis and personalized assistance.'
              : 'AI platform that includes an intelligent chat for queries, analysis and personalized assistance. Get real-time insights, market analysis, and smart recommendations for your crypto journey.'
            }
          </p>
          
          <div className={`space-y-${isMobile ? '3' : '4'} ${isMobile ? 'flex flex-col items-center' : ''}`}>
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
          </div>
          
          <div className={`${isMobile ? 'flex justify-center' : ''}`}>
            <button 
              onClick={() => navigate('/chat')}
              className={`${isMobile ? 'mt-6 px-6 py-2 text-sm' : 'mt-8 px-8 py-3'} btn-primary`}
            >
              Chat with Nuxbee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AISection;