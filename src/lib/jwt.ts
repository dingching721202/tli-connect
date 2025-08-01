// JWT 工具函數 - 用於生成和驗證 JWT tokens
// 注意：這是示範實現，生產環境應使用真正的 JWT 庫如 jsonwebtoken

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat: number; // 發行時間
  exp: number; // 過期時間
}

// 簡化的 JWT 實現（僅用於示範）
class SimpleJWT {
  private readonly secret = 'your-secret-key'; // 生產環境應使用環境變數

  // 跨平台 Base64 編碼
  private base64Encode(str: string): string {
    if (typeof window !== 'undefined') {
      // 瀏覽器環境
      return btoa(str);
    } else {
      // Node.js 環境
      return Buffer.from(str).toString('base64');
    }
  }

  // 跨平台 Base64 解碼
  private base64Decode(str: string): string {
    if (typeof window !== 'undefined') {
      // 瀏覽器環境
      return atob(str);
    } else {
      // Node.js 環境
      return Buffer.from(str, 'base64').toString();
    }
  }

  // 生成 JWT token
  generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: now + (24 * 60 * 60) // 24 小時過期
    };

    // 簡化實現：使用 Base64 編碼（支援 Node.js 和瀏覽器）
    const header = this.base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = this.base64Encode(JSON.stringify(fullPayload));
    const signature = this.base64Encode(`${header}.${encodedPayload}.${this.secret}`);

    return `${header}.${encodedPayload}.${signature}`;
  }

  // 驗證和解析 JWT token
  verifyToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const [header, payload, signature] = parts;
      
      // 驗證簽名
      const expectedSignature = this.base64Encode(`${header}.${payload}.${this.secret}`);
      if (signature !== expectedSignature) {
        return null;
      }

      // 解析 payload
      const decodedPayload: JWTPayload = JSON.parse(this.base64Decode(payload));
      
      // 檢查過期時間
      const now = Math.floor(Date.now() / 1000);
      if (decodedPayload.exp < now) {
        return null; // Token 已過期
      }

      return decodedPayload;
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  }

  // 檢查 token 是否即將過期（1小時內）
  isTokenExpiringSoon(token: string): boolean {
    const payload = this.verifyToken(token);
    if (!payload) return true;

    const now = Math.floor(Date.now() / 1000);
    const oneHour = 60 * 60;
    return (payload.exp - now) < oneHour;
  }
}

export const jwtUtils = new SimpleJWT();

// 中間件函數：驗證請求中的 JWT token
export function validateJWT(request: Request): JWTPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // 移除 'Bearer ' 前綴
  return jwtUtils.verifyToken(token);
}