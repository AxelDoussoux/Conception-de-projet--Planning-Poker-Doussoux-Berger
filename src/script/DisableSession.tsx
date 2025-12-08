import { supabase, type Session } from '../lib/supabase';

/**
 * Désactive une session en la marquant comme inactive.
 * 
 * @param {string} sessionId - L'ID de la session à désactiver.
 * @returns {Promise<Session | null>} La session mise à jour ou null en cas d'erreur.
 */
async function deactivateSession(sessionId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('id', sessionId)
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de la désactivation de la session :', error);
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
async function getSessionParticipants(sessionId: string): Promise<Array<{id: string, name: string}> | null> {
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
 * Désactive une session et notifie tous les participants.
 * Marque la session comme inactive et affiche un message à tous les participants.
 * 
 * @returns {void}
 */
function DisableSession(sessionId: string): void {
  /**
   * Gère le processus de désactivation d'une session.
   * 
   * @returns {Promise<void>}
   */
  async function disableSessionProcess(sessionId: string): Promise<void> {
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
    
    // Notification pour tous les participants
    const participantNames = participants.map(p => p.name).join(', ');
    alert(`La session "${session.name}" est maintenant terminée.\n\nParticipants : ${participantNames}\n\nMerci d'avoir participé !`);
    
    console.log(`Session ${session.id} désactivée. ${participants.length} participant(s) notifié(s).`);
  }
  
  disableSessionProcess(sessionId);
}

export { DisableSession };