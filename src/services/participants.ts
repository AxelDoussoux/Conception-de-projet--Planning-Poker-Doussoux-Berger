import { supabase, type Participant } from '../lib/supabase';

export async function isPseudoExists(pseudo: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('participants')
    .select('name')
    .eq('name', pseudo)
    .maybeSingle();
  
  if (error) {
    console.error('Erreur lors de la vérification du pseudo :', error);
    return false;
  }
  
  return data !== null;
}

export async function findParticipantByName(pseudo: string): Promise<Participant | null> {
  const exists: boolean = await isPseudoExists(pseudo);
  if (!exists) return null;

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('name', pseudo)
    .maybeSingle();

  if (error) {
    console.error('Erreur lors de la recherche du participant :', error);
    return null;
  }

  return data;
}

export async function createParticipant(pseudo: string): Promise<Participant | null> {
  const existingParticipant = await findParticipantByName(pseudo);
  if (existingParticipant) {
    return existingParticipant;
  }

  const { data, error } = await supabase
    .from('participants')
    .insert([{ name: pseudo }])
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création du participant :', error);
    return null;
  }

  return data;
}

export async function disconnectParticipant(participantId: string): Promise<Participant | null> {
  const { data, error } = await supabase
    .from('participants')
    .update({ session_id: null })
    .eq('id', participantId)
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la déconnexion du participant :', error);
    return null;
  }

  return data;
}

export async function deleteParticipant(participantId: string): Promise<boolean> {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', participantId);

  if (error) {
    console.error('Erreur lors de la suppression du participant :', error);
    return false;
  }

  return true;
}
