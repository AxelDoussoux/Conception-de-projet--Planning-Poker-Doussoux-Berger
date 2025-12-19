import { supabase, type Participant } from '../lib/supabase';

/**
 * Vérifie si un pseudo existe déjà dans la base de données
 * @param pseudo - Le pseudo à vérifier
 * @returns true si le pseudo existe, false sinon
 */
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

/**
 * Recherche un participant par son pseudo
 * @param pseudo - Le pseudo du participant à rechercher
 * @returns Le participant trouvé ou null
 */
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

/**
 * Crée un nouveau participant ou retourne le participant existant si le pseudo existe déjà
 * @param pseudo - Le pseudo du participant à créer
 * @returns Le participant créé ou existant, ou null en cas d'erreur
 */
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

/**
 * Déconnecte un participant de sa session (met session_id à null)
 * @param participantId - L'ID du participant à déconnecter
 * @returns Le participant mis à jour ou null en cas d'erreur
 */
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

/**
 * Supprime un participant de la base de données
 * @param participantId - L'ID du participant à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
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
