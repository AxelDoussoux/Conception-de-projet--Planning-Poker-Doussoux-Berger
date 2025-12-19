import { useEffect, useState } from 'react';
import { fetchVotes, subscribeToVotes } from '../services/votes';
import type { Votes } from '../lib/supabase';

export default function useVotes(taskId?: string | null) {
    const [votes, setVotes] = useState<Votes[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!taskId) {
            setVotes([]);
            return;
        }

        let unsub: (() => Promise<void>) | undefined;
        setLoading(true);

        void fetchVotes(taskId)
            .then((data) => setVotes(data))
            .catch((err) => console.error('useVotes fetch error:', err))
            .finally(() => setLoading(false));

        unsub = subscribeToVotes(taskId, (data) => setVotes(data));

        return () => {
            if (unsub) void unsub();
        };
    }, [taskId]);

    return { votes, loading } as const;
}
