// app/tasks/page.js
'use client';

import KanbanBoard from '@/components/tasks/KanbanBoard';

export default function TasksPage() {
    return (
        <div className="h-full overflow-hidden p-4 md:p-8">
            <KanbanBoard />
        </div>
    );
}
