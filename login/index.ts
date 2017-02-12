import * as nodemailer from "nodemailer";

const mailerOptions = {
    service: "Mailgun",
    auth: {
        user: process.env.MAILGUN_USER,
        pass: process.env.MAILGUN_PASS
    }
};

const transporter = nodemailer.createTransport(mailerOptions)

const message = {
    from: process.env.EMAIL_FROM,
    to: "webmusic@mailinator.com",
    subject: "Log in to WebMusic!",
    html: `<a href='http://${process.env.DOMAIN}'>Log in to WebMusic!</a>`
};

transporter.sendMail(message, console.error);