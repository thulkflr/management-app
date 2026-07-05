import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/auth';

export async function POST(request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const blob = await put(`attachments/${filename}`, file, {
            access: 'public',
        });

        return NextResponse.json({
            success: true,
            url: blob.url,
            name: file.name
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
