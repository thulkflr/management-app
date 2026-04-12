// app/members/page.js
'use client';
import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';
import ActionButtons from '@/components/ActionButtons';
import AppModal from '@/components/AppModal';
import Loader from '@/components/Loader';

export default function Members() {
    const { data, loading, addRecord, updateRecord, deleteRecord, netProfit } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', role: '', sharePercentage: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Modal state
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (modalConfig.type === 'edit') {
                await updateRecord('Members', modalConfig.data.id, formData);
                setModalConfig({ isOpen: false, type: null, data: null });
            } else {
                await addRecord('Members', formData);
            }
            setShowForm(false);
            setFormData({ name: '', role: '', sharePercentage: '' });
        } catch (err) {
            alert('❌ فشل الحفظ: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (member) => {
        if (confirm(`Are you sure you want to delete ${member.name}?`)) {
            try {
                await deleteRecord('Members', member.id);
            } catch (err) {
                alert('❌ فشل الحذف: ' + err.message);
            }
        }
    };

    const openEdit = (member) => {
        setFormData({ name: member.name, role: member.role, sharePercentage: member.sharePercentage });
        setModalConfig({ isOpen: true, type: 'edit', data: member });
    };

    const openView = (member) => {
        setModalConfig({ isOpen: true, type: 'view', data: member });
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto p-4 space-y-6">
            <div className="h-10 w-48 bg-brand-gold/10 animate-pulse rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-brand-gold/10 animate-pulse rounded-2xl"></div>)}
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Members</h1>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setFormData({ name: '', role: '', sharePercentage: '' });
                        setModalConfig({ isOpen: false, type: null, data: null });
                    }}
                    className="w-full sm:w-auto bg-brand-gold text-black px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    {showForm ? 'Cancel' : '+ New Member'}
                </button>
            </div>

            {/* Add Member Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-card-bg p-5 md:p-8 rounded-2xl border border-card-border shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold text-foreground">New Member</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Full Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Ahmad Khaled"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Role</label>
                            <input
                                type="text"
                                placeholder="e.g. Photographer"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Share %</label>
                            <input
                                required
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="10"
                                value={formData.sharePercentage}
                                onChange={e => setFormData({ ...formData, sharePercentage: e.target.value })}
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
                        {isSaving ? 'Saving...' : 'Save Member'}
                    </button>
                </form>
            )}

            {/* Members Grid */}
            {data.members.length === 0 ? (
                <div className="text-center py-20 bg-card-bg rounded-2xl border border-card-border text-foreground/40">
                    <p className="text-lg">No members yet.</p>
                    <p className="text-sm">Add your first business partner to start tracking roles and shares.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {data.members.map(member => {
                        const shareAmount = (netProfit * (Number(member.sharePercentage) / 100)).toFixed(2);
                        return (
                            <div key={member.id} className="bg-card-bg p-6 rounded-2xl shadow-sm border border-card-border hover:shadow-xl hover:border-brand-gold/30 transition-all group relative">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 text-brand-gold flex items-center justify-center text-xl font-black group-hover:bg-brand-gold group-hover:text-black transition-colors duration-300 border border-brand-gold/20">
                                        {member.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-foreground truncate group-hover:text-brand-gold transition-colors">{member.name}</h3>
                                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">{member.role || 'Partner'}</p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-card-border flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mb-1">Profit Share</p>
                                        <p className="text-brand-gold font-black text-base">{member.sharePercentage}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mb-1">Current Balance</p>
                                        <p className={`font-black text-xl ${Number(shareAmount) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            ${Number(shareAmount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-card-border flex justify-end">
                                    <ActionButtons
                                        onView={() => openView(member)}
                                        onEdit={() => openEdit(member)}
                                        onDelete={() => handleDelete(member)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            <AppModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ isOpen: false, type: null, data: null })}
                title={modalConfig.type === 'edit' ? 'Edit Member' : 'Member Details'}
            >
                {modalConfig.type === 'edit' ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Full Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Role</label>
                            <input
                                type="text"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground/70">Share %</label>
                            <input
                                required
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.sharePercentage}
                                onChange={e => setFormData({ ...formData, sharePercentage: e.target.value })}
                                className="block w-full rounded-xl border border-card-border p-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition"
                            />
                        </div>
                        <button
                            disabled={isSaving}
                            type="submit"
                            className="bg-brand-gold text-black p-3.5 rounded-xl w-full font-bold shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving && <Loader size={18} />}
                            {isSaving ? 'Updating...' : 'Update Member'}
                        </button>
                    </form>
                ) : modalConfig.data && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-brand-gold/10 text-brand-gold flex items-center justify-center text-3xl font-black border border-brand-gold/20">
                                {modalConfig.data.name?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">{modalConfig.data.name}</h3>
                                <p className="text-foreground/40 font-medium uppercase tracking-widest">{modalConfig.data.role || 'Partner'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-card-border">
                                <p className="text-xs font-bold text-foreground/30 uppercase mb-1">Profit Share</p>
                                <p className="text-xl font-black text-brand-gold">{modalConfig.data.sharePercentage}%</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-card-border">
                                <p className="text-xs font-bold text-foreground/30 uppercase mb-1">Estimated Balance</p>
                                <p className="text-xl font-black text-emerald-500">
                                    ${(netProfit * (Number(modalConfig.data.sharePercentage) / 100)).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </AppModal>
        </div>
    );
}
