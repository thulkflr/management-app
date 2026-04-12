// app/wallet/page.js
'use client';
import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';
import ActionButtons from '@/components/ActionButtons';
import AppModal from '@/components/AppModal';
import Loader from '@/components/Loader';

export default function Wallet() {
    const { data, loading, addRecord, updateRecord, deleteRecord, totalIncome, totalExpenses, totalCapital, netProfit } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ description: '', amount: '', type: 'income', memberId: '', date: new Date().toISOString().split('T')[0] });
    const [isSaving, setIsSaving] = useState(false);

    // Modal state
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (modalConfig.type === 'edit') {
                await updateRecord('Transactions', modalConfig.data.id, formData);
                setModalConfig({ isOpen: false, type: null, data: null });
            } else {
                await addRecord('Transactions', {
                    ...formData,
                    date: formData.date || new Date().toISOString().split('T')[0],
                });
            }
            setShowForm(false);
            setFormData({ description: '', amount: '', type: 'income', memberId: '', date: new Date().toISOString().split('T')[0] });
        } catch (err) {
            alert('❌ فشل الحفظ: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (tx) => {
        if (confirm(`Are you sure you want to delete this transaction: "${tx.description}"?`)) {
            try {
                await deleteRecord('Transactions', tx.id);
            } catch (err) {
                alert('❌ فشل الحذف: ' + err.message);
            }
        }
    };

    const openEdit = (tx) => {
        setFormData({ ...tx });
        setModalConfig({ isOpen: true, type: 'edit', data: tx });
    };

    const openView = (tx) => {
        setModalConfig({ isOpen: true, type: 'view', data: tx });
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
                    onClick={() => {
                        setShowForm(!showForm);
                        setFormData({ description: '', amount: '', type: 'income', memberId: '', date: new Date().toISOString().split('T')[0] });
                        setModalConfig({ isOpen: false, type: null, data: null });
                    }}
                    className="w-full sm:w-auto bg-brand-gold text-black px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    {showForm ? 'Cancel' : '+ New Transaction'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card-bg p-4 rounded-2xl shadow-sm border border-card-border overflow-hidden">
                    <p className="text-[9px] text-foreground/30 font-black uppercase tracking-widest">Income</p>
                    <p className="text-xl font-black text-emerald-500 mt-1">${totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-card-bg p-4 rounded-2xl shadow-sm border border-card-border overflow-hidden">
                    <p className="text-[9px] text-foreground/30 font-black uppercase tracking-widest">Expenses</p>
                    <p className="text-xl font-black text-red-500 mt-1">${totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-card-bg p-4 rounded-2xl shadow-sm border border-card-border border-l-2 border-l-brand-gold overflow-hidden">
                    <p className="text-[9px] text-foreground/30 font-black uppercase tracking-widest">Capital</p>
                    <p className="text-xl font-black text-brand-gold mt-1">${totalCapital.toLocaleString()}</p>
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${netProfit >= 0 ? 'bg-emerald-600' : 'bg-red-600'} text-white overflow-hidden`}>
                    <p className="text-[9px] font-black opacity-60 uppercase tracking-widest">Profit</p>
                    <p className="text-xl font-black mt-1">${netProfit.toLocaleString()}</p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Date</label>
                            <input
                                required
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            />
                        </div>
                    </div>
                    <button
                        disabled={isSaving}
                        type="submit"
                        className="bg-foreground text-background p-3.5 rounded-xl w-full font-bold shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving && <Loader size={18} />}
                        {isSaving ? 'Saving...' : 'Save Transaction'}
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
                            <div key={tx.id} className="bg-card-bg p-5 rounded-2xl shadow-sm border border-card-border space-y-3 relative group">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-sm text-foreground truncate group-hover:text-brand-gold transition-colors">{tx.description}</h3>
                                        <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mt-1">{tx.date}</p>
                                    </div>
                                    <p className={`font-black text-base whitespace-nowrap ${tx.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {tx.type === 'expense' ? '-' : '+'}${Number(tx.amount).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-card-border">
                                    <div className="flex gap-2 items-center">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/10 italic">
                                            {member ? member.name : 'General'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            tx.type === 'capital' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' :
                                                'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                            {tx.type}
                                        </span>
                                    </div>
                                    <ActionButtons
                                        onView={() => openView(tx)}
                                        onEdit={() => openEdit(tx)}
                                        onDelete={() => handleDelete(tx)}
                                    />
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
                            <th className="text-right p-4 font-bold text-foreground/40 uppercase tracking-widest text-[10px]">Actions</th>
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
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ActionButtons
                                                onView={() => openView(tx)}
                                                onEdit={() => openEdit(tx)}
                                                onDelete={() => handleDelete(tx)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <AppModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ isOpen: false, type: null, data: null })}
                title={modalConfig.type === 'edit' ? 'Edit Transaction' : 'Transaction Details'}
            >
                {modalConfig.type === 'edit' ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground/70">Description</label>
                                <input
                                    required
                                    type="text"
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground/70">Date</label>
                                <input
                                    required
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                                />
                            </div>
                        </div>
                        <button
                            disabled={isSaving}
                            type="submit"
                            className="bg-brand-gold text-black p-3.5 rounded-xl w-full font-bold shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving && <Loader size={18} />}
                            {isSaving ? 'Updating...' : 'Update Transaction'}
                        </button>
                    </form>
                ) : modalConfig.data && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-bold text-foreground">{modalConfig.data.description}</h3>
                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${modalConfig.data.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                modalConfig.data.type === 'capital' ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' :
                                    'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                {modalConfig.data.type}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-card-border">
                                <p className="text-xs font-bold text-foreground/30 uppercase mb-1">Amount</p>
                                <p className={`text-xl font-black ${modalConfig.data.type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {modalConfig.data.type === 'expense' ? '-' : '+'}${Number(modalConfig.data.amount).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-card-border">
                                <p className="text-xs font-bold text-foreground/30 uppercase mb-1">Date</p>
                                <p className="text-xl font-black text-foreground">{modalConfig.data.date}</p>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-card-border">
                            <p className="text-xs font-bold text-foreground/30 uppercase mb-1">Contributor</p>
                            <p className="text-lg font-bold text-brand-gold">
                                {data.members.find(m => m.id === modalConfig.data.memberId)?.name || 'General'}
                            </p>
                        </div>
                    </div>
                )}
            </AppModal>
        </div>
    );
}
