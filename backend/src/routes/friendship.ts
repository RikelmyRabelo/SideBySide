import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.post('/:id/accept', async (req: Request, res: Response) => {
  try {
     
    const userId = (req as any).userId;
    const { id } = req.params;

     
    const friendship = await (prisma as any).friendship.findUnique({
      where: { id },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Solicitação de amizade não encontrada.' });
    }

    if (friendship.receiverId !== userId) {
      return res.status(403).json({ error: 'Acesso negado: você não é o destinatário desta solicitação.' });
    }

     
    const updated = await (prisma as any).friendship.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    return res.json(updated);
  } catch (_error) {
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

export default router;