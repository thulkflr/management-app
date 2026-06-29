// app/members/page.js
'use client';
import { useAppContext } from '@/context/AppContext';
import { useState, useMemo } from 'react';
import ActionButtons from '@/components/ActionButtons';
import AppModal from '@/components/AppModal';
import Loader from '@/components/Loader';
import { Users2, Plus, X, Mail, TrendingUp } from 'lucide-react';

const INITIAL_FORM = { name: '', role: '', email: '', sharePercentage: '' };

const ROLES = ['Photographer', 'Videographer', 'Editor', 'Assistant', 'Manager', 'Partner'];

function MemberForm({ formData, setFormData }) {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Full Name</label>
                    <input required type="text" placeholder="e.g. Ahmad Khaled"
                        value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Role</label>
                    <input type="text" list="roles-list" placeholder="e.g. Photographer"
                        value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                        className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
                    <datalist id="roles-list">{ROLES.map(r => <option key={r} value={r} />)}</datalist>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Email</label>
                    <input type="email" placeholder="member@example.com"
                        value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Profit Share %</label>
                    <input required type="number" min="0" max="100" step="0.1" placeholder="e.g. 25"
                        value={formData.sharePercentage} onChange={e => setFormData(p => ({ ...p, sharePercentage: e.target.value }))}
                        className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold" />
                </div>
            </div>
        </div>
    );
}

export default function Members() {
    const { data, loading, addRecord, updateRecord, deleteRecord, netProfit } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

    const totalShare = useMemo(() =>
        data.members.reduce((sum, m) => sum + Number(m.sharePercentage || 0), 0),
        [data.members]
    );

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
            setFormData(INITIAL_FORM);
        } catch (err) {
            alert('❌ ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (member) => {
        if (confirm(`Delete ${member.name}?`)) {
            try { await deleteRecord('Members', member.id); }
            catch (err) { alert('❌ ' + err.message); }
        }
    };

    const openEdit = (member) => {
        setFormData({ name: member.name || '', role: member.role || '', email: member.email || '', sharePercentage: member.sharePercentage || '' });
        setModalConfig({ isOpen: true, type: 'edit', data: member });
    };

    const openView = (member) => setModalConfig({ isOpen: true, type: 'view', data: member });

    if (loading) return (
        <div className="h-full p-6 md:p-8 space-y-6 animate-pulse">
            <div className="h-8 w-40 bg-brand-gold/10 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-40 bg-brand-gold/10 rounded-3xl" />)}
            </div>
        </div>
    );

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-7 pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                                <Users2 size={18} />
                            </span>
                            Team Members
                        </h1>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1 ml-12">
                            {data.members.length} members · {totalShare}% total share allocated
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowForm(s => !s); setFormData(INITIAL_FORM); setModalConfig({ isOpen: false, type: null, data: null }); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-gold text-black px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? 'Cancel' : 'New Member'}
                    </button>
                </div>

                {/* Add form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="bg-card-bg p-6 md:p-8 rounded-3xl border border-card-border shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h2 className="text-base font-black text-foreground uppercase tracking-widest">New Member</h2>
                        <MemberForm formData={formData} setFormData={setFormData} />
                        <button disabled={isSaving} type="submit"
                            className="bg-foreground text-background p-4 rounded-2xl w-full font-black text-sm shadow-xl hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving && <Loader size={16} />}
                            {isSaving ? 'Saving...' : 'Add Member'}
                        </button>
                    </form>
                )}

                {/* Stats bar */}
                {data.members.length > 0 && (
                    <div className="bg-card-bg rounded-3xl border border-card-border p-5 flex flex-wrap gap-6">
                        <div>
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Net Profit</p>
                            <p className="text-xl font-black text-brand-gold">${Number(netProfit || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-px bg-card-border" />
                        <div>
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Members</p>
                            <p className="text-xl font-black text-foreground">{data.members.length}</p>
                        </div>
                        <div className="w-px bg-card-border" />
                        <div>
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Share Allocated</p>
                            <p className={`text-xl font-black ${totalShare > 100 ? 'text-red-400' : totalShare === 100 ? 'text-emerald-400' : 'text-foreground'}`}>{totalShare}%</p>
                        </div>
                    </div>
                )}

                {/* Grid */}
                {data.members.length === 0 ? (
                    <div className="py-28 bg-card-bg rounded-3xl border border-dashed border-card-border text-center text-foreground/30">
                        <Users2 size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-sm">No members yet</p>
                        <p className="text-xs mt-1 font-medium">Add team members to track roles and profit shares.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.members.map(member => {
                            const share = Number(member.sharePercentage || 0);
                            const amount = (Number(netProfit || 0) * share / 100);
                            return (
                                <div key={member.id} className="bg-card-bg rounded-3xl border border-card-border hover:border-brand-gold/25 hover:shadow-xl hover:shadow-brand-gold/5 transition-all duration-300 overflow-hidden group flex flex-col">
                                    <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, var(--brand-gold) ${share}%, transparent ${share}%)`, opacity: 0.5 }} />
                                    <div className="p-5 flex flex-col flex-1">
                                        {/* Avatar + Name */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold flex items-center justify-center text-xl font-black group-hover:bg-brand-gold group-hover:text-black transition-colors duration-300 flex-shrink-0">
                                                {member.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-black text-base text-foreground group-hover:text-brand-gold transition-colors truncate">{member.name}</h3>
                                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{member.role || 'Partner'}</p>
                                                {member.email && (
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <Mail size={10} className="text-foreground/20 flex-shrink-0" />
                                                        <p className="text-[10px] text-foreground/30 font-medium truncate">{member.email}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Share bar */}
                                        <div className="space-y-1.5 mb-4">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest">Profit Share</p>
                                                <span className="text-xs font-black text-brand-gold">{share}%</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-background border border-card-border overflow-hidden">
                                                <div className="h-full bg-brand-gold rounded-full transition-all duration-500" style={{ width: `${Math.min(share, 100)}%` }} />
                                            </div>
                                        </div>

                                        {/* Bottom row */}
                                        <div className="mt-auto pt-4 border-t border-card-border flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest mb-0.5">Balance</p>
                                                <div className="flex items-center gap-1.5">
                                                    <TrendingUp size={12} className={amount >= 0 ? 'text-emerald-500' : 'text-red-400'} />
                                                    <p className={`font-black text-base ${amount >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                                        ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                            <ActionButtons onView={() => openView(member)} onEdit={() => openEdit(member)} onDelete={() => handleDelete(member)} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modals */}
            <AppModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ isOpen: false, type: null, data: null })}
                title={modalConfig.type === 'edit' ? 'Edit Member' : 'Member Details'}>
                {modalConfig.type === 'edit' ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <MemberForm formData={formData} setFormData={setFormData} />
                        <button disabled={isSaving} type="submit"
                            className="bg-brand-gold text-black p-4 rounded-2xl w-full font-black shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving && <Loader size={16} />}
                            {isSaving ? 'Updating...' : 'Update Member'}
                        </button>
                    </form>
                ) : modalConfig.data && (() => {
                    const m = modalConfig.data;
                    const share = Number(m.sharePercentage || 0);
                    const amount = (Number(netProfit || 0) * share / 100);
                    return (
                        <div className="space-y-5">
                            <div className="flex items-center gap-4 pb-5 border-b border-card-border">
                                <div className="w-20 h-20 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold flex items-center justify-center text-3xl font-black">
                                    {m.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-foreground">{m.name}</h3>
                                    <p className="text-foreground/40 font-black text-[10px] uppercase tracking-widest">{m.role || 'Partner'}</p>
                                    {m.email && (
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <Mail size={12} className="text-brand-gold/50" />
                                            <p className="text-xs text-foreground/50 font-medium">{m.email}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/3 p-4 rounded-2xl border border-card-border">
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-2">Profit Share</p>
                                    <p className="text-2xl font-black text-brand-gold">{share}%</p>
                                    <div className="mt-2 h-1 rounded-full bg-background border border-card-border overflow-hidden">
                                        <div className="h-full bg-brand-gold" style={{ width: `${Math.min(share, 100)}%` }} />
                                    </div>
                                </div>
                                <div className="bg-white/3 p-4 rounded-2xl border border-card-border">
                                    <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-2">Estimated Balance</p>
                                    <p className={`text-2xl font-black ${amount >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                        ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </AppModal>
        </div>
    );
}
