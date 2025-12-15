import { supabase, type Session } from '../lib/supabase';

/**
 * Vérifie si une session existe et est active.
 * 
 * @param {string} sessionId - L'ID de la session à vérifier.
 * @returns {Promise<Session | null>} La session si elle existe et est active, null sinon.
 */
export async function findActiveSession(sessionId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('is_active', true)
    .maybeSingle();
  
  if (error) {
    console.error('Erreur lors de la recherche de la session :', error);
    return null;
  }
  
  return data;
}

/**
 * Désactive une session en la marquant comme inactive.
 * 
 * @param {string} sessionId - L'ID de la session à désactiver.
 * @returns {Promise<Session | null>} La session mise à jour ou null en cas d'erreur.
 */
export async function deactivateSession(sessionId: string): Promise<Session | null> {
  // Ne pas utiliser .select() car cela nécessite une policy SELECT
  const { error } = await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('id', sessionId);
  
  if (error) {
    console.error('Erreur lors de la désactivation de la session :', error);
    return null;
  }
  
  // Récupérer la session mise à jour séparément
  const { data, error: selectError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();
  
  if (selectError) {
    console.error('Erreur lors de la récupération de la session mise à jour :', selectError);
    return null;
  }
  
  return data;
}

/**
 * Récupère tous les participants d'une session.
 * 
 * @param {string} sessionId - L'ID de la session.
 * @returns {Promise<Array<{id: string, name: string}> | null>} La liste des participants ou null en cas d'erreur.
 */
export async function getSessionParticipants(sessionId: string): Promise<Array<{id: string, name: string}> | null> {
  const { data, error } = await supabase
    .from('participants')
    .select('id, name')
    .eq('session_id', sessionId);
  
  if (error) {
    console.error('Erreur lors de la récupération des participants :', error);
    return null;
  }
  
  return data;
}

/**
 * Déconnecte tous les participants d'une session.
 * 
 * @param {string} sessionId - L'ID de la session.
 * @returns {Promise<boolean>} True si réussi, false sinon.
 */
export async function disconnectParticipants(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('participants')
    .update({ session_id: null })
    .eq('session_id', sessionId);
  
  if (error) {
    console.error('Erreur lors de la déconnexion des participants :', error);
    return false;
  }
  
  return true;
}

/**
 * Désactive une session et notifie tous les participants.
 * Marque la session comme inactive et affiche un message à tous les participants.
 * 
 * @param {string} sessionId - L'ID de la session à désactiver.
 * @param {Function} setCurrentSession - Fonction pour réinitialiser la session dans le contexte.
 * @returns {void}
 */
export function DisableSession(
  sessionId: string,
  setCurrentSession: (session: Session | null) => void,
): void {
  /**
   * Gère le processus de désactivation d'une session.
   * 
   * @returns {Promise<void>}
   */
  async function disableSessionProcess(sessionId: string): Promise<void> {
    // Vérifier que la session existe et est active
    const activeSession = await findActiveSession(sessionId);
    
    if (!activeSession) {
      alert('Session introuvable ou déjà désactivée.');
      setCurrentSession(null);
      return;
    }
    
    // Récupérer les participants avant de désactiver la session
    const participants = await getSessionParticipants(sessionId);
    
    if (!participants) {
      alert('Impossible de récupérer les participants de la session.');
      return;
    }
    
    // Désactiver la session
    const session = await deactivateSession(sessionId);
    
    if (!session) {
      alert('Erreur lors de la désactivation de la session.');
      return;
    }
    
    // Déconnecter tous les participants de la session
    const disconnected = await disconnectParticipants(sessionId);
    
    if (!disconnected) {
      alert('Erreur lors de la déconnexion des participants.');
    }
    
    // Réinitialiser le contexte
    setCurrentSession(null);
    
    // Notification pour tous les participants
    const participantNames = participants.length > 0 
      ? participants.map(p => p.name).join(', ')
      : 'Aucun participant';
      
    alert(`La session "${session.name}" est maintenant terminée.\n\nParticipants : ${participantNames}\n\nMerci d'avoir participé !`);
    
    console.log(`Session ${session.id} désactivée. ${participants.length} participant(s) notifié(s).`);
  }
  
  disableSessionProcess(sessionId);
}