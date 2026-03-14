"use client";

import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Target, Crosshair, DollarSign, Activity, AlertCircle } from 'lucide-react';

// 定义交易记录的接口
export interface Trade {
  id: number;
  date: string;
  match: string;
  market: string;
  prediction: string;
  buyPrice: number;
  closingPrice: number;
  amount: number;
  result: 'Won' | 'Lost' | 'Pending';
  pnl: number;
}

// 模拟的 Polymarket CS2 交易数据
const mockTrades: Trade[] = [
  { id: 1, date: '2024-03-01', match: 'FaZe vs NAVI', market: 'Match Winner', prediction: 'NAVI', buyPrice: 0.45, closingPrice: 0.52, amount: 100, result: 'Won', pnl: 122.22 },
  { id: 2, date: '2024-03-02', match: 'Vitality vs G2', market: 'Match Winner', prediction: 'Vitality', buyPrice: 0.60, closingPrice: 0.58, amount: 200, result: 'Lost', pnl: -200 },
  { id: 3, date: '2024-03-05', match: 'Spirit vs MOUZ', market: 'Map 1 Winner', prediction: 'Spirit', buyPrice: 0.70, closingPrice: 0.75, amount: 500, result: 'Won', pnl: 214.28 },
  { id: 4, date: '2024-03-08', match: 'Cloud9 vs Heroic', market: 'Match Winner', prediction: 'Cloud9', buyPrice: 0.55, closingPrice: 0.48, amount: 150, result: 'Lost', pnl: -150 },
  { id: 5, date: '2024-03-10', match: 'Liquid vs FURIA', market: '2-0 Sweep', prediction: 'Liquid 2-0', buyPrice: 0.35, closingPrice: 0.42, amount: 80, result: 'Won', pnl: 148.57 },
  { id: 6, date: '2024-03-12', match: 'FaZe vs Vitality', market: 'Match Winner', prediction: 'FaZe', buyPrice: 0.50, closingPrice: 0.55, amount: 300, result: 'Won', pnl: 300 },
  { id: 7, date: '2024-03-15', match: 'NAVI vs G2', market: 'Total Maps > 2.5', prediction: 'Yes', buyPrice: 0.48, closingPrice: 0.50, amount: 150, result: 'Lost', pnl: -150 },
  { id: 8, date: '2024-03-18', match: 'Spirit vs FaZe', market: 'Match Winner', prediction: 'Spirit', buyPrice: 0.65, closingPrice: 0.68, amount: 400, result: 'Won', pnl: 215.38 },
];

// 计算累计盈亏用于折线图
let cumulative = 0;
const pnlData = mockTrades.map((trade: Trade) => {
  cumulative += trade.pnl;
  return {
    date: trade.date,
    pnl: trade.pnl,
    cumulativePnl: parseFloat(cumulative.toFixed(2))
  };
});

// CLV (Closing Line Value) 数据
const clvData = mockTrades.map((trade: Trade) => ({
  name: trade.match,
  buyPrice: trade.buyPrice * 100, // 转为百分比
  clvDifference: parseFloat(((trade.closingPrice - trade.buyPrice) * 100).toFixed(1)), // 差值，转为数字
  result: trade.result
}));

export default function App() {
  const [trades, setTrades] = useState<Trade[]>(mockTrades);

  // 核心指标计算
  const totalTrades = trades.length;
  const wonTrades = trades.filter((t: Trade) => t.result === 'Won').length;
  const winRate = totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(1) : '0.0';
  const totalVolume = trades.reduce((acc: number, curr: Trade) => acc + curr.amount, 0);
  const totalPnlNumber = trades.reduce((acc: number, curr: Trade) => acc + curr.pnl, 0);
  const totalPnl = totalPnlNumber.toFixed(2);
  const roi = totalVolume > 0 ? ((totalPnlNumber / totalVolume) * 100).toFixed(1) : '0.0';

  // 计算平均击败收盘线 (Beat CLV) 的比例
  const beatClvTrades = trades.filter((t: Trade) => t.closingPrice > t.buyPrice).length;
  const beatClvRate = totalTrades > 0 ? ((beatClvTrades / totalTrades) * 100).toFixed(1) : '0.0';

  return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Polymarket CS2 预测分析中心</h1>
              <p className="text-slate-400 mt-1">发掘你的认知优势 (Edge)，优化资金管理</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
              导入 Polymarket CSV
            </button>
          </div>

          {/* 核心指标卡片 (Key Metrics) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="总净利润 (Net PnL)"
                value={`$${totalPnl}`}
                icon={<DollarSign size={20} />}
                trend={totalPnlNumber >= 0 ? 'up' : 'down'}
            />
            <MetricCard
                title="预测胜率 (Win Rate)"
                value={`${winRate}%`}
                subtitle={`${wonTrades} 胜 / ${totalTrades} 总`}
                icon={<Target size={20} />}
                trend={parseFloat(winRate) >= 50 ? 'up' : 'down'}
            />
            <MetricCard
                title="投资回报率 (ROI)"
                value={`${roi}%`}
                subtitle={`总投入 $${totalVolume}`}
                icon={<Activity size={20} />}
                trend={parseFloat(roi) > 0 ? 'up' : 'down'}
            />
            <MetricCard
                title="击败收盘线 (CLV Beat)"
                value={`${beatClvRate}%`}
                subtitle="你的买入价低于开赛前价格的概率"
                icon={<Crosshair size={20} />}
                trend={parseFloat(beatClvRate) >= 50 ? 'up' : 'down'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* 左侧：资金曲线 */}
            <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
                <TrendingUp className="mr-2 text-blue-400" size={20}/> 资金曲线 (Cumulative PnL)
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pnlData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val: number) => `$${val}`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Line type="monotone" dataKey="cumulativePnl" name="累计盈亏" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 右侧：CLV 优势分析 */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
                <AlertCircle className="mr-2 text-purple-400" size={20}/> 收盘线价值优势 (CLV)
              </h2>
              <p className="text-sm text-slate-400 mb-4">长期正收益的核心：你买入时的概率必须低于比赛开始前的最终概率。</p>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clvData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false}/>
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} unit="%" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                    <Tooltip cursor={{fill: '#334155'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}/>
                    <Bar dataKey="clvDifference" name="概率优势(%)" radius={[0, 4, 4, 0]}>
                      {clvData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.clvDifference >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 底部：详细交易记录 */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">近期交易复盘 (Trade Log)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">日期</th>
                  <th className="px-6 py-4 font-medium">CS2 比赛</th>
                  <th className="px-6 py-4 font-medium">预测对象</th>
                  <th className="px-6 py-4 font-medium">买入概率 (价)</th>
                  <th className="px-6 py-4 font-medium">收盘概率 (价)</th>
                  <th className="px-6 py-4 font-medium">投入金额</th>
                  <th className="px-6 py-4 font-medium">结果</th>
                  <th className="px-6 py-4 font-medium text-right">盈亏 (PnL)</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                {trades.map((trade: Trade) => (
                    <tr key={trade.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4">{trade.date}</td>
                      <td className="px-6 py-4 font-medium text-white">{trade.match}</td>
                      <td className="px-6 py-4 text-blue-400">{trade.prediction}</td>
                      <td className="px-6 py-4">{Math.round(trade.buyPrice * 100)}¢</td>
                      <td className="px-6 py-4">
                      <span className={trade.closingPrice > trade.buyPrice ? 'text-emerald-400' : 'text-red-400'}>
                        {Math.round(trade.closingPrice * 100)}¢
                      </span>
                      </td>
                      <td className="px-6 py-4">${trade.amount}</td>
                      <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          trade.result === 'Won' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {trade.result}
                      </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.pnl > 0 ? '+' : ''}{trade.pnl}
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
  );
}

// 定义 MetricCard 的 Props 接口
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}

// 辅助组件：指标卡片
function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="text-slate-400 text-sm font-medium">{title}</div>
          <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {icon}
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white mb-1">{value}</div>
          {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </div>
      </div>
  );
}