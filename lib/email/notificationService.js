import { resend } from './resend';
import { templates } from './templates';
import { getSheetData } from '../googleSheets';

const APP_URL = process.env.AUTH_URL || 'http://localhost:3000';
const DEFAULT_FROM = 'Caprice MGMT <onboarding@resend.dev>'; // Default Resend test domain

export const notificationService = {
    /**
     * Finds the email of a member by their name.
     */
    async getUserEmail(name) {
        if (!name || name === 'Unassigned') {
            console.log('📧 Email System: No assignee provided or unassigned.');
            return null;
        }
        
        try {
            const members = await getSheetData('Members');
            const searchName = name.trim();
            console.log(`📧 Email System: Looking for member: "${searchName}" in ${members.length} members.`);
            
            const member = members.find(m => {
                const sheetName = (m.name || '').trim();
                const sheetUsername = (m.username || '').trim();
                // If active column is missing, assume true. If it exists, check for 'true'.
                const isActive = m.active === undefined || m.active?.toString().toLowerCase() === 'true';
                return (sheetName === searchName || sheetUsername === searchName) && isActive;
            });
            
            if (!member) {
                const availableNames = members.map(m => `"${(m.name || '').trim()}" (${m.active})`).join(', ');
                console.log(`📧 Email System: Member "${searchName}" not found or inactive.`);
                console.log(`📧 Email System: Available in sheet: ${availableNames}`);
                return null;
            }

            if (!member.email) {
                console.log(`📧 Email System: Member "${name}" found but has no email in the "email" column.`);
                return null;
            }

            console.log(`📧 Email System: Found email for "${name}": ${member.email}`);
            return member.email;
        } catch (error) {
            console.error('📧 Email System Error fetching member email:', error);
            return null;
        }
    },

    /**
     * Helper to get readable status from column ID.
     */
    async getStatusTitle(columnId) {
        try {
            const columns = await getSheetData('BoardColumns');
            const column = columns.find(c => c.id === columnId);
            return column ? column.label : columnId;
        } catch (error) {
            return columnId;
        }
    },

    /**
     * Triggers a notification for a newly created task.
     */
    async notifyTaskCreated(task) {
        if (!resend) {
            console.log('📧 Email System: Resend is not initialized.');
            return;
        }
        
        if (!task.assignee) return;

        const email = await this.getUserEmail(task.assignee);
        if (!email) return;

        try {
            // Map ID to Title
            const readableStatus = await this.getStatusTitle(task.status);
            const taskWithReadableStatus = { ...task, status: readableStatus };

            console.log(`📧 Email System: Sending "Task Created" to ${email}...`);
            const data = await resend.emails.send({
                from: DEFAULT_FROM,
                to: email,
                subject: `📌 New Task Assigned: ${task.title}`,
                html: templates.taskCreated(taskWithReadableStatus, APP_URL),
            });
            console.log('📧 Email System: Resend API Response:', data);
        } catch (error) {
            console.error('📧 Email System: Failed to send task creation email:', error);
        }
    },

    /**
     * Triggers a notification for a task update (status or assignee change).
     */
    async notifyTaskUpdate(originalTask, updatedData) {
        if (!resend) {
            console.log('📧 Email System: Resend is not initialized.');
            return;
        }

        const updatedTask = { ...originalTask, ...updatedData };
        const hasStatusChanged = updatedData.status && updatedData.status !== originalTask.status;
        const hasAssigneeChanged = updatedData.assignee && updatedData.assignee !== originalTask.assignee;

        if (!hasStatusChanged && !hasAssigneeChanged) {
            console.log('📧 Email System: No relevant changes (status/assignee) for notification.');
            return;
        }

        const email = await this.getUserEmail(updatedTask.assignee);
        if (!email) return;

        try {
            const isAssigneeChange = hasAssigneeChanged;
            const changeType = isAssigneeChange ? 'assignee' : 'status';
            
            // Map IDs to Titles
            const oldStatusTitle = await this.getStatusTitle(originalTask.status);
            const newStatusTitle = await this.getStatusTitle(updatedTask.status);
            
            const taskForEmail = { ...updatedTask, status: newStatusTitle };
            const oldValue = isAssigneeChange ? originalTask.assignee : oldStatusTitle;
            const newValue = isAssigneeChange ? updatedTask.assignee : newStatusTitle;

            const subject = isAssigneeChange 
                ? `🔄 Task Reassigned: ${updatedTask.title}`
                : `📊 Task Status Update: ${updatedTask.title}`;

            console.log(`📧 Email System: Sending "Task Update" to ${email}...`);
            const data = await resend.emails.send({
                from: DEFAULT_FROM,
                to: email,
                subject,
                html: templates.taskUpdated(taskForEmail, APP_URL, changeType, oldValue, newValue),
            });
            console.log('📧 Email System: Resend API Response:', data);
        } catch (error) {
            console.error('📧 Email System: Failed to send task update email:', error);
        }
    }
};
