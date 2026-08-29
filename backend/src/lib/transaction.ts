import { prisma } from './prisma.js';

const MAX_RETRIES = 3;

export async function executeWithRetry<T>(
  transactionFn: (tx: any) => Promise<T>
): Promise<T> {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      return await prisma.$transaction(transactionFn, {
        isolationLevel: 'Serializable',
        maxWait: 5000,
        timeout: 10000,
      });
    } catch (error: any) {
      attempts++;
      if (error?.code === 'P2034' && attempts < MAX_RETRIES) {
        console.warn(`⚠️ Conflito de transação detectado (P2034). Tentativa ${attempts} de ${MAX_RETRIES}. Repetindo...`);
        await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attempts)));
        continue;
      }
      throw error;
    }
  }

  throw new Error('Número máximo de tentativas excedido para a transação concorrente.');
}