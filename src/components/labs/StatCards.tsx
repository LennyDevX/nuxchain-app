import React from 'react';
import { ZapIcon, BarChart3Icon, CheckIcon, CalendarIcon, BrainIcon, DatabaseIcon, LockIcon, CpuIcon } from './CustomIcons';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  const bgColor = color.replace('border', 'bg').replace('\/20', '\/10');
  const textColor = `text-${color.split('-')[1]}-400`;
  
  return (
    <div className={`card-unified p-6 ${color}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl ${bgColor} ${textColor}`}>
          {icon}
        </div>
        {change && (
          <span className={`text-sm font-medium ${change.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold">{value}</h3>
    </div>
  );
};

const StatCards: React.FC = () => {
  const stats: StatCardProps[] = [
    {
      title: "AI Strategist Accuracy Rate",
      value: "87%",
      change: "+5% vs last month",
      icon: <BrainIcon className="w-6 h-6" />,
      color: "border-purple-500/20"
    },
    {
      title: "Active AI Users",
      value: "12.5k",
      change: "+1.8k vs last month",
      icon: <DatabaseIcon className="w-6 h-6" />,
      color: "border-blue-500/20"
    },
    {
      title: "Investment Optimization",
      value: "32%",
      change: "Average increase",
      icon: <CpuIcon className="w-6 h-6" />,
      color: "border-green-500/20"
    },
    {
      title: "Processing Speed",
      value: "<1s",
      icon: <ZapIcon className="w-6 h-6" />,
      color: "border-amber-500/20"
    },
    {
      title: "Data Security",
      value: "100%",
      icon: <LockIcon className="w-6 h-6" />,
      color: "border-emerald-500/20"
    },
    {
      title: "Active Algorithms",
      value: "24",
      icon: <BarChart3Icon className="w-6 h-6" />,
      color: "border-rose-500/20"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h2 
          className="text-3xl font-bold mb-4"
        >
          Impact of Our Artificial Intelligence
        </h2>
        <p 
          className="text-slate-400"
        >
          These numbers show the real impact of our AI tools on our users' experience and investment strategies.
        </p>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Additional stats section */}
      <div
        className="mt-12"
      >
        <h3 className="text-xl font-bold mb-6 text-center">Evolution of Our AI Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-content p-6">
            <h4 className="font-semibold text-lg mb-4">2022</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Lanzamiento de NuxAI Beta</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Primera versión de IA para Staking</span>
              </li>
            </ul>
          </div>
          <div className="card-content p-6">
            <h4 className="font-semibold text-lg mb-4">2023</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Integración con NFT Analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Lanzamiento del Asistente de IA</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Optimizador de Cartera</span>
              </li>
            </ul>
          </div>
          <div className="card-content p-6">
            <h4 className="font-semibold text-lg mb-4">2024 (Planificado)</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">NFT Analytics Dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">AI-Powered Trading Bot</span>
              </li>
              <li className="flex items-start gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Governance AI</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;