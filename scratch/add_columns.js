const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const getValue = (key) => {
    const match = env.match(new RegExp(`${key}=(.*)`));
    if (!match) return null;
    let val = match[1].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
    }
    return val;
};

async function addColumns() {
    const serviceAccountEmail = getValue('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const privateKey = getValue('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');
    const spreadsheetId = getValue('GOOGLE_SPREADSHEET_ID');

    const auth = new JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(spreadsheetId, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Tasks'];
    await sheet.loadHeaderRow();
    
    const headers = sheet.headerValues;
    const newHeaders = [...headers];
    let changed = false;
    
    if (!headers.includes('checklist')) {
        newHeaders.push('checklist');
        changed = true;
    }
    if (!headers.includes('attachments')) {
        newHeaders.push('attachments');
        changed = true;
    }
    
    if (changed) {
        await sheet.setHeaderRow(newHeaders);
        console.log('Headers updated:', newHeaders);
    } else {
        console.log('Headers already up to date:', headers);
    }
}

addColumns();
