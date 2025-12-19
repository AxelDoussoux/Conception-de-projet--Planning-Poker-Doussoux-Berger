import { supabase, type Session, type Participant } from '../lib/supabase';
import { findParticipantByName } from './participants';

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function isCodeUnique(code: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('sessions')
    .select('code')
    .eq('code', code)
    .maybeSingle();
  
  if (error && (error as any).code === 'PGRST116') {
    return true;
  }
  
  return !data;
}

export async function generateUniqueCode(): Promise<string> {
  let code: string = generateCode();
  let attempts: number = 0;
  const maxAttempts: number = 10;
  
  while (!(await isCodeUnique(code)) && attempts < maxAttempts) {
    code = generateCode();
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('Impossible de générer un code unique');
  }
  
  return code;
}

export async function findSessionByCode(code: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();
  
  if (error) {
    console.error('Erreur lors de la recherche de la session :', error);
    return null;
  }
  
  return data;
}

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

export async function createSession(sessionName: string, pseudo: string, gameMode: string, setCurrentSession: (s: Session | null) => void, setCurrentParticipant: (p: Participant | null) => void): Promise<void> {
  try {
    const participant: Participant | null = await findParticipantByName(pseudo.trim());
    if (!participant) {
      alert('Participant introuvable. Veuillez d\'abord vous connecter.');
      return;
    }
    if (participant.session_id) {
      alert('Vous êtes déjà connecté à une session.');
      return;
    }
    const uniqueCode = await generateUniqueCode();
    const { data: session, error } = await supabase
      .from('sessions')
      .insert([{ name: sessionName, is_active: true, code: uniqueCode, gamemode: gameMode }])
      .select()
      .single();

    if (error || !session) {
      console.error('Erreur lors de la création de la session :', error);
      alert('Échec de la création de la session.');
      return;
    }

    const createdSession: Session = session as Session;
    const connectedParticipant: Participant | null = await addParticipantToSession(createdSession.id, participant.id);
    if (!connectedParticipant) {
      alert('Session créée mais échec de la connexion du participant.');
      return;
    }

    setCurrentSession(createdSession);
    setCurrentParticipant(connectedParticipant);
    alert(`Session créée avec succès !\n\nNom : ${createdSession.name}\nCode : ${createdSession.code}\nParticipant : ${connectedParticipant.name}\nMode de jeu : ${createdSession.gamemode}`);
  } catch (error) {
    console.error('Erreur lors de la création de la session :', error);
    alert('Échec de la création de la session.');
  }
}

export async function joinSession(sessionCode: string, pseudo: string, setCurrentSession: (s: Session | null) => void, setCurrentParticipant: (p: Participant | null) => void): Promise<void> {
  const session = await findSessionByCode(sessionCode);
  if (!session) return alert('Session introuvable ou inactive. Vérifiez le code.');

  const participant = await findParticipantByName(pseudo);
  if (!participant) return alert('Participant introuvable. Veuillez d\'abord vous connecter.');
  if (participant.session_id) return alert('Vous êtes déjà connecté à une session.');

  const updatedParticipant = await addParticipantToSession(session.id, participant.id);
  if (updatedParticipant) {
    setCurrentSession(session);
    setCurrentParticipant(updatedParticipant);
    alert(`Vous avez rejoint la session : ${session.name} (Code: ${session.code})`);
  } else {
    alert('Échec de la connexion à la session.');
  }
}

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

export async function deactivateSession(sessionId: string): Promise<Session | null> {
  const { error } = await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('id', sessionId);
  
  if (error) {
    console.error('Erreur lors de la désactivation de la session :', error);
    return null;
  }
  
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

export async function disableSession(sessionId: string, setCurrentSession: (s: Session | null) => void): Promise<void> {
  const activeSession = await findActiveSession(sessionId);
  if (!activeSession) {
    alert('Session introuvable ou déjà désactivée.');
    setCurrentSession(null);
    return;
  }

  const participants = await getSessionParticipants(sessionId);
  if (!participants) return alert('Impossible de récupérer les participants de la session.');

  const session = await deactivateSession(sessionId);
  if (!session) return alert('Erreur lors de la désactivation de la session.');

  const disconnected = await disconnectParticipants(sessionId);
  if (!disconnected) alert('Erreur lors de la déconnexion des participants.');

  setCurrentSession(null);

  const participantNames = participants.length > 0 ? participants.map(p => p.name).join(', ') : 'Aucun participant';
  alert(`La session "${session.name}" est maintenant terminée.\n\nParticipants : ${participantNames}\n\nMerci d'avoir participé !`);
  console.log(`Session ${session.id} désactivée. ${participants.length} participant(s) notifié(s).`);
}
