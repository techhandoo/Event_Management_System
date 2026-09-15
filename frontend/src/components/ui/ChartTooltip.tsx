/**
 * Shared recharts tooltip — was copy-pasted in DonutChart, EnterpriseBarChart
 * and MiniAreaChart (with a fourth divergent style in Mini). One component,
 * one chart UX. `compact` renders the small dark variant MiniAreaChart used.
 */
interface ChartTooltipProps {
 active?: boolean;
 payload?: Array<{ name?: string; value?: number }>;
 label?: string | number;
 compact?: boolean;
}

export default function ChartTooltip({ active, payload, label, compact = false }: ChartTooltipProps) {
 if (!active || !payload || payload.length === 0) return null;

 if (compact) {
  return (
   <div className="bg-surface-800 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
    <p className="font-medium">{payload[0].value?.toLocaleString()}</p>
    {label !== undefined && <p className="text-surface-400 text-[10px]">{label}</p>}
   </div>
  );
 }

 return (
  <div className="surface-card px-3 py-2 shadow-dropdown">
   <p className="text-xs font-semibold text-surface-800">{label ?? payload[0].name}</p>
   <p className="text-sm font-bold text-brand-400 tabular-nums">{payload[0].value?.toLocaleString()}</p>
  </div>
 );
}
