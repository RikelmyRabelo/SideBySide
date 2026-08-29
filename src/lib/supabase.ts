export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const formData = new FormData();
  formData.append('avatar', file);
  formData.append('userId', userId);

  const response = await fetch('http://localhost:3000/api/user/avatar', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao processar a imagem no servidor.');
  }

  const data = await response.json();
  
  // O backend agora é responsável por lidar com o Supabase Storage ou disco local
  // e deve retornar a URL final da imagem nesta propriedade.
  return data.publicUrl;
}