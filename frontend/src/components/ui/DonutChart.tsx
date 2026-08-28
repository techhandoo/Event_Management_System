import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

const COLORS = ['#0070F3', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-surface-200 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs font-semibold text-surface-800">{payload[0].name}</p>
        <p className="text-sm font-bold text-brand-600 tabular-nums">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

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
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xl font-bold text-surface-900 tabular-nums">{centerValue}</p>
            <p className="text-xs text-surface-500">{centerLabel}</p>
          </div>
        </div>
      )}
    </div>
  );
}
