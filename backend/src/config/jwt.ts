if (!process.env.JWT_SECRET) {
  throw new Error('FATAL_ERROR: A variável de ambiente JWT_SECRET é obrigatória e não foi configurada.');
}

export const JWT_SECRET: string = process.env.JWT_SECRET;