import { supabase, type Tasks } from '../lib/supabase';

/**
 * Récupère toutes les tâches d'une session
 * @param sessionId - L'ID de la session
 * @returns Liste des tâches triées par date de création
 */
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

/**
 * Crée une nouvelle tâche dans une session
 * @param sessionId - L'ID de la session
 * @param title - Le titre de la tâche
 * @param description - La description optionnelle de la tâche
 * @returns La tâche créée ou null en cas d'erreur
 */
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

/**
 * Met à jour une tâche existante
 * @param taskId - L'ID de la tâche à mettre à jour
 * @param updates - Les champs à mettre à jour (title et/ou description)
 * @returns La tâche mise à jour ou null en cas d'erreur
 */
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

/**
 * Supprime une tâche
 * @param taskId - L'ID de la tâche à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
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

/**
 * Définit la tâche courante d'une session
 * @param sessionId - L'ID de la session
 * @param taskId - L'ID de la tâche à définir comme courante (null pour réinitialiser)
 * @returns true si l'opération a réussi, false sinon
 */
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

/**
 * S'abonne aux changements de tâches d'une session en temps réel
 * @param sessionId - L'ID de la session
 * @param cb - Callback appelé à chaque changement avec la liste des tâches
 * @returns Fonction pour se désabonner
 */
export function subscribeToTasks(sessionId: string, cb: (tasks: Tasks[]) => void): () => Promise<void> {
  const channel = supabase
    .channel(`tasks:session:${sessionId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `session_id=eq.${sessionId}` },
      () => {
        void fetchTasks(sessionId).then(cb).catch((err) => console.error('Error fetching tasks on subscription:', err));
      }
    )
    .subscribe();

  return async () => {
    try {
      await supabase.removeChannel(channel);
    } catch (err) {
      console.error('Error unsubscribing tasks channel:', err);
    }
  };
}
