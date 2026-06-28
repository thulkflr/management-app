import { NextResponse } from 'next/server';
import { getSheetData, addRowToSheet, deleteRowFromSheet, updateRowInSheet } from '@/lib/googleSheets';
import { auth } from '@/auth';
import { notificationService } from '@/lib/email/notificationService';

export async function GET(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); 

    const isAdmin = session.user.role === 'Admin';
    if (!isAdmin && (type === 'Members' || type === 'Wallet')) {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    try {
        const data = await getSheetData(type);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { type, payload } = await request.json();

        const isAdmin = session.user.role === 'Admin';
        if (!isAdmin && (type === 'Members' || type === 'Wallet')) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const result = await addRowToSheet(type, payload);

        // Background Trigger for Task Notification
        if (type === 'Tasks') {
            notificationService.notifyTaskCreated(result).catch(e => console.error('Email error:', e));
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { type, id, payload } = await request.json();

        const isAdmin = session.user.role === 'Admin';
        if (!isAdmin && (type === 'Members' || type === 'Wallet')) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        let originalTask = null;
        if (type === 'Tasks') {
            const allTasks = await getSheetData('Tasks');
            originalTask = allTasks.find(t => t.id === id);
        }

        const result = await updateRowInSheet(type, id, payload);

        // Background Trigger for Task Update Notification
        if (type === 'Tasks' && originalTask) {
            notificationService.notifyTaskUpdate(originalTask, payload)
                .catch(e => console.error('Email error:', e));
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // RBAC: Only Admins can delete anything
    const isAdmin = session.user.role === 'Admin';
    if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden: Admin access required to delete" }, { status: 403 });
    }

    try {
        const { type, id } = await request.json();
        await deleteRowFromSheet(type, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}