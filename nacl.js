const nacl = require("tweetnacl");
nacl.auth = require("tweetnacl-auth");

const mac = nacl.auth("cows", process.env.HMAC_KEY);
const macStr = Buffer.from(mac).toString("hex");
const macBuffer = Buffer.from(macStr, "hex");
console.log(macStr);
console.log(nacl.verify(mac, macBuffer));
