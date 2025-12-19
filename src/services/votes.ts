import { supabase, type Votes } from '../lib/supabase';

/**
 * Récupère tous les votes d'une tâche
 * @param taskId - L'ID de la tâche
 * @returns Liste des votes triés par date
 */
export async function fetchVotes(taskId: string): Promise<Votes[]> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('task_id', taskId)
    .order('voted_at', { ascending: true });

  if (error) {
    console.error('Erreur fetchVotes:', error);
    return [];
  }

  return data as Votes[];
}

/**
 * Soumet ou met à jour un vote pour une tâche
 * @param taskId - L'ID de la tâche
 * @param participantId - L'ID du participant
 * @param value - La valeur du vote (numérique)
 * @returns Le vote créé/mis à jour ou null en cas d'erreur
 */
export async function submitVote(taskId: string, participantId: string, value: number): Promise<Votes | null> {
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('task_id', taskId)
    .eq('participant_id', participantId)
    .maybeSingle();

  if (existingVote) {
    const { data, error } = await supabase
      .from('votes')
      .update({ value, voted_at: new Date().toISOString() })
      .eq('id', existingVote.id)
      .select()
      .single();

    if (error) {
      console.error('Erreur updateVote:', error);
      return null;
    }

    return data as Votes;
  } else {
    const { data, error } = await supabase
      .from('votes')
      .insert([{ task_id: taskId, participant_id: participantId, value }])
      .select()
      .single();

    if (error) {
      console.error('Erreur submitVote:', error);
      return null;
    }

    return data as Votes;
  }
}

/**
 * Réinitialise tous les votes d'une tâche
 * @param taskId - L'ID de la tâche
 * @returns true si la réinitialisation a réussi, false sinon
 */
export async function resetVotes(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from('votes')
    .delete()
    .eq('task_id', taskId);

  if (error) {
    console.error('Erreur resetVotes:', error);
    return false;
  }

  return true;
}

/**
 * Supprime le vote d'un participant pour une tâche
 * @param taskId - L'ID de la tâche
 * @param participantId - L'ID du participant
 * @returns true si la suppression a réussi, false sinon
 */
export async function deleteVote(taskId: string, participantId: string): Promise<boolean> {
  const { error } = await supabase
    .from('votes')
    .delete()
    .eq('task_id', taskId)
    .eq('participant_id', participantId);

  if (error) {
    console.error('Erreur deleteVote:', error);
    return false;
  }

  return true;
}

/**
 * S'abonne aux changements de votes d'une tâche en temps réel
 * @param taskId - L'ID de la tâche
 * @param cb - Callback appelé à chaque changement avec la liste des votes
 * @returns Fonction pour se désabonner
 */
export function subscribeToVotes(taskId: string, cb: (votes: Votes[]) => void): () => Promise<void> {
  const channel = supabase
    .channel(`votes:task:${taskId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'votes', filter: `task_id=eq.${taskId}` },
      () => {
        void fetchVotes(taskId).then(cb).catch((err) => console.error('Error fetching votes on subscription:', err));
      }
    )
    .subscribe();

  return async () => {
    try {
      await supabase.removeChannel(channel);
    } catch (err) {
      console.error('Error unsubscribing votes channel:', err);
    }
  };
}
