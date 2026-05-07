// context/AppContext.js
'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [data, setData] = useState({
        members: [],
        transactions: [],
        projects: [],
        ideas: [],
        checklist: [],
    });
    const [loading, setLoading] = useState(true);
    const [, setError] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [membersRes, txRes, projectsRes, ideasRes, checklistRes] = await Promise.all([
                fetch('/api/data?type=Members'),
                fetch('/api/data?type=Transactions'),
                fetch('/api/data?type=Projects'),
                fetch('/api/data?type=Ideas'),
                fetch('/api/data?type=Checklist'),
            ]);

            const [members, transactionsRaw, projects, ideas, checklist] = await Promise.all([
                membersRes.json(),
                txRes.json(),
                projectsRes.json(),
                ideasRes.json(),
                checklistRes.json(),
            ]);

            // Normalize: Handle cases where the spreadsheet header might be 'numberId' instead of 'memberId'
            const transactions = transactionsRaw.map(tx => ({
                ...tx,
                memberId: tx.memberId || tx.numberId // Map both to memberId for app consistency
            }));

            setData({ members, transactions, projects, ideas, checklist });
        } catch (err) {
            console.error("Failed to load data", err);
            setError(err.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, []);

    const getKeyForType = (type) => {
        switch (type) {
            case 'Members': return 'members';
            case 'Transactions': return 'transactions';
            case 'Projects': return 'projects';
            case 'Ideas': return 'ideas';
            case 'Checklist': return 'checklist';
            default: return null;
        }
    };

    const addRecord = async (type, payload, options = {}) => {
        const { reload = true, optimistic = false } = options;
        const newRecord = {
            ...payload,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            ...(payload.memberId ? { numberId: payload.memberId } : {})
        };

        const key = getKeyForType(type);
        if (optimistic && key) {
            setData(prev => ({
                ...prev,
                [key]: [...(Array.isArray(prev[key]) ? prev[key] : []), newRecord],
            }));
        }

        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, payload: newRecord }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            if (optimistic && key) {
                setData(prev => ({
                    ...prev,
                    [key]: (Array.isArray(prev[key]) ? prev[key] : []).filter(r => r.id !== newRecord.id),
                }));
            }
            throw new Error(err.error || `Failed to save ${type}`);
        }
        if (reload) await loadData();
    };

    const updateRecord = async (type, id, payload, options = {}) => {
        const { reload = true, optimistic = false } = options;
        const key = getKeyForType(type);

        if (optimistic && key) {
            setData(prev => {
                const list = Array.isArray(prev[key]) ? prev[key] : [];
                return {
                    ...prev,
                    [key]: list.map(r => (r.id === id ? { ...r, ...payload } : r)),
                };
            });
        }

        const res = await fetch('/api/data', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, id, payload }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            if (optimistic && key) {
                // fallback: refetch to guarantee correctness
                await loadData();
            }
            throw new Error(err.error || `Failed to update ${type}`);
        }
        if (reload) await loadData();
    };

    const deleteRecord = async (type, id, options = {}) => {
        const { reload = true, optimistic = false } = options;
        const key = getKeyForType(type);

        if (optimistic && key) {
            setData(prev => ({
                ...prev,
                [key]: (Array.isArray(prev[key]) ? prev[key] : []).filter(r => r.id !== id),
            }));
        }

        const res = await fetch('/api/data', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, id }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            if (optimistic && key) {
                await loadData();
            }
            throw new Error(err.error || `Failed to delete ${type}`);
        }
        if (reload) await loadData();
    };

    // Financial Computations
    const totalIncome = data.transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpenses = data.transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalCapital = data.transactions.filter(t => t.type === 'capital').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const netProfit = totalIncome - totalExpenses;
    const remainingMoney = totalCapital + netProfit;

    return (
        <AppContext.Provider value={{
            data,
            loading,
            addRecord,
            updateRecord,
            deleteRecord,
            totalIncome,
            totalExpenses,
            totalCapital,
            netProfit,
            remainingMoney
        }}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => useContext(AppContext);


