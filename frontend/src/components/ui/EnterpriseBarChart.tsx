import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-surface-200 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs font-semibold text-surface-800">{label}</p>
        <p className="text-sm font-bold text-brand-600 tabular-nums">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function EnterpriseBarChart({
  data, height = 280, color = '#0070F3', showGrid = true, barRadius = [6, 6, 0, 0], xKey = 'name', yKey = 'value'
}: EnterpriseBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        )}
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,112,243,0.04)' }} />
        <Bar dataKey={yKey} radius={barRadius} animationDuration={800}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.fill || color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
