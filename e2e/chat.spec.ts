import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

test.describe('Fluxo E2E: Amizade e Chat em Tempo Real', () => {
  
  test.beforeAll(async () => {
    const connectionString = process.env.DATABASE_URL?.replace(':6543', ':5432').replace('?pgbouncer=true', '');
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
      const possibleTables = ['Friendship', 'FriendRelation', 'friendship', 'friendRelation', 'Friend', 'friends'];
      for (const table of possibleTables) {
        try {
          await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
        } catch (e) {
          // Ignora tabelas inexistentes
        }
      }
    } catch (e) {
      console.log('Limpeza via SQL ignorada:', e);
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }
  });

  test('User A envia pedido, User B aceita e ambos conversam via Socket', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // 1. LOGIN DOS DOIS USUÁRIOS
    await pageA.goto('http://localhost:5173/login');
    await pageA.getByRole('button', { name: 'Entrar', exact: true }).first().click();
    await pageA.fill('input[type="email"]', 'userA@teste.com');
    await pageA.fill('input[type="password"]', 'senha123');
    await pageA.locator('form').getByRole('button', { name: 'Entrar', exact: true }).click();

    await pageB.goto('http://localhost:5173/login');
    await pageB.getByRole('button', { name: 'Entrar', exact: true }).first().click();
    await pageB.fill('input[type="email"]', 'userB@teste.com');
    await pageB.fill('input[type="password"]', 'senha123');
    await pageB.locator('form').getByRole('button', { name: 'Entrar', exact: true }).click();

    await expect(pageA.getByRole('button', { name: /procurar par de conversa/i })).toBeVisible({ timeout: 10000 });
    await expect(pageB.getByRole('button', { name: /procurar par de conversa/i })).toBeVisible({ timeout: 10000 });
    
    // 2. USER A ENVIA SOLICITAÇÃO DE AMIZADE
    const menuBtnA = pageA.locator('header button:has(img)').first();
    await expect(menuBtnA).toBeVisible({ timeout: 10000 });
    await menuBtnA.click();
    
    await pageA.getByRole('button', { name: /Lista de Amigos/i }).click(); 
    await pageA.getByRole('button', { name: 'Adicionar' }).click();
    await pageA.fill('input[placeholder="Ex: Usuario#1234"]', 'UserB#1234');
    
    const requestPromise = pageA.waitForResponse(response => response.url().includes('/api/friends/request') && response.status() === 200);
    await pageA.getByRole('button', { name: 'Enviar Solicitação' }).click();
    await requestPromise;
    
    await expect(pageA.getByText(/Solicitação enviada/i)).toBeVisible();

    // 3. USER B RECEBE E ACEITA A SOLICITAÇÃO
    await pageB.reload();
    await expect(pageB.locator('header button:has(img)').first()).toBeVisible({ timeout: 15000 });
    await pageB.locator('header button:has(img)').first().click();
    
    await pageB.getByRole('button', { name: /Lista de Amigos/i }).click();
    await pageB.getByRole('button', { name: /Pedidos/i }).click();
    
    const btnAceitar = pageB.getByRole('button', { name: 'Aceitar' }).first();
    await expect(btnAceitar).toBeVisible({ timeout: 10000 });
    
    const acceptPromise = pageB.waitForResponse(response => response.url().includes('/api/friends/accept') && response.status() === 200);
    await btnAceitar.click();
    await acceptPromise;

    // Fecha o modal de amigos do User B
    await pageB.locator('button:has-text("✕")').first().click();

    // 4. TROCA DE MENSAGENS EM TEMPO REAL VIA SOCKET.IO

// -------------------------
// USER A ABRE O CHAT PRIMEIRO
// -------------------------

await pageA.reload();
await pageA.waitForLoadState('networkidle');

await pageA.locator('header button:has(img)').first().click();
await pageA.getByRole('button', { name: 'Conversas' }).click();

const chatContactA = pageA.locator('text=User B').first();

if (await chatContactA.isVisible({ timeout: 3000 }).catch(() => false)) {
  await chatContactA.click();
} else {
  await pageA
    .locator('.fixed.inset-0')
    .locator('div')
    .filter({ hasText: /User|Conversa/i })
    .first()
    .click();
}

await expect(
  pageA.locator('input[placeholder="Escreva sua mensagem..."]')
).toBeVisible({ timeout: 10000 });


// -------------------------
// USER B ABRE O CHAT
// -------------------------

await pageB.locator('header button:has(img)').first().click();
await pageB.getByRole('button', { name: 'Conversas' }).click();

const chatContactB = pageB.locator('text=User A').first();

if (await chatContactB.isVisible({ timeout: 3000 }).catch(() => false)) {
  await chatContactB.click();
} else {
  await pageB
    .locator('.fixed.inset-0')
    .locator('div')
    .filter({ hasText: /User|Conversa/i })
    .first()
    .click();
}

await expect(
  pageB.locator('input[placeholder="Escreva sua mensagem..."]')
).toBeVisible({ timeout: 10000 });


// -------------------------
// B ENVIA
// -------------------------

const mensagemTeste = `Automated Socket Message ${Date.now()}`;

await pageB.fill(
  'input[placeholder="Escreva sua mensagem..."]',
  mensagemTeste
);

await pageB.locator('form button[type="submit"]').click();

await expect(
  pageB.getByText(mensagemTeste)
).toBeVisible({ timeout: 5000 });


// -------------------------
// A RECEBE VIA SOCKET
// -------------------------

await expect(
  pageA.getByText(mensagemTeste)
).toBeVisible({ timeout: 15000 });


// -------------------------
// A RESPONDE
// -------------------------

const respostaTeste = 'Message received loudly and clearly!';

await pageA.fill(
  'input[placeholder="Escreva sua mensagem..."]',
  respostaTeste
);

await pageA.locator('form button[type="submit"]').click();


// -------------------------
// B RECEBE
// -------------------------

await expect(
  pageB.getByText(respostaTeste)
).toBeVisible({ timeout: 15000 });
  });
});