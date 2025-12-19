import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { type Session, type Participant } from '../lib/supabase.ts';
import { findActiveSession, getSessionParticipants } from '../services/sessions';
import { findParticipantByName } from '../services/participants';

interface SessionContextType {
    currentSession: Session | null;
    currentParticipant: Participant | null;
    setCurrentSession: (session: Session | null) => void;
    setCurrentParticipant: (participant: Participant | null) => void;
    refreshNow: () => Promise<void>;
    startAutoRefresh: (intervalMs?: number) => void;
    stopAutoRefresh: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    // Charger les données depuis localStorage au démarrage
    const [currentSession, setCurrentSession] = useState<Session | null>(() => {
        const saved = localStorage.getItem('currentSession');
        return saved ? JSON.parse(saved) : null;
    });

    const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(() => {
        const saved = localStorage.getItem('currentParticipant');
        return saved ? JSON.parse(saved) : null;
    });

    // Ref pour timer d'auto-refresh
    const refreshTimerRef = useRef<number | null>(null);

    // Fonction pour rafraîchir immédiatement session et participant depuis la BDD
    async function refreshNow(): Promise<void> {
        try {
            if (currentSession) {
                const freshSession = await findActiveSession(currentSession.id);
                if (freshSession) {
                    // Ne met à jour que si les données ont changé
                    if (JSON.stringify(freshSession) !== JSON.stringify(currentSession)) {
                        setCurrentSession(freshSession);
                        console.log('Session rafraîchie (changement détecté)');
                    }
                    const participants = await getSessionParticipants(currentSession.id);
                    console.log('Participants rafraîchis:', participants?.length ?? 0);
                } else {
                    // session inactive / supprimée
                    console.log('Session inactive ou supprimée, nettoyage...');
                    setCurrentSession(null);
                    setCurrentParticipant(null);
                }
            }

            if (currentParticipant && currentSession) {
                // Ne rafraîchir le participant que s'il appartient à une session active
                const freshParticipant = await findParticipantByName(currentParticipant.name);
                if (freshParticipant) {
                    // Vérifier que le participant est toujours dans la session active
                    if (freshParticipant.session_id === currentSession.id) {
                        // Ne met à jour que si les données ont changé
                        if (JSON.stringify(freshParticipant) !== JSON.stringify(currentParticipant)) {
                            setCurrentParticipant(freshParticipant);
                            console.log('Participant rafraîchi (changement détecté)');
                        }
                    } else {
                        // Le participant n'est plus dans cette session
                        console.log('Participant déconnecté de la session');
                        setCurrentParticipant(null);
                    }
                } else {
                    setCurrentParticipant(null);
                }
            }
        } catch (error) {
            console.error('Erreur lors du rafraîchissement du contexte :', error);
        }
    }

    function startAutoRefresh(intervalMs: number = 5000): void {
        stopAutoRefresh();
        refreshTimerRef.current = window.setInterval(() => {
            void refreshNow();
        }, intervalMs);
        console.log('Auto-refresh démarré', { intervalMs });
    }

    function stopAutoRefresh(): void {
        if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
            refreshTimerRef.current = null;
            console.log('Auto-refresh arrêté');
        }
    }

    // Sauvegarder la session dans localStorage à chaque changement
    useEffect(() => {
        if (currentSession) {
            localStorage.setItem('currentSession', JSON.stringify(currentSession));
            console.log('Session sauvegardée dans localStorage:', {
                id: currentSession.id,
                name: currentSession.name,
                code: currentSession.code,
                is_active: currentSession.is_active
            });
        } else {
            localStorage.removeItem('currentSession');
            console.log('Session supprimée du localStorage');
        }
    }, [currentSession]);

    // Sauvegarder le participant dans localStorage à chaque changement
    useEffect(() => {
        if (currentParticipant) {
            localStorage.setItem('currentParticipant', JSON.stringify(currentParticipant));
            console.log('Participant sauvegardé dans localStorage:', {
                id: currentParticipant.id,
                name: currentParticipant.name,
                session_id: currentParticipant.session_id
            });
        } else {
            localStorage.removeItem('currentParticipant');
            console.log('Participant supprimé du localStorage');
        }
    }, [currentParticipant]);

    // Démarrer l'auto-refresh automatiquement quand une session est active
    useEffect(() => {
        if (currentSession) {
            startAutoRefresh(5000);
        } else {
            stopAutoRefresh();
        }
        return () => stopAutoRefresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSession]);

    return (
        <SessionContext.Provider value={{ currentSession, currentParticipant, setCurrentSession, setCurrentParticipant, refreshNow, startAutoRefresh, stopAutoRefresh }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within SessionProvider');
    }
    return context;
}