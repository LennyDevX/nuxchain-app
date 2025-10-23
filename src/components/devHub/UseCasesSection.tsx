import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { USE_CASES } from '../../constants/benefits';

function UseCasesSection() {
  const isMobile = useIsMobile();
  // ✅ React 19 Best Practice: Use centralized constants
  const useCases = USE_CASES;

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12 pb-20' : 'py-20 pb-32'}`}>
      <div className="text-center mb-12">
        <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-4`}>
          Perfect For
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Whether you're building the next DeFi protocol or managing a community DAO, Nuxchain has you covered.
        </p>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'md:grid-cols-3 gap-8'}`}>
        {useCases.map((useCase, index) => (
          <div key={index} className="card-unified group hover:scale-105 transition-transform">
            <div className="text-5xl mb-4">{useCase.icon}</div>
            <h3 className="text-2xl font-bold mb-3 text-purple-400">{useCase.title}</h3>
            <p className="text-white/70 mb-4 leading-relaxed">{useCase.description}</p>
            
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/50 mb-2">Common use cases:</p>
              <div className="flex flex-wrap gap-2">
                {useCase.examples.map((example, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-600/10 border border-purple-400/20 rounded-full text-xs text-purple-300">
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
