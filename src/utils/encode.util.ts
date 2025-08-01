import { SHA256 } from 'crypto-js';

export class EncodeUtil {
  hashData(data: string): string {
    return SHA256(data).toString();
  }

  compareData(data: string, hashedData: string): boolean {
    return SHA256(data).toString() === hashedData;
  }
}
