const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_1234567890';

function base64urlEncode(buffer: Uint8Array | ArrayBuffer): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecode(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signToken(payload: any, expiresInSeconds: number = 604800): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encoder = new TextEncoder();
  
  const encodedHeader = base64urlEncode(encoder.encode(JSON.stringify(header)));
  
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };
  
  const encodedPayload = base64urlEncode(encoder.encode(JSON.stringify(fullPayload)));
  
  const dataToSign = encoder.encode(`${encodedHeader}.${encodedPayload}`);
  const key = await getCryptoKey();
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, dataToSign);
  const signature = base64urlEncode(signatureBuffer);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, signature] = parts;
    
    const encoder = new TextEncoder();
    const dataToVerify = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const signatureBuffer = base64urlDecode(signature);
    const key = await getCryptoKey();
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      dataToVerify
    );
    
    if (!isValid) return null;
    
    const payloadString = new TextDecoder().decode(base64urlDecode(encodedPayload));
    const parsedPayload = JSON.parse(payloadString);
    
    if (parsedPayload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (parsedPayload.exp < now) {
        return null;
      }
    }
    
    return parsedPayload;
  } catch (e) {
    return null;
  }
}
