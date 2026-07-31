import React from 'react';
import {
  Church,
  LayoutDashboard,
  UserPlus,
  Users,
  CalendarDays,
  FileSpreadsheet,
  History,
  Settings,
  Search,
  QrCode,
  Lock,
  LogOut,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { UsuarioSistema } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  usuarioAtual: UsuarioSistema;
  setUsuarioAtual: (u: UsuarioSistema) => void;
  usuariosDisponiveis: UsuarioSistema[];
  isAdminLoggedIn: boolean;
  onOpenLogin: () => void;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  usuarioAtual,
  setUsuarioAtual,
  usuariosDisponiveis,
  isAdminLoggedIn,
  onOpenLogin,
  onLogoutAdmin
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-[#E5E1DA]">
      {/* Faixa Superior - Identificação & Modo do Sistema */}
      <div className="bg-[#2D2A26] border-b border-[#4A443F] px-4 py-2 text-xs flex flex-wrap justify-between items-center text-[#E5E1DA] gap-2">
        <div className="flex items-center gap-2 font-medium">
          <Church className="w-4 h-4 text-[#C4A976]" />
          <span>IGREJA SÃO JOSÉ - LAR DE MISERICÓRDIA &bull; CATEQUESE IVC</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Estado de Acesso Administrativo vs Público */}
          {isAdminLoggedIn ? (
            <div className="flex items-center gap-2 bg-[#8C7851]/30 border border-[#8C7851] px-3 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C4A976]" />
              <span className="text-[11px] font-bold text-[#C4A976]">
                Coordenador Logado: {usuarioAtual.nome}
              </span>

              {/* Seletor Rápido de Perfil em Modo Admin */}
              <select
                value={usuarioAtual.uid}
                onChange={(e) => {
                  const found = usuariosDisponiveis.find(u => u.uid === e.target.value);
                  if (found) setUsuarioAtual(found);
                }}
                className="bg-transparent text-[11px] font-semibold text-white focus:outline-none cursor-pointer border-l border-[#8C7851] pl-2"
              >
                {usuariosDisponiveis.map(u => (
                  <option key={u.uid} value={u.uid} className="bg-[#2D2A26] text-white">
                    {u.perfil}
                  </option>
                ))}
              </select>

              <button
                onClick={onLogoutAdmin}
                title="Sair do modo administrativo (Voltar para Portal Público)"
                className="flex items-center gap-1 text-[10px] bg-red-950/80 hover:bg-red-900 text-red-200 px-2 py-0.5 rounded-md ml-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8C7851] hover:bg-[#7A6946] text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Área do Coordenador / Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo e Título */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab('inscricao')}
        >
          <div className="w-10 h-10 rounded-xl bg-[#8C7851] flex items-center justify-center text-white font-bold text-lg shadow-sm">
            IVC
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#2D2A26] flex items-center gap-2">
              Catequese Igreja São José
              <span className="text-[10px] uppercase tracking-wider bg-[#F3F1ED] text-[#8C7851] px-2 py-0.5 rounded border border-[#E5E1DA] font-semibold">
                Lar de Misericórdia
              </span>
            </h1>
            <p className="text-xs text-[#A69F95]">Portal de Inscrições & Gestão Catequética</p>
          </div>
        </div>

        {/* Links de Acesso Rápido Públicos */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inscricao')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'inscricao'
                ? 'bg-[#8C7851] text-white shadow-md shadow-[#8C7851]/20 font-bold'
                : 'bg-[#F3F1ED] text-[#4A443F] hover:bg-[#E5E1DA]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Nova Inscrição
          </button>

          <button
            onClick={() => setActiveTab('consulta')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'consulta'
                ? 'bg-[#8C7851] text-white shadow-md shadow-[#8C7851]/20 font-bold'
                : 'bg-[#F3F1ED] text-[#4A443F] hover:bg-[#E5E1DA]'
            }`}
          >
            <Search className="w-4 h-4" />
            Consultar Protocolo
          </button>

          <button
            onClick={() => setActiveTab('validar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'validar'
                ? 'bg-[#8C7851] text-white shadow-md shadow-[#8C7851]/20 font-bold'
                : 'bg-[#F3F1ED] text-[#4A443F] hover:bg-[#E5E1DA]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Validar Comprovante
          </button>
        </div>
      </div>

      {/* Navegação de Módulos Administrativos - Visível EXCLUSIVAMENTE para Coordenador/Admin Logado */}
      {isAdminLoggedIn ? (
        <nav className="bg-[#FAF9F7] border-t border-[#E5E1DA] px-4 animate-in slide-in-from-top-1 duration-150">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none text-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C7851] pr-2 border-r border-[#E5E1DA]">
              Painel Admin:
            </span>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-[#8C7851] text-white font-semibold' : 'text-[#5D574F] hover:bg-[#F3F1ED] hover:text-[#2D2A26]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('inscritos')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'inscritos' ? 'bg-[#8C7851] text-white font-semibold' : 'text-[#5D574F] hover:bg-[#F3F1ED] hover:text-[#2D2A26]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Todas as Inscrições
            </button>

            <button
              onClick={() => setActiveTab('responsaveis')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'responsaveis' ? 'bg-[#8C7851] text-white font-semibold' : 'text-[#5D574F] hover:bg-[#F3F1ED] hover:text-[#2D2A26]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Responsáveis
            </button>

            <button
              onClick={() => setActiveTab('turmas')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'turmas' ? 'bg-[#8C7851] text-white font-semibold' : 'text-[#5D574F] hover:bg-[#F3F1ED] hover:text-[#2D2A26]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Turmas & Catequistas
            </button>

            <button
              onClick={() => setActiveTab('relatorios')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'relatorios' ? 'bg-[#8C7851] text-white font-semibold' : 'text-[#5D574F] hover:bg-[#F3F1ED] hover:text-[#2D2A26]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Relatórios (PDF / Excel)
            </button>

            {usuarioAtual.perfil === 'Administrador' && (
              <button
                onClick={() => setActiveTab('auditoria')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'auditoria' ? 'bg-[#8C7851] text-white font-semibold' : 'text-[#5D574F] hover:bg-[#F3F1ED] hover:text-[#2D2A26]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Auditoria
              </button>
            )}

            {usuarioAtual.perfil === 'Administrador' && (
              <button
                onClick={() => setActiveTab('configuracoes')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'configuracoes' ? 'bg-[#8C7851] text-white font-semibold' : 'text-[#5D574F] hover:bg-[#F3F1ED] hover:text-[#2D2A26]'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Configurações
              </button>
            )}
          </div>
        </nav>
      ) : (
        <div className="bg-[#FAF9F7] border-t border-[#E5E1DA] px-4 py-1 text-center text-[11px] text-[#8C7851] font-medium">
          ✨ Portal de Inscrições On-line da Catequese (IVC) — Preencha os dados e envie os comprovantes de forma simples e segura.
        </div>
      )}
    </header>
  );
};
