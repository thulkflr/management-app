// app/api/debug-env/route.js
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
        GOOGLE_SPREADSHEET_ID: !!process.env.GOOGLE_SPREADSHEET_ID,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: !!process.env.VERCEL,
    });
}
