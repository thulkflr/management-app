import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// استخراج المتغيرات من البيئة
const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

// معالجة المفتاح الخاص لحل مشكلة الأسطر الجديدة (\n)
const formattedKey = privateKey ? privateKey.replace(/\\n/g, '\n') : undefined;

const serviceAccountAuth = new JWT({
    email: serviceAccountEmail,
    key: formattedKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);

export async function getSheetData(sheetTitle) {
    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle[sheetTitle];
        if (!sheet) throw new Error(`Sheet "${sheetTitle}" not found`);
        const rows = await sheet.getRows();
        return rows.map(row => row.toObject());
    } catch (error) {
        console.error(`Error fetching ${sheetTitle}:`, error);
        return [];
    }
}

export async function addRowToSheet(sheetTitle, data) {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetTitle];
    await sheet.addRow(data);
    return data;
}