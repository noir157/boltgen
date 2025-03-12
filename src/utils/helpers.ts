export function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export async function delay(timeout: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, timeout));
}

export async function randomDelay(min = 300, max = 800): Promise<number> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
  return delay;
}

export function generateUsername(): string {
  const prefix = 'user_';
  const randomPart = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}${randomPart}${timestamp}`;
}

export function generatePassword(): string {
  const randomPart = Math.random().toString(36).substring(2, 8);
  const number = Math.floor(Math.random() * 900) + 100; // 100-999
  return `Pass_${randomPart}_${number}!`;
}

type LogType = 'info' | 'warn' | 'error' | 'success';

export function log(message: string, type: LogType = 'info'): void {
  const timestamp = new Date().toISOString().slice(11, 19);
  const prefix = {
    info: '📘 INFO',
    warn: '⚠️ WARNING',
    error: '❌ ERROR',
    success: '✅ SUCCESS'
  }[type];

  console.log(`[${timestamp}] ${prefix}: ${message}`);
}