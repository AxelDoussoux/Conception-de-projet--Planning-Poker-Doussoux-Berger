import { supabase, type Votes } from '../lib/supabase';

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
