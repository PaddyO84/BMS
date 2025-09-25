import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { useAuth } from './useAuth';

export const useCollection = (collectionName, options) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const baseCollectionPath = `artifacts/${appId}/public/data/${collectionName}`;
        let q = query(collection(db, baseCollectionPath), where("ownerId", "==", user.uid));

        if (options?.orderBy) {
            q = query(q, ...options.orderBy.map(field => orderBy(field)));
        }

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                if (collectionName === 'jobs') {
                    results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                }

                setDocuments(results);
                setLoading(false);
            },
            (err) => {
                console.error(`Error fetching ${collectionName}:`, err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [collectionName, user, options]);

    return { documents, loading, error };
};