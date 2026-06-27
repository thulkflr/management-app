// app/api/data/route.js
import { NextResponse } from 'next/server';
import { getSheetData, addRowToSheet, deleteRowFromSheet, updateRowInSheet } from '@/lib/googleSheets';
import { auth } from '@/auth';

export async function GET(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'Members', 'Projects', etc.

    // RBAC: Only Admins can access Members or Wallet data
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

        // RBAC: Only Admins can modify Members or Wallet
        const isAdmin = session.user.role === 'Admin';
        if (!isAdmin && (type === 'Members' || type === 'Wallet')) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const result = await addRowToSheet(type, payload);
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

        // RBAC: Only Admins can modify Members or Wallet
        const isAdmin = session.user.role === 'Admin';
        if (!isAdmin && (type === 'Members' || type === 'Wallet')) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const result = await updateRowInSheet(type, id, payload);
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