/**
 * RewardsProjectionChart - Visual representation of projected rewards growth
 * Shows cumulative rewards over different time periods with an ascending area chart
 */

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface RewardsProjectionChartProps {
  hourly: string;
  daily: string;
  weekly: string;
  monthly: string;
  yearly: string;
  pending: string;
}

export function RewardsProjectionChart({
  hourly,
  daily,
  weekly,
  monthly,
  yearly,
  pending,
}: RewardsProjectionChartProps) {
  const chartData = useMemo(() => {
    // Parse values
    const values = [
      parseFloat(hourly) || 0,
      parseFloat(daily) || 0,
      parseFloat(weekly) || 0,
      parseFloat(monthly) || 0,
      parseFloat(yearly) || 0,
    ];

    // Calculate cumulative values
    const cumulative = values.reduce((acc: number[], val) => {
      acc.push((acc[acc.length - 1] || 0) + val);
      return acc;
    }, []);

    return {
      labels: ['1h', '1d', '1w', '1m', '1y'],
      datasets: [
        {
          label: 'Cumulative Rewards',
          data: cumulative,
          fill: true,
          tension: 0.4,
          backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
            const canvas = context.chart.ctx;
            const gradient = canvas.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(167, 139, 250, 0.4)');
            gradient.addColorStop(1, 'rgba(167, 139, 250, 0.01)');
            return gradient;
          },
          borderColor: '#a78bfa',
          borderWidth: 3,
          pointRadius: 6,
          pointBackgroundColor: '#a78bfa',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#c084fc',
          pointHoverBorderWidth: 3,
          segment: {
            borderColor: (ctx: { p0: { y: number }, p1: { y: number } }) => {
              return ctx.p1.y > ctx.p0.y ? '#a78bfa' : '#ef4444';
            },
          },
        },
      ],
    };
  }, [hourly, daily, weekly, monthly, yearly]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: '#ffffff',
            padding: 16,
            font: {
              size: 12,
              family: 'Inter, system-ui, sans-serif',
              weight: 500 as const,
            },
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            boxHeight: 8,
          },
        },
        title: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function (context: { parsed: { y: number } }) {
              const value = context.parsed.y || 0;
              return `${value.toFixed(6)} POL`;
            },
            afterLabel: function (context: { dataIndex: number }) {
              const idx = context.dataIndex;
              const values = [hourly, daily, weekly, monthly, yearly];
              if (idx >= 0 && idx < values.length) {
                return `Period: ${values[idx]}`;
              }
              return '';
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false,
          },
          ticks: {
            color: '#ffffff80',
            font: {
              size: 12,
              family: 'Inter, system-ui, sans-serif',
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false,
          },
          ticks: {
            color: '#ffffff80',
            font: {
              size: 12,
              family: 'Inter, system-ui, sans-serif',
            },
            callback: function (value: string | number) {
              return Number(value).toFixed(4) + ' POL';
            },
          },
        },
      },
    }),
    [hourly, daily, weekly, monthly, yearly]
  );

  const periods = [
    { key: '1h', label: 'Hourly', value: hourly },
    { key: '1d', label: 'Daily', value: daily },
    { key: '1w', label: 'Weekly', value: weekly },
    { key: '1m', label: 'Monthly', value: monthly },
    { key: '1y', label: 'Yearly', value: yearly },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Chart Container */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/5">
        <div style={{ height: '300px', position: 'relative' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {periods.map((period) => (
          <motion.div
            key={period.key}
            className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-lg p-3 border border-purple-500/20"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <p className="jersey-15-regular text-white/40 text-xs lg:text-sm font-medium">{period.label}</p>
            <p className="jersey-20-regular text-white font-semibold text-sm lg:text-base mt-1">{period.value}</p>
            <p className="jersey-20-regular text-white/30 text-xs lg:text-sm">POL</p>
          </motion.div>
        ))}
      </div>

      {/* Pending Rewards Status */}
      <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-3 rounded-lg border border-emerald-500/20">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <div>
          <p className="jersey-20-regular text-emerald-400 text-sm lg:text-base font-semibold">{pending} POL</p>
          <p className="jersey-20-regular text-emerald-300/70 text-xs lg:text-sm">Pending Rewards</p>
        </div>
      </div>

      {/* Info Footer */}
      <p className="jersey-20-regular text-white/40 text-xs lg:text-sm px-1">
        📈 Chart shows cumulative rewards growth. Hover over points for exact values.
      </p>
    </motion.div>
  );
}
