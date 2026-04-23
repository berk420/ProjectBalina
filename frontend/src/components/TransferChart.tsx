import React, { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { Transfer } from '../types';

interface Props {
  transfers: Transfer[];
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatAmount(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)     return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

const COLORS = [
  '#4fc3f7', '#29b6f6', '#0288d1', '#0097a7',
  '#00bcd4', '#26c6da', '#4dd0e1', '#80deea',
];

// ── Custom Tooltip ────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="ct-amount">{d.amountFormatted} USDT</div>
      <div className="ct-row"><span>Gönderen</span><span>{shortAddr(d.from)}</span></div>
      <div className="ct-row"><span>Alıcı</span><span>{shortAddr(d.to)}</span></div>
      {d.txHash && d.txHash !== 'unknown' && (
        <a
          className="ct-link"
          href={`https://etherscan.io/tx/${d.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Etherscan'da Gör →
        </a>
      )}
    </div>
  );
};

const BarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="ct-amount">{d.label}</div>
      <div className="ct-row"><span>Transfer Sayısı</span><span>{d.count}</span></div>
      <div className="ct-row"><span>Toplam</span><span>{formatAmount(d.total)}</span></div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────
const TransferChart: React.FC<Props> = ({ transfers }) => {
  const chartData = useMemo(() =>
    [...transfers]
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((t, i) => ({
        ...t,
        index: i + 1,
        amount: parseFloat(t.amount) / 1_000_000,
        time: new Date(t.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      })),
    [transfers]
  );

  const bucketData = useMemo(() => {
    const buckets: Record<string, { label: string; count: number; total: number }> = {
      '100K–500K':  { label: '100K–500K',  count: 0, total: 0 },
      '500K–1M':   { label: '500K–1M',   count: 0, total: 0 },
      '1M–5M':     { label: '1M–5M',     count: 0, total: 0 },
      '5M–10M':    { label: '5M–10M',    count: 0, total: 0 },
      '10M+':      { label: '10M+',      count: 0, total: 0 },
    };
    transfers.forEach(t => {
      const amt = parseFloat(t.amount) / 1_000_000;
      const key =
        amt < 500_000  ? '100K–500K'  :
        amt < 1_000_000 ? '500K–1M'   :
        amt < 5_000_000 ? '1M–5M'     :
        amt < 10_000_000 ? '5M–10M'   : '10M+';
      buckets[key].count++;
      buckets[key].total += amt;
    });
    return Object.values(buckets).filter(b => b.count > 0);
  }, [transfers]);

  const maxAmount = useMemo(() =>
    chartData.length ? Math.max(...chartData.map(d => d.amount)) : 0,
  [chartData]);

  const avgAmount = useMemo(() =>
    chartData.length ? chartData.reduce((s, d) => s + d.amount, 0) / chartData.length : 0,
  [chartData]);

  if (transfers.length === 0) {
    return (
      <div className="chart-section">
        <div className="chart-empty">
          <div className="chart-empty-icon">📊</div>
          <p>Grafik için veri bekleniyor…</p>
          <p className="chart-empty-sub">Ethereum mainnet dinleniyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-section">

      {/* ── Özet Kartlar ── */}
      <div className="chart-summary">
        <div className="cs-card">
          <span className="cs-label">En Büyük</span>
          <span className="cs-value">{formatAmount(maxAmount)}</span>
        </div>
        <div className="cs-card">
          <span className="cs-label">Ortalama</span>
          <span className="cs-value">{formatAmount(avgAmount)}</span>
        </div>
        <div className="cs-card">
          <span className="cs-label">Toplam Transfer</span>
          <span className="cs-value">{transfers.length}</span>
        </div>
        <div className="cs-card">
          <span className="cs-label">Toplam Hacim</span>
          <span className="cs-value">
            {formatAmount(chartData.reduce((s, d) => s + d.amount, 0))}
          </span>
        </div>
      </div>

      {/* ── Alan Grafiği — Zaman Serisi ── */}
      <div className="chart-block">
        <h3 className="chart-title">Transfer Miktarları (USDT)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="amtGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4fc3f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4fc3f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#4a5a7a', fontSize: 11 }}
              axisLine={{ stroke: '#1a2540' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatAmount}
              tick={{ fill: '#4a5a7a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avgAmount}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              label={{ value: 'ORT', fill: '#f59e0b', fontSize: 10, position: 'right' }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#4fc3f7"
              strokeWidth={2}
              fill="url(#amtGrad)"
              dot={{ fill: '#4fc3f7', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#fff', stroke: '#4fc3f7', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bar Grafiği — Miktar Dağılımı ── */}
      {bucketData.length > 0 && (
        <div className="chart-block">
          <h3 className="chart-title">Miktar Dağılımı</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bucketData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#4a5a7a', fontSize: 11 }}
                axisLine={{ stroke: '#1a2540' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#4a5a7a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                label={{ value: 'Adet', angle: -90, fill: '#4a5a7a', fontSize: 10, position: 'insideLeft' }}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(79,195,247,0.05)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {bucketData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
};

export default TransferChart;
