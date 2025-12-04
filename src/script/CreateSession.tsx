import { supabase, type Session } from '../lib/supabase';

const sessionName = 'Session 1'; // Exemple de test nom de session

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function isCodeUnique(code: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('sessions')
    .select('code')
    .eq('code', code)
    .single();
  
  if (error && error.code === 'PGRST116') { // Aucune session trouvée avec ce code
    return true;
  }
  
  return !data;
}

async function generateUniqueCode(): Promise<string> {
  let code = generateCode();
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!(await isCodeUnique(code)) && attempts < maxAttempts) {
    code = generateCode();
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('Impossible de générer un code unique');
  }
  
  return code;
}

function CreateSession() {
  /**
   * Crée une nouvelle session dans la base de données Supabase.
   * @returns {Promise<Session | null>} La session créée ou null en cas d'erreur.
   */

  async function createNewSession(): Promise<Session | null> {
    try {
      const uniqueCode = await generateUniqueCode();
      
      const { data, error } = await supabase
        .from('sessions')
        .insert([{ name: sessionName, is_active: true, code: uniqueCode }])
        .select()
        .single();
      
      if (error) {
        console.error('Erreur lors de la création de la session :', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Erreur lors de la génération du code unique :', error);
      return null;
    }
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