import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Session, type Participant } from '../lib/supabase.ts';

interface SessionContextType {
    currentSession: Session | null;
    currentParticipant: Participant | null;
    setCurrentSession: (session: Session | null) => void;
    setCurrentParticipant: (participant: Participant | null) => void;
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

    return (
        <SessionContext.Provider value={{ currentSession, currentParticipant, setCurrentSession, setCurrentParticipant }}>
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