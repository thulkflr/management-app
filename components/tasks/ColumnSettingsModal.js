// components/tasks/ColumnSettingsModal.js
'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, Save, Palette, Check } from 'lucide-react';
import { useTasks } from '@/context/TasksContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const PRESET_COLORS = [
    { value: 'bg-slate-500', label: 'Slate Gray' },
    { value: 'bg-blue-600', label: 'Royal Blue' },
    { value: 'bg-amber-500', label: 'Golden Sun' },
    { value: 'bg-purple-600', label: 'Mystic Purple' },
    { value: 'bg-emerald-600', label: 'Emerald Green' },
    { value: 'bg-red-600', label: 'Crimson Red' },
    { value: 'bg-pink-500', label: 'Rose Petal' },
    { value: 'bg-indigo-600', label: 'Deep Indigo' },
    { value: 'bg-cyan-500', label: 'Ocean Cyan' },
    { value: 'bg-orange-500', label: 'Vibrant Orange' },
    { value: 'bg-teal-600', label: 'Dark Teal' },
    { value: 'bg-lime-500', label: 'Lime Burst' }
];

export default function ColumnSettingsModal({ onClose }) {
    const { columns, addColumn, updateColumn, deleteColumn, reorderColumns } = useTasks();
    const [localColumns, setLocalColumns] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [activeColorPicker, setActiveColorPicker] = useState(null); // ID of column opening picker

    useEffect(() => {
        setLocalColumns([...columns]);
    }, [columns]);

    const handleAddColumn = async () => {
        if (!newColumnName.trim()) return;
        setIsSaving(true);
        try {
            await addColumn({
                label: newColumnName,
                color: PRESET_COLORS[localColumns.length % PRESET_COLORS.length].value
            });
            setNewColumnName('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(localColumns);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setLocalColumns(items);
        reorderColumns(items);
    };

    const handleUpdateLabel = (id, newLabel) => {
        setLocalColumns(prev => prev.map(c => c.id === id ? { ...c, label: newLabel } : c));
    };

    const saveLabel = async (id, label) => {
        try {
            await updateColumn(id, { label });
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateColor = async (id, newColor) => {
        try {
            await updateColumn(id, { color: newColor });
            setActiveColorPicker(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (localColumns.length <= 1) return alert("Board must have at least one column.");
        if (!confirm("Are you sure?")) return;
        try {
            await deleteColumn(id);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Workflow <span className="text-brand-gold italic">Engine</span></h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Structure your production pipeline</p>
                    </div>
                    <button onClick={onClose} className="p-3 text-slate-400 hover:text-black hover:bg-slate-50 rounded-2xl transition-all active:scale-90">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Stages Strategy</label>
                             <div className="h-px bg-slate-100 flex-1 ml-4" />
                        </div>
                        
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="columns">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                        {localColumns.map((column, index) => (
                                            <Draggable key={column.id} draggableId={column.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div 
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`flex items-center gap-4 p-5 rounded-[24px] transition-all border duration-300 ${
                                                            snapshot.isDragging 
                                                            ? 'bg-white border-brand-gold/50 shadow-2xl z-50 scale-[1.02]' 
                                                            : 'bg-white border-slate-100 hover:border-brand-gold/20 hover:shadow-lg hover:shadow-slate-100'
                                                        }`}
                                                    >
                                                        <div {...provided.dragHandleProps} className="text-slate-300 hover:text-brand-gold transition-colors cursor-grab active:cursor-grabbing">
                                                            <GripVertical size={20} />
                                                        </div>
                                                        
                                                        {/* Color Indicator */}
                                                        <div className="relative">
                                                            <button 
                                                                onClick={() => setActiveColorPicker(activeColorPicker === column.id ? null : column.id)}
                                                                className={`w-10 h-10 rounded-2xl ${column.color} shadow-inner cursor-pointer hover:ring-4 hover:ring-slate-100 transition-all flex items-center justify-center text-white`}
                                                            >
                                                                <Palette size={16} />
                                                            </button>

                                                            {/* Custom Color Picker Popover */}
                                                            {activeColorPicker === column.id && (
                                                                <div className="absolute left-0 top-full mt-4 z-[120] bg-white border border-slate-100 p-5 rounded-[32px] shadow-2xl w-64 animate-in slide-in-from-top-2">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {PRESET_COLORS.map((color) => (
                                                                            <button
                                                                                key={color.value}
                                                                                onClick={() => handleUpdateColor(column.id, color.value)}
                                                                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${
                                                                                    column.color === color.value 
                                                                                    ? 'bg-brand-gold/10 border-brand-gold/30' 
                                                                                    : 'hover:bg-slate-50 border-transparent'
                                                                                }`}
                                                                            >
                                                                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${color.value}`} />
                                                                                <span className="text-[10px] font-black text-slate-700 whitespace-nowrap">{color.label}</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <input 
                                                            type="text"
                                                            value={column.label}
                                                            onChange={(e) => handleUpdateLabel(column.id, e.target.value)}
                                                            onBlur={(e) => saveLabel(column.id, e.target.value)}
                                                            className="flex-1 bg-transparent border-none p-0 text-md font-black text-slate-900 focus:ring-0 placeholder:text-slate-200"
                                                            placeholder="Untitled Stage"
                                                        />

                                                        <button 
                                                            onClick={() => handleDelete(column.id)}
                                                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        >
                                                            <Trash2 size={18} />
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

                    <div className="mt-12 group">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Plus className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-gold transition-colors" size={20} />
                                <input 
                                    type="text"
                                    placeholder="Enter new stage title..."
                                    value={newColumnName}
                                    onChange={(e) => setNewColumnName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] pl-14 pr-8 py-5 text-sm font-black text-slate-900 focus:outline-none focus:bg-white focus:border-brand-gold/30 focus:shadow-xl focus:shadow-brand-gold/5 transition-all transition-duration-500"
                                />
                            </div>
                            <button 
                                onClick={handleAddColumn}
                                disabled={isSaving || !newColumnName.trim()}
                                className="bg-black text-white px-10 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-gold hover:text-black active:scale-95 transition-all disabled:opacity-30 flex items-center gap-2"
                            >
                                Build
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Check size={14} className="text-brand-gold" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pipeline sync active</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="bg-black text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.05] active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex items-center gap-3"
                    >
                        <Save size={18} />
                        Confirm Setup
                    </button>
                </div>
            </div>
        </div>
    );
}
