import nodemailer from 'nodemailer';

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

if (!gmailUser || !gmailAppPassword) {
    console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD is missing. Emails will not be sent.');
}

export const mailer = (gmailUser && gmailAppPassword)
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailAppPassword,
        },
    })
    : null;
