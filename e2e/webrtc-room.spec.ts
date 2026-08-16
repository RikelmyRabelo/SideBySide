import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação e Matchmaking (Login.tsx & Room.tsx)', () => {

  test.beforeEach(async ({ page }) => {
    // Acessa a página de login
    await page.goto('/login');
    
    // O formulário fica no final da página. Clicar no botão do header garante o scroll.
    const accessButton = page.locator('header button:has-text("Acessar")');
    if (await accessButton.isVisible()) {
      await accessButton.click();
    }
  });

  test('Deve realizar o login com sucesso e redirecionar para o dashboard', async ({ page }) => {
    // MOCK: Finge que o backend aprovou o login instantaneamente
    await page.route('**/api/auth/login', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'token-falso-123', user: { email: 'usuarioA@teste.com' } })
    }));

    // 1. Vai para a aba de Login
    await page.locator('button', { hasText: 'Entrar' }).first().click();

    // 2. Preenche o formulário
    await page.getByPlaceholder('seu@email.com').fill('usuarioA@teste.com');
    await page.getByPlaceholder('Sua senha').fill('123456');

    // 3. Clica em Entrar
    await page.locator('button', { hasText: /^Entrar$/ }).last().click();

    // 4. Como o mock forçou o sucesso, o redirecionamento DEVE ocorrer
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Deve exibir erro ao tentar cadastrar sem aceitar os termos', async ({ page }) => {
    // Garante que está na aba "Criar Conta"
    await page.locator('button', { hasText: 'Criar Conta' }).click();

    await page.getByPlaceholder('seu@email.com').fill('novo_usuario@teste.com');
    await page.getByPlaceholder('Sua senha').fill('SenhaForte123!');

    // Tenta submeter sem marcar o checkbox
    await page.locator('button', { hasText: 'Cadastrar Gratuitamente' }).click();

    // Verifica a mensagem de erro da interface
    const errorMessage = page.locator('text=Você deve aceitar os Termos de Uso e a Política de Moderação para continuar.');
    await expect(errorMessage).toBeVisible();
  });

  test('Deve realizar o cadastro com sucesso ao aceitar os termos e ir para Verificação', async ({ page }) => {
    // MOCK: Finge que o banco de dados criou o usuário com sucesso
    await page.route('**/api/auth/register', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Registro concluído, verifique seu e-mail.' })
    }));

    await page.locator('button', { hasText: 'Criar Conta' }).click();

    // Podemos usar e-mails estáticos porque o banco real nunca será tocado neste teste
    await page.getByPlaceholder('seu@email.com').fill('qualquer_email@teste.com');
    await page.getByPlaceholder('Sua senha').fill('SenhaForte123!');

    // Marca os termos
    await page.locator('input[type="checkbox"]').check();

    // Clica em cadastrar
    await page.locator('button', { hasText: 'Cadastrar Gratuitamente' }).click();

    // O cadastro bem-sucedido redireciona imediatamente para a verificação de código
    await expect(page).toHaveURL(/\/verify-code/);
  });

  test('Fluxo de "Esqueceu sua senha?" deve exibir mensagem de sucesso', async ({ page }) => {
    // MOCK: Finge que a API enviou o e-mail de recuperação perfeitamente
    await page.route('**/api/auth/forgot-password', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Enviamos um link de redefinição de senha para o seu e-mail!' })
    }));

    // Muda para a aba de Login para ver o botão
    await page.locator('button', { hasText: 'Entrar' }).first().click();

    // Clica no link e preenche e-mail
    await page.locator('button', { hasText: 'Esqueceu sua senha?' }).click();
    await expect(page.locator('h2:has-text("Recuperar Senha")')).toBeVisible();
    await page.getByPlaceholder('seu@email.com').fill('usuario_esquecido@teste.com');

    // Submete
    await page.locator('button', { hasText: 'Enviar E-mail de Recuperação' }).click();

    // Verifica a mensagem de sucesso que agora será disparada pelo Mock
    const successMessage = page.locator('text=Enviamos um link de redefinição de senha para o seu e-mail!');
    await expect(successMessage).toBeVisible();
  });

  test('Deve iniciar a busca de par no dashboard e transicionar para a sala de vídeo (Matchmaking E2E)', async ({ page }) => {
    // MOCK: Usuário logado
    await page.route('**/api/user/me', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'user-1', name: 'Usuário Teste', email: 'usuarioA@teste.com', level: 'B1' })
    }));

    // MOCK: Status da sala limpo
    await page.route('**/api/room/status', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ hasActiveSession: false })
    }));

    // Navega para o dashboard simulando sessão ativa
    await page.goto('/dashboard');

    // Clica no botão de iniciar prática / buscar par
    const startPracticeButton = page.locator('button:has-text("Iniciar Prática"), button:has-text("Praticar Agora")').first();
    await startPracticeButton.click();

    // Valida transição correta para a rota da sala de vídeo
    await expect(page).toHaveURL(/\/room/);
  });
});