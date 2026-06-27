// constants/taskConstants.js

export const TASK_STATUSES = {
    PLANNING: { id: 'planning', label: 'Planning', color: 'bg-slate-500' },
    READY_TO_SHOOT: { id: 'ready-to-shoot', label: 'Ready To Shoot', color: 'bg-blue-500' },
    EDITING: { id: 'editing', label: 'Editing', color: 'bg-amber-500' },
    CLIENT_REVIEW: { id: 'client-review', label: 'Client Review', color: 'bg-purple-500' },
    DELIVERED: { id: 'delivered', label: 'Delivered', color: 'bg-emerald-500' },
};

export const TASK_TYPES = [
    { id: 'photography-session', label: 'Photography Session', icon: 'Camera' },
    { id: 'video-production', label: 'Video Production', icon: 'Video' },
    { id: 'editing-task', label: 'Editing Task', icon: 'Scissors' },
    { id: 'client-request', label: 'Client Request', icon: 'User' },
    { id: 'marketing-content', label: 'Marketing Content', icon: 'Megaphone' },
    { id: 'social-media-content', label: 'Social Media', icon: 'Share2' },
    { id: 'equipment-preparation', label: 'Equipment Prep', icon: 'Settings' },
    { id: 'administrative-task', label: 'Admin Task', icon: 'FileText' },
];

export const TASK_PRIORITIES = {
    URGENT: { id: 'urgent', label: 'Urgent', color: 'text-red-600', bg: 'bg-red-50' },
    HIGH: { id: 'high', label: 'High', color: 'text-orange-600', bg: 'bg-orange-50' },
    MEDIUM: { id: 'medium', label: 'Medium', color: 'text-blue-600', bg: 'bg-blue-50' },
    LOW: { id: 'low', label: 'Low', color: 'text-slate-600', bg: 'bg-slate-100' },
};

export const COLUMNS = [
    TASK_STATUSES.PLANNING,
    TASK_STATUSES.READY_TO_SHOOT,
    TASK_STATUSES.EDITING,
    TASK_STATUSES.CLIENT_REVIEW,
    TASK_STATUSES.DELIVERED,
];
