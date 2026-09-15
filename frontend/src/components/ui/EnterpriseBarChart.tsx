import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartTooltip from './ChartTooltip';

interface DataPoint {
 name: string;
 value: number;
 fill?: string;
}

interface EnterpriseBarChartProps {
 data: DataPoint[];
 height?: number;
 color?: string;
 showGrid?: boolean;
 barRadius?: [number, number, number, number];
 xKey?: string;
 yKey?: string;
}

export default function EnterpriseBarChart({
 data, height = 280, color = '#6366f1', showGrid = true, barRadius = [6, 6, 0, 0], xKey = 'name', yKey = 'value'
}: EnterpriseBarChartProps) {
 return (
  <ResponsiveContainer width="100%" height={height}>
   <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
    {showGrid && (
     <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
    )}
    <XAxis
     dataKey={xKey}
     tick={{ fontSize: 12, fill: '#64748b' }}
     tickLine={false}
     axisLine={false}
    />
    <YAxis
     tick={{ fontSize: 12, fill: '#64748b' }}
     tickLine={false}
     axisLine={false}
     width={40}
    />
    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
    <Bar dataKey={yKey} radius={barRadius} animationDuration={800}>
     {data.map((entry, index) => (
      <Cell key={index} fill={entry.fill || color} />
     ))}
    </Bar>
   </BarChart>
  </ResponsiveContainer>
 );
}
