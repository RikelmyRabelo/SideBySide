import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/me', async (req, res) => {
  try {
    const userId = (req as any).userId; // ou req.user?.id dependendo da auth atual
    if (!userId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // Excluindo explicitamente o passwordHash ou dados sensíveis
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;