// app/tasks/page.js
'use client';

import KanbanBoard from '@/components/tasks/KanbanBoard';

export default function TasksPage() {
    return (
        <div className="max-w-[1600px] mx-auto h-full">
            <KanbanBoard />
        </div>
    );
}
