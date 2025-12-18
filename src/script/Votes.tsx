import { supabase, type Votes } from '../lib/supabase';

export async function fetchVotes(taskId: string): Promise<Votes[]> {
    const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('task_id', taskId)
        .order('voted_at', { ascending: true }); // On trie par ordre chronologique

    if (error) {
        console.error('Erreur fetchVotes:', error);
        return [];
    }
    return data as Votes[];
}

export async function submitVote(taskId: string, participantId: string, value: number): Promise<Votes | null> {
    // Vérifier si un vote existe déjà pour ce participant sur cette tâche
    const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('task_id', taskId)
        .eq('participant_id', participantId)
        .maybeSingle();

    if (existingVote) {
        // Mise à jour du vote existant
        const { data, error } = await supabase
            .from('votes')
            .update({ value, voted_at: new Date().toISOString() }) // On met à jour la date aussi
            .eq('id', existingVote.id)
            .select()
            .single();

        if (error) {
            console.error('Erreur updateVote:', error);
            return null;
        }
        return data as Votes;
    } else {
        // Création d'un nouveau vote
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
