import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip';

interface DataPoint {
 label: string;
 value: number;
}

interface MiniAreaChartProps {
 data: DataPoint[];
 color?: string;
 height?: number;
}

export default function MiniAreaChart({ data, color = '#0070F3', height = 60 }: MiniAreaChartProps) {
 return (
  <ResponsiveContainer width="100%" height={height}>
   <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
    <defs>
     <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={0.3} />
      <stop offset="100%" stopColor={color} stopOpacity={0} />
     </linearGradient>
    </defs>
    <Tooltip content={<ChartTooltip compact />} />
    <Area
     type="monotone"
     dataKey="value"
     stroke={color}
     strokeWidth={2}
     fill={`url(#gradient-${color.replace('#', '')})`}
     dot={false}
     animationDuration={1000}
    />
   </AreaChart>
  </ResponsiveContainer>
 );
}
