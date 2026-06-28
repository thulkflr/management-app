// services/tasksService.js

const API_BASE = '/api/data';

export const tasksService = {
    async fetchTasks() {
        const res = await fetch(`${API_BASE}?type=Tasks`);
        if (!res.ok) throw new Error('Failed to fetch tasks');
        return res.json();
    },

    async createTask(task, hints = {}) {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'Tasks', payload: task, hints }),
        });
        if (!res.ok) throw new Error('Failed to create task');
        return res.json();
    },

    async updateTask(id, updates, originalTask, hints = {}) {
        const res = await fetch(API_BASE, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'Tasks', id, payload: updates, originalTask, hints }),
        });
        if (!res.ok) throw new Error('Failed to update task');
        return res.json();
    },

    async deleteTask(id) {
        const res = await fetch(API_BASE, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'Tasks', id }),
        });
        if (!res.ok) throw new Error('Failed to delete task');
        return res.json();
    },

    // Comments
    async fetchComments(taskId) {
        const res = await fetch(`${API_BASE}?type=TaskComments`);
        if (!res.ok) throw new Error('Failed to fetch comments');
        const allComments = await res.json();
        return allComments.filter(c => c.taskId === taskId);
    },

    async addComment(comment) {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'TaskComments', payload: comment }),
        });
        if (!res.ok) throw new Error('Failed to add comment');
        return res.json();
    },

    // Dynamic Board Columns (Statuses)
    async fetchBoardColumns() {
        const res = await fetch(`${API_BASE}?type=BoardColumns`);
        if (!res.ok) throw new Error('Failed to fetch board columns');
        const data = await res.json();
        // Sort by 'order' field if it exists
        return data.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    },

    async updateBoardColumn(id, updates) {
        const res = await fetch(API_BASE, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'BoardColumns', id, payload: updates }),
        });
        if (!res.ok) throw new Error('Failed to update board column');
        return res.json();
    },

    async addBoardColumn(column) {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'BoardColumns', payload: column }),
        });
        if (!res.ok) throw new Error('Failed to add board column');
        return res.json();
    },

    async deleteBoardColumn(id) {
        const res = await fetch(API_BASE, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'BoardColumns', id }),
        });
        if (!res.ok) throw new Error('Failed to delete board column');
        return res.json();
    }
};
