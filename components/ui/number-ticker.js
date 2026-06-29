'use client';
import { useEffect, useRef } from 'react';
import { useInView, animate } from 'framer-motion';

export default function NumberTicker({
    value = 0,
    prefix = '',
    suffix = '',
    decimals = 0,
    className = '',
    duration = 1.4,
}) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-20px' });

    useEffect(() => {
        if (!inView) return;
        const el = ref.current;
        if (!el) return;

        const controls = animate(0, value, {
            duration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate(latest) {
                el.textContent =
                    prefix +
                    latest.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
                    suffix;
            },
        });

        return () => controls.stop();
    }, [inView, value, prefix, suffix, decimals, duration]);

    return (
        <span ref={ref} className={`tabular ${className}`}>
            {prefix}0{suffix}
        </span>
    );
}
