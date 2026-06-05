import nacl from "tweetnacl";

const PUBLIC_KEY_HEX = "83fc4f57a82abdf38610f22b0b1021230ec2fcc6d418182db557329b060e821c";

export interface LicenseValidationResult {
	valid: boolean;
	reason?: string;
	email?: string;
}

interface LicenseBundle {
	p: string;
	s: string;
}

interface LicensePayload {
	email: string;
	product: string;
	version: number;
	issuedAt: string;
}

export function validateLicense(licenseKey: string): LicenseValidationResult {
	if (!licenseKey || licenseKey.trim().length === 0) {
		return { valid: false, reason: "No license key provided." };
	}

	try {
		const bundleJson = atob(licenseKey.trim());
		const bundle = JSON.parse(bundleJson) as LicenseBundle;

		if (!bundle.p || !bundle.s) {
			return { valid: false, reason: "Invalid license key format." };
		}

		const signatureBytes = base64ToBytes(bundle.s);
		const messageBytes = new TextEncoder().encode(bundle.p);
		const publicKey = hexToBytes(PUBLIC_KEY_HEX);
		const valid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey);

		if (!valid) {
			return { valid: false, reason: "License key signature is invalid." };
		}

		const payload = JSON.parse(bundle.p) as LicensePayload;

		if (payload.product !== "ai-journal-coach") {
			return { valid: false, reason: "This license key is for a different product." };
		}

		return { valid: true, email: payload.email };

	} catch {
		return { valid: false, reason: "License key could not be parsed." };
	}
}

function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
	}
	return bytes;
}

function base64ToBytes(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}