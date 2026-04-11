// context/AppContext.js
'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [data, setData] = useState({
        members: [],
        transactions: [],
        projects: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [membersRes, txRes, projectsRes] = await Promise.all([
                fetch('/api/data?type=Members'),
                fetch('/api/data?type=Transactions'),
                fetch('/api/data?type=Projects')
            ]);

            const [members, transactionsRaw, projects] = await Promise.all([
                membersRes.json(),
                txRes.json(),
                projectsRes.json(),
            ]);

            // Normalize: Handle cases where the spreadsheet header might be 'numberId' instead of 'memberId'
            const transactions = transactionsRaw.map(tx => ({
                ...tx,
                memberId: tx.memberId || tx.numberId // Map both to memberId for app consistency
            }));

            setData({ members, transactions, projects });
        } catch (err) {
            console.error("Failed to load data", err);
            setError(err.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const addRecord = async (type, payload) => {
        // Generate simple ID and handle memberId/numberId compatibility
        const newRecord = {
            ...payload,
            id: Date.now().toString(),
            // If it's a transaction, send both just in case the sheet header has a typo
            ...(payload.memberId ? { numberId: payload.memberId } : {})
        };
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // ← Fix: required for request.json()
            body: JSON.stringify({ type, payload: newRecord }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Failed to save ${type}`);
        }
        // Refresh local state to reflect DB
        await loadData();
    };

    // Financial Computations
    const totalIncome = data.transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpenses = data.transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalCapital = data.transactions.filter(t => t.type === 'capital').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const netProfit = totalIncome - totalExpenses;

    return (
        <AppContext.Provider value={{ data, loading, addRecord, totalIncome, totalExpenses, totalCapital, netProfit }}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => useContext(AppContext);


