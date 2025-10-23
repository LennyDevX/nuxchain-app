import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { PLATFORM_BENEFITS } from '../../constants/benefits';

function BenefitsSection() {
  const isMobile = useIsMobile();
  // ✅ React 19 Best Practice: Use centralized constants
  const benefits = PLATFORM_BENEFITS;

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12' : 'py-20'}`}>
      <div className="text-center mb-12">
        <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-4`}>
          Why Choose <span className="text-gradient">Nuxchain</span>
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Built by developers, for developers. Focus on your product, we handle the infrastructure.
        </p>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
        {benefits.map((benefit, index) => (
          <div key={index} className="card-content text-center group">
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
              {benefit.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BenefitsSection;
