import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type Session, type Participant } from '../lib/supabase';

interface SessionContextType {
    currentSession: Session | null;
    currentParticipant: Participant | null;
    setCurrentSession: (session: Session | null) => void;
    setCurrentParticipant: (participant: Participant | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);

    // Log quand la session change
    useEffect(() => {
        if (currentSession) {
            console.log('✅ Session mise à jour:', {
                id: currentSession.id,
                name: currentSession.name,
                code: currentSession.code,
                is_active: currentSession.is_active
            });
        } else {
            console.log('❌ Session réinitialisée (null)');
        }
    }, [currentSession]);

    // Log quand le participant change
    useEffect(() => {
        if (currentParticipant) {
            console.log('👤 Participant mis à jour:', {
                id: currentParticipant.id,
                name: currentParticipant.name,
                session_id: currentParticipant.session_id
            });
        } else {
            console.log('👤 Participant réinitialisé (null)');
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

