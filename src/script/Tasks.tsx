import { supabase, type Tasks } from '../lib/supabase';

export async function fetchTasks(sessionId: string): Promise<Tasks[]> {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
    if (error) {
        console.error('Erreur fetchTasks:', error);
        return [];
    }
    return data as Tasks[];
}

export async function createTask(sessionId: string, title: string, description?: string): Promise<Tasks | null> {
    const { data, error } = await supabase
        .from('tasks')
        .insert([{ session_id: sessionId, title, description }])
        .select()
        .single();
    if (error) {
        console.error('Erreur createTask:', error);
        return null;
    }
    return data as Tasks;
}

export async function updateTask(taskId: string, updates: Partial<Pick<Tasks, 'title' | 'description'>>): Promise<Tasks | null> {
    const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .maybeSingle();
    if (error) {
        console.error('Erreur updateTask:', error);
        return null;
    }
    return data as Tasks | null;
}

export async function deleteTask(taskId: string): Promise<boolean> {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
    if (error) {
        console.error('Erreur deleteTask:', error);
        return false;
    }
    return true;
}

export async function setCurrentTask(sessionId: string, taskId: string | null): Promise<boolean> {
    const { error: resetError } = await supabase
        .from('tasks')
        .update({ is_current: false })
        .eq('session_id', sessionId);
    if (resetError) {
        console.error('Erreur lors de la réinitialisation des tâches courantes:', resetError);
        return false;
    }
    if (taskId) {
        const { error: setError } = await supabase
            .from('tasks')
            .update({ is_current: true })
            .eq('id', taskId);
        if (setError) {
            console.error('Erreur lors de la définition de la tâche courante:', setError);
            return false;
        }
    }
    return true;
}