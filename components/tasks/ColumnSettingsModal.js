// components/tasks/ColumnSettingsModal.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, GripVertical, Palette, Check, Layers } from 'lucide-react';
import { useTasks } from '@/context/TasksContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Loader from '@/components/Loader';
import ConfirmDialog from '@/components/ConfirmDialog';

const PRESET_COLORS = [
    { value: 'bg-slate-500',   label: 'Slate'    },
    { value: 'bg-blue-500',    label: 'Blue'     },
    { value: 'bg-amber-500',   label: 'Amber'    },
    { value: 'bg-purple-500',  label: 'Purple'   },
    { value: 'bg-emerald-500', label: 'Emerald'  },
    { value: 'bg-red-500',     label: 'Red'      },
    { value: 'bg-pink-500',    label: 'Pink'     },
    { value: 'bg-indigo-500',  label: 'Indigo'   },
    { value: 'bg-cyan-500',    label: 'Cyan'     },
    { value: 'bg-orange-500',  label: 'Orange'   },
    { value: 'bg-teal-500',    label: 'Teal'     },
    { value: 'bg-lime-500',    label: 'Lime'     },
];

function ColorDot({ value }) {
    return <span className={`inline-block w-3 h-3 rounded-full flex-shrink-0 ${value}`} />;
}

export default function ColumnSettingsModal({ onClose }) {
    const { columns, addColumn, updateColumn, deleteColumn, reorderColumns } = useTasks();
    const [localColumns, setLocalColumns]     = useState([]);
    const [isSaving, setIsSaving]             = useState(false);
    const [newColumnName, setNewColumnName]   = useState('');
    const [activeColorPicker, setActiveColorPicker] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState(null);
    const pickerRef = useRef(null);
    const addInputRef = useRef(null);

    useEffect(() => { setLocalColumns([...columns]); }, [columns]);

    // close color picker on outside click
    useEffect(() => {
        const handler = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setActiveColorPicker(null);
            }
        };
        if (activeColorPicker) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [activeColorPicker]);

    const handleAddColumn = async () => {
        const name = newColumnName.trim();
        if (!name) return;
        setIsSaving(true);
        try {
            await addColumn({
                label: name,
                color: PRESET_COLORS[localColumns.length % PRESET_COLORS.length].value,
            });
            setNewColumnName('');
            addInputRef.current?.focus();
        } catch (err) { console.error(err); }
        finally { setIsSaving(false); }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(localColumns);
        const [moved] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, moved);
        setLocalColumns(items);
        reorderColumns(items);
    };

    const handleUpdateLabel = (id, label) =>
        setLocalColumns(prev => prev.map(c => c.id === id ? { ...c, label } : c));

    const saveLabel = (id, label) => updateColumn(id, { label }).catch(console.error);

    const handleUpdateColor = async (id, color) => {
        try { await updateColumn(id, { color }); setActiveColorPicker(null); }
        catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (localColumns.length <= 1) return alert('Board must have at least one stage.');
        setConfirmConfig({
            title: 'Delete stage',
            message: 'Delete this stage? This cannot be undone.',
            confirmLabel: 'Delete Stage',
            onConfirm: async () => {
                try { await deleteColumn(id); setConfirmConfig(null); } catch (err) { console.error(err); }
            },
        });
    };

    return (
        <>
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/72 backdrop-blur-xl animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[86vh] flex flex-col
                bg-card-bg/95 backdrop-blur-2xl border border-white/10
                rounded-t-[2rem] sm:rounded-[28px]
                shadow-[0_32px_110px_rgba(0,0,0,0.62)]
                animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/8 to-transparent" />
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/45 to-transparent" />

                {/* Drag handle (mobile only) */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-foreground/10" />
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between px-5 sm:px-7 py-5 sm:py-6 border-b border-white/10 bg-white/[0.025] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold flex-shrink-0">
                            <Layers size={17} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-foreground uppercase tracking-wider leading-none">
                                Workflow <span className="text-brand-gold italic">Engine</span>
                            </h2>
                            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mt-1">
                                Structure your production pipeline
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-foreground/45 hover:text-foreground hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all active:scale-90">
                        <X size={18} />
                    </button>
                </div>

                {/* Stages list */}
                <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 py-5 custom-scrollbar space-y-2">
                    <p className="text-[9px] font-black text-foreground/25 uppercase tracking-widest px-1 mb-3">
                        {localColumns.length} Stage{localColumns.length !== 1 ? 's' : ''} — drag to reorder
                    </p>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="columns">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                    {localColumns.map((col, index) => (
                                        <Draggable key={col.id} draggableId={col.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 rounded-2xl border transition-all ${
                                                        snapshot.isDragging
                                                            ? 'bg-brand-gold/8 border-brand-gold/35 shadow-xl shadow-brand-gold/10 scale-[1.01]'
                                                            : 'bg-white/[0.035] border-white/10 hover:border-brand-gold/25 hover:bg-white/[0.055]'
                                                    }`}
                                                >
                                                    {/* Drag handle */}
                                                    <div {...provided.dragHandleProps}
                                                        className="text-foreground/20 hover:text-brand-gold/60 transition-colors cursor-grab active:cursor-grabbing touch-none flex-shrink-0">
                                                        <GripVertical size={16} />
                                                    </div>

                                                    {/* Color button + picker */}
                                                    <div className="relative flex-shrink-0" ref={activeColorPicker === col.id ? pickerRef : null}>
                                                        <button
                                                            onClick={() => setActiveColorPicker(activeColorPicker === col.id ? null : col.id)}
                                                            className={`w-8 h-8 rounded-xl ${col.color} flex items-center justify-center text-white/80 hover:ring-2 hover:ring-brand-gold/40 transition-all active:scale-90`}
                                                            aria-label="Change color"
                                                        >
                                                            <Palette size={13} />
                                                        </button>

                                                        {activeColorPicker === col.id && (
                                                            <div className="absolute left-0 top-full mt-2 z-[130] bg-card-bg/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-3 w-52 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150">
                                                                <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest mb-2 px-1">Pick a color</p>
                                                                <div className="grid grid-cols-3 gap-1.5">
                                                                    {PRESET_COLORS.map(pc => (
                                                                        <button key={pc.value}
                                                                            onClick={() => handleUpdateColor(col.id, pc.value)}
                                                                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all text-left ${
                                                                                col.color === pc.value
                                                                                    ? 'bg-brand-gold/10 border-brand-gold/30'
                                                                                    : 'border-transparent hover:bg-white/5'
                                                                            }`}>
                                                                            <ColorDot value={pc.value} />
                                                                            <span className="text-[9px] font-black text-foreground/60 truncate">{pc.label}</span>
                                                                            {col.color === pc.value && <Check size={9} className="text-brand-gold ml-auto flex-shrink-0" />}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Label input */}
                                                    <input
                                                        type="text"
                                                        value={col.label}
                                                        onChange={e => handleUpdateLabel(col.id, e.target.value)}
                                                        onBlur={e => saveLabel(col.id, e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                                                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm font-black text-foreground placeholder:text-foreground/20 focus:ring-0 p-0"
                                                        placeholder="Untitled Stage"
                                                    />

                                                    {/* Index badge */}
                                                    <span className="text-[9px] font-black text-foreground/20 w-5 text-center flex-shrink-0">
                                                        {index + 1}
                                                    </span>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDelete(col.id)}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground/20 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-90 flex-shrink-0">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                {/* Add stage + footer */}
                <div className="relative z-10 flex-shrink-0 border-t border-white/10 bg-white/[0.025] px-4 sm:px-6 py-4 space-y-3">
                    {/* Add input row */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Plus size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/25 pointer-events-none" />
                            <input
                                ref={addInputRef}
                                type="text"
                                placeholder="New stage name..."
                                value={newColumnName}
                                onChange={e => setNewColumnName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                                className="w-full pl-9 pr-3 py-3 rounded-2xl border border-white/10 bg-background/70 focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold/50 outline-none text-sm font-bold transition placeholder:text-foreground/25"
                            />
                        </div>
                        <button
                            onClick={handleAddColumn}
                            disabled={isSaving || !newColumnName.trim()}
                            className="px-5 py-3 rounded-2xl bg-gradient-to-br from-[#e4c34f] to-brand-gold text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-brand-gold/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-40 disabled:hover:translate-y-0 flex items-center gap-1.5 flex-shrink-0"
                        >
                            {isSaving ? <Loader size={14} /> : <Plus size={14} />}
                            Add
                        </button>
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-foreground/25">
                            <Check size={11} className="text-brand-gold/50" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Pipeline sync active</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-2xl bg-white/7 border border-white/10 text-foreground font-black text-xs uppercase tracking-wider hover:bg-white/10 hover:border-white/15 active:scale-95 transition-all">
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <ConfirmDialog
            isOpen={!!confirmConfig}
            title={confirmConfig?.title}
            message={confirmConfig?.message}
            confirmLabel={confirmConfig?.confirmLabel}
            onCancel={() => setConfirmConfig(null)}
            onConfirm={confirmConfig?.onConfirm}
        />
        </>
    );
}
