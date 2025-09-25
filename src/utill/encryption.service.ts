import { randomBytes, createCipheriv, createHash, createDecipheriv } from 'crypto';

const key = Buffer.from(process.env.AES_KEY, 'hex'); // 32바이트 AES-256 키

// AES-256-GCM 암호화
export function encryptAES256GCM(data: string)
{
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
};

// SHA-256 해시 생성
export function hashSHA256(value: string)
{
  return createHash('sha256').update(value).digest('hex');
};

//복호화
//AES-256-GCM
export function decryptionAES256GCM(encryptedPart: Buffer, ivPart: Buffer, authTagPart: Buffer): string
{
  const decipher = createDecipheriv('aes-256-gcm', key, ivPart);
  decipher.setAuthTag(authTagPart);

  const decryptedBuffer = Buffer.concat([
    decipher.update(encryptedPart),
    decipher.final(),
  ]);

  return decryptedBuffer.toString('utf8');
}