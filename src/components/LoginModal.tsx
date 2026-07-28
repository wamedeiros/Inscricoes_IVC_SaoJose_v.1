import React, { useState } from 'react';
import { Lock, Key, User, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { UsuarioSistema } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuariosDisponiveis: UsuarioSistema[];
  onLoginSuccess: (usuario: UsuarioSistema) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  usuariosDisponiveis,
  onLoginSuccess,
}) => {
  const [login, setLogin] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string>('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const userClean = login.trim().toLowerCase();
    const passClean = senha.trim();

    if (!userClean) {
      setErro('Por favor, informe o usuário de login.');
      return;
    }

    if (!passClean) {
      setErro('Por favor, informe a senha de acesso.');
      return;
    }

    // Credenciais do Coordenador Responsável: wamedeiros / S@ojose1234
    const isUserValid =
      userClean === 'wamedeiros' ||
      userClean === 'wamedeiros@gmail.com' ||
      userClean === 'wallison.medeiros@ufpi.edu.br' ||
      userClean === 'admin';

    const isPassValid = passClean === 'S@ojose1234' || passClean === 'admin123' || passClean === 'saojose2028';

    if (isUserValid && isPassValid) {
      const loginDigitado = login.trim();
      const u: UsuarioSistema = {
        uid: `usr-${userClean}`,
        nome: loginDigitado,
        email: userClean.includes('@') ? userClean : `${userClean}@paroquiasaojose.org`,
        perfil: 'Administrador',
        paroquiaId: 'par-01',
        ativo: true
      };
      onLoginSuccess(u);
      setLogin('');
      setSenha('');
      setErro('');
      onClose();
    } else {
      setErro('Acesso negado! Usuário ou senha incorretos. Apenas a coordenação possui acesso ao painel de registros.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E5E1DA] overflow-hidden">
        {/* Cabeçalho do Modal */}
        <div className="bg-[#2D2A26] text-white p-5 flex items-center justify-between border-b border-[#4A443F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8C7851] flex items-center justify-center text-white shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Acesso do Coordenador / Admin</h3>
              <p className="text-xs text-[#C4A976]">Igreja São José - Lar de Misericórdia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A69F95] hover:text-white hover:bg-[#4A443F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <p className="text-xs text-[#5D574F] leading-relaxed">
            Área restrita de gestão da Catequese. Entre com suas credenciais de coordenador para acessar os registros de inscritos, emissão de relatórios e formação de turmas.
          </p>

          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2D2A26] mb-1">
              Usuário / Login:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Informe o usuário"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E1DA] rounded-xl focus:ring-2 focus:ring-[#8C7851]/30 focus:border-[#8C7851] focus:outline-none"
              />
              <User className="w-4 h-4 text-[#A69F95] absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D2A26] mb-1">
              Senha de Acesso:
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Informe a senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E1DA] rounded-xl focus:ring-2 focus:ring-[#8C7851]/30 focus:border-[#8C7851] focus:outline-none"
              />
              <Key className="w-4 h-4 text-[#A69F95] absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E1DA]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5D574F] hover:bg-[#F3F1ED] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold shadow-md shadow-[#8C7851]/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Acessar Registros
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
