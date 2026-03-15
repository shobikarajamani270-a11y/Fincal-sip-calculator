import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatShort } from '../lib/finance';

function fmtAxis(value) {
  if (value >= 1e7) return `${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `${(value / 1e5).toFixed(0)}L`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  return value;
}

export default function GrowthChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#224c87" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#224c87" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#1a7a4a" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#1a7a4a" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fill: '#666688', fontSize: 11, fontFamily: 'Montserrat, Arial' }}
          axisLine={false} tickLine={false}
          tickFormatter={(v) => `Yr ${v}`}
        />
        <YAxis
          tick={{ fill: '#666688', fontSize: 11, fontFamily: 'Montserrat, Arial' }}
          axisLine={false} tickLine={false}
          tickFormatter={fmtAxis} width={52}
        />
        <Tooltip
          contentStyle={{
            background: '#ffffff',
            border: '1px solid #d0daea',
            borderRadius: 8,
            fontFamily: 'Montserrat, Arial',
            fontSize: 12,
          }}
          labelStyle={{ color: '#224c87', fontWeight: 700 }}
          labelFormatter={(v) => `Year ${v}`}
          formatter={(value, name) => [formatShort(value), name]}
        />
        <Area
          type="monotone" dataKey="corpus" name="Corpus"
          stroke="#224c87" strokeWidth={2.5}
          fill="url(#corpusGrad)" dot={false}
          activeDot={{ r: 5, fill: '#224c87', stroke: '#fff', strokeWidth: 2 }}
        />
        <Area
          type="monotone" dataKey="invested" name="Invested"
          stroke="#1a7a4a" strokeWidth={2}
          fill="url(#investedGrad)" dot={false}
          activeDot={{ r: 4, fill: '#1a7a4a', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}