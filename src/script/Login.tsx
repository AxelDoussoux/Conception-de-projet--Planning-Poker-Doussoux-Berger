import { supabase, type Participant } from '../lib/supabase';

/**
 * Pseudo par défaut du participant à connecter.
 * @constant {string}
 */
const pseudo = "Participant 1";

/**
 * Connecte un participant en l'enregistrant dans la base de données.
 * Crée une entrée pour le participant et affiche le résultat de la connexion.
 * 
 * @returns {void}
 */
function Login(): void {
  /**
   * Crée un nouveau participant dans la base de données Supabase.
   * 
   * @returns {Promise<Participant | null>} Le participant créé ou null en cas d'erreur.
   */
  async function createParticipant(): Promise<Participant | null> {
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
  
  createParticipant().then((participant) => {
    if (participant) {
      alert(`Participant connecté : Pseudo = ${participant.name}`);
    } else {
      alert('Échec de la connexion du participant.');
    }
  });
}

export { Login };