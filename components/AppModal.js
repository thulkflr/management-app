import { X } from 'lucide-react';

export default function AppModal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative bg-card-bg border-t sm:border border-card-border w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col max-h-[92vh] sm:max-h-[85vh]">
                <div className="flex justify-between items-center p-6 border-b border-card-border flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition text-foreground/30 hover:text-brand-gold">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
