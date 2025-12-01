import { supabase, type Participant } from '../lib/supabase';

const pseudo = "Participant 1"; // Exemple de test nom de participant

function Login() {
    /**
   * Crée un nouveau participant dans la base de données Supabase.
   * @returns {Promise<Participant | null>} Le participant créé ou null en cas d'erreur.
   */

    async function Login(): Promise<Participant | null> {
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
    Login().then((participant) => {
    if (participant) {
      alert(`Participant connecté : Pseudo = ${participant.name}`);
    } else {
      alert('Échec de la connexion du participant.');
    }
  });
}

export { Login };