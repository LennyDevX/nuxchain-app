function AISection() {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Imagen AI - Izquierda */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-6 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 animate-pulse"></div>
            <div className="relative">
              <img 
                 src="/NuvosBotAI2.webp" 
                 alt="Nuvos Bot AI" 
                 className="w-96 h-96 object-contain mx-auto animate-float"
                 style={{ animationDuration: '8s', animationDelay: '1s' }}
               />
              {/* Partículas alrededor de la imagen */}
              <div className="absolute top-10 left-10 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
               <div className="absolute top-20 right-16 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
               <div className="absolute bottom-16 left-20 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
               <div className="absolute bottom-10 right-10 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
        
        {/* Información - Derecha */}
        <div className="animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Nux - <span className="text-gradient">AI</span>
          </h2>
          
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            AI platform that includes an intelligent chat for queries, analysis and personalized assistance. 
            Get real-time insights, market analysis, and smart recommendations for your crypto journey.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-white/80">Intelligent market analysis</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-white/80">24/7 personalized assistance</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-white/80">Smart trading recommendations</span>
            </div>
          </div>
          
          <button className="mt-8 bg-gradient-to-r from-cyan-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform duration-200">
            Chat with AI
          </button>
        </div>
      </div>
    </div>
  );
}

export default AISection;