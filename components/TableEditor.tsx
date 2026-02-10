
import React, { useState, useEffect, useMemo } from 'react';
import { Table, Column, Row, ColumnType, AggregationType } from '../types';
import { Trash2, Plus, Settings, Palette, CheckSquare, X, Check, Edit3, Eye, Sigma, Calculator, Search, FilterX, Layout } from 'lucide-react';

interface TableEditorProps {
  table: Table;
  allTables: Table[];
  onUpdate: (table: Table) => void;
  onDelete: (id: string) => void;
  onDuplicate: (table: Table, isProjection: boolean, multiplier?: number) => void;
  onSelectTable: (id: string) => void;
}

const THEME_COLORS = [
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Índigo', hex: '#6366f1' },
  { name: 'Violeta', hex: '#8b5cf6' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Laranja', hex: '#f59e0b' },
  { name: 'Vermelho', hex: '#ef4444' },
  { name: 'Ardósia', hex: '#475569' },
];

const COLUMN_TYPES: { label: string; value: ColumnType }[] = [
  { label: 'Texto', value: 'string' },
  { label: 'Número', value: 'number' },
  { label: 'Data', value: 'date' },
  { label: 'Moeda (R$)', value: 'currency' },
  { label: 'Checkbox', value: 'checkbox' },
];

const AGGREGATION_TYPES: { label: string; value: AggregationType }[] = [
  { label: 'Sem Cálculo', value: 'none' },
  { label: 'Soma', value: 'sum' },
  { label: 'Média', value: 'avg' },
  { label: 'Contagem', value: 'count' },
];

const TableEditor: React.FC<TableEditorProps> = ({ table, allTables, onUpdate, onDelete, onDuplicate, onSelectTable }) => {
  const [editingRows, setEditingRows] = useState<Row[]>(table.rows);
  const [showSettings, setShowSettings] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    setEditingRows(table.rows);
  }, [table.id, table.rows]);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }), []);

  const formatValue = (value: any, type: ColumnType) => {
    if (type === 'currency') {
      const num = parseFloat(value) || 0;
      return currencyFormatter.format(num);
    }
    return value || '---';
  };

  const filteredRows = useMemo(() => {
    if (!filterText.trim()) return editingRows;
    const search = filterText.toLowerCase();
    return editingRows.filter(row => {
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(search)
      );
    });
  }, [editingRows, filterText]);

  const addRow = () => {
    const newRow: Row = { id: crypto.randomUUID() };
    table.columns.forEach(col => {
      newRow[col.key] = col.type === 'checkbox' ? false : col.type === 'number' || col.type === 'currency' ? 0 : '';
    });
    const updated = [...editingRows, newRow];
    setEditingRows(updated);
    onUpdate({ ...table, rows: updated });
    if (isReadOnly) setIsReadOnly(false);
  };

  const removeRow = (id: string) => {
    const updated = editingRows.filter(r => r.id !== id);
    setEditingRows(updated);
    onUpdate({ ...table, rows: updated });
  };

  const updateCellValue = (rowId: string, key: string, value: any) => {
    if (isReadOnly) return;
    const updated = editingRows.map(r => r.id === rowId ? { ...r, [key]: value } : r);
    setEditingRows(updated);
    onUpdate({ ...table, rows: updated });
  };

  const addColumn = () => {
    const newKey = `col_${Math.random().toString(36).substr(2, 5)}`;
    const newColumn: Column = { key: newKey, label: 'Nova Coluna', type: 'string', aggregation: 'none' };
    const updatedColumns = [...table.columns, newColumn];
    const updatedRows = editingRows.map(row => ({ ...row, [newKey]: '' }));
    onUpdate({ ...table, columns: updatedColumns, rows: updatedRows });
  };

  const removeColumn = (key: string) => {
    const updatedColumns = table.columns.filter(c => c.key !== key);
    const updatedRows = editingRows.map(row => {
      const { [key]: _, ...rest } = row;
      return rest as Row;
    });
    onUpdate({ ...table, columns: updatedColumns, rows: updatedRows });
  };

  const updateColumn = (key: string, updates: Partial<Column>) => {
    const updatedColumns = table.columns.map(c => c.key === key ? { ...c, ...updates } : c);
    onUpdate({ ...table, columns: updatedColumns });
  };

  const updateTheme = (hex: string) => {
    onUpdate({ ...table, themeColor: hex });
    setShowColorPicker(false);
  };

  const theme = table.themeColor || '#10b981';

  const totals = useMemo(() => {
    const result: Record<string, string | number> = {};
    table.columns.forEach(col => {
      if (!col.aggregation || col.aggregation === 'none') return;

      const values = filteredRows
        .map(r => {
          if (col.type === 'checkbox') return r[col.key] ? 1 : 0;
          return parseFloat(r[col.key]) || 0;
        });

      if (col.aggregation === 'sum') {
        const sum = values.reduce((acc, v) => acc + v, 0);
        result[col.key] = col.type === 'currency' ? currencyFormatter.format(sum) : sum.toFixed(2).replace('.00', '');
      } else if (col.aggregation === 'avg') {
        const avg = values.length > 0 ? values.reduce((acc, v) => acc + v, 0) / values.length : 0;
        result[col.key] = col.type === 'currency' ? currencyFormatter.format(avg) : avg.toFixed(2).replace('.00', '');
      } else if (col.aggregation === 'count') {
        result[col.key] = values.length;
      }
    });
    return result;
  }, [table.columns, filteredRows, currencyFormatter]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 shrink-0 mr-2">
          <Layout size={14} /> Coleção:
        </span>
        {allTables.map(t => (
          <button
            key={t.id}
            onClick={() => onSelectTable(t.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              t.id === table.id 
                ? 'bg-white border-slate-200 text-slate-900 shadow-sm ring-2 ring-offset-1'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            style={t.id === table.id ? { ringColor: theme } : {}}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-3 h-12 rounded-full shrink-0" style={{ backgroundColor: theme }}></div>
          <div className="flex-1 min-w-0">
            <input 
              value={table.name}
              onChange={(e) => onUpdate({...table, name: e.target.value})}
              readOnly={isReadOnly}
              className={`text-2xl font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-full truncate ${isReadOnly ? 'cursor-default' : ''}`}
            />
            <input 
              value={table.description}
              onChange={(e) => onUpdate({...table, description: e.target.value})}
              readOnly={isReadOnly}
              className={`text-slate-500 text-sm bg-transparent border-none p-0 focus:ring-0 w-full truncate ${isReadOnly ? 'cursor-default' : ''}`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative mr-2 group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text"
              placeholder="Filtrar dados..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-9 pr-10 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:bg-white focus:border-emerald-500 outline-none w-48 transition-all"
            />
            {filterText && (
              <button 
                onClick={() => setFilterText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                <FilterX size={14} />
              </button>
            )}
          </div>

          <button 
            onClick={() => setIsReadOnly(!isReadOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm ${
              isReadOnly 
                ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' 
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isReadOnly ? <Eye size={16} /> : <Edit3 size={16} />}
            {isReadOnly ? 'Visualização' : 'Edição'}
          </button>

          <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
            <button 
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 text-slate-500 hover:bg-white rounded-lg transition-all relative"
            >
              <Palette size={18} style={{ color: theme }} />
              {showColorPicker && (
                <div className="absolute top-full right-0 mt-2 p-3 bg-white border border-slate-100 rounded-xl shadow-xl z-50 grid grid-cols-4 gap-2 w-48">
                  {THEME_COLORS.map(c => (
                    <button 
                      key={c.hex}
                      onClick={() => updateTheme(c.hex)}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              )}
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-white'}`}
            >
              <Settings size={18} />
            </button>
            <button 
              onClick={() => onDelete(table.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-inner animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold flex items-center gap-2 text-emerald-400 text-lg">
                <Calculator size={20} /> Layout e Cálculos Automáticos
              </h3>
              <p className="text-slate-400 text-xs mt-1">Configure o tipo de dado e como a IA deve resumir cada coluna.</p>
            </div>
            <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {table.columns.map((col) => (
              <div key={col.key} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col gap-3 relative group">
                <button 
                  onClick={() => removeColumn(col.key)} 
                  className="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
                
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Rótulo da Coluna</label>
                  <input 
                    value={col.label}
                    onChange={(e) => updateColumn(col.key, { label: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">Tipo</label>
                    <select 
                      value={col.type}
                      onChange={(e) => updateColumn(col.key, { type: e.target.value as ColumnType })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                    >
                      {COLUMN_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-wider mb-1 block">Resumo (Fórmula)</label>
                    <select 
                      value={col.aggregation || 'none'}
                      onChange={(e) => updateColumn(col.key, { aggregation: e.target.value as AggregationType })}
                      className="w-full bg-slate-900 border border-emerald-900/30 rounded-lg px-3 py-2 text-xs text-emerald-400 outline-none cursor-pointer font-bold"
                    >
                      {AGGREGATION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={addColumn}
              className="border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-emerald-500 hover:text-emerald-500 transition-all py-8 bg-slate-800/20"
            >
              <Plus size={24} />
              <span className="font-bold text-sm">Adicionar Coluna</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {table.columns.map(col => (
                  <th key={col.key} className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: theme }}></div>
                      {col.label}
                    </div>
                  </th>
                ))}
                {!isReadOnly && <th className="px-6 py-5 w-16 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={table.columns.length + (isReadOnly ? 0 : 1)} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center opacity-20">
                       {filterText ? <FilterX size={48} className="mb-2" /> : <CheckSquare size={48} className="mb-2" />}
                       <p className="text-slate-500 italic">{filterText ? 'Nenhum resultado para o filtro.' : 'Nenhum registro encontrado.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/40 transition-colors group animate-in fade-in duration-300">
                    {table.columns.map(col => (
                      <td key={col.key} className="px-6 py-4">
                        {col.type === 'checkbox' ? (
                          <button 
                            onClick={() => !isReadOnly && updateCellValue(row.id, col.key, !row[col.key])}
                            disabled={isReadOnly}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                              row[col.key] ? 'text-white shadow-sm' : 'bg-slate-100 border border-slate-200 text-transparent'
                            }`}
                            style={row[col.key] ? { backgroundColor: theme } : {}}
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                        ) : isReadOnly ? (
                          <div className={`text-sm ${row[col.key] === '' ? 'text-slate-300 italic' : 'text-slate-900 font-semibold'}`}>
                            {formatValue(row[col.key], col.type)}
                          </div>
                        ) : (
                          <div className="relative group/cell">
                            {col.type === 'currency' && !isReadOnly && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">R$</span>
                            )}
                            <input
                              type={col.type === 'date' ? 'date' : col.type === 'number' || col.type === 'currency' ? 'number' : 'text'}
                              value={row[col.key] ?? ''}
                              onChange={(e) => updateCellValue(row.id, col.key, e.target.value)}
                              className={`w-full bg-transparent border-none focus:ring-0 text-sm text-slate-900 font-medium placeholder-slate-200 ${col.type === 'currency' ? 'pl-6' : ''}`}
                              placeholder={col.type === 'currency' ? '0,00' : 'Digitar...'}
                            />
                          </div>
                        )}
                      </td>
                    ))}
                    {!isReadOnly && (
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => removeRow(row.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
            
            {Object.keys(totals).length > 0 && (
              <tfoot className="border-t-2 border-slate-100 bg-slate-50/50">
                <tr className="divide-x divide-slate-100/50">
                  {table.columns.map(col => (
                    <td key={col.key} className="px-6 py-4">
                      {totals[col.key] !== undefined && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5 flex items-center gap-1">
                            <Sigma size={10} style={{ color: theme }} /> {AGGREGATION_TYPES.find(t => t.value === col.aggregation)?.label}
                          </span>
                          <span className="text-sm font-black text-slate-900" style={{ color: theme }}>
                            {totals[col.key]}
                          </span>
                        </div>
                      )}
                    </td>
                  ))}
                  {!isReadOnly && <td className="px-6 py-4 bg-slate-100/30"></td>}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        
        {!isReadOnly && (
          <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={addRow}
              className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-sm hover:shadow-md"
              style={{ color: theme }}
            >
              <Plus size={18} />
              Nova Linha
            </button>
            <div className="flex items-center gap-3">
               <div className="h-6 w-[1px] bg-slate-200"></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-slate-500">
                 {filteredRows.length} {filteredRows.length === 1 ? 'Registro' : 'Registros'} {filterText && '(filtrado)'}
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableEditor;
