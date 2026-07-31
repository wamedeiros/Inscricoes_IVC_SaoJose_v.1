import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { FormularioInscricao } from './components/FormularioInscricao';
import { ValidarQRCode } from './components/ValidarQRCode';
import { AdminDashboard } from './components/AdminDashboard';
import { InscritosManager } from './components/InscritosManager';
import { ResponsaveisManager } from './components/ResponsaveisManager';
import { TurmasManager } from './components/TurmasManager';
import { RelatoriosManager } from './components/RelatoriosManager';
import { AuditoriaView } from './components/AuditoriaView';
import { ConfiguracoesView } from './components/ConfiguracoesView';
import { UsuarioSistema } from './types';
import {
  initStorage,
  getUsuariosSistema,
  subscribeStorage
} from './services/storage';
import { Lock, ShieldAlert } from 'lucide-react';

export default function App() {
  // Inicializar storage com dados padrão se necessário
  useEffect(() => {
    initStorage();
  }, []);

  // Forçar re-render quando os dados mudarem no LocalStorage/Barramento
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribeStorage(() => {
      setTick(prev => prev + 1);
    });
  }, []);

  const usuariosDisponiveis = getUsuariosSistema();
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioSistema>(() => usuariosDisponiveis[0]);

  // Modo de Acesso (Público vs Administração)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Aba Ativa
  const [activeTab, setActiveTab] = useState<string>('inscricao');

  // Abas restritas a administradores/coordenadores
  const adminTabs = ['dashboard', 'inscritos', 'responsaveis', 'turmas', 'relatorios', 'auditoria', 'configuracoes'];

  // Trocar de aba garantindo a segurança
  const handleSelectTab = (tab: string) => {
    if (adminTabs.includes(tab) && !isAdminLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleLoginSuccess = (usuario: UsuarioSistema) => {
    setUsuarioAtual(usuario);
    setIsAdminLoggedIn(true);
    setActiveTab('dashboard');
  };

  const handleLogoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setActiveTab('inscricao');
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] font-sans text-[#4A443F] flex flex-col antialiased">
      {/* Header com perfil, controle de modo público/admin e navegação */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        usuarioAtual={usuarioAtual}
        setUsuarioAtual={setUsuarioAtual}
        usuariosDisponiveis={usuariosDisponiveis}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Modal de Login Administrativo */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        usuariosDisponiveis={usuariosDisponiveis}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'inscricao' && (
          <FormularioInscricao
            onSucessoInscricao={() => {}}
          />
        )}

        {activeTab === 'validar' && (
          <ValidarQRCode />
        )}

        {/* Abas Administrativas Protegidas */}
        {isAdminLoggedIn ? (
          <>
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'inscritos' && <InscritosManager usuarioAtual={usuarioAtual} />}
            {activeTab === 'responsaveis' && <ResponsaveisManager />}
            {activeTab === 'turmas' && <TurmasManager />}
            {activeTab === 'relatorios' && <RelatoriosManager />}
            {activeTab === 'auditoria' && <AuditoriaView />}
            {activeTab === 'configuracoes' && <ConfiguracoesView usuarioAtual={usuarioAtual} />}
          </>
        ) : (
          adminTabs.includes(activeTab) && (
            <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-[#E5E1DA] shadow-lg text-center space-y-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2A26]">Acesso Restrito ao Coordenador</h3>
              <p className="text-xs text-[#5D574F] leading-relaxed">
                Esta área é reservada para a Coordenação e Secretaria da Catequese. Para realizar uma nova inscrição ou validar um comprovante, utilize os botões da barra superior.
              </p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full py-2.5 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#8C7851]/20 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Entrar na Área Administrativa
              </button>
            </div>
          )
        )}
      </main>

      {/* Rodapé Oficial - Igreja São José */}
      <footer className="bg-[#2D2A26] text-[#E5E1DA] py-8 px-4 text-xs border-t border-[#4A443F] mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <h4 className="font-bold text-white text-sm">IGREJA SÃO JOSÉ - LAR DE MISERICÓRDIA</h4>
            <p className="text-[#C4A976] mt-0.5 font-semibold">Coordenador Responsável pelas Inscrições: WALLISON ANGELIM MEDEIROS</p>
            <p className="text-[11px] text-[#A69F95] mt-1 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span>WhatsApp: (86) 99989 0000</span>
              <span>&bull;</span>
              <span>E-mail: wamedeiros@gmail.com</span>
            </p>
          </div>

          <div className="text-[11px] text-[#A69F95]">
            <p>&copy; 2028 Catequese Igreja São José - Lar de Misericórdia. Todos os direitos reservados.</p>
            <p className="mt-0.5">Sistema em conformidade com a LGPD (Lei nº 13.709/2018).</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
