/**
 * Email templates for Photobiz Management Task System
 * Optimized for Premium Gold & Black visual identity.
 */

const APP_NAME = 'Caprice MGMT';
const BRAND_GOLD = '#c5a022';
const BG_DARK = '#000000';
const TEXT_WHITE = '#ffffff';
const TEXT_MUTED = '#94a3b8';

const getBaseTemplate = (content, taskLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Inter', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1a1a1a; }
        .container { max-width: 600px; margin: 40px auto; background-color: ${BG_DARK}; color: ${TEXT_WHITE}; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2); }
        .header { padding: 40px; text-align: center; border-bottom: 1px solid rgba(197, 160, 34, 0.1); }
        .logo { font-size: 24px; font-weight: 900; color: ${BRAND_GOLD}; text-transform: uppercase; letter-spacing: -1px; font-style: italic; }
        .logo span { color: white; font-weight: 300; font-style: normal; opacity: 0.5; }
        .content { padding: 40px; }
        .title { font-size: 20px; font-weight: 800; margin-bottom: 24px; letter-spacing: -0.5px; }
        .detail-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(197, 160, 34, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 32px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
        .detail-label { color: ${TEXT_MUTED}; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
        .detail-value { font-weight: 700; font-size: 13px; color: ${TEXT_WHITE}; }
        .btn { display: block; background-color: ${BRAND_GOLD}; color: black !important; text-align: center; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 20px; }
        .footer { padding: 30px; text-align: center; font-size: 10px; color: ${TEXT_MUTED}; opacity: 0.5; border-top: 1px solid rgba(255,255,255,0.05); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">CAPRICE <span>MGMT</span></div>
        </div>
        <div class="content">
            ${content}
            <a href="${taskLink}" class="btn">View Task Details</a>
        </div>
        <div class="footer">
            &copy; 2026 CAPRICE MEDIA PRODUCTION. ALL RIGHTS RESERVED.
        </div>
    </div>
</body>
</html>
`;

export const templates = {
    taskCreated: (task, appUrl) => {
        const taskLink = `${appUrl}/tasks/${task.id}`;
        const content = `
            <div class="title">New Task Assigned to You</div>
            <p style="color: ${TEXT_MUTED}; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
                Hello, you have been assigned a new task: <strong>${task.title}</strong>. Please review the details below.
            </p>
            <div class="detail-card">
                <div class="detail-row">
                    <span class="detail-label">Priority</span>
                    <span class="detail-value" style="color: ${task.priority === 'high' ? '#ef4444' : BRAND_GOLD}">${task.priority?.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Type</span>
                    <span class="detail-value">${task.type?.replace(/-/g, ' ').toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">${task.status?.toUpperCase()}</span>
                </div>
                <div class="detail-row" style="border: none;">
                    <span class="detail-label">Due Date</span>
                    <span class="detail-value">${task.dueDate || 'No Date Set'}</span>
                </div>
            </div>
        `;
        return getBaseTemplate(content, taskLink);
    },

    taskUpdated: (task, appUrl, changeType, oldValue, newValue) => {
        const taskLink = `${appUrl}/tasks/${task.id}`;
        let message = '';
        
        if (changeType === 'status') {
            message = `The status of task <strong>${task.title}</strong> has changed from <span style="text-decoration: line-through;">${oldValue}</span> to <strong>${newValue}</strong>.`;
        } else if (changeType === 'assignee') {
            message = `You have been assigned to task <strong>${task.title}</strong>. Previous assignee: ${oldValue || 'None'}.`;
        }

        const content = `
            <div class="title">Task Update Notification</div>
            <p style="color: ${TEXT_MUTED}; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
                ${message}
            </p>
            <div class="detail-card">
                <div class="detail-row">
                    <span class="detail-label">Current Status</span>
                    <span class="detail-value">${task.status?.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Priority</span>
                    <span class="detail-value">${task.priority?.toUpperCase()}</span>
                </div>
                <div class="detail-row" style="border: none;">
                    <span class="detail-label">Assignee</span>
                    <span class="detail-value">${task.assignee}</span>
                </div>
            </div>
        `;
        return getBaseTemplate(content, taskLink);
    }
};
