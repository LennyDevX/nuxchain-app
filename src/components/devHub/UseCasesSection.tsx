import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { USE_CASES } from '../nfts/benefits';

function UseCasesSection() {
  const isMobile = useIsMobile();
  // ✅ React 19 Best Practice: Use centralized constants
  const useCases = USE_CASES;

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12 pb-20' : 'py-20 pb-32'}`}>
      <div className="text-center mb-12">
        <h2 className={`font-bold jersey-15-regular text-gradient ${isMobile ? 'text-4xl mb-3' : 'text-5xl mb-4'}`}>
          Perfect For
        </h2>
        <p className={`jersey-20-regular text-slate-400 max-w-2xl mx-auto ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          Whether you're building the next DeFi protocol or managing a community DAO, Nuxchain has you covered.
        </p>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'md:grid-cols-3 gap-8'}`}>
        {useCases.map((useCase, index) => (
          <div key={index} className="card-unified group hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">{useCase.icon}</div>
            <h3 className={`font-bold jersey-15-regular text-purple-400 mb-3 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{useCase.title}</h3>
            <p className="jersey-20-regular text-slate-300 text-base mb-4 leading-relaxed">{useCase.description}</p>
            
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-slate-500 mb-2 jersey-20-regular">Common use cases:</p>
              <div className="flex flex-wrap gap-2">
                {useCase.examples.map((example, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-600/10 border border-purple-400/20 rounded-full text-xs text-purple-300 jersey-20-regular">
                    {example}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UseCasesSection;
