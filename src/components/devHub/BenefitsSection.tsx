import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { PLATFORM_BENEFITS } from '../nfts/benefits';

function BenefitsSection() {
  const isMobile = useIsMobile();
  // ✅ React 19 Best Practice: Use centralized constants
  const benefits = PLATFORM_BENEFITS;

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12' : 'py-20'}`}>
      <div className="text-center mb-12">
        <h2 className={`font-bold jersey-15-regular text-gradient ${isMobile ? 'text-4xl mb-3' : 'text-5xl mb-4'}`}>
          Why Choose Nuxchain
        </h2>
        <p className={`jersey-20-regular text-slate-400 max-w-2xl mx-auto ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          Built by developers, for developers. Focus on your product, we handle the infrastructure.
        </p>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
        {benefits.map((benefit, index) => (
          <div key={index} className="card-unified text-center group hover:scale-105 transition-transform">
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
              {benefit.icon}
            </div>
            <h3 className={`font-bold jersey-15-regular text-white mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{benefit.title}</h3>
            <p className="jersey-20-regular text-slate-400 text-base leading-relaxed">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BenefitsSection;
