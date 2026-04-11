// app/wallet/page.js
'use client';
import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';

export default function Wallet() {
    const { data, loading, addRecord, totalIncome, totalExpenses, totalCapital, netProfit } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ description: '', amount: '', type: 'income', memberId: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addRecord('Transactions', {
                ...formData,
                date: new Date().toISOString().split('T')[0],
            });
            setShowForm(false);
            setFormData({ description: '', amount: '', type: 'income', memberId: '' });
        } catch (err) {
            alert('❌ فشل الحفظ: ' + err.message);
        }
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto p-4 space-y-4">
            <div className="h-8 w-48 bg-brand-gold/10 animate-pulse rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-brand-gold/10 animate-pulse rounded-xl"></div>)}
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Wallet & Capital</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="w-full sm:w-auto bg-brand-gold text-black px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    {showForm ? 'Cancel' : '+ New Transaction'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card-bg p-5 rounded-2xl shadow-sm border border-card-border">
                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">Total Income</p>
                    <p className="text-2xl font-black text-emerald-500 mt-2">${totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-card-bg p-5 rounded-2xl shadow-sm border border-card-border">
                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">Total Expenses</p>
                    <p className="text-2xl font-black text-red-500 mt-2">${totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-card-bg p-5 rounded-2xl shadow-sm border border-card-border border-l-4 border-l-brand-gold">
                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">Total Capital</p>
                    <p className="text-2xl font-black text-brand-gold mt-2">${totalCapital.toLocaleString()}</p>
                </div>
                <div className={`p-5 rounded-2xl shadow-sm ${netProfit >= 0 ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider">Net Profit</p>
                    <p className="text-2xl font-black mt-2">${netProfit.toLocaleString()}</p>
                </div>
            </div>

            {/* Add Transaction Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-card-bg p-5 md:p-8 rounded-2xl border border-card-border shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h2 className="text-xl font-bold text-foreground">New Transaction</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Description</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Wedding Shoot Payment"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Contributor / Member</label>
                            <select
                                value={formData.memberId}
                                onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            >
                                <option value="">General (No Member)</option>
                                {data.members.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Amount ($)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            >
                                <option value="income">Business Income</option>
                                <option value="expense">Business Expense</option>
                                <option value="capital">Capital Contribution (رأس مال)</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="bg-foreground text-background p-3.5 rounded-xl w-full font-bold shadow-lg hover:opacity-90 transition active:scale-95">
                        Save Transaction
                    </button>
                </form>
            )}

            {/* Transactions Header */}
            <h2 className="text-xl font-bold text-foreground px-1 tracking-tight">History</h2>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
                {data.transactions.length === 0 ? (
                    <div className="text-center p-12 bg-card-bg rounded-2xl border border-card-border text-foreground/40 italic">No history found</div>
                ) : (
                    data.transactions.map(tx => {
                        const member = data.members.find(m => m.id === tx.memberId);
                        return (
                            <div key={tx.id} className="bg-card-bg p-5 rounded-2xl shadow-sm border border-card-border space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-foreground">{tx.description}</h3>
                                        <p className="text-xs text-foreground/40 mt-0.5">{tx.date}</p>
                                    </div>
                                    <p className={`font-black text-lg ${tx.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {tx.type === 'expense' ? '-' : '+'}${Number(tx.amount).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-card-border">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/10 italic">
                                        {member ? member.name : 'General'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                        tx.type === 'capital' ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' :
                                            'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                        {tx.type}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block bg-card-bg rounded-2xl shadow-sm border border-card-border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-background/50 border-b border-card-border">
                        <tr>
                            <th className="text-left p-4 font-bold text-foreground/40 uppercase tracking-widest text-[10px]">Description</th>
                            <th className="text-left p-4 font-bold text-foreground/40 uppercase tracking-widest text-[10px]">Contributor</th>
                            <th className="text-left p-4 font-bold text-foreground/40 uppercase tracking-widest text-[10px]">Date</th>
                            <th className="text-left p-4 font-bold text-foreground/40 uppercase tracking-widest text-[10px]">Type</th>
                            <th className="text-right p-4 font-bold text-foreground/40 uppercase tracking-widest text-[10px]">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                        {data.transactions.map(tx => {
                            const member = data.members.find(m => m.id === tx.memberId);
                            return (
                                <tr key={tx.id} className="hover:bg-background/50 transition-colors group">
                                    <td className="p-4 font-bold text-foreground group-hover:text-brand-gold transition-colors">{tx.description}</td>
                                    <td className="p-4 text-foreground/60 font-medium">{member ? member.name : '-'}</td>
                                    <td className="p-4 text-foreground/40 font-mono text-[11px]">{tx.date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            tx.type === 'capital' ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' :
                                                'bg-red-500/10 text-red-500 border border-red-500/20'
                                            }`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className={`p-4 text-right font-black text-base ${tx.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {tx.type === 'expense' ? '-' : '+'}${Number(tx.amount).toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
