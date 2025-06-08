import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "default-key-change-in-production";
const ALGORITHM = "aes-256-cbc";

// パスワードからキーを導出
const scryptAsync = promisify(scrypt);

async function getKey(): Promise<Buffer> {
  return (await scryptAsync(ENCRYPTION_KEY, "salt", 32)) as Buffer;
}

export async function encryptToBuffer(text: string): Promise<Buffer> {
  const key = await getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // IVと暗号化されたデータを結合
  const combined = Buffer.concat([iv, Buffer.from(encrypted, "hex")]);
  return combined;
}

export async function decryptFromBuffer(buffer: Buffer): Promise<string> {
  const key = await getKey();
  const iv = buffer.slice(0, 16);
  const encrypted = buffer.slice(16);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// MFAシークレット用のヘルパー
export async function encryptMfaSecret(secret: string): Promise<Buffer> {
  return await encryptToBuffer(secret);
}

export async function decryptMfaSecret(
  encryptedBuffer: Buffer,
): Promise<string> {
  return await decryptFromBuffer(encryptedBuffer);
}

// OAuth トークン用のヘルパー
export async function encryptToken(token: string): Promise<Buffer> {
  return await encryptToBuffer(token);
}

export async function decryptToken(encryptedBuffer: Buffer): Promise<string> {
  return await decryptFromBuffer(encryptedBuffer);
}
