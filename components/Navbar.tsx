
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Table as TableIcon, MessageSquare, ChevronDown, Plus, LogOut, Smartphone, Share, X, CheckCircle2 } from 'lucide-react';
import { Table } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'tables' | 'chat';
  setActiveTab: (tab: 'dashboard' | 'tables' | 'chat') => void;
  tables: Table[];
  selectedTableId: string | null;
  setSelectedTableId: (id: string) => void;
  userName: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, tables, selectedTableId, setSelectedTableId, userName, onLogout }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showTablesDropdown, setShowTablesDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 80) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [lastScrollY]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowInstallModal(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true); // Mostrar instruções genéricas se não houver prompt disponível
    }
    setShowProfileDropdown(false);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo e Nome */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
                F
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">FinAI</span>
            </div>

            {/* Navegação Central */}
            <div className="flex items-center gap-1 sm:gap-4">
              <NavBtn 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')} 
                icon={<LayoutGrid size={18} />} 
                label="Início" 
              />
              
              {/* Dropdown de Tabelas */}
              <div className="relative">
                <button 
                  onClick={() => setShowTablesDropdown(!showTablesDropdown)}
                  onBlur={() => setTimeout(() => setShowTablesDropdown(false), 200)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'tables' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <TableIcon size={18} />
                  <span className="hidden sm:inline">Minhas Tabelas</span>
                  <ChevronDown size={14} className={`transition-transform ${showTablesDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showTablesDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {tables.length === 0 ? (
                      <p className="px-4 py-2 text-xs text-slate-400 italic">Nenhuma tabela</p>
                    ) : (
                      tables.map(table => (
                        <button
                          key={table.id}
                          onClick={() => {
                            setSelectedTableId(table.id);
                            setActiveTab('tables');
                            setShowTablesDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors truncate ${
                            selectedTableId === table.id && activeTab === 'tables' ? 'text-emerald-600 font-bold' : 'text-slate-600'
                          }`}
                        >
                          {table.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <NavBtn 
                active={activeTab === 'chat'} 
                onClick={() => setActiveTab('chat')} 
                icon={<MessageSquare size={18} />} 
                label="Assistente IA" 
              />
            </div>

            {/* Ações e Perfil */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('chat')}
                className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-200 mr-2"
              >
                <Plus size={16} />
                Criar com IA
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  onBlur={() => setTimeout(() => setShowProfileDropdown(false), 200)}
                  className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-200 transition-all overflow-hidden"
                >
                  {userName.charAt(0).toUpperCase()}
                </button>

                {showProfileDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                      <p className="text-[10px] text-slate-500">Usuário FinAI</p>
                    </div>
                    
                    <button
                      onClick={handleInstallClick}
                      className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-2 font-medium"
                    >
                      <Smartphone size={16} />
                      Instalar no Celular
                    </button>

                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de Instalação PWA */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-500 p-8 text-center text-white relative">
              <button 
                onClick={() => setShowInstallModal(false)}
                className="absolute top-4 right-4 p-2 bg-emerald-600/50 hover:bg-emerald-600 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-2xl">F</div>
              </div>
              <h3 className="text-xl font-bold">Instalar FinAI</h3>
              <p className="text-emerald-100 text-sm mt-1">Acesse suas finanças direto da tela inicial</p>
            </div>
            
            <div className="p-8 space-y-6">
              {isIOS ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">No seu iPhone/iPad, siga os passos abaixo:</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400">
                        <Share size={18} />
                      </div>
                      <p className="text-xs text-slate-700">1. Toque no ícone de <b>Compartilhar</b> na barra do Safari.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400">
                        <Plus size={18} />
                      </div>
                      <p className="text-xs text-slate-700">2. Role para baixo e toque em <b>Adicionar à Tela de Início</b>.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <p className="text-sm text-slate-600 text-center">Use o botão abaixo para instalar instantaneamente no seu Android ou PC.</p>
                   <button 
                    onClick={handleInstallClick}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all"
                   >
                     Confirmar Instalação
                   </button>
                </div>
              )}

              <div className="pt-2">
                <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold uppercase tracking-widest justify-center">
                  <CheckCircle2 size={14} /> Aplicativo Verificado
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const NavBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      active ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default Navbar;
