// lib/googleSheets.js
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, serviceAccountAuth);

export async function getSheetData(sheetTitle) {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetTitle];
    const rows = await sheet.getRows();
    // Convert rows to plain objects
    return rows.map(row => row.toObject());
}

export async function addRowToSheet(sheetTitle, data) {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetTitle];
    await sheet.addRow(data);
    return data;
}

export async function deleteRowFromSheet(sheetTitle, id) {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetTitle];
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(r => r.get('id') === id);
    if (rowToDelete) {
        await rowToDelete.delete();
    }
}