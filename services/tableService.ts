
import { supabase } from './supabaseClient';
import { Table } from '../types';

// Código de erro do Postgres para "Relation does not exist"
export const TABLE_NOT_FOUND_ERROR = '42P01';

export const tableService = {
  getTables: async (userId: string): Promise<Table[]> => {
    const { data, error } = await supabase
      .from('finai_tables')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === TABLE_NOT_FOUND_ERROR) {
        throw new Error('DATABASE_NOT_READY');
      }
      console.error('Erro Supabase (getTables):', error.message);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      columns: item.columns,
      rows: item.rows,
      themeColor: item.theme_color,
      createdAt: item.created_at
    }));
  },

  saveTable: async (userId: string, table: Table): Promise<Table> => {
    const { data, error } = await supabase
      .from('finai_tables')
      .upsert({
        id: table.id,
        user_id: userId,
        name: table.name,
        description: table.description,
        columns: table.columns,
        rows: table.rows,
        theme_color: table.themeColor,
        created_at: table.createdAt
      })
      .select()
      .single();

    if (error) {
      if (error.code === TABLE_NOT_FOUND_ERROR) {
        throw new Error('DATABASE_NOT_READY');
      }
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      columns: data.columns,
      rows: data.rows,
      themeColor: data.theme_color,
      createdAt: data.created_at
    };
  },

  deleteTable: async (tableId: string): Promise<void> => {
    const { error } = await supabase
      .from('finai_tables')
      .delete()
      .eq('id', tableId);

    if (error) throw error;
  }
};
