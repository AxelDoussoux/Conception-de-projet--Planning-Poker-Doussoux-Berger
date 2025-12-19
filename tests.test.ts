import { generateCode } from './src/services/sessions';
import { supabase } from './src/lib/supabase';

jest.mock('./src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
            order: jest.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: '1', name: 'test' }, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
            maybeSingle: jest.fn(() => Promise.resolve({ data: { id: '1' }, error: null }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    }))
  }
}));

// ============================================
// TESTS SESSIONS
// ============================================

describe('Sessions Service', () => {
  describe('generateCode', () => {
    test('génère un code de 6 caractères', () => {
      const code = generateCode();
      expect(code).toHaveLength(6);
    });

    test('génère un code numérique', () => {
      const code = generateCode();
      expect(/^\d{6}$/.test(code)).toBe(true);
    });

    test('génère un code entre 100000 et 999999', () => {
      const code = generateCode();
      const num = parseInt(code, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThan(1000000);
    });

    test('génère des codes différents', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateCode());
      }
      expect(codes.size).toBeGreaterThan(90);
    });
  });
});

// ============================================
// TESTS PARTICIPANTS
// ============================================

describe('Participants Service', () => {
  const participants = require('./src/services/participants');
  const { supabase: mockSupabase } = require('./src/lib/supabase');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isPseudoExists', () => {
    test('retourne false si pseudo inexistant', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      });

      const result = await participants.isPseudoExists('nouveauPseudo');
      expect(result).toBe(false);
    });

    test('retourne true si pseudo existe', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => Promise.resolve({ data: { name: 'existant' }, error: null }))
          }))
        }))
      });

      const result = await participants.isPseudoExists('existant');
      expect(result).toBe(true);
    });
  });

  describe('deleteParticipant', () => {
    test('retourne true si suppression réussie', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null }))
        }))
      });

      const result = await participants.deleteParticipant('participant-id');
      expect(result).toBe(true);
    });

    test('retourne false si erreur', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: { message: 'Erreur' } }))
        }))
      });

      const result = await participants.deleteParticipant('participant-id');
      expect(result).toBe(false);
    });
  });
});

// ============================================
// TESTS TASKS
// ============================================

describe('Tasks Service', () => {
  const tasks = require('./src/services/tasks');
  const { supabase: mockSupabase } = require('./src/lib/supabase');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchTasks', () => {
    test('retourne liste vide si aucune tâche', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      });

      const result = await tasks.fetchTasks('session-id');
      expect(result).toEqual([]);
    });

    test('retourne les tâches si présentes', async () => {
      const mockTasks = [
        { id: '1', title: 'Tâche 1', session_id: 'session-id' },
        { id: '2', title: 'Tâche 2', session_id: 'session-id' }
      ];
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockTasks, error: null }))
          }))
        }))
      });

      const result = await tasks.fetchTasks('session-id');
      expect(result).toEqual(mockTasks);
      expect(result).toHaveLength(2);
    });
  });

  describe('createTask', () => {
    test('crée une tâche avec succès', async () => {
      const mockTask = { id: '1', title: 'Nouvelle tâche', session_id: 'session-id' };
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockTask, error: null }))
          }))
        }))
      });

      const result = await tasks.createTask('session-id', 'Nouvelle tâche');
      expect(result).toEqual(mockTask);
    });

    test('retourne null si erreur', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Erreur' } }))
          }))
        }))
      });

      const result = await tasks.createTask('session-id', 'Nouvelle tâche');
      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    test('retourne true si suppression réussie', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null }))
        }))
      });

      const result = await tasks.deleteTask('task-id');
      expect(result).toBe(true);
    });
  });
});

// ============================================
// TESTS VOTES
// ============================================

describe('Votes Service', () => {
  const votes = require('./src/services/votes');
  const { supabase: mockSupabase } = require('./src/lib/supabase');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchVotes', () => {
    test('retourne liste vide si aucun vote', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      });

      const result = await votes.fetchVotes('task-id');
      expect(result).toEqual([]);
    });

    test('retourne les votes si présents', async () => {
      const mockVotes = [
        { id: '1', task_id: 'task-id', participant_id: 'p1', value: 5 },
        { id: '2', task_id: 'task-id', participant_id: 'p2', value: 8 }
      ];
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockVotes, error: null }))
          }))
        }))
      });

      const result = await votes.fetchVotes('task-id');
      expect(result).toEqual(mockVotes);
      expect(result).toHaveLength(2);
    });
  });

  describe('resetVotes', () => {
    test('retourne true si réinitialisation réussie', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null }))
        }))
      });

      const result = await votes.resetVotes('task-id');
      expect(result).toBe(true);
    });

    test('retourne false si erreur', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: { message: 'Erreur' } }))
        }))
      });

      const result = await votes.resetVotes('task-id');
      expect(result).toBe(false);
    });
  });

  describe('deleteVote', () => {
    test('retourne true si suppression réussie', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null }))
          }))
        }))
      });

      const result = await votes.deleteVote('task-id', 'participant-id');
      expect(result).toBe(true);
    });
  });
});
