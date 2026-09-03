import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/Button';

export const Profile: React.FC = () => {
  const navigate = useNavigate();

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [cursorOpacity, setCursorOpacity] = useState(1);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const padding = 40;
      const isNearEdge =
        e.clientX < padding ||
        e.clientY < padding ||
        e.clientX > window.innerWidth - padding ||
        e.clientY > window.innerHeight - padding;
      setCursorOpacity(isNearEdge ? 0 : 1);
    };

    const handleMouseLeave = () => setCursorOpacity(0);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const updateFollower = () => {
      setFollowerPos((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        return { x: prev.x + dx * 0.12, y: prev.y + dy * 0.12 };
      });
      animationFrameId = requestAnimationFrame(updateFollower);
    };
    animationFrameId = requestAnimationFrame(updateFollower);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [showAgeInProfile, setShowAgeInProfile] = useState(true);
  const [gender, setGender] = useState('Masculino');
  const [pronouns, setPronouns] = useState('ele/dele (he/him)');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/user/me');
        const data = res.data;
        setDisplayName(data.name || '');
        setBirthDate(data.birthDate || '');
        setShowAgeInProfile(data.showAgeInProfile ?? true);
        setGender(data.gender || 'Masculino');
        setPronouns(data.pronouns || 'ele/dele (he/him)');
        setBio(data.bio || '');
        setSelectedInterests(data.interests || []);
        setCefrLevel(data.level || 'B1');
        setAvatarUrl(data.avatar || '');
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const img = new Image();
        img.onload = () => {
          const maxWidth = 800;
          const maxHeight = 800;
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => reject(new Error('Erro ao processar imagem.'));
        img.src = result;
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarUrl(dataUrl);
    } catch (_err) {
      alert('Erro ao carregar imagem.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/user/profile', {
        name: displayName.trim(),
        birthDate,
        showAgeInProfile,
        gender,
        pronouns,
        cefrLevel,
        bio: bio.trim(),
        interests: selectedInterests,
        avatar: avatarUrl,
      });
      alert('Perfil atualizado com sucesso!');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      alert(errorObj.response?.data?.error || 'Erro ao atualizar perfil.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    try {
      await api.delete('/api/user/me', {
        data: { password: deletePassword }
      });
      localStorage.clear();
      navigate('/');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setDeleteError(errorObj.response?.data?.error || 'Erro ao excluir conta.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex items-center justify-center font-bold text-sm uppercase">
        Carregando perfil...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans relative selection:bg-[#1C1917] selection:text-[#FAF9F6]">
      <div
        className="pointer-events-none fixed z-50 w-3.5 h-3.5 rounded-full bg-[#1C1917] transition-opacity duration-300 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ left: `${followerPos.x}px`, top: `${followerPos.y}px`, opacity: cursorOpacity }}
      />

      <header className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-md bg-[#1C1917] flex items-center justify-center font-black text-[#FAF9F6] text-base">
            S
          </div>
          <span className="text-lg font-black tracking-tight text-[#1C1917] uppercase">SideBySide</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2 bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#1C1917] font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-[#E7E5E4]"
        >
          ← Voltar ao Dashboard
        </button>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 lg:p-8 flex flex-col gap-8">
        
        <div className="flex flex-col gap-1 border-b border-[#E7E5E4] pb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#1C1917]">Configurações de Perfil</h1>
          <p className="text-xs text-[#57534E] font-medium">Gerencie suas informações pessoais, preferências e nível de aprendizado.</p>
        </div>

        <form onSubmit={handleSaveProfile} className="flex flex-col gap-8">
          
          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">Foto de Exibição</h2>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#1C1917] bg-[#F5F5F4] shrink-0">
                <img src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <label className="px-5 py-2.5 bg-[#FAF9F6] border-2 border-[#1C1917] hover:bg-[#F5F5F4] text-[#1C1917] font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all">
                Alterar Foto
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">Dados Pessoais</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-black text-[#1C1917] uppercase">Nome de Exibição</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-[#1C1917] uppercase">Data de Nascimento</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-[#1C1917] uppercase">Gênero</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Não-binário">Não-binário</option>
                  <option value="Prefiro não dizer">Prefiro não dizer</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <h2 className="text-base font-black uppercase tracking-tight text-[#1C1917]">Nível CEFR & Interesses</h2>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-[#1C1917] uppercase">Nível de Inglês</label>
              <select
                value={cefrLevel}
                onChange={(e) => setCefrLevel(e.target.value)}
                className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
              >
                <option value="A1">A1 - Iniciante</option>
                <option value="A2">A2 - Básico</option>
                <option value="B1">B1 - Intermediário</option>
                <option value="B2">B2 - Intermediário Avançado</option>
                <option value="C1">C1 - Avançado</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-[#1C1917] uppercase">Biografia Curta</label>
              <textarea
                rows={3}
                maxLength={140}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="p-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917] resize-none"
              />
            </div>
          </div>

          <Button variant="primary" type="submit" className="py-4 bg-[#1C1917] hover:bg-[#292524] text-[#FAF9F6] font-black text-xs uppercase tracking-widest rounded-xl transition-all border-2 border-[#1C1917] shadow-md">
            Salvar Alterações
          </Button>

        </form>

        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 mt-6">
          <h3 className="text-base font-black uppercase tracking-tight text-red-700">Zona de Perigo</h3>
          <p className="text-xs text-red-600 font-medium">A exclusão da conta é permanente e removerá todas as suas amizades, mensagens e histórico de sessões.</p>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-fit px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm"
          >
            Excluir Minha Conta
          </button>
        </div>

      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#1C1917]/80 backdrop-blur-md z-[130] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#1C1917] rounded-3xl p-8 max-w-md w-full shadow-[8px_8px_0px_0px_#1C1917] flex flex-col gap-6 text-center">
            <h3 className="text-lg font-black uppercase text-red-600">Confirmar Exclusão</h3>
            <p className="text-xs text-[#57534E] font-medium leading-relaxed">
              Para prosseguir com a exclusão definitiva, digite sua senha atual:
            </p>
            <input
              type="password"
              placeholder="Sua senha atual"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="px-4 py-3 bg-[#FAF9F6] border-2 border-[#E7E5E4] rounded-xl text-xs font-bold text-[#1C1917] outline-none focus:border-[#1C1917]"
            />
            {deleteError && <span className="text-[10px] font-bold text-red-600 uppercase">{deleteError}</span>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-[#FAF9F6] border-2 border-[#1C1917] text-[#1C1917] text-xs font-black uppercase rounded-xl">Cancelar</button>
              <button type="button" onClick={handleDeleteAccount} className="flex-1 py-3 bg-red-600 text-white text-xs font-black uppercase rounded-xl">Excluir Definitivamente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;