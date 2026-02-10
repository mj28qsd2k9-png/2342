
import React from 'react';
import { LayoutGrid, Table as TableIcon, MessageSquare, List } from 'lucide-react';
import { Table } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'tables' | 'chat';
  setActiveTab: (tab: 'dashboard' | 'tables' | 'chat') => void;
  tables: Table[];
  selectedTableId: string | null;
  setSelectedTableId: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, tables, selectedTableId, setSelectedTableId }) => {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20">
            F
          </div>
          <span className="text-xl font-bold tracking-tight">FinAI</span>
        </div>

        <nav className="space-y-2">
          <SidebarItem 
            icon={<LayoutGrid size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<MessageSquare size={20} />} 
            label="Assistente IA" 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')} 
          />
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Suas Tabelas</h3>
        <div className="space-y-1">
          {tables.length === 0 ? (
            <p className="text-sm text-slate-500 px-2 italic">Nenhuma tabela criada.</p>
          ) : (
            tables.map(table => (
              <button
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  selectedTableId === table.id && activeTab === 'tables'
                    ? 'bg-slate-800 text-emerald-400'
                    : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon size={16} />
                <span className="truncate">{table.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
            U
          </div>
          <div>
            <p className="text-xs font-medium">Usuário Pro</p>
            <p className="text-[10px] text-slate-500">Free Tier</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
      active 
        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default Sidebar;
