import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface DataPoint {
  label: string;
  value: number;
}

interface MiniAreaChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-800 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
        <p className="font-medium">{payload[0].value.toLocaleString()}</p>
        <p className="text-surface-400 text-[10px]">{label}</p>
      </div>
    );
  }
  return null;
};

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
        <Tooltip content={<CustomTooltip />} />
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
