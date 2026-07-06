'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const normalizeOptions = (options = []) => options.map(option => {
    if (typeof option === 'string') return { value: option, label: option };
    return {
        value: option.value ?? option.label ?? '',
        label: option.label ?? option.value ?? '',
        disabled: Boolean(option.disabled),
    };
});

export default function Dropdown({
    value,
    onChange,
    options = [],
    placeholder = 'Select an option',
    disabled = false,
    searchable,
    className = '',
    panelClassName = '',
    ariaLabel,
}) {
    const id = useId();
    const rootRef = useRef(null);
    const listRef = useRef(null);
    const searchRef = useRef(null);
    const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);
    const selectedIndex = normalizedOptions.findIndex(option => String(option.value) === String(value));
    const selectedOption = selectedIndex >= 0 ? normalizedOptions[selectedIndex] : null;
    const canSearch = searchable ?? normalizedOptions.length > 15;

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(Math.max(selectedIndex, 0));
    const [syncedState, setSyncedState] = useState({ isOpen: false, filteredOptions: normalizedOptions, value });

    const filteredOptions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return normalizedOptions;
        return normalizedOptions.filter(option => String(option.label).toLowerCase().includes(q));
    }, [normalizedOptions, query]);

    const getEnabledIndex = (startIndex, direction = 1, list = filteredOptions) => {
        if (list.length === 0) return -1;
        let index = startIndex;
        for (let i = 0; i < list.length; i += 1) {
            const normalized = (index + list.length) % list.length;
            if (!list[normalized]?.disabled) return normalized;
            index += direction;
        }
        return -1;
    };

    const open = () => {
        if (disabled) return;
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setQuery('');
    };

    const selectOption = (option) => {
        if (!option || option.disabled) return;
        onChange?.(option.value);
        close();
    };

    if (isOpen && (!syncedState.isOpen || syncedState.filteredOptions !== filteredOptions || syncedState.value !== value)) {
        setSyncedState({ isOpen, filteredOptions, value });
        const selectedFilteredIndex = filteredOptions.findIndex(option => String(option.value) === String(value));
        setActiveIndex(getEnabledIndex(selectedFilteredIndex >= 0 ? selectedFilteredIndex : 0, 1, filteredOptions));
    } else if (!isOpen && syncedState.isOpen) {
        setSyncedState({ isOpen, filteredOptions, value });
    }

    useEffect(() => {
        if (!isOpen) return;
        requestAnimationFrame(() => {
            const activeItem = listRef.current?.querySelector('[data-active="true"]');
            activeItem?.scrollIntoView({ block: 'nearest' });
            if (canSearch) searchRef.current?.focus();
        });
    }, [isOpen, activeIndex, canSearch]);

    useEffect(() => {
        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) close();
        };

        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, []);

    const handleKeyDown = (event) => {
        if (disabled) return;

        if (!isOpen && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
            event.preventDefault();
            open();
            return;
        }

        if (!isOpen) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            close();
            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            setActiveIndex(prev => getEnabledIndex(prev + direction, direction));
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            selectOption(filteredOptions[activeIndex]);
        }
    };

    return (
        <div ref={rootRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
            <button
                type="button"
                id={id}
                disabled={disabled}
                aria-label={ariaLabel || placeholder}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => (isOpen ? close() : open())}
                className={`group flex min-h-[3rem] w-full items-center justify-between gap-3 rounded-2xl border border-card-border bg-background/80 px-4 py-3 text-left text-sm font-bold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-brand-gold/35 hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-brand-gold/25 disabled:cursor-not-allowed disabled:opacity-55 ${isOpen ? 'border-brand-gold/50 ring-2 ring-brand-gold/15' : ''}`}
            >
                <span className={`min-w-0 truncate ${selectedOption ? 'text-foreground' : 'text-foreground/32'}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown size={16} className={`flex-shrink-0 text-foreground/35 transition-transform duration-200 group-hover:text-brand-gold/70 ${isOpen ? 'rotate-180 text-brand-gold' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.14, ease: 'easeOut' }}
                        className={`absolute left-0 right-0 top-full z-[140] mt-2 overflow-hidden rounded-2xl border border-white/10 bg-card-bg/98 shadow-[0_22px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl ${panelClassName}`}
                    >
                        {canSearch && (
                            <div className="border-b border-white/8 p-2">
                                <div className="relative">
                                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                                    <input
                                        ref={searchRef}
                                        value={query}
                                        onChange={event => setQuery(event.target.value)}
                                        placeholder="Search options..."
                                        className="h-10 w-full rounded-xl border border-white/10 bg-background/70 pl-9 pr-3 text-sm font-bold text-foreground outline-none transition placeholder:text-foreground/25 focus:border-brand-gold/45 focus:ring-2 focus:ring-brand-gold/15"
                                    />
                                </div>
                            </div>
                        )}

                        <div ref={listRef} role="listbox" aria-labelledby={id} className="max-h-[280px] overflow-y-auto p-1.5 custom-scrollbar scroll-smooth">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-8 text-center text-xs font-black uppercase tracking-widest text-foreground/25">
                                    No options available
                                </div>
                            ) : filteredOptions.map((option, index) => {
                                const selected = String(option.value) === String(value);
                                const active = index === activeIndex;

                                return (
                                    <button
                                        key={`${option.value}-${index}`}
                                        type="button"
                                        role="option"
                                        aria-selected={selected}
                                        disabled={option.disabled}
                                        data-active={active}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onClick={() => selectOption(option)}
                                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${selected ? 'bg-brand-gold/12 text-brand-gold' : active ? 'bg-white/8 text-foreground' : 'text-foreground/66 hover:bg-white/7 hover:text-foreground'}`}
                                    >
                                        <span className="min-w-0 truncate">{option.label}</span>
                                        {selected && <Check size={14} className="flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
