import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationsModal } from '../components/dashboard/NotificationsModal';

describe('NotificationsModal', () => {
  const mockNotifications = [
    { id: '1', title: 'Notif 1', message: 'Msg 1', read: false, createdAt: new Date().toISOString() },
    { id: '2', title: 'Notif 2', message: 'Msg 2', read: true, createdAt: new Date().toISOString() },
  ];

  it('não deve renderizar se isOpen for falso', () => {
    const { container } = render(<NotificationsModal isOpen={false} onClose={vi.fn()} notifications={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('deve renderizar a lista de notificações', () => {
    render(<NotificationsModal isOpen={true} onClose={vi.fn()} notifications={mockNotifications} />);
    expect(screen.getByText('Notif 1')).toBeDefined();
    expect(screen.getByText('Notif 2')).toBeDefined();
    expect(screen.getByText('1 novas')).toBeDefined();
  });

  it('deve exibir o botão de Carregar Mais quando hasMore for verdadeiro', () => {
    const onLoadMoreMock = vi.fn();
    render(
      <NotificationsModal 
        isOpen={true} 
        onClose={vi.fn()} 
        notifications={mockNotifications} 
        hasMore={true}
        onLoadMore={onLoadMoreMock}
      />
    );
    
    const btn = screen.getByText('Carregar Mais');
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(onLoadMoreMock).toHaveBeenCalled();
  });

  it('deve desabilitar o botão e mostrar Carregando quando isLoadingMore for verdadeiro', () => {
    render(
      <NotificationsModal 
        isOpen={true} 
        onClose={vi.fn()} 
        notifications={mockNotifications} 
        hasMore={true}
        isLoadingMore={true}
      />
    );
    
    const btn = screen.getByText('Carregando...');
    expect(btn).toBeDefined();
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });
});