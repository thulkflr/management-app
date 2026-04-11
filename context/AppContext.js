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

    const loadData = async () => {
        setLoading(true);
        try {
            const [membersRes, txRes, projectsRes] = await Promise.all([
                fetch('/api/data?type=Members'),
                fetch('/api/data?type=Transactions'),
                fetch('/api/data?type=Projects')
            ]);

            setData({
                members: await membersRes.json(),
                transactions: await txRes.json(),
                projects: await projectsRes.json()
            });
        } catch (error) {
            console.error("Failed to load data", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const addRecord = async (type, payload) => {
        // Generate simple ID
        const newRecord = { ...payload, id: Date.now().toString() };
        await fetch('/api/data', {
            method: 'POST',
            body: JSON.stringify({ type, payload: newRecord })
        });
        // Refresh local state to reflect DB
        await loadData();
    };

    // Financial Computations
    const totalIncome = data.transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpenses = data.transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const netProfit = totalIncome - totalExpenses;

    return (
        <AppContext.Provider value={{ data, loading, addRecord, totalIncome, totalExpenses, netProfit }}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => useContext(AppContext);