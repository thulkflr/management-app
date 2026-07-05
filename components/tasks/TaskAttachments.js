'use client';

import { useState, useRef } from 'react';
import { Paperclip, X, Image as ImageIcon, FileText, Loader2, Plus, ExternalLink } from 'lucide-react';

export default function TaskAttachments({ attachments = [], onChange }) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();

            const updated = [...attachments, { 
                id: Date.now(), 
                url: data.url, 
                name: data.name,
                type: file.type 
            }];
            onChange(updated);
        } catch (error) {
            console.error(error);
            alert('Upload failed: ' + error.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeAttachment = (id) => {
        const updated = attachments.filter(a => a.id !== id);
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2 ml-1 flex items-center gap-2">
                <Paperclip size={12} /> Attachments & Images
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((file) => (
                    <div 
                        key={file.id} 
                        className="group relative flex items-center gap-3 p-3 rounded-xl border border-card-border bg-accent-slate/30 hover:border-brand-gold/30 transition-all"
                    >
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-brand-gold border border-card-border overflow-hidden">
                            {file.type?.startsWith('image/') ? (
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                                <FileText size={18} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                            <p className="text-xs font-bold text-foreground truncate">{file.name}</p>
                            <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] font-black text-brand-gold uppercase tracking-widest hover:underline flex items-center gap-1"
                            >
                                View File <ExternalLink size={8} />
                            </a>
                        </div>
                        <button 
                            onClick={() => removeAttachment(file.id)}
                            className="absolute top-2 right-2 p-1 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center justify-center gap-3 p-5 rounded-xl border border-dashed border-card-border bg-accent-slate/20 hover:border-brand-gold/40 hover:bg-brand-gold/5 transition-all text-text-muted hover:text-brand-gold group"
                >
                    {isUploading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <>
                            <Plus size={20} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Add Attachment</span>
                        </>
                    )}
                </button>
            </div>

            <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                onChange={handleUpload}
                accept="image/*,.pdf,.doc,.docx"
            />
        </div>
    );
}
