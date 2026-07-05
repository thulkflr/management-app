'use client';

import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ListTodo } from 'lucide-react';

export default function TaskChecklist({ items = [], onChange }) {
    const [newItem, setNewItem] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        const updated = [...items, { id: Date.now(), text: newItem.trim(), checked: false }];
        onChange(updated);
        setNewItem('');
    };

    const toggleItem = (id) => {
        const updated = items.map(item => 
            item.id === id ? { ...item, checked: !item.checked } : item
        );
        onChange(updated);
    };

    const deleteItem = (id) => {
        const updated = items.filter(item => item.id !== id);
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 ml-1 flex items-center gap-2">
                <ListTodo size={12} /> Photography Gear Checklist
            </label>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {items.length === 0 ? (
                    <p className="text-xs text-text-muted/50 italic py-2 px-1">No gear added yet...</p>
                ) : (
                    items.map((item) => (
                        <div 
                            key={item.id} 
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                item.checked ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-background border-card-border hover:border-brand-gold/30'
                            }`}
                        >
                            <div 
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => toggleItem(item.id)}
                            >
                                {item.checked ? (
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                ) : (
                                    <Circle size={18} className="text-text-muted/30" />
                                )}
                                <span className={`text-sm font-bold ${item.checked ? 'line-through text-text-muted' : 'text-foreground'}`}>
                                    {item.text}
                                </span>
                            </div>
                            <button 
                                onClick={() => deleteItem(item.id)}
                                className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleAdd} className="flex gap-2">
                <input 
                    type="text" 
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add gear (e.g. Sony A7IV, 24-70mm...)"
                    className="flex-1 bg-accent-slate/50 border border-card-border rounded-xl px-4 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                />
                <button 
                    type="submit"
                    className="p-2.5 bg-brand-gold text-black rounded-xl hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-brand-gold/20"
                >
                    <Plus size={18} />
                </button>
            </form>
        </div>
    );
}
