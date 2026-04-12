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
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [membersRes, txRes, projectsRes, ideasRes] = await Promise.all([
                fetch('/api/data?type=Members'),
                fetch('/api/data?type=Transactions'),
                fetch('/api/data?type=Projects'),
                fetch('/api/data?type=Ideas')
            ]);

            const [members, transactionsRaw, projects, ideas] = await Promise.all([
                membersRes.json(),
                txRes.json(),
                projectsRes.json(),
                ideasRes.json(),
            ]);

            // Normalize: Handle cases where the spreadsheet header might be 'numberId' instead of 'memberId'
            const transactions = transactionsRaw.map(tx => ({
                ...tx,
                memberId: tx.memberId || tx.numberId // Map both to memberId for app consistency
            }));

            setData({ members, transactions, projects, ideas });
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
        const newRecord = {
            ...payload,
            id: Date.now().toString(),
            ...(payload.memberId ? { numberId: payload.memberId } : {})
        };
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, payload: newRecord }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Failed to save ${type}`);
        }
        await loadData();
    };

    const updateRecord = async (type, id, payload) => {
        const res = await fetch('/api/data', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, id, payload }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Failed to update ${type}`);
        }
        await loadData();
    };

    const deleteRecord = async (type, id) => {
        const res = await fetch('/api/data', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, id }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Failed to delete ${type}`);
        }
        await loadData();
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


