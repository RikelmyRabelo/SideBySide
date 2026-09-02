import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ForgotPassword } from '../ForgotPassword';

describe('ForgotPassword Component', () => {
  it('deve renderizar os elementos da tela de recuperação de senha corretamente', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    expect(screen.getByText('Esqueceu a Senha?')).toBeDefined();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeDefined();
    expect(screen.getByRole('button', { name: /enviar código/i })).toBeDefined();
  });
});