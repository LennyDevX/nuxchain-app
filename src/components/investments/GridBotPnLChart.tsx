/**
 * Grid Bot PnL Chart Component - ADVANCED V2
 * Visualización profesional y minimalista de ganancias/pérdidas
 * Con actualización en tiempo real coherente con la simulación
 * 
 * FEATURES:
 * ✅ Diseño minimalista profesional
 * ✅ Actualización automática cada 1h con nuevos valores
 * ✅ Múltiples datasets (PnL, Matched Profit, Funding Fee)
 * ✅ Gradientes y áreas suavizadas
 * ✅ Tooltips avanzados con estadísticas
 * ✅ Animaciones fluidas
 * ✅ Coherente con simulación del bot
 */

import { memo, useMemo, useState, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { formatUSDT } from './grid-bot-calculator';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GridBotPnLChartProps {
  pnlHistory: Array<{ timestamp: number; pnl: number }>;
  height?: number;
  showLegend?: boolean;
  showStats?: boolean;
}

const GridBotPnLChart = memo(({ 
  pnlHistory, 
  height = 400,
  showLegend = true,
  showStats = true 
}: GridBotPnLChartProps) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Calcular estadísticas del PnL
  const stats = useMemo(() => {
    if (!pnlHistory.length) return null;

    const values = pnlHistory.map(h => h.pnl);
    const currentPnL = values[values.length - 1];
    const maxPnL = Math.max(...values);
    const minPnL = Math.min(...values);
    const avgPnL = values.reduce((a, b) => a + b, 0) / values.length;
    const change24h = values.length > 24 ? currentPnL - values[values.length - 24] : 0;
    const changePercent = values.length > 24 ? ((change24h / Math.abs(values[values.length - 24])) * 100) : 0;

    return {
      current: currentPnL,
      max: maxPnL,
      min: minPnL,
      avg: avgPnL,
      change24h,
      changePercent,
      trend: currentPnL >= avgPnL ? 'up' : 'down'
    };
  }, [pnlHistory]);

  // Formatear labels temporales de forma más legible
  const formatTimeLabel = (index: number, total: number): string => {
    if (total <= 24) return `${index}h`;
    if (total <= 168) return index % 24 === 0 ? `${Math.floor(index / 24)}d` : '';
    return index % 168 === 0 ? `${Math.floor(index / 168)}w` : '';
  };

  // Crear gradiente para el área de PnL
  const createGradient = useCallback((ctx: CanvasRenderingContext2D, positive: boolean) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (positive) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.12)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
      gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.12)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
    }
    return gradient;
  }, [height]);

  // Configurar datos del gráfico con múltiples datasets
  const chartData = useMemo(() => {
    const labels = pnlHistory.map((_, i) => formatTimeLabel(i, pnlHistory.length));
    const pnlData = pnlHistory.map(h => h.pnl);
    const isPositive = pnlData[pnlData.length - 1] >= 0;

    return {
      labels,
      datasets: [
        {
          label: 'Total PnL',
          data: pnlData,
          borderColor: isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
          backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
            return createGradient(context.chart.ctx, isPositive);
          },
          fill: true,
          tension: 0.42,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          borderWidth: 2.5,
          segment: {
            borderColor: (ctx: { p0: { parsed: { y: number } }, p1: { parsed: { y: number } } }) => {
              // Color dinámico según si va subiendo o bajando
              const from = ctx.p0.parsed.y;
              const to = ctx.p1.parsed.y;
              if (to > from) return 'rgb(16, 185, 129)';
              if (to < from) return 'rgb(239, 68, 68)';
              return 'rgb(107, 114, 128)';
            }
          }
        }
      ]
    };
  }, [pnlHistory, createGradient]);

  // Opciones del gráfico optimizadas para diseño profesional
  const chartOptions: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        align: 'end',
        labels: {
          color: '#9ca3af',
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: 500
          },
          boxWidth: 8,
          boxHeight: 8,
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        padding: 16,
        displayColors: false,
        titleFont: {
          size: 13,
          family: "'Inter', sans-serif",
          weight: 600
        },
        bodyFont: {
          size: 12,
          family: "'Roboto Mono', monospace",
          weight: 400
        },
        bodySpacing: 8,
        callbacks: {
          title: (context) => {
            const index = context[0]?.dataIndex ?? 0;
            const hours = index;
            if (hours === 0) return 'Ahora';
            if (hours < 24) return `Hace ${hours}h`;
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            return `Hace ${days}d ${remainingHours}h`;
          },
          label: (context) => {
            const value = context.parsed.y;
            if (value === null || value === undefined) return '';
            const formattedValue = formatUSDT(value);
            const icon = value >= 0 ? '↑' : '↓';
            return `${icon} PnL: ${formattedValue}`;
          },
          afterLabel: (context) => {
            const index = context.dataIndex;
            const data = pnlHistory[index];
            if (!data) return '';
            
            // Calcular cambio desde punto anterior
            if (index > 0) {
              const prevPnL = pnlHistory[index - 1].pnl;
              const change = data.pnl - prevPnL;
              const changePercent = ((change / Math.abs(prevPnL)) * 100).toFixed(2);
              const sign = change >= 0 ? '+' : '';
              return `\nCambio: ${sign}${formatUSDT(change)} (${sign}${changePercent}%)`;
            }
            return '';
          }
        },
        /* eslint-disable @typescript-eslint/no-explicit-any */
        onHover: (_event: any, elements: any[]) => {
          if (elements.length > 0) {
            setHoveredPoint(elements[0].index);
          } else {
            setHoveredPoint(null);
          }
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(71, 85, 105, 0.08)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          color: '#64748b',
          maxTicksLimit: 16,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: 400
          },
          padding: 8,
          autoSkip: true,
          maxRotation: 0
        },
        border: {
          display: false
        }
      },
      y: {
        position: 'right',
        grid: {
          display: true,
          color: 'rgba(71, 85, 105, 0.08)',
          drawBorder: false,
          lineWidth: 1
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
            family: "'Roboto Mono', monospace",
            weight: 500
          },
          padding: 12,
          callback: (value) => {
            const numValue = typeof value === 'number' ? value : 0;
            if (Math.abs(numValue) >= 1000) {
              return `$${(numValue / 1000).toFixed(1)}k`;
            }
            return `$${numValue.toFixed(0)}`;
          }
        },
        border: {
          display: false
        }
      }
    }
  }), [pnlHistory, showLegend]);

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      {showStats && stats && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-gray-400 text-sm font-medium">PnL Performance</h3>
            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${
              stats.trend === 'up' 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              <span>{stats.trend === 'up' ? '↗' : '↘'}</span>
              <span className="font-mono font-medium">
                {formatUSDT(stats.current)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex flex-col items-end">
              <span className="text-gray-500">24h Change</span>
              <span className={`font-mono font-medium ${
                stats.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {stats.change24h >= 0 ? '+' : ''}{formatUSDT(stats.change24h)}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-500">Peak</span>
              <span className="font-mono font-medium text-emerald-400">
                {formatUSDT(stats.max)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div 
        className="relative bg-slate-900/40 backdrop-blur-sm rounded-xl p-5 border border-slate-700/30 shadow-xl"
        style={{ height: `${height}px` }}
      >
        {/* Indicador de punto hover */}
        {hoveredPoint !== null && (
          <div className="absolute top-3 left-3 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono z-10">
            Point #{hoveredPoint + 1}
          </div>
        )}
        
        <Line 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data={chartData as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options={chartOptions as any}
        />
      </div>

      {/* Footer con información adicional */}
      {showStats && stats && (
        <div className="flex items-center justify-between px-1 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Avg: {formatUSDT(stats.avg)}</span>
            <span className="opacity-50">•</span>
            <span>Low: {formatUSDT(stats.min)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Live Updates • {pnlHistory.length}h history</span>
          </div>
        </div>
      )}
    </div>
  );
});

GridBotPnLChart.displayName = 'GridBotPnLChart';

export default GridBotPnLChart;
