
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Plus, Table as TableIcon, AlertCircle, Lightbulb } from 'lucide-react';
import { ChatMessage, Table } from '../types';
import { generateTableFromPrompt, getFinancialAdvice } from '../services/geminiService';

interface AIChatProps {
  tables: Table[];
  onTableCreated: (table: Table) => Promise<any>;
}

const EXAMPLES = [
  { label: 'Cartão de Crédito', prompt: 'Crie uma tabela para controle de fatura de cartão de crédito com data, estabelecimento, categoria e valor.' },
  { label: 'Metas de Economia', prompt: 'Monte uma planilha de metas de economia para uma viagem, com objetivo, valor meta, valor guardado e status.' },
  { label: 'Investimentos', prompt: 'Crie um controle de carteira de investimentos com ativo, quantidade, preço médio e valor atual.' },
  { label: 'Orçamento Doméstico', prompt: 'Gere uma tabela de gastos fixos e variáveis da casa por mês.' },
];

const AIChat: React.FC<AIChatProps> = ({ tables, onTableCreated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Olá! Sou seu assistente financeiro. Como posso te ajudar hoje? Posso criar tabelas personalizadas com checkboxes, moedas e cores para você se organizar!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping, isSaving]);

  const handleSubmit = async (e?: React.FormEvent, customInput?: string) => {
    e?.preventDefault();
    const finalInput = customInput || input;
    if (!finalInput.trim() || isTyping || isSaving) return;

    setError(null);
    const userMessage: ChatMessage = { role: 'user', content: finalInput };
    setMessages(prev => [...prev, userMessage]);
    
    if (!customInput) setInput('');
    setIsTyping(true);

    try {
      const lowerInput = finalInput.toLowerCase();
      const isRequestingTable = 
        lowerInput.includes('crie') || 
        lowerInput.includes('tabela') || 
        lowerInput.includes('planilha') || 
        lowerInput.includes('monte') || 
        lowerInput.includes('faca') ||
        lowerInput.includes('gerar');

      if (isRequestingTable) {
        const tableData = await generateTableFromPrompt(finalInput);
        const modelMessage: ChatMessage = { 
          role: 'model', 
          content: `Analisei seu pedido e preparei a estrutura para "${tableData.name}". Você pode aceitar abaixo para salvar no seu perfil!`,
          suggestedTable: tableData
        };
        setMessages(prev => [...prev, modelMessage]);
      } else {
        const advice = await getFinancialAdvice(tables, finalInput);
        const modelMessage: ChatMessage = { role: 'model', content: advice };
        setMessages(prev => [...prev, modelMessage]);
      }
    } catch (error: any) {
      console.error("Erro na IA:", error);
      setError("Houve um problema ao processar seu pedido. Pode ser a conexão ou um erro temporário.");
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: 'Desculpe, tive um pequeno problema técnico ao gerar essa tabela. Pode tentar descrevê-la de outra forma?' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAcceptTable = async (suggested: Partial<Table>) => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    
    try {
      const finalTable: Table = {
        ...suggested as Table,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      
      await onTableCreated(finalTable);
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `Sucesso! A tabela "${finalTable.name}" foi salva com segurança no seu perfil. Você já pode vê-la na aba de tabelas.` 
      }]);
    } catch (e: any) {
      console.error("Erro ao aceitar tabela:", e);
      setError(`Falha ao salvar: ${e.message || 'Erro de conexão com o Supabase'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Consultor Inteligente</h2>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 <p className="text-xs text-indigo-200 font-medium">Sincronizado com seu Perfil</p>
              </div>
            </div>
          </div>
          <Sparkles className="text-indigo-400 opacity-50" size={20} />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100 text-indigo-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200 shadow-lg' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
                
                {msg.suggestedTable && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xl animate-in fade-in zoom-in-95 duration-500 delay-150 border-l-4 border-l-emerald-500">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <TableIcon size={20} />
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-800">{msg.suggestedTable.name}</h4>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Estrutura Sugerida</p>
                         </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-5">
                      <p className="text-xs text-slate-500 leading-relaxed italic">"{msg.suggestedTable.description}"</p>
                      <div className="flex flex-wrap gap-2">
                         {msg.suggestedTable.columns?.map(c => (
                           <span key={c.key} className="text-[10px] bg-slate-50 text-slate-600 border border-slate-100 px-2 py-1.5 rounded-lg flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                             {c.label}
                           </span>
                         ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleAcceptTable(msg.suggestedTable!)}
                      disabled={isSaving}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold shadow-lg shadow-slate-200 active:scale-[0.98]"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Salvando no Perfil...
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Salvar em meu Perfil
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {(isTyping || isSaving) && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 text-indigo-600 flex items-center justify-center shadow-sm">
                <Bot size={16} />
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-4 rounded-xl border border-red-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-50 shrink-0 space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 whitespace-nowrap">
            <Lightbulb size={12} className="text-amber-500" /> Exemplos:
          </div>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => handleSubmit(undefined, ex.prompt)}
              disabled={isTyping || isSaving}
              className="px-3 py-1.5 bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-full text-xs font-medium transition-all whitespace-nowrap active:scale-95"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSaving}
            placeholder="Ex: Crie uma tabela de controle de aluguel..."
            className="w-full pl-6 pr-16 py-4 bg-slate-100/50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all text-sm text-slate-900 placeholder-slate-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || isSaving}
            className="absolute right-2 top-2 bottom-2 px-4 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
