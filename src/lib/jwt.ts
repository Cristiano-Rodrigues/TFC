import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_1234567890';

function base64url(str: string | Buffer): string {
  if (typeof str === 'string') {
    return Buffer.from(str).toString('base64url');
  }
  return str.toString('base64url');
}

export function signToken(payload: object): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  return `${encodedHeader}.${encodedPayload}.${base64url(signature)}`;
}

export function verifyToken(token: string): any {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) return null;
    
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();
      
    if (base64url(expectedSignature) !== signature) {
      return null;
    }
    
    return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch (e) {
    return null;
  }
}
