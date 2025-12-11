import { supabase, type Participant } from '../lib/supabase';

/**
 * Vérifie si un pseudo est déjà utilisé dans la base de données.
 * 
 * @param {string} pseudo - Le pseudo à vérifier.
 * @returns {Promise<boolean>} True si le pseudo existe déjà, false sinon.
 */
async function isPseudoExists(pseudo: string): Promise<boolean> {
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
 * Vérifie si un participant existe déjà avec le pseudo donné.
 * 
 * @param {string} pseudo - Le pseudo du participant à vérifier.
 * @returns {Promise<Participant | null>} Le participant trouvé ou null s'il n'existe pas.
 */
export async function findParticipantByName(pseudo: string): Promise<Participant | null> {
  // Vérifier d'abord si le pseudo existe
  const exists: boolean = await isPseudoExists(pseudo);
  
  if (!exists) {
    return null;
  }
  
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
 * Connecte un participant en l'enregistrant dans la base de données.
 * Crée une entrée pour le participant et affiche le résultat de la connexion.
 * 
 * @param {string} pseudo - Le pseudo du participant à connecter.
 * @param {Function} setCurrentParticipant - Fonction pour sauvegarder le participant dans le contexte.
 * @returns {void}
 */
export function Login(
  pseudo: string,
  setCurrentParticipant: (participant: Participant | null) => void
): void {
  /**
   * Crée un nouveau participant dans la base de données Supabase.
   * 
   * @param {string} pseudo - Le pseudo du participant à créer.
   * @returns {Promise<Participant | null>} Le participant créé ou null en cas d'erreur.
   */
  async function createParticipant(pseudo: string): Promise<Participant | null> {
    // Vérifier si le pseudo existe déjà
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
      console.error('Erreur lors de la connexion du participant :', error);
      return null;
    }
    return data;
  }
  
  createParticipant(pseudo).then((participant: Participant | null) => {
    if (participant) {
      // Sauvegarder le participant dans le contexte
      setCurrentParticipant(participant);
      alert(`Participant connecté : Pseudo = ${participant.name}`);
    } else {
      alert('Échec de la connexion du participant.');
    }
  });
}