import { useState, useEffect } from 'react';

export function useTerminology(token: string) {
    const [terminology, setTerminology] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/terminology', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => { setTerminology(data.terminology); setLoading(false); });
    }, [token]);

    const getTerm = (key: string) => {
        if (!terminology) return key;
        return terminology[key.toLowerCase()] || key;
    };

    return { terminology, getTerm, loading };
}
