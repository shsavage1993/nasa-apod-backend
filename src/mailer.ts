import nodemailer from 'nodemailer';
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { Attachment } from 'nodemailer/lib/mailer';
import multer from 'multer';
import Logger from "./lib/logger";
import path from 'path';
import { inDevOrProd, inDevTest } from './lib/checkNodeEnv';

export const createTransporter = async () => {
    let transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

    if (!inDevOrProd() && !inDevTest()) {
        // Generate test SMTP service account from ethereal.email
        const testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
            logger: true
        });
    } else {
        const port = process.env.MAILER_PORT ? parseInt(process.env.MAILER_PORT) : undefined;
        transporter = nodemailer.createTransport({
            host: process.env.MAILER_HOST,
            port: port,
            secure: port === 465 ? true : false,
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASS,
            },
            // debug: true, // show debug output
            logger: process.env.NODE_ENV !== 'production' ? true : false // log information in console
        });
    }

    return transporter;
}

export const verifyTransporter = (transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>) => {
    // verify nodemailer transporter connection configuration
    transporter.verify(function (error, success) {
        if (error) {
            Logger.error(error);
        } else {
            Logger.debug("SMTP connection verified - Server is ready to accept messages");
        }
    });
}

export const sendMail = (
    transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>,
    from: string,
    to: string,
    subject: string,
    text: string,
    attachment: Attachment | undefined
) => {
    // Specify mailOptions
    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text,
    };

    if (attachment) {
        Object.assign(mailOptions, { attachments: [attachment] })
    }

    // Send mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            Logger.error(error);
        }

        Logger.info(`Message sent: ${info.messageId} - ${info.response}`);
        if (!inDevOrProd() && !inDevTest()) {
            // Preview only available when sending through an Ethereal account
            Logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
    });
}

// Multer options for error handling
export const multerUpload = multer({
    // dest: 'uploads/',
    fileFilter: function (req, file, cb) {
        if (!['.doc', '.docx', '.pdf'].includes(path.extname(file.originalname))) {
            return cb(new Error('Unsupported file format, only .doc, .docx, .pdfs allowed'))
        }
        cb(null, true)
    },
    limits: { fileSize: 2 * 1024 * 1024 }
});