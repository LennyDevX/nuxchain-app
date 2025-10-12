import { useIsMobile } from '../../hooks/mobile/useIsMobile';

function BenefitsSection() {
  const isMobile = useIsMobile();

  const benefits = [
    {
      title: 'Rapid Deployment',
      description: 'Launch your Web3 project in hours, not months. Pre-built smart contracts ready to customize.',
      icon: '⚡'
    },
    {
      title: 'Enterprise Security',
      description: 'Audited smart contracts and battle-tested infrastructure for peace of mind.',
      icon: '🛡️'
    },
    {
      title: 'Full Control',
      description: 'Own your infrastructure. No vendor lock-in. Deploy on any EVM-compatible chain.',
      icon: '🎯'
    },
    {
      title: 'Scalable Architecture',
      description: 'Built to scale from MVP to millions of users without architectural changes.',
      icon: '📈'
    }
  ];

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
