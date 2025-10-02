import React from 'react';
import { BrainIcon, BarChart3Icon, LockIcon, LineChartIcon, MaximizeIcon, ZapIcon } from './CustomIcons';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => {
  return (
    <div className="h-full">
      <div className="card-unified h-full p-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-4">
          <div className="text-purple-400">{icon}</div>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  );
};

const AIFeaturesSection: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          How AI Transforms Your Nuxchain Experience
        </h2>
        <p className="text-slate-400">
          Our artificial intelligence-powered tools help you make more informed decisions, optimize your strategies, and maximize your earnings in the blockchain ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Feature
          icon={<BrainIcon className="w-6 h-6" />}
          title="AI Investment Assistant"
          description="Analyzes thousands of data points and recommends the most profitable staking strategies for your goals."
        />
        
        <Feature
          icon={<BarChart3Icon className="w-6 h-6" />}
          title="Market Prediction"
          description="Machine learning models that anticipate trends and alert you about important changes."
        />
        
        <Feature
          icon={<LockIcon className="w-6 h-6" />}
          title="Lockup Optimization"
          description="Calculates the best locking period to maximize your APY according to your risk profile."
        />
        
        <Feature
          icon={<LineChartIcon className="w-6 h-6" />}
          title="Profitability Simulator"
          description="Compare different investment scenarios and see how your earnings will evolve."
        />
        
        <Feature
          icon={<MaximizeIcon className="w-6 h-6" />}
          title="Diversification Strategies"
          description="Helps you optimally distribute your portfolio between NFTs, staking, and other investments."
        />
        
        <Feature
          icon={<ZapIcon className="w-6 h-6" />}
          title="Smart Automation"
          description="Automatically executes actions based on market signals and your preferences."
        />
      </div>
    </div>
  );
};

export default AIFeaturesSection;