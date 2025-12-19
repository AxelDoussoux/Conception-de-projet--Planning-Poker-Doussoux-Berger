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
  const exists: boolean = await isPseudoExists(pseudo);
  if (exists) {
    alert('Ce pseudo est déjà utilisé. Veuillez en choisir un autre.');
    return null;
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
