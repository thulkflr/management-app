'use client';
import { useMemo, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ActionButtons from '@/components/ActionButtons';
import AppModal from '@/components/AppModal';
import Loader from '@/components/Loader';
import { CheckCircle2, Circle, ListChecks, RefreshCcw, Search, Tag, Plus, Boxes } from 'lucide-react';

const INITIAL_FORM_DATA = {
    name: '',
    category: 'Camera',
    quantity: 1,
    notes: '',
    isPacked: false,
};

function normalizeBool(value) {
    if (typeof value === 'boolean') return value;
    if (value == null) return false;
    const s = String(value).trim().toLowerCase();
    return s === 'true' || s === 'yes' || s === '1' || s === 'packed' || s === 'done';
}

export default function ChecklistPage() {
    const { data, loading, addRecord, updateRecord, deleteRecord } = useAppContext();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [isSaving, setIsSaving] = useState(false);
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');

    // Modal state
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });

    const items = useMemo(() => {
        const raw = Array.isArray(data.checklist) ? data.checklist : [];
        const mapped = raw.map((it) => ({
            ...it,
            quantity: it.quantity === '' || it.quantity == null ? 1 : Number(it.quantity),
            isPacked: normalizeBool(it.isPacked),
        }));

        const q = query.trim().toLowerCase();
        return mapped
            .filter((it) => {
                if (category !== 'All' && String(it.category || '').trim() !== category) return false;
                if (!q) return true;
                const hay = `${it.name || ''} ${it.category || ''} ${it.notes || ''}`.toLowerCase();
                return hay.includes(q);
            })
            .sort((a, b) => {
                // Unpacked first, then alphabetical
                if (a.isPacked !== b.isPacked) return a.isPacked ? 1 : -1;
                return String(a.name || '').localeCompare(String(b.name || ''));
            });
    }, [data.checklist, query, category]);

    const categories = useMemo(() => {
        const set = new Set();
        (Array.isArray(data.checklist) ? data.checklist : []).forEach((it) => {
            const c = String(it.category || '').trim();
            if (c) set.add(c);
        });
        return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [data.checklist]);

    const packedCount = useMemo(() => items.filter(i => i.isPacked).length, [items]);
    const totalCount = items.length;
    const completion = totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                name: String(formData.name || '').trim(),
                category: String(formData.category || '').trim() || 'Other',
                notes: String(formData.notes || '').trim(),
                quantity: Math.max(1, Number(formData.quantity || 1)),
                isPacked: !!formData.isPacked,
                updatedAt: new Date().toISOString(),
            };

            if (!payload.name) throw new Error('Name is required');

            if (modalConfig.type === 'edit') {
                await updateRecord('Checklist', modalConfig.data.id, payload, { reload: false, optimistic: true });
                setModalConfig({ isOpen: false, type: null, data: null });
            } else {
                await addRecord('Checklist', payload, { reload: false, optimistic: true });
            }

            setShowForm(false);
            setFormData(INITIAL_FORM_DATA);
        } catch (err) {
            alert('❌ فشل الحفظ: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (confirm(`Delete "${item.name}" from checklist?`)) {
            try {
                await deleteRecord('Checklist', item.id, { reload: false, optimistic: true });
            } catch (err) {
                alert('❌ فشل الحذف: ' + err.message);
            }
        }
    };

    const togglePacked = async (item) => {
        try {
            await updateRecord('Checklist', item.id, {
                isPacked: !normalizeBool(item.isPacked),
                updatedAt: new Date().toISOString(),
            }, { reload: false, optimistic: true });
        } catch (err) {
            alert('❌ فشل التحديث: ' + err.message);
        }
    };

    const markAll = async (packed) => {
        const list = Array.isArray(data.checklist) ? data.checklist : [];
        if (list.length === 0) return;
        if (!confirm(packed ? 'Mark ALL items as packed?' : 'Reset ALL items to unpacked?')) return;

        setIsSaving(true);
        try {
            for (const item of list) {
                const current = normalizeBool(item.isPacked);
                if (current === packed) continue;
                // Sequential updates to avoid rate limits
                await updateRecord('Checklist', item.id, {
                    isPacked: packed,
                    updatedAt: new Date().toISOString(),
                }, { reload: false, optimistic: true });
            }
        } catch (err) {
            alert('❌ فشل العملية: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const openEdit = (item) => {
        setFormData({
            name: item.name || '',
            category: item.category || 'Other',
            quantity: item.quantity === '' || item.quantity == null ? 1 : Number(item.quantity),
            notes: item.notes || '',
            isPacked: normalizeBool(item.isPacked),
        });
        setModalConfig({ isOpen: true, type: 'edit', data: item });
    };

    const openView = (item) => setModalConfig({ isOpen: true, type: 'view', data: item });

    if (loading) return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            <div className="h-10 w-52 bg-brand-gold/10 animate-pulse rounded-lg"></div>
            <div className="h-40 bg-brand-gold/10 animate-pulse rounded-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-brand-gold/10 animate-pulse rounded-2xl"></div>)}
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                            <ListChecks className="text-brand-gold" size={24} />
                            Checklist
                        </h1>
                        <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">
                            Gear list to verify before each shoot
                        </p>
                    </div>
                    <div className="w-full sm:w-auto flex gap-2">
                        <button
                            onClick={() => markAll(true)}
                            disabled={isSaving || (Array.isArray(data.checklist) ? data.checklist.length : 0) === 0}
                            className="flex-1 sm:flex-none bg-foreground text-background px-4 py-3 rounded-2xl font-black text-xs shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader size={16} /> : <CheckCircle2 size={16} />}
                            Mark all packed
                        </button>
                        <button
                            onClick={() => markAll(false)}
                            disabled={isSaving || (Array.isArray(data.checklist) ? data.checklist.length : 0) === 0}
                            className="flex-1 sm:flex-none bg-brand-gold text-black px-4 py-3 rounded-2xl font-black text-xs shadow-lg shadow-brand-gold/20 hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <RefreshCcw size={16} />
                            Reset
                        </button>
                        <button
                            onClick={() => {
                                setShowForm(!showForm);
                                setFormData(INITIAL_FORM_DATA);
                                setModalConfig({ isOpen: false, type: null, data: null });
                            }}
                            className="w-full sm:w-auto bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-4 py-3 rounded-2xl font-black text-xs hover:bg-brand-gold hover:text-black transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {showForm ? 'Close' : <><Plus size={16} /> Add item</>}
                        </button>
                    </div>
                </div>

                {/* Progress + filters */}
                <div className="bg-card-bg border border-card-border rounded-3xl p-5 md:p-7 shadow-sm space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Boxes size={18} className="text-brand-gold" />
                                <p className="text-sm font-black text-foreground tracking-tight">
                                    Packed: <span className="text-brand-gold">{packedCount}</span> / {totalCount} ({completion}%)
                                </p>
                            </div>
                            <div className="w-full md:w-96 h-2 rounded-full bg-background border border-card-border overflow-hidden">
                                <div className="h-full bg-brand-gold" style={{ width: `${completion}%` }} />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <div className="relative flex-1 min-w-0">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search (name, category, notes)"
                                    className="w-full rounded-2xl border border-card-border pl-10 pr-3 py-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag size={16} className="text-foreground/30" />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="rounded-2xl border border-card-border px-3 py-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} className="bg-background/40 p-5 md:p-6 rounded-3xl border border-card-border space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Item name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Camera Body, Lens 24-70, Batteries..."
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Category</label>
                                        <input
                                            type="text"
                                            placeholder="Camera / Lenses / Lighting / Audio..."
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Qty</label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                            className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Notes</label>
                                <input
                                    type="text"
                                    placeholder="Optional: bag location, extra detail, owner..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                />
                            </div>

                            <button
                                disabled={isSaving}
                                type="submit"
                                className="bg-foreground text-background p-4 rounded-2xl w-full font-black text-sm shadow-xl hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving && <Loader size={18} />}
                                {isSaving ? 'Saving...' : (modalConfig.type === 'edit' ? 'Update item' : 'Add to checklist')}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.length === 0 ? (
                    <div className="col-span-full text-center py-24 bg-card-bg rounded-3xl border border-card-border text-foreground/40 italic">
                        No checklist items yet. Add your gear list and start packing.
                    </div>
                ) : (
                    items.map(item => (
                        <div
                            key={item.id}
                            className={`bg-card-bg p-5 rounded-3xl border transition-all flex items-start justify-between gap-4 ${item.isPacked ? 'border-emerald-500/20' : 'border-card-border hover:border-brand-gold/30 hover:shadow-xl'}`}
                        >
                            <button
                                type="button"
                                onClick={() => togglePacked(item)}
                                className="mt-1 flex-shrink-0 w-10 h-10 rounded-2xl border border-card-border bg-background flex items-center justify-center hover:scale-[1.02] active:scale-95 transition"
                                aria-label={item.isPacked ? 'Mark as unpacked' : 'Mark as packed'}
                            >
                                {item.isPacked ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} className="text-foreground/20" />}
                            </button>

                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className={`font-black tracking-tight text-base truncate ${item.isPacked ? 'text-foreground/50 line-through' : 'text-foreground'}`}>
                                            {item.name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/10 italic">
                                                {item.category || 'Other'}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30 bg-white/5 px-2 py-0.5 rounded border border-card-border">
                                                Qty: {Number.isFinite(item.quantity) ? item.quantity : 1}
                                            </span>
                                        </div>
                                    </div>
                                    <ActionButtons
                                        onView={() => openView(item)}
                                        onEdit={() => openEdit(item)}
                                        onDelete={() => handleDelete(item)}
                                    />
                                </div>

                                {item.notes && (
                                    <p className="text-xs text-foreground/50 leading-relaxed font-medium bg-white/5 p-3 rounded-2xl border border-card-border">
                                        {item.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            <AppModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ isOpen: false, type: null, data: null })}
                title={modalConfig.type === 'edit' ? 'Edit Checklist Item' : 'Checklist Item'}
            >
                {modalConfig.type === 'edit' ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Item name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Qty</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-foreground/50 uppercase tracking-widest">Notes</label>
                            <input
                                type="text"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none transition text-sm font-bold"
                            />
                        </div>
                        <button
                            disabled={isSaving}
                            type="submit"
                            className="bg-brand-gold text-black p-4 rounded-2xl w-full font-black shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving && <Loader size={18} />}
                            {isSaving ? 'Updating...' : 'Update Item'}
                        </button>
                    </form>
                ) : modalConfig.data && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start border-b border-card-border pb-5">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-foreground tracking-tight">{modalConfig.data.name}</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-gold/10 italic">
                                        {modalConfig.data.category || 'Other'}
                                    </span>
                                    <span className="px-3 py-1 bg-white/5 text-foreground/40 text-[10px] font-black uppercase tracking-widest rounded-full border border-card-border">
                                        Qty: {modalConfig.data.quantity || 1}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${normalizeBool(modalConfig.data.isPacked) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-foreground/5 text-foreground/40 border-card-border'}`}>
                                        {normalizeBool(modalConfig.data.isPacked) ? 'Packed' : 'Not packed'}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => togglePacked(modalConfig.data)}
                                className="px-4 py-2 rounded-2xl font-black text-xs border border-card-border bg-background hover:border-brand-gold/30 transition"
                            >
                                Toggle
                            </button>
                        </div>

                        {modalConfig.data.notes && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Notes</p>
                                <p className="text-sm font-medium text-foreground/70 leading-relaxed bg-white/5 p-4 rounded-2xl border border-card-border">
                                    {modalConfig.data.notes}
                                </p>
                            </div>
                        )}

                        {modalConfig.data.updatedAt && (
                            <div className="bg-white/5 p-4 rounded-2xl border border-card-border">
                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">Last update</p>
                                <p className="text-sm font-black text-foreground/60 font-mono">{String(modalConfig.data.updatedAt)}</p>
                            </div>
                        )}
                    </div>
                )}
            </AppModal>
        </div>
    );
}

