// app/api/data/route.js
import { NextResponse } from 'next/server';
import { getSheetData, addRowToSheet, deleteRowFromSheet } from '@/lib/googleSheets';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'Members', 'Projects', etc.

    try {
        const data = await getSheetData(type);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { type, payload } = await request.json();
        const result = await addRowToSheet(type, payload);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { type, id } = await request.json();
        await deleteRowFromSheet(type, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}