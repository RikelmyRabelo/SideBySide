// backend/src/routes/profile.ts
import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stringId = Array.isArray(id) ? id[0] : id;

    const userProfile = await prisma.user.findUnique({
      where: { id: stringId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // Excluindo email e sessionsHistory explicitamente para privacidade pública
      },
    });

    if (!userProfile) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(userProfile);
  } catch (_error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;