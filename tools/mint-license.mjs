import nacl from "tweetnacl";
import { Buffer } from "buffer";

const PRIVATE_KEY_HEX = process.env.AIJC_PRIVATE_KEY;

if (!PRIVATE_KEY_HEX) {
  console.error("Error: AIJC_PRIVATE_KEY environment variable not set.");
  console.error("Usage: AIJC_PRIVATE_KEY=<your-private-key> npm run mint -- <email>");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("Error: Email argument required.");
  console.error("Usage: AIJC_PRIVATE_KEY=<your-private-key> npm run mint -- <email>");
  process.exit(1);
}

const privateKey = Buffer.from(PRIVATE_KEY_HEX, "hex");

const payload = JSON.stringify({
  email: email.toLowerCase().trim(),
  product: "ai-journal-coach",
  version: 1,
  issuedAt: new Date().toISOString(),
});

const messageBytes = Buffer.from(payload, "utf8");
const signature = nacl.sign.detached(messageBytes, privateKey);

// Combine payload + signature into one bundle
const bundle = JSON.stringify({
  p: payload,
  s: Buffer.from(signature).toString("base64"),
});

const licenseKey = Buffer.from(bundle, "utf8").toString("base64");

console.log("=== License Minted ===");
console.log("");
console.log("Email:  ", email);
console.log("");
console.log("LICENSE KEY (send this to customer):");
console.log(licenseKey);