import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip';

interface DataPoint {
 name: string;
 value: number;
 color?: string;
}

interface DonutChartProps {
 data: DataPoint[];
 height?: number;
 innerRadius?: number;
 outerRadius?: number;
 centerLabel?: string;
 centerValue?: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#f87171', '#34d399', '#fbbf24'];

export default function DonutChart({
 data, height = 200, innerRadius = 60, outerRadius = 90, centerLabel, centerValue
}: DonutChartProps) {
 return (
  <div className="relative">
   <ResponsiveContainer width="100%" height={height}>
    <PieChart>
     <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      dataKey="value"
      strokeWidth={0}
      animationDuration={800}
     >
      {data.map((entry, index) => (
       <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
      ))}
     </Pie>
     <Tooltip content={<ChartTooltip />} />
    </PieChart>
   </ResponsiveContainer>
   {centerLabel && (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
     <div className="text-center">
      <p className="text-xl font-bold text-surface-900 tabular-nums">{centerValue}</p>
      <p className="text-xs text-surface-400">{centerLabel}</p>
     </div>
    </div>
   )}
  </div>
 );
}
