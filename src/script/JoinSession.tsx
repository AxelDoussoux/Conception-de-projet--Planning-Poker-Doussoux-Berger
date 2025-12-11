import { supabase, type Session, type Participant } from '../lib/supabase.ts';
import { findParticipantByName } from './Login.tsx';
import { useSession } from '../context/SessionContext.tsx';

/**
 * Vérifie si une session existe avec le code fourni.
 * 
 * @param {string} code - Le code de la session à vérifier.
 * @returns {Promise<Session | null>} La session trouvée ou null si elle n'existe pas.
 */
async function findSessionByCode(code: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      console.error('Aucune session active trouvée avec ce code');
    } else {
      console.error('Erreur lors de la recherche de la session :', error);
    }
    return null;
  }
  
  return data;
}

/**
 * Ajoute un participant à une session.
 * 
 * @param {string} sessionId - L'ID de la session.
 * @param {string} participantId - L'ID du participant.
 * @returns {Promise<Participant | null>} Le participant mis à jour ou null en cas d'erreur.
 */
export async function addParticipantToSession(sessionId: string, participantId: string): Promise<Participant | null> {
  const { data, error } = await supabase
    .from('participants')
    .update({ session_id: sessionId })
    .eq('id', participantId)
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de l\'ajout du participant à la session :', error);
    return null;
  }
  
  return data;
}

/**
 * Permet à un participant de rejoindre une session de Planning Poker.
 * Vérifie l'existence de la session, du participant et effectue la connexion.
 * 
 * @param {string} sessionCode - Le code de la session à rejoindre.
 * @param {string} pseudo - Le pseudo du participant.
 * @param {Function} setCurrentSession - Fonction pour sauvegarder la session dans le contexte.
 * @param {Function} setCurrentParticipant - Fonction pour sauvegarder le participant dans le contexte.
 * @returns {void}
 */
export function JoinSession(sessionCode: string, pseudo: string): void {

  // Récupérer les fonctions et données du contexte de session
  const { setCurrentSession, setCurrentParticipant } = useSession();

  /**
   * Gère le processus de connexion d'un participant à une session.
   * 
   * @returns {Promise<void>}
   */
  async function joinSessionProcess(): Promise<void> {
    // Vérifier que la session existe
    const session: Session | null = await findSessionByCode(sessionCode);
    if (!session) {
      alert('Session introuvable ou inactive. Vérifiez le code.');
      return;
    }
    
    // Vérifier que le participant existe
    const participant: Participant | null = await findParticipantByName(pseudo);
    if (!participant) {
      alert('Participant introuvable. Veuillez d\'abord vous connecter.');
      return;
    }
    
    // Vérifier si le participant n'est pas déjà dans une session
    if (participant.session_id) {
      alert('Vous êtes déjà connecté à une session.');
      return;
    }
    
    // Ajouter le participant à la session
    const updatedParticipant: Participant | null = await addParticipantToSession(session.id, participant.id);
    
    if (updatedParticipant) {
      // Sauvegarder la session et le participant dans le contexte
      setCurrentSession(session);
      setCurrentParticipant(updatedParticipant);
      
      alert(`Vous avez rejoint la session : ${session.name} (Code: ${session.code})`);
    } else {
      alert('Échec de la connexion à la session.');
    }
  }
  
  joinSessionProcess();
}