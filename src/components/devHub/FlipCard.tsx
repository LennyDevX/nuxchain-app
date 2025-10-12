import { useState } from 'react';

interface FlipCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  color: string;
  backContent: {
    title: string;
    details: string[];
    techStack?: string[];
  };
}

function FlipCard({ icon, title, description, features, color, backContent }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative h-[400px] cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Side */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="card-unified group h-full flex flex-col">
            <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            <div className="relative flex-1 flex flex-col">
              <div className="text-purple-400 mb-4">{icon}</div>
              
              <h3 className="text-2xl font-bold mb-3">{title}</h3>
              <p className="text-white/70 mb-4 leading-relaxed flex-1">{description}</p>
              
              <ul className="space-y-2 mb-4">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-white/60">
                    <svg className="w-4 h-4 mr-2 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center text-purple-400 font-semibold text-sm">
                Click to learn more
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className="card-unified h-full flex flex-col bg-gradient-to-br from-purple-900/30 to-indigo-900/30">
            <div className="relative flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-purple-300">{backContent.title}</h3>
                <button className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3 mb-4 flex-1 overflow-y-auto">
                {backContent.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-purple-400 mr-2 mt-1">▸</span>
                    <p className="text-white/80 text-sm leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>

              {backContent.techStack && (
                <div className="mt-auto pt-4 border-t border-white/10">
                  <p className="text-xs text-white/50 mb-2">Tech Stack:</p>
                  <div className="flex flex-wrap gap-2">
                    {backContent.techStack.map((tech, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-600/20 border border-purple-400/30 rounded text-xs text-purple-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center text-purple-400 font-semibold text-sm mt-4">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Click to go back
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlipCard;
