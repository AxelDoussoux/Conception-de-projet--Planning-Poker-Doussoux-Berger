import { supabase, type Session } from '../lib/supabase';

const sessionName = 'Session 1'; // Exemple de test nom de session

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function CreateSession() {
  /**
   * Crée une nouvelle session dans la base de données Supabase.
   * @returns {Promise<Session | null>} La session créée ou null en cas d'erreur.
   */

    async function createNewSession(): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .insert([{ name: sessionName, is_active: true, code: generateCode() }])
      .select()
      .single();
    if (error) {
      console.error('Erreur lors de la création de la session :', error);
      return null;
    }
    return data;
  }

  createNewSession().then((session) => {
    if (session) {
      alert(`Session créée avec succès : ID = ${session.id}, Nom = ${session.name}, Code = ${session.code}`);
    } else {
      alert('Échec de la création de la session.');
    }
  });
}

export { CreateSession };