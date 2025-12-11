import { supabase, type Session, type Participant } from '../lib/supabase';
import { addParticipantToSession } from './JoinSession';
import { findParticipantByName } from './Login';
import { useSession } from '../context/SessionContext.tsx';

/**
 * Génère un code aléatoire à 6 chiffres.
 * 
 * @returns {string} Un code numérique entre 100000 et 999999.
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Vérifie si un code de session est unique dans la base de données.
 * 
 * @param {string} code - Le code à vérifier.
 * @returns {Promise<boolean>} True si le code est unique, false sinon.
 */
async function isCodeUnique(code: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('sessions')
    .select('code')
    .eq('code', code)
    .single();
  
  if (error && error.code === 'PGRST116') {
    // Aucune session trouvée avec ce code
    return true;
  }
  
  return !data;
}

/**
 * Génère un code unique pour une session en vérifiant son unicité.
 * Effectue jusqu'à 10 tentatives pour trouver un code unique.
 * 
 * @returns {Promise<string>} Un code unique à 6 chiffres.
 * @throws {Error} Si aucun code unique n'a pu être généré après 10 tentatives.
 */
async function generateUniqueCode(): Promise<string> {
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

/**
 * Crée une nouvelle session de Planning Poker.
 * Vérifie qu'un participant existe, génère un code unique, crée la session 
 * et connecte le participant à cette session.
 * 
 * @param {string} sessionName - Le nom de la session à créer.
 * @param {string} pseudo - Le pseudo du participant créateur.
 * @returns {void}
 */
export function CreateSession(sessionName: string, pseudo: string): void {
  
  // Récupérer les fonctions et données du contexte de session
  const { setCurrentSession, setCurrentParticipant } = useSession();

  /**
   * Crée une nouvelle session dans la base de données Supabase et y connecte le participant.
   * 
   * @returns {Promise<void>}
   */
  async function createNewSession(): Promise<void> {
    try {
      // Vérifier que le participant existe
      const participant: Participant | null = await findParticipantByName(pseudo.trim());
      
      if (!participant) {
        alert('Participant introuvable. Veuillez d\'abord vous connecter.');
        return;
      }
      
      // Vérifier si le participant n'est pas déjà dans une session
      if (participant.session_id) {
        alert('Vous êtes déjà connecté à une session.');
        return;
      }
      
      // Générer un code unique
      const uniqueCode: string = await generateUniqueCode();
      
      // Créer la session
      const { data: session, error } = await supabase
        .from('sessions')
        .insert([{ name: sessionName, is_active: true, code: uniqueCode }])
        .select()
        .single();
      
      if (error || !session) {
        console.error('Erreur lors de la création de la session :', error);
        alert('Échec de la création de la session.');
        return;
      }
      
      // Typer explicitement la session
      const createdSession: Session = session as Session;
      
      // Connecter le participant à la session
      const connectedParticipant: Participant | null = await addParticipantToSession(createdSession.id, participant.id);
      
      if (!connectedParticipant) {
        alert('Session créée mais échec de la connexion du participant.');
        return;
      }
      
      // Sauvegarder la session et le participant dans le contexte
      setCurrentSession(createdSession);
      setCurrentParticipant(connectedParticipant);
      
      alert(`Session créée avec succès !\n\nNom : ${createdSession.name}\nCode : ${createdSession.code}\nParticipant : ${connectedParticipant.name}`);
      
    } catch (error) {
      console.error('Erreur lors de la création de la session :', error);
      alert('Échec de la création de la session.');
    }
  }

  createNewSession();
}