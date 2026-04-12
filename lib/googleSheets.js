import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Factory: creates a fresh authenticated doc instance per call (lazy init)
function createDoc() {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    const missing = [];
    if (!serviceAccountEmail) missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    if (!privateKey) missing.push('GOOGLE_PRIVATE_KEY');
    if (!spreadsheetId) missing.push('GOOGLE_SPREADSHEET_ID');

    if (missing.length > 0) {
        throw new Error(`Missing required Google Sheets environment variables: ${missing.join(', ')}`);
    }

    // Handle escaped newlines in private key (common in env vars)
    const formattedKey = privateKey.replace(/\\n/g, '\n');

    const auth = new JWT({
        email: serviceAccountEmail,
        key: formattedKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return new GoogleSpreadsheet(spreadsheetId, auth);
}

export async function getSheetData(sheetTitle) {
    try {
        const doc = createDoc();
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
    try {
        const doc = createDoc();
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle[sheetTitle];
        if (!sheet) throw new Error(`Sheet "${sheetTitle}" not found`);

        await sheet.addRow(data);
        return data;
    } catch (error) {
        console.error(`Error adding to ${sheetTitle}:`, error);
        throw error;
    }
}

export async function updateRowInSheet(sheetTitle, id, updatedData) {
    try {
        const doc = createDoc();
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle[sheetTitle];
        if (!sheet) throw new Error(`Sheet "${sheetTitle}" not found`);

        const rows = await sheet.getRows();
        const rowToUpdate = rows.find(row => row.get('id') === id);

        if (rowToUpdate) {
            // Use row.assign for google-spreadsheet v4+
            rowToUpdate.assign(updatedData);
            await rowToUpdate.save();
            return rowToUpdate.toObject();
        } else {
            throw new Error(`Row with id ${id} not found in ${sheetTitle}`);
        }
    } catch (error) {
        console.error(`Error updating in ${sheetTitle}:`, error);
        throw error;
    }
}

export async function deleteRowFromSheet(sheetTitle, id) {
    try {
        const doc = createDoc();
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle[sheetTitle];
        if (!sheet) throw new Error(`Sheet "${sheetTitle}" not found`);

        const rows = await sheet.getRows();
        const rowToDelete = rows.find(row => row.get('id') === id);

        if (rowToDelete) {
            await rowToDelete.delete();
            return { success: true };
        } else {
            throw new Error(`Row with id ${id} not found in ${sheetTitle}`);
        }
    } catch (error) {
        console.error(`Error deleting from ${sheetTitle}:`, error);
        throw error;
    }
}