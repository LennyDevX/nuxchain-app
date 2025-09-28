import React from 'react';
import AIFeaturesSection from '../components/labs/AIFeaturesSection';
import InnovationShowcase from '../components/labs/InnovationShowcase';
import RoadmapTimeline from '../components/labs/RoadmapTimeline';
import GlobalBackground from '../ui/gradientBackground';

const LabsPage: React.FC = () => {
  return (
    <GlobalBackground>
      {/* Hero Section */}
      <section
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >


        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-purple-400 bg-purple-900/20 rounded-full border border-purple-500/30 mb-6">
              Nuxchain Innovation Hub
            </span>
          </div>
          
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient  mb-6"
          >
            AI Innovation and Technology
          </h1>
          
          <p 
            className="text-xl text-slate-300 max-w-3xl mx-auto mb-10"
          >
            Exploring the limits of blockchain with artificial intelligence. Discover how our technology helps optimize staking strategies, NFTs, and maximize your earnings.
          </p>
          
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl transition-all duration-300 transform hover:scale-105">
              Explore Projects
            </button>
            <button className="bg-slate-800/50 hover:bg-slate-700/50 text-white px-8 py-6 text-lg rounded-xl border border-slate-700">
              Meet Our AI
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-20">
          {/* AI Features Section */}
          <section>
            <AIFeaturesSection />
          </section>

          {/* Innovation Showcase */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Innovative Projects</h2>
              <p className="text-slate-400 max-w-3xl mx-auto">
                Discover the projects we're developing to revolutionize the blockchain ecosystem.
              </p>
            </div>
            <InnovationShowcase />
          </section>

          {/* Roadmap Timeline */}
          <section>
            <RoadmapTimeline />
          </section>

          {/* Stats Cards */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Impact of Our Technology</h2>
              <p className="text-slate-400 max-w-3xl mx-auto">
                We measure the real impact of our solutions on investors' performance.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-stats border-green-500/20">
                <div className="">
                  <h3 className="text-3xl font-bold text-green-400">+42%</h3>
                  <p className="text-slate-400">Profitability Optimization</p>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-green-500" style={{ width: '75%' }}></div>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">Users report higher earnings with AI</p>
                </div>
              </div>
              
              <div className="card-stats border-blue-500/20">
                <div className="">
                  <h3 className="text-3xl font-bold text-blue-400">500k+</h3>
                  <p className="text-slate-400">Investment Simulations</p>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '68%' }}></div>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">Scenarios analyzed monthly</p>
                </div>
              </div>
              
              <div className="card-stats border-purple-500/20">
                <div className="">
                  <h3 className="text-3xl font-bold text-purple-400">98%</h3>
                  <p className="text-slate-400">Recommendation Accuracy</p>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500" style={{ width: '98%' }}></div>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">User satisfaction rate</p>
                </div>
              </div>
              
              <div className="card-stats border-amber-500/20">
                <div className="">
                  <h3 className="text-3xl font-bold text-amber-400">12</h3>
                  <p className="text-slate-400">Predictive Models</p>
                </div>
                <div className="mt-4">
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: '85%' }}></div>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">Advanced analysis tools</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section>
            <div className="card-unified p-8 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Want to try our AI tools?</h2>
                <p className="text-slate-400 max-w-2xl mx-auto mb-8">
                  Join our community of innovators and discover how our technology can help you optimize your investment strategies.
                </p>
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl transition-all duration-300 transform hover:scale-105">
                  Get Started Now
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </GlobalBackground>
  );
};

export default LabsPage;