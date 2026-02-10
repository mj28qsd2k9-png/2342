
import React, { useMemo } from 'react';
import { Table } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Wallet, PieChart as PieIcon } from 'lucide-react';

interface DashboardProps {
  tables: Table[];
}

const Dashboard: React.FC<DashboardProps> = ({ tables }) => {
  const currencyFormatter = useMemo(() => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }), []);

  const stats = useMemo(() => {
    let total = 0;
    const categoryMap: Record<string, number> = {};
    const recentExpenses: any[] = [];

    tables.forEach(table => {
      // Procurar por colunas de moeda ou número para somar
      const valueCols = table.columns.filter(c => c.type === 'currency' || c.type === 'number');
      
      table.rows.forEach(row => {
        // Se houver múltiplas colunas de valor, somamos a primeira encontrada com dados
        const val = valueCols.reduce((acc, col) => acc + (parseFloat(row[col.key]) || 0), 0);
        total += val;
        
        const cat = row.category || row.categoria || 'Outros';
        categoryMap[cat] = (categoryMap[cat] || 0) + val;
        
        recentExpenses.push({
          name: row.item || row.name || row.descricao || 'Despesa',
          value: val,
          date: row.date || row.data || table.createdAt
        });
      });
    });

    const pieData = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const barData = recentExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);

    return { total, pieData, barData };
  }, [tables]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Volume Financeiro Total" 
          value={currencyFormatter.format(stats.total)} 
          icon={<Wallet className="text-emerald-500" />} 
          trend="Total Consolidado"
        />
        <StatCard 
          title="Categorias Detectadas" 
          value={stats.pieData.length.toString()} 
          icon={<PieIcon className="text-blue-500" />} 
          trend="Equilibrado"
        />
        <StatCard 
          title="Movimentações" 
          value={tables.reduce((acc, t) => acc + t.rows.length, 0).toString()} 
          icon={<TrendingUp className="text-indigo-500" />} 
          trend="Ativo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Distribuição por Categoria</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => currencyFormatter.format(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {stats.pieData.slice(0, 6).map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{d.name}: <b>{currencyFormatter.format(d.value)}</b></span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Lançamentos Recentes</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: number) => currencyFormatter.format(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend?: string; trendType?: 'up' | 'down' }> = ({ title, value, icon, trend, trendType }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
      {trend && (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
          trendType === 'down' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{title}</p>
    <h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
  </div>
);

export default Dashboard;
