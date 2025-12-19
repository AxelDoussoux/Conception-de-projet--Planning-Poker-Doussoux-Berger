import { useEffect, useState } from 'react';
import { fetchTasks, subscribeToTasks } from '../services/tasks';
import type { Tasks } from '../lib/supabase';

export default function useTasks(sessionId?: string | null) {
    const [tasks, setTasks] = useState<Tasks[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!sessionId) {
            setTasks([]);
            return;
        }

        let unsub: (() => Promise<void>) | undefined;
        setLoading(true);

        void fetchTasks(sessionId)
            .then((data) => setTasks(data))
            .catch((err) => console.error('useTasks fetch error:', err))
            .finally(() => setLoading(false));

        unsub = subscribeToTasks(sessionId, (data) => setTasks(data));

        return () => {
            if (unsub) void unsub();
        };
    }, [sessionId]);

    const currentTask = tasks.find((t) => (t as any).is_current) ?? null;

    return { tasks, currentTask, loading } as const;
}
