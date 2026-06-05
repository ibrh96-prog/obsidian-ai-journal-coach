import nacl from "tweetnacl";
import { Buffer } from "buffer";

const keypair = nacl.sign.keyPair();

console.log("=== AI Journal Coach — New Keypair ===");
console.log("");
console.log("PUBLIC KEY (embed in source):");
console.log(Buffer.from(keypair.publicKey).toString("hex"));
console.log("");
console.log("PRIVATE KEY (store securely, never commit):");
console.log(Buffer.from(keypair.secretKey).toString("hex"));
console.log("");
console.log("IMPORTANT: Save the private key somewhere safe. It cannot be recovered.");