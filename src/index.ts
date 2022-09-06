import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import Logger from "./lib/logger";
import morganMiddleware from './lib/morganMiddleware';
import { createTransporter, verifyTransporter, sendMail, multerUpload } from './mailer';
import { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

// only load .env file if server is not in production mode
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app: Express = express();
const port = process.env.PORT || 5000;

// Set up logging
app.use(morganMiddleware);

// Set up CORS
var corsOptions = {
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

// app.get('/api', cors(corsOptions), (req: Request, res: Response) => {
//     res.send('Express + TypeScript Server');
// });

// Create nodemailer transporter and verify connection
let transporter: Transporter<SMTPTransport.SentMessageInfo>
createTransporter().then((result) => {
    transporter = result
    verifyTransporter(transporter);
});

app.post('/api/contact', multerUpload.single('cv'), (req: Request, res: Response) => {
    const formData = req.body;
    const formFile = req.file;
    Logger.http(`${req.method} ${req.url}: Request from ${req.get('host')}`)
    Logger.http(formData);
    Logger.http(formFile);

    // define mail option variables
    const from = `"${req.body.firstName} ${req.body.lastName}" <from@example.com>`
    const to = process.env.MAIL_TO!;
    const subject = req.body.subject;
    const text = req.body.body;
    const attachment = req.file ? { filename: req.file.originalname, content: req.file.buffer } : undefined;

    sendMail(transporter, from, to, subject, text, attachment)
    res.sendStatus(200);
});

app.listen(port, () => {
    Logger.debug(`Server is running at http://localhost:${port}`);
});