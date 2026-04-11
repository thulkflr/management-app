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

    if (loading) return <div className="animate-pulse">Loading wallet...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Wallet & Capital</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                    + New Transaction
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Income</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">${totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">${totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-indigo-500">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Capital</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">${totalCapital.toLocaleString()}</p>
                </div>
                <div className={`p-5 rounded-xl shadow-sm text-white ${netProfit >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    <p className="text-xs font-medium opacity-90 uppercase tracking-wider">Net Profit</p>
                    <p className="text-2xl font-bold mt-1">${netProfit.toLocaleString()}</p>
                </div>
            </div>

            {/* Add Transaction Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold">New Transaction</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <input
                                required
                                type="text"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-slate-300 p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Contributor / Member</label>
                            <select
                                value={formData.memberId}
                                onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-slate-300 p-2"
                            >
                                <option value="">General (No Member)</option>
                                {data.members.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Amount ($)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-slate-300 p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-slate-300 p-2"
                            >
                                <option value="income">Business Income</option>
                                <option value="expense">Business Expense</option>
                                <option value="capital">Capital Contribution (رأس مال)</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg w-full">
                        Save Transaction
                    </button>
                </form>
            )}

            {/* Transactions List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="text-left p-4 font-medium text-slate-600">Description</th>
                            <th className="text-left p-4 font-medium text-slate-600">Contributor</th>
                            <th className="text-left p-4 font-medium text-slate-600">Date</th>
                            <th className="text-left p-4 font-medium text-slate-600">Type</th>
                            <th className="text-right p-4 font-medium text-slate-600">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center p-8 text-slate-400">No transactions yet</td>
                            </tr>
                        ) : (
                            data.transactions.map(tx => {
                                const member = data.members.find(m => m.id === tx.memberId);
                                return (
                                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                                        <td className="p-4 font-medium">{tx.description}</td>
                                        <td className="p-4 text-slate-600">{member ? member.name : '-'}</td>
                                        <td className="p-4 text-slate-500">{tx.date}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' :
                                                    tx.type === 'capital' ? 'bg-indigo-100 text-indigo-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {tx.type === 'capital' ? 'CAPITAL' : tx.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className={`p-4 text-right font-bold ${tx.type === 'expense' ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {tx.type === 'expense' ? '-' : '+'}${Number(tx.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
