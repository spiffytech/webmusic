import * as nodemailer from "nodemailer";
const nacl = require("tweetnacl");
nacl.auth = require("tweetnacl-auth");
import * as url from "url";

const MAILER_OPTIONS = {
    service: "Mailgun",
    auth: {
        user: process.env.MAILGUN_USER,
        pass: process.env.MAILGUN_PASS
    }
};

const TOKEN_TTL = 1000 * 3600 * 24;
const EMAIL_FROM = process.env.EMAIL_FROM;

export function makeHmac(message: string) {
    const macBytes = nacl.auth(message, process.env.HMAC_KEY);
    const macStr = Buffer.from(macBytes).toString("hex");
    return macStr;
}

/**
 * Accepts an original message, and an untrusted HMAC of it, and compares
 * against us signing the message now
 */
export function verifyMac(message: string, untrustedMacStr: string) {
    const untrustedMacBytes = Buffer.from(untrustedMacStr, "hex");

    const trustedMacStr = makeHmac(message);
    const trustedMacBytes = Buffer.from(trustedMacStr, "hex");

    return nacl.verify(untrustedMacBytes, trustedMacBytes);
}

/**
 * Accepts a token from a login URL. Verifies the token is validly signed, and is not expired.
 */
export function verifyToken(token: string) {
    const [email, expirationDate, mac] = token.split("|");
    const toVerify = [email, expirationDate].join("|");
    console.log("token:", token);
    if (!verifyMac(toVerify, mac)) console.log("invalid mac");
    if (new Date(expirationDate) < new Date()) console.log("invalid date");

    if (!verifyMac(toVerify, mac)) return false;
    if (new Date(expirationDate) < new Date()) return false;
    return email;
}

/**
 * Returns a string "email|datestring|mac"
 */
export function buildLoginToken(userEmail: string) {
    const expirationDate = new Date(new Date().getTime() + TOKEN_TTL).toString();
    const message = [userEmail, expirationDate].join("|");
    const mac = makeHmac(message);
    return [message, mac].join("|");
}

/**
 * Builds the URL a user will click to log in
 */
export function buildLoginUrl(token: string) {
    return url.format({
        protocol: "http",
        host: process.env.DOMAIN,
        pathname: "login",
        query: {token}
    });
}

/**
 * Sends a login email for the given user. Uses an HMAC'd login token to verify
 * the user's identity (only the user will have access to their email to click
 * the link).
 */
export function sendLoginEmail(userEmail: string) {
    const loginToken = buildLoginToken(userEmail);
    const loginUrl = buildLoginUrl(loginToken);

    const message = {
        from: EMAIL_FROM,
        to: userEmail,
        subject: "Log in to WebMusic!",
        html: `<a href='${loginUrl}'>Log in to WebMusic!</a>`
    };

    const transporter = nodemailer.createTransport(MAILER_OPTIONS);

    return new Promise((resolve, reject) =>
        transporter.sendMail(
            message,
            (err) => err ? reject(err) : resolve()
        )
    )
}