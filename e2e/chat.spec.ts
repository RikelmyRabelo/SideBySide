import { test, expect } from '@playwright/test';

test.describe('Fluxo E2E: Amizade e Chat em Tempo Real', () => {
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

    await expect(pageA.getByText('Procurar Par de Conversa')).toBeVisible();
    await expect(pageB.getByText('Procurar Par de Conversa')).toBeVisible();

   // =================================================================
    // 2. USER A ENVIA SOLICITAÇÃO DE AMIZADE PARA USER B
    // =================================================================
    
    // Abre o menu do usuário
    await pageA.getByRole('button', { name: 'User A User A' }).click();
    
    // Clica na opção "Lista de Amigos" que abrirá o modal de amigos
    await pageA.click('button:has-text("Lista de Amigos")'); 
    
    // Dentro da modal, interage para adicionar amigo
    await pageA.click('button:has-text("Adicionar")');
    await pageA.fill('input[placeholder="Ex: Usuario#1234"]', 'UserB#1234');
    
    // Envia a solicitação
    const requestPromise = pageA.waitForResponse(response => response.url().includes('/api/friends/request') && response.status() === 200);
    await pageA.click('button:has-text("Enviar Solicitação")');
    await requestPromise;
    
    await expect(pageA.getByText(/Solicitação enviada/i)).toBeVisible();

    // =================================================================
    // 3. USER B RECEBE E ACEITA A SOLICITAÇÃO
    // =================================================================
    
    await pageB.getByRole('button', { name: 'User B' }).click();
    await pageB.getByRole('button', { name: 'Lista de Amigos' }).click();
    await pageB.click('button:has-text("Pedidos")');
    
    const requestCard = pageB.locator('div').filter({ hasText: 'User A' }).filter({ hasText: 'quer te adicionar' }).first();
    await expect(requestCard).toBeVisible({ timeout: 10000 });
    await requestCard.locator('button:has-text("Aceitar")').click();

    // =================================================================
    // 4. TROCA DE MENSAGENS EM TEMPO REAL VIA SOCKET.IO
    // =================================================================
    
    await pageA.click('button:has-text("Amigos")');
    await pageA.click('button[title="Enviar Mensagem Direta"]');
    
    await pageB.click('button:has-text("Amigos")');
    await pageB.click('button[title="Enviar Mensagem Direta"]');

    const mensagemTeste = `Automated Socket Message ${Date.now()}`;
    await pageA.fill('input[placeholder="Escreva sua mensagem..."]', mensagemTeste);
    await pageA.locator('form button[type="submit"]').click();

    await expect(pageA.getByText(mensagemTeste)).toBeVisible();
    await expect(pageB.getByText(mensagemTeste)).toBeVisible({ timeout: 5000 });

    const respostaTeste = 'Message received loudly and clearly!';
    await pageB.fill('input[placeholder="Escreva sua mensagem..."]', respostaTeste);
    await pageB.locator('form button[type="submit"]').click();

    await expect(pageA.getByText(respostaTeste)).toBeVisible({ timeout: 5000 });

    await contextA.close();
    await contextB.close();
  });
});