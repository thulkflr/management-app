'use client';
import { useMemo, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ActionButtons from '@/components/ActionButtons';
import AppModal from '@/components/AppModal';
import Loader from '@/components/Loader';
import {
    CheckCircle2, Circle, ListChecks, RefreshCcw, Plus, ChevronDown,
    ChevronRight, Pencil, Trash2, FolderPlus, Check, X
} from 'lucide-react';

function normalizeBool(value) {
    if (typeof value === 'boolean') return value;
    if (value == null) return false;
    const s = String(value).trim().toLowerCase();
    return s === 'true' || s === 'yes' || s === '1' || s === 'packed' || s === 'done';
}

export default function ChecklistPage() {
    const { data, loading, addRecord, updateRecord, deleteRecord } = useAppContext();
    const [isSaving, setIsSaving] = useState(false);

    // Sections
    const [pendingSections, setPendingSections] = useState([]);
    const [collapsedSections, setCollapsedSections] = useState(new Set());
    const [newSectionInput, setNewSectionInput] = useState('');
    const [showNewSectionInput, setShowNewSectionInput] = useState(false);
    const [renamingSection, setRenamingSection] = useState(null);
    const [renameValue, setRenameValue] = useState('');

    // Per-section add form
    const [addItemSection, setAddItemSection] = useState(null);
    const [addItemForm, setAddItemForm] = useState({ name: '', quantity: 1, notes: '' });

    // Edit modal
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, data: null });
    const [editForm, setEditForm] = useState({ name: '', category: '', quantity: 1, notes: '' });

    const allItems = useMemo(() => {
        const raw = Array.isArray(data.checklist) ? data.checklist : [];
        return raw.map(it => ({
            ...it,
            quantity: it.quantity === '' || it.quantity == null ? 1 : Number(it.quantity),
            isPacked: normalizeBool(it.isPacked),
        }));
    }, [data.checklist]);

    const dbSectionNames = useMemo(() => {
        const set = new Set();
        allItems.forEach(it => {
            const c = String(it.category || '').trim();
            if (c) set.add(c);
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [allItems]);

    const allSectionNames = useMemo(() => {
        const pending = pendingSections.filter(s => !dbSectionNames.includes(s));
        return [...dbSectionNames, ...pending];
    }, [dbSectionNames, pendingSections]);

    const getSectionItems = (section) =>
        allItems.filter(it => String(it.category || '').trim() === section);

    const globalPacked = allItems.filter(i => i.isPacked).length;
    const globalTotal = allItems.length;
    const globalPct = globalTotal === 0 ? 0 : Math.round((globalPacked / globalTotal) * 100);

    // Section actions
    const addSection = (e) => {
        e.preventDefault();
        const name = newSectionInput.trim();
        if (!name) return;
        if (allSectionNames.includes(name)) { alert('Section already exists'); return; }
        setPendingSections(p => [...p, name]);
        setNewSectionInput('');
        setShowNewSectionInput(false);
    };

    const deleteSection = async (section) => {
        const items = getSectionItems(section);
        if (pendingSections.includes(section) && items.length === 0) {
            setPendingSections(p => p.filter(s => s !== section));
            return;
        }
        if (!confirm(`Delete "${section}" and its ${items.length} item${items.length !== 1 ? 's' : ''}?`)) return;
        setIsSaving(true);
        try {
            for (const item of items) {
                await deleteRecord('Checklist', item.id, { reload: false, optimistic: true });
            }
            setPendingSections(p => p.filter(s => s !== section));
        } catch (err) { alert('❌ ' + err.message); }
        finally { setIsSaving(false); }
    };

    const startRename = (section) => { setRenamingSection(section); setRenameValue(section); };

    const confirmRename = async (e) => {
        e.preventDefault();
        const newName = renameValue.trim();
        if (!newName || newName === renamingSection) { setRenamingSection(null); return; }
        if (allSectionNames.includes(newName)) { alert('A section with that name already exists'); return; }
        setIsSaving(true);
        try {
            const items = getSectionItems(renamingSection);
            for (const item of items) {
                await updateRecord('Checklist', item.id, { category: newName, updatedAt: new Date().toISOString() }, { reload: false, optimistic: true });
            }
            setPendingSections(p => p.map(s => s === renamingSection ? newName : s));
            if (addItemSection === renamingSection) setAddItemSection(newName);
            setRenamingSection(null);
        } catch (err) { alert('❌ ' + err.message); }
        finally { setIsSaving(false); }
    };

    const toggleCollapse = (section) => {
        setCollapsedSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) next.delete(section);
            else next.add(section);
            return next;
        });
    };

    // Item actions
    const handleAddItem = async (e, section) => {
        e.preventDefault();
        const name = addItemForm.name.trim();
        if (!name) return;
        setIsSaving(true);
        try {
            await addRecord('Checklist', {
                name,
                category: section,
                quantity: Math.max(1, Number(addItemForm.quantity || 1)),
                notes: addItemForm.notes.trim(),
                isPacked: false,
                updatedAt: new Date().toISOString(),
            }, { reload: false, optimistic: true });
            setPendingSections(p => p.filter(s => s !== section));
            setAddItemSection(null);
            setAddItemForm({ name: '', quantity: 1, notes: '' });
        } catch (err) { alert('❌ ' + err.message); }
        finally { setIsSaving(false); }
    };

    const togglePacked = async (item) => {
        try {
            await updateRecord('Checklist', item.id, {
                isPacked: !item.isPacked,
                updatedAt: new Date().toISOString(),
            }, { reload: false, optimistic: true });
        } catch (err) { alert('❌ ' + err.message); }
    };

    const handleDeleteItem = async (item) => {
        if (confirm(`Delete "${item.name}"?`)) {
            try { await deleteRecord('Checklist', item.id, { reload: false, optimistic: true }); }
            catch (err) { alert('❌ ' + err.message); }
        }
    };

    const openEdit = (item) => {
        setEditForm({ name: item.name || '', category: item.category || '', quantity: item.quantity || 1, notes: item.notes || '' });
        setModalConfig({ isOpen: true, type: 'edit', data: item });
    };

    const openView = (item) => setModalConfig({ isOpen: true, type: 'view', data: item });

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateRecord('Checklist', modalConfig.data.id, {
                ...editForm,
                quantity: Math.max(1, Number(editForm.quantity || 1)),
                updatedAt: new Date().toISOString(),
            }, { reload: false, optimistic: true });
            setModalConfig({ isOpen: false, type: null, data: null });
        } catch (err) { alert('❌ ' + err.message); }
        finally { setIsSaving(false); }
    };

    const markAll = async (packed) => {
        const list = Array.isArray(data.checklist) ? data.checklist : [];
        if (list.length === 0) return;
        if (!confirm(packed ? 'Mark ALL items as packed?' : 'Reset ALL items to unpacked?')) return;
        setIsSaving(true);
        try {
            for (const item of list) {
                if (normalizeBool(item.isPacked) === packed) continue;
                await updateRecord('Checklist', item.id, { isPacked: packed, updatedAt: new Date().toISOString() }, { reload: false, optimistic: true });
            }
        } catch (err) { alert('❌ ' + err.message); }
        finally { setIsSaving(false); }
    };

    if (loading) return (
        <div className="h-full p-6 md:p-8 space-y-6 animate-pulse">
            <div className="h-8 w-52 bg-brand-gold/10 rounded-xl" />
            <div className="h-16 bg-brand-gold/10 rounded-2xl" />
            {[1, 2, 3].map(i => <div key={i} className="h-36 bg-brand-gold/10 rounded-3xl" />)}
        </div>
    );

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6 pb-10">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold flex-shrink-0">
                                <ListChecks size={18} />
                            </span>
                            Shot <span className="text-brand-gold italic">Checklist</span>
                        </h1>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1 ml-12">
                            {globalPacked}/{globalTotal} packed · {globalPct}%
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => markAll(false)} disabled={isSaving || globalTotal === 0}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-card-border font-black text-xs text-foreground/50 hover:border-brand-gold/30 hover:text-foreground/80 transition disabled:opacity-40">
                            <RefreshCcw size={13} /> Reset
                        </button>
                        <button onClick={() => markAll(true)} disabled={isSaving || globalTotal === 0}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-card-border font-black text-xs text-foreground/50 hover:border-emerald-500/40 hover:text-emerald-500 transition disabled:opacity-40">
                            <CheckCircle2 size={13} /> Mark All
                        </button>
                        <button onClick={() => setShowNewSectionInput(s => !s)}
                            className="flex items-center gap-1.5 bg-brand-gold text-black px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all">
                            {showNewSectionInput ? <X size={13} /> : <FolderPlus size={13} />}
                            {showNewSectionInput ? 'Cancel' : 'Add Section'}
                        </button>
                    </div>
                </div>

                {/* Global progress */}
                {globalTotal > 0 && (
                    <div className="bg-card-bg rounded-2xl border border-card-border p-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Overall Progress</p>
                            <p className="text-xs font-black text-brand-gold">{globalPct}%</p>
                        </div>
                        <div className="h-2 rounded-full bg-background border border-card-border overflow-hidden">
                            <div className="h-full bg-brand-gold transition-all duration-500"
                                style={{ width: `${globalPct}%`, background: globalPct === 100 ? '#10b981' : undefined }} />
                        </div>
                    </div>
                )}

                {/* New section input */}
                {showNewSectionInput && (
                    <form onSubmit={addSection} className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <input autoFocus type="text" placeholder="Section name, e.g. Camera Gear"
                            value={newSectionInput} onChange={e => setNewSectionInput(e.target.value)}
                            className="flex-1 rounded-2xl border border-brand-gold/30 px-4 py-3 bg-background focus:ring-2 focus:ring-brand-gold outline-none text-sm font-bold" />
                        <button type="submit" className="bg-brand-gold text-black px-5 py-3 rounded-2xl font-black text-sm hover:opacity-90 active:scale-95 transition">
                            Create
                        </button>
                    </form>
                )}

                {/* Empty state (no sections at all) */}
                {allSectionNames.length === 0 && (
                    <div className="py-28 bg-card-bg rounded-3xl border border-dashed border-card-border text-center text-foreground/30">
                        <ListChecks size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-sm">No sections yet</p>
                        <p className="text-xs mt-1 font-medium">Create a section to start adding checklist items.</p>
                        <button onClick={() => setShowNewSectionInput(true)}
                            className="mt-5 inline-flex items-center gap-2 bg-brand-gold text-black px-6 py-2.5 rounded-2xl font-black text-xs shadow-lg shadow-brand-gold/20 hover:scale-[1.02] active:scale-95 transition-all">
                            <FolderPlus size={14} /> Add First Section
                        </button>
                    </div>
                )}

                {/* Sections */}
                {allSectionNames.map(section => {
                    const items = getSectionItems(section);
                    const packed = items.filter(i => i.isPacked).length;
                    const total = items.length;
                    const pct = total === 0 ? 0 : Math.round((packed / total) * 100);
                    const isCollapsed = collapsedSections.has(section);
                    const isRenaming = renamingSection === section;

                    return (
                        <div key={section} className="bg-card-bg rounded-3xl border border-card-border overflow-hidden transition-all">
                            {/* Section header */}
                            <div className="flex items-center gap-3 p-4 border-b border-card-border/50">
                                <button type="button" onClick={() => toggleCollapse(section)}
                                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-foreground/40 hover:text-brand-gold hover:bg-brand-gold/10 transition">
                                    {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                                </button>

                                {isRenaming ? (
                                    <form onSubmit={confirmRename} className="flex-1 flex gap-2">
                                        <input autoFocus type="text" value={renameValue}
                                            onChange={e => setRenameValue(e.target.value)}
                                            className="flex-1 rounded-xl border border-brand-gold/30 px-3 py-1.5 bg-background focus:ring-2 focus:ring-brand-gold outline-none text-sm font-bold"
                                            onKeyDown={e => e.key === 'Escape' && setRenamingSection(null)} />
                                        <button type="submit" className="w-7 h-7 rounded-lg bg-brand-gold text-black flex items-center justify-center hover:opacity-90 transition">
                                            <Check size={13} />
                                        </button>
                                        <button type="button" onClick={() => setRenamingSection(null)}
                                            className="w-7 h-7 rounded-lg border border-card-border text-foreground/40 flex items-center justify-center hover:text-foreground transition">
                                            <X size={13} />
                                        </button>
                                    </form>
                                ) : (
                                    <div className="flex-1 min-w-0 flex items-center gap-3">
                                        <h2 className="font-black text-sm text-foreground uppercase tracking-wider truncate">{section}</h2>
                                        {total > 0 && (
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                                                pct === 100 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    : 'bg-brand-gold/8 text-brand-gold/60 border-brand-gold/15'}`}>
                                                {packed}/{total}
                                            </span>
                                        )}
                                        {total === 0 && (
                                            <span className="text-[9px] font-black px-2 py-0.5 rounded border border-card-border text-foreground/20">
                                                Empty
                                            </span>
                                        )}
                                    </div>
                                )}

                                {!isRenaming && (
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button onClick={() => startRename(section)}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/30 hover:text-brand-gold hover:bg-brand-gold/10 transition">
                                            <Pencil size={13} />
                                        </button>
                                        <button onClick={() => deleteSection(section)} disabled={isSaving}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/30 hover:text-red-400 hover:bg-red-400/10 transition disabled:opacity-30">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Section body */}
                            {!isCollapsed && (
                                <div className="p-4 space-y-3">
                                    {/* Progress bar (only if has items) */}
                                    {total > 0 && (
                                        <div className="h-1 rounded-full bg-background border border-card-border overflow-hidden mb-1">
                                            <div className="h-full transition-all duration-500"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: pct === 100 ? '#10b981' : 'var(--brand-gold)',
                                                }} />
                                        </div>
                                    )}

                                    {/* Items */}
                                    {items.length === 0 ? (
                                        <p className="text-xs text-foreground/25 font-medium text-center py-3 italic">
                                            No items yet — add your first item below.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {items
                                                .sort((a, b) => {
                                                    if (a.isPacked !== b.isPacked) return a.isPacked ? 1 : -1;
                                                    return String(a.name || '').localeCompare(String(b.name || ''));
                                                })
                                                .map(item => (
                                                    <div key={item.id}
                                                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${item.isPacked ? 'border-emerald-500/15 bg-emerald-500/3' : 'border-card-border hover:border-brand-gold/20'}`}>
                                                        <button type="button" onClick={() => togglePacked(item)}
                                                            className="flex-shrink-0 w-8 h-8 rounded-xl border border-card-border bg-background flex items-center justify-center hover:scale-105 active:scale-95 transition">
                                                            {item.isPacked
                                                                ? <CheckCircle2 size={17} className="text-emerald-500" />
                                                                : <Circle size={17} className="text-foreground/20" />}
                                                        </button>

                                                        <div className="flex-1 min-w-0">
                                                            <p className={`font-black text-sm truncate ${item.isPacked ? 'line-through text-foreground/35' : 'text-foreground'}`}>
                                                                {item.name}
                                                            </p>
                                                            {(item.quantity > 1 || item.notes) && (
                                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                    {item.quantity > 1 && (
                                                                        <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30 bg-white/4 px-1.5 py-0.5 rounded border border-card-border">
                                                                            ×{item.quantity}
                                                                        </span>
                                                                    )}
                                                                    {item.notes && (
                                                                        <span className="text-[10px] text-foreground/30 font-medium truncate italic">
                                                                            {item.notes}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <ActionButtons onView={() => openView(item)} onEdit={() => openEdit(item)} onDelete={() => handleDeleteItem(item)} />
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                    {/* Add item form */}
                                    {addItemSection === section ? (
                                        <form onSubmit={e => handleAddItem(e, section)}
                                            className="bg-background/60 rounded-2xl border border-brand-gold/20 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="flex gap-2">
                                                <input autoFocus required type="text" placeholder="Item name..."
                                                    value={addItemForm.name} onChange={e => setAddItemForm(p => ({ ...p, name: e.target.value }))}
                                                    className="flex-1 rounded-xl border border-card-border px-3 py-2 bg-background focus:ring-2 focus:ring-brand-gold outline-none text-sm font-bold" />
                                                <input type="number" min="1" step="1" placeholder="Qty"
                                                    value={addItemForm.quantity} onChange={e => setAddItemForm(p => ({ ...p, quantity: e.target.value }))}
                                                    className="w-16 rounded-xl border border-card-border px-3 py-2 bg-background focus:ring-2 focus:ring-brand-gold outline-none text-sm font-bold" />
                                            </div>
                                            <input type="text" placeholder="Notes (optional)"
                                                value={addItemForm.notes} onChange={e => setAddItemForm(p => ({ ...p, notes: e.target.value }))}
                                                className="block w-full rounded-xl border border-card-border px-3 py-2 bg-background focus:ring-2 focus:ring-brand-gold outline-none text-sm font-bold" />
                                            <div className="flex gap-2">
                                                <button type="submit" disabled={isSaving}
                                                    className="flex-1 bg-brand-gold text-black py-2 rounded-xl font-black text-xs shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-1">
                                                    {isSaving ? <Loader size={14} /> : <Plus size={14} />}
                                                    {isSaving ? 'Adding...' : 'Add'}
                                                </button>
                                                <button type="button" onClick={() => { setAddItemSection(null); setAddItemForm({ name: '', quantity: 1, notes: '' }); }}
                                                    className="px-4 py-2 rounded-xl border border-card-border text-foreground/40 font-black text-xs hover:border-foreground/30 transition">
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button onClick={() => { setAddItemSection(section); setAddItemForm({ name: '', quantity: 1, notes: '' }); }}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-dashed border-card-border text-foreground/25 font-black text-xs uppercase tracking-wider hover:border-brand-gold/30 hover:text-brand-gold/60 transition">
                                            <Plus size={13} /> Add Item
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* "Add another section" shortcut at bottom */}
                {allSectionNames.length > 0 && !showNewSectionInput && (
                    <button onClick={() => setShowNewSectionInput(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-3xl border border-dashed border-card-border text-foreground/20 font-black text-xs uppercase tracking-wider hover:border-brand-gold/30 hover:text-brand-gold/50 transition">
                        <FolderPlus size={14} /> Add Section
                    </button>
                )}
            </div>

            {/* Edit Modal */}
            <AppModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ isOpen: false, type: null, data: null })}
                title={modalConfig.type === 'edit' ? 'Edit Item' : 'Item Details'}>
                {modalConfig.type === 'edit' ? (
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Item Name</label>
                            <input required type="text" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none text-sm font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Section</label>
                                <input type="text" value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none text-sm font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Quantity</label>
                                <input type="number" min="1" step="1" value={editForm.quantity} onChange={e => setEditForm(p => ({ ...p, quantity: e.target.value }))}
                                    className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none text-sm font-bold" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Notes</label>
                            <input type="text" value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                                className="block w-full rounded-2xl border border-card-border p-4 bg-background focus:ring-2 focus:ring-brand-gold outline-none text-sm font-bold" />
                        </div>
                        <button disabled={isSaving} type="submit"
                            className="bg-brand-gold text-black p-4 rounded-2xl w-full font-black shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSaving && <Loader size={16} />}
                            {isSaving ? 'Updating...' : 'Update Item'}
                        </button>
                    </form>
                ) : modalConfig.data && (() => {
                    const item = modalConfig.data;
                    const packed = normalizeBool(item.isPacked);
                    return (
                        <div className="space-y-5">
                            <div className="flex justify-between items-start pb-5 border-b border-card-border">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-foreground">{item.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2.5 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-gold/15 italic">{item.category || 'Other'}</span>
                                        <span className="px-2.5 py-1 bg-white/5 text-foreground/40 text-[10px] font-black uppercase tracking-widest rounded-full border border-card-border">Qty: {item.quantity || 1}</span>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${packed ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-foreground/5 text-foreground/40 border-card-border'}`}>
                                            {packed ? 'Packed' : 'Not Packed'}
                                        </span>
                                    </div>
                                </div>
                                <button type="button" onClick={() => togglePacked(item)}
                                    className="px-4 py-2 rounded-2xl font-black text-xs border border-card-border bg-background hover:border-brand-gold/30 transition text-foreground/50">
                                    Toggle
                                </button>
                            </div>
                            {item.notes && (
                                <div>
                                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-2">Notes</p>
                                    <p className="text-sm font-medium text-foreground/60 bg-white/4 p-4 rounded-2xl border border-card-border">{item.notes}</p>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </AppModal>
        </div>
    );
}
