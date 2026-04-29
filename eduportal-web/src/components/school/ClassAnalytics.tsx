"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

const data = [
  { subject: 'Algebra', score: 85, color: '#8B5CF6' },
  { subject: 'Geometry', score: 62, color: '#F472B6' },
  { subject: 'Statistics', score: 45, color: '#FB7185' },
  { subject: 'Trig', score: 78, color: '#34D399' },
  { subject: 'Calculus', score: 92, color: '#60A5FA' },
];

export default function ClassAnalytics() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-secondary/20 p-2 rounded-lg">
            <Brain className="w-5 h-5 text-secondary" />
          </div>
          <h2 className="text-xl font-bold">AI Learning Analytics</h2>
        </div>
        <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] text-muted flex items-center gap-2 border border-white/10 uppercase tracking-widest">
          <TrendingUp className="w-3 h-3 text-success" /> Updated 2m ago
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-6 min-h-[300px]">
          <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
            Average Subject Proficiency <span className="text-[10px] font-normal text-muted">(Based on AI Quizzes)</span>
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="subject" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={40}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel p-5 border-l-4 border-danger bg-danger/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <h4 className="text-xs font-bold text-danger uppercase">Critical Gap Detected</h4>
            </div>
            <p className="text-xs text-white leading-relaxed">
              65% of the class struggled with <span className="font-bold underline">Standard Deviation</span> in today's quiz. 
            </p>
            <button className="mt-3 text-[10px] font-bold text-danger hover:underline">Push Remedial PDF to Hubs →</button>
          </div>

          <div className="glass-panel p-5 border-l-4 border-success bg-success/5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <h4 className="text-xs font-bold text-success uppercase">Concept Mastered</h4>
            </div>
            <p className="text-xs text-white leading-relaxed">
              92% proficiency in <span className="font-bold">Calculus Fundamentals</span>. AI recommends moving to Derivative Applications.
            </p>
            <button className="mt-3 text-[10px] font-bold text-success hover:underline">Generate Harder Quiz →</button>
          </div>

          <div className="glass-panel p-5 flex flex-col items-center justify-center text-center gap-2">
            <p className="text-[10px] text-muted uppercase">Overall Class Mood</p>
            <div className="text-3xl">🚀</div>
            <p className="text-xs font-bold">Highly Engaged</p>
          </div>
        </div>
      </div>
    </div>
  );
}
