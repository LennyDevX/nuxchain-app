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
      className="relative h-[460px] cursor-pointer"
      style={{ perspective: '1200px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className={`h-full rounded-2xl border border-white/8 bg-black/30 backdrop-blur-sm overflow-hidden flex flex-col group hover:border-purple-500/30 transition-colors duration-300`}>
            {/* Accent bar top */}
            <div className={`h-0.5 w-full bg-gradient-to-r ${color.replace('/20', '')}`} />

            <div className="flex flex-col flex-1 p-7">
              {/* Icon + title row */}
              <div className="flex items-start gap-4 mb-5">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${color} border border-white/10 flex items-center justify-center text-purple-300`}>
                  {icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold jersey-15-regular text-white leading-tight">{title}</h3>
                  <p className="text-xs text-slate-500 jersey-20-regular mt-0.5">Click to explore →</p>
                </div>
              </div>

              {/* Description */}
              <p className="jersey-20-regular text-slate-300 text-base leading-relaxed mb-6">{description}</p>

              {/* Features */}
              <ul className="space-y-2.5 mt-auto">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span className="jersey-20-regular text-slate-400 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="h-full rounded-2xl border border-purple-500/25 bg-black/40 backdrop-blur-sm overflow-hidden flex flex-col">
            {/* Accent bar top */}
            <div className={`h-0.5 w-full bg-gradient-to-r ${color.replace('/20', '')}`} />

            <div className="flex flex-col flex-1 p-7 min-h-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-5 flex-shrink-0">
                <div>
                  <h3 className="text-lg font-bold jersey-15-regular text-white">{backContent.title}</h3>
                  <p className="text-xs text-slate-500 jersey-20-regular mt-0.5">Click anywhere to go back</p>
                </div>
                <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-slate-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>

              {/* Details — scrollable */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 min-h-0">
                {backContent.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400 mt-2" />
                    <p className="jersey-20-regular text-slate-300 text-sm leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>

              {/* Tech stack — always visible at bottom */}
              {backContent.techStack && (
                <div className="flex-shrink-0 pt-4 border-t border-white/8">
                  <p className="text-xs text-slate-600 mb-2.5 jersey-20-regular uppercase tracking-wider">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {backContent.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-300 jersey-20-regular"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlipCard;
