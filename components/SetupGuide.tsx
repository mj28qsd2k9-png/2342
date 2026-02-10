
import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, Terminal, ShieldCheck } from 'lucide-react';

const SQL_SCRIPT = `-- 1. Criar a tabela de tabelas financeiras
create table if not exists public.finai_tables (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  columns jsonb default '[]'::jsonb,
  rows jsonb default '[]'::jsonb,
  theme_color text default '#10b981',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar Row Level Security (Segurança)
alter table public.finai_tables enable row level security;

-- 3. Criar política para que usuários só vejam seus próprios dados
create policy "Usuários podem gerenciar suas próprias tabelas"
  on public.finai_tables
  for all
  using (auth.uid() = user_id);`;

interface SetupGuideProps {
  onRetry: () => void;
}

const SetupGuide: React.FC<SetupGuideProps> = ({ onRetry }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-8 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/20 text-amber-500 rounded-2xl">
              <Database size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Configuração do Banco de Dados</h2>
              <p className="text-slate-400 text-sm">A tabela 'finai_tables' não foi encontrada no seu Supabase.</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <p className="text-slate-300 text-sm">Acesse o seu projeto no <b>Supabase Dashboard</b> e vá em <b>SQL Editor</b>.</p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <p className="text-slate-300 text-sm">Clique em <b>New Query</b> e cole o código abaixo:</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={copyToClipboard}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all flex items-center gap-2 text-xs font-bold"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar SQL'}
              </button>
            </div>
            <pre className="bg-slate-950 p-6 rounded-2xl text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-700 max-h-64 scrollbar-hide">
              {SQL_SCRIPT}
            </pre>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="text-blue-400 shrink-0" size={20} />
            <p className="text-blue-200 text-xs leading-relaxed">
              <b>Dica de Segurança:</b> Este script já inclui o <b>RLS (Row Level Security)</b>, garantindo que nenhum usuário consiga ver as tabelas financeiras de outro.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-white hover:bg-slate-100 text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              Abrir Supabase <ExternalLink size={18} />
            </a>
            <button 
              onClick={onRetry}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20"
            >
              Já executei o SQL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
