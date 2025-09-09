function HeroSection() {
  
  return (
    <div className="text-white relative overflow-hidden">
      {/* Hero Principal */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Welcome to{' '}
            <span className="text-gradient">
              Nuxchain
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-4xl mx-auto leading-relaxed">
            The definitive Web3 platform for staking, NFTs, marketplace, airdrops and decentralized chat.
            Join the decentralized financial revolution.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-center animate-slide-up max-w-4xl mx-auto">
            <button className="card-interactive text-white px-6 py-4 font-bold text-sm hover:scale-105 flex flex-col items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Blog
            </button>
            <button className="card-interactive text-white px-6 py-4 font-bold text-sm hover:scale-105 flex flex-col items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              CTA Hub
            </button>
            <button className="card-interactive text-white px-6 py-4 font-bold text-sm hover:scale-105 flex flex-col items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Labs
            </button>
            <button className="card-interactive g-white/10 backdrop-blur-sm text-white px-6 py-4 rounded-xl font-bold text-sm hover:bg-white/20 hover:scale-105 transition-all duration-200 border border-white/20 flex flex-col items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Nuvim IA
            </button>
          </div>
        </div>
      </div>
      

    </div>
  )
}

export default HeroSection