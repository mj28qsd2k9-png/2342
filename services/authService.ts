
import { supabase } from './supabaseClient';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export const authService = {
  signUp: async (email: string, name: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Erro ao criar usuário');

    return {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata.display_name,
      createdAt: data.user.created_at,
    };
  },

  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Usuário não encontrado');

    return {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata.display_name || 'Usuário',
      createdAt: data.user.created_at,
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata.display_name || 'Usuário',
      createdAt: user.created_at,
    };
  }
};
