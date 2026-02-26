import { useEffect, useRef } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function TimeTracker() {
    const { user } = useAuth();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'student') return;

        const recordTime = async () => {
            try {
                await api.post('/student/activity', { minutes: 1 });
                // console.log("Recorded 1 minute of activity");
            } catch (err) {
                console.error("Failed to record activity", err);
            }
        };

        // Record every 60 seconds
        intervalRef.current = setInterval(recordTime, 60000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [user]);

    return null; // Renderless component
}
