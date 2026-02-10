
import React, { useState, useEffect } from 'react';
import { Table, Row } from './types';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TableEditor from './components/TableEditor';
import AIChat from './components/AIChat';
import Auth from './components/Auth';
import SetupGuide from './components/SetupGuide';
import { authService, User as UserType } from './services/authService';
import { tableService } from './services/tableService';
import { Table as TableIcon, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tables' | 'chat'>('dashboard');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [needsDatabaseSetup, setNeedsDatabaseSetup] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await loadUserTables(currentUser.id);
        }
      } catch (err: any) {
        if (err.message === 'DATABASE_NOT_READY') {
          setNeedsDatabaseSetup(true);
        } else {
          console.error("Erro na inicialização:", err);
        }
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  const loadUserTables = async (userId: string) => {
    setIsLoadingTables(true);
    setNeedsDatabaseSetup(false);
    try {
      const remoteTables = await tableService.getTables(userId);
      setTables(remoteTables);
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_READY') {
        setNeedsDatabaseSetup(true);
      } else {
        console.error("Erro ao carregar tabelas:", err);
      }
    } finally {
      setIsLoadingTables(false);
    }
  };

  const handleLogin = (loggedUser: UserType) => {
    setUser(loggedUser);
    loadUserTables(loggedUser.id);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setTables([]);
    setSelectedTableId(null);
  };

  const addTable = async (newTable: Table) => {
    if (!user) return;
    try {
      const savedTable = await tableService.saveTable(user.id, newTable);
      setTables(prev => [savedTable, ...prev]);
      setSelectedTableId(savedTable.id);
      return savedTable;
    } catch (err: any) {
      if (err.message === 'DATABASE_NOT_READY') {
        setNeedsDatabaseSetup(true);
      } else {
        console.error("Erro ao salvar nova tabela no perfil:", err);
      }
      throw err;
    }
  };

  const updateTable = async (updatedTable: Table) => {
    if (!user) return;
    try {
      const savedTable = await tableService.saveTable(user.id, updatedTable);
      setTables(prev => prev.map(t => t.id === savedTable.id ? savedTable : t));
    } catch (err) {
      console.error("Erro ao atualizar tabela:", err);
    }
  };

  const deleteTable = async (id: string) => {
    if (!user) return;
    try {
      setTables(prev => prev.filter(t => t.id !== id));
      if (selectedTableId === id) setSelectedTableId(null);
      await tableService.deleteTable(id);
    } catch (err) {
      console.error("Erro ao deletar tabela:", err);
    }
  };

  const handleDuplicateTable = async (sourceTable: Table, isProjection: boolean, multiplier: number = 1) => {
    if (!user) return;
    const newId = crypto.randomUUID();
    const newName = isProjection 
      ? `${sourceTable.name} (Projeção)` 
      : `${sourceTable.name} (Cópia)`;
    
    const newRows = sourceTable.rows.map(row => {
      const newRow: Row = { ...row, id: crypto.randomUUID() };
      if (isProjection) {
        sourceTable.columns.forEach(col => {
          if ((col.type === 'number' || col.type === 'currency') && typeof row[col.key] === 'number') {
            newRow[col.key] = parseFloat((row[col.key] * multiplier).toFixed(2));
          }
        });
      }
      return newRow;
    });

    const newTable: Table = {
      ...sourceTable,
      id: newId,
      name: newName,
      rows: newRows,
      createdAt: new Date().toISOString(),
    };

    try {
      const savedTable = await tableService.saveTable(user.id, newTable);
      setTables(prev => [savedTable, ...prev]);
      setSelectedTableId(savedTable.id);
    } catch (err) {
      console.error("Erro ao duplicar tabela:", err);
    }
  };

  const handleRetrySetup = () => {
    if (user) loadUserTables(user.id);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (needsDatabaseSetup) {
    return <SetupGuide onRetry={handleRetrySetup} />;
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tables={tables}
        selectedTableId={selectedTableId}
        setSelectedTableId={setSelectedTableId}
        userName={user.name}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isLoadingTables && (
            <div className="flex items-center gap-2 text-slate-400 mb-4 text-sm bg-white/50 w-fit px-3 py-1 rounded-full border border-slate-100">
              <Loader2 size={14} className="animate-spin text-emerald-500" />
              Sincronizando perfil...
            </div>
          )}

          {activeTab === 'dashboard' && <Dashboard tables={tables} />}
          
          {activeTab === 'tables' && selectedTableId && (
            <TableEditor 
              table={tables.find(t => t.id === selectedTableId)!} 
              allTables={tables}
              onUpdate={updateTable}
              onDelete={deleteTable}
              onDuplicate={handleDuplicateTable}
              onSelectTable={setSelectedTableId}
            />
          )}

          {activeTab === 'tables' && !selectedTableId && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
               <div className="bg-white p-12 rounded-full mb-6 shadow-sm border border-slate-100">
                 <TableIcon size={64} className="opacity-20 text-emerald-500" />
               </div>
               <p className="text-xl font-bold text-slate-800">Seu Perfil está Vazio</p>
               <p className="text-sm text-slate-500 mt-2 text-center max-w-xs">Todas as tabelas que você criar serão salvas automaticamente aqui e vinculadas à sua conta.</p>
               <button 
                onClick={() => setActiveTab('chat')}
                className="mt-8 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
               >
                 Criar com Assistente IA
               </button>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="h-[calc(100vh-12rem)] min-h-[600px]">
              <AIChat tables={tables} onTableCreated={addTable} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
