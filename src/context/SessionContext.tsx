import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Session, type Participant } from '../lib/supabase.ts';

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