
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Bot } from 'lucide-react';
import { authService, User as UserType } from '../services/authService';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const user = await authService.login(formData.email, formData.password);
        onLogin(user);
      } else {
        const user = await authService.signUp(formData.email, formData.name, formData.password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl shadow-xl shadow-emerald-200 mb-4">
            <span className="text-white text-3xl font-bold">F</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">FinAI</h1>
          <p className="text-slate-500 mt-2">Sua gestão financeira inteligente</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="flex gap-4 mb-8 p-1 bg-slate-50 rounded-2xl">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Entrar
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  required
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white focus:border-emerald-500 transition-all text-sm text-slate-900"
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                required
                type="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white focus:border-emerald-500 transition-all text-sm text-slate-900"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                required
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white focus:border-emerald-500 transition-all text-sm text-slate-900"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 mt-6 active:scale-[0.98]"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  {isLogin ? 'Entrar Agora' : 'Começar Gratuitamente'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50">
             <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl text-indigo-700">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Bot size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Consultor IA</p>
                  <p className="text-xs font-medium">Pronto para organizar suas finanças com você.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
