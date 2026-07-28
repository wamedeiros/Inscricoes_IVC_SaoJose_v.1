import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Sliders, UserPlus, Users, Edit3, Trash2, ShieldCheck, KeyRound } from 'lucide-react';
import { ConfigSistema, UsuarioSistema } from '../types';
import { getConfig, saveConfig, getUsuariosSistema, saveUsuarioSistema, deleteUsuarioSistema } from '../services/storage';
import { ConfirmModal } from './ConfirmModal';

interface ConfiguracoesViewProps {
  usuarioAtual?: UsuarioSistema;
}

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({ usuarioAtual }) => {
  const [config, setConfig] = useState<ConfigSistema>(() => getConfig());
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>(() => getUsuariosSistema());
  const [salvo, setSalvo] = useState(false);

  // Estado para Modal de Novo/Editar Usuário
  const [isModalUsuarioOpen, setIsModalUsuarioOpen] = useState(false);
  const [usuarioEdicao, setUsuarioEdicao] = useState<Partial<UsuarioSistema>>({
    nome: '',
    email: '',
    perfil: 'Secretaria',
    ativo: true,
    cargo: 'Secretária Catequética'
  });

  // Confirmação Exclusão de Usuário
  const [userUidExcluir, setUserUidExcluir] = useState<string | null>(null);
  const [mensagemAviso, setMensagemAviso] = useState<string>('');

  const handleSalvarConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfig(config);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  };

  const handleAbrirModalNovoUsuario = () => {
    setUsuarioEdicao({
      uid: '',
      nome: '',
      email: '',
      perfil: 'Secretaria',
      ativo: true,
      cargo: 'Secretária Catequética'
    });
    setIsModalUsuarioOpen(true);
  };

  const handleAbrirModalEditarUsuario = (usr: UsuarioSistema) => {
    setUsuarioEdicao({ ...usr });
    setIsModalUsuarioOpen(true);
  };

  const handleSalvarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEdicao.nome || !usuarioEdicao.email) {
      alert('Por favor, preencha o Nome e o E-mail de acesso.');
      return;
    }

    const usrParaSalvar: UsuarioSistema = {
      uid: usuarioEdicao.uid || `usr-${Date.now()}`,
      nome: usuarioEdicao.nome,
      email: usuarioEdicao.email,
      perfil: usuarioEdicao.perfil || 'Secretaria',
      cargo: usuarioEdicao.cargo || (usuarioEdicao.perfil === 'Administrador' ? 'Coordenador Geral' : 'Secretária Catequética'),
      ativo: usuarioEdicao.ativo !== undefined ? usuarioEdicao.ativo : true
    };

    saveUsuarioSistema(usrParaSalvar);
    setUsuarios(getUsuariosSistema());
    setIsModalUsuarioOpen(false);
  };

  const handleExcluirUsuario = (uid: string) => {
    if (usuarioAtual && uid === usuarioAtual.uid) {
      setMensagemAviso('Você não pode excluir o seu próprio login em uso.');
      return;
    }
    if (usuarios.length <= 1) {
      setMensagemAviso('Não é possível excluir o único usuário do sistema.');
      return;
    }
    setMensagemAviso('');
    setUserUidExcluir(uid);
  };

  const executarExclusaoUsuario = () => {
    if (!userUidExcluir) return;
    deleteUsuarioSistema(userUidExcluir);
    setUsuarios(getUsuariosSistema());
    setUserUidExcluir(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8C7851] bg-[#F3F1ED] px-2.5 py-1 rounded-md border border-[#E5E1DA]">
          Parâmetros e Segurança do Sistema
        </span>
        <h2 className="text-2xl font-black text-[#2D2A26] mt-1">Configurações e Gestão de Acessos</h2>
        <p className="text-xs text-[#5D574F]">
          Altere os parâmetros de cálculo de idade, faixas etárias, mensagens e cadastre novos logins para a equipe de catequistas.
        </p>
      </div>

      {salvo && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Configurações salvas com sucesso! Os novos parâmetros já estão ativos para todas as inscrições.</span>
        </div>
      )}

      {/* PAINEL DE GESTÃO DE USUÁRIOS E LOGINS */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#E5E1DA] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E1DA] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7851] bg-[#F3F1ED] px-2 py-0.5 rounded border border-[#E5E1DA]">
              Controle de Usuários
            </span>
            <h3 className="text-lg font-bold text-[#2D2A26] mt-0.5 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8C7851]" />
              <span>Logins e Perfis Cadastrados no Sistema</span>
            </h3>
            <p className="text-xs text-[#5D574F]">
              Crie e gerencie os acessos do Administrador, Coordenadores, Secretárias e Catequistas.
            </p>
          </div>

          <button
            onClick={handleAbrirModalNovoUsuario}
            className="px-4 py-2 bg-[#8C7851] hover:bg-[#7A6946] text-white font-bold text-xs rounded-xl shadow-md shadow-[#8C7851]/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Novo Login</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-[#E5E1DA] rounded-xl">
          <table className="w-full text-left text-xs text-[#4A443F]">
            <thead className="bg-[#FAF9F7] text-[#2D2A26] uppercase text-[10px] tracking-wider border-b border-[#E5E1DA]">
              <tr>
                <th className="p-3 pl-4">Nome do Usuário</th>
                <th className="p-3">E-mail de Acesso</th>
                <th className="p-3">Perfil</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right pr-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1DA] bg-white">
              {usuarios.map(u => (
                <tr key={u.uid} className="hover:bg-[#FAF9F7]">
                  <td className="p-3 pl-4 font-bold text-[#2D2A26]">
                    {u.nome}
                    <span className="block text-[10px] text-[#A69F95] font-normal">{u.cargo}</span>
                  </td>
                  <td className="p-3 font-medium text-[#5D574F]">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      u.perfil === 'Administrador'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : u.perfil === 'Coordenador'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {u.perfil}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-3 text-right pr-4 space-x-2">
                    <button
                      onClick={() => handleAbrirModalEditarUsuario(u)}
                      className="p-1.5 text-[#8C7851] hover:text-[#7A6946] hover:bg-[#F3F1ED] rounded-lg transition-colors cursor-pointer"
                      title="Editar Login"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExcluirUsuario(u.uid)}
                      className="p-1.5 text-[#A69F95] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Login"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORMULÁRIO DE CONFIGURAÇÃO GERAL */}
      <form onSubmit={handleSalvarConfig} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#E5E1DA] space-y-8 text-xs text-[#5D574F]">

        {/* 1. ANO DE CONCLUSÃO & DATA DE REFERÊNCIA */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#2D2A26] border-b border-[#E5E1DA] pb-2">
            1. Ano de Conclusão e Regra de Idade
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#2D2A26] mb-1">Ano de Conclusão Vigente *</label>
              <input
                type="number"
                required
                value={config.anoPastoralAtual}
                onChange={(e) => setConfig(p => ({ ...p, anoPastoralAtual: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl font-bold text-[#8C7851] focus:outline-none focus:border-[#8C7851]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2D2A26] mb-1">Data de Referência para Cálculo da Idade *</label>
              <input
                type="date"
                required
                value={config.dataReferencia}
                onChange={(e) => setConfig(p => ({ ...p, dataReferencia: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl font-bold text-[#2D2A26] focus:outline-none focus:border-[#8C7851]"
              />
              <span className="text-[10px] text-[#A69F95] mt-1 block">A idade do catequizando será calculada exatamente na data informada acima.</span>
            </div>
          </div>
        </div>

        {/* 2. FAIXAS ETÁRIAS POR MODALIDADE */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#2D2A26] border-b border-[#E5E1DA] pb-2">
            2. Faixas Etárias para Atribuição Automática
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-3 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl space-y-2">
              <span className="font-bold text-[#2D2A26] block">Pré-Catequese (PRE)</span>
              <div className="flex gap-2 items-center">
                <span>Mín:</span>
                <input
                  type="number"
                  value={config.faixasEtarias.PRE.min}
                  onChange={(e) => setConfig(p => ({
                    ...p,
                    faixasEtarias: { ...p.faixasEtarias, PRE: { ...p.faixasEtarias.PRE, min: Number(e.target.value) } }
                  }))}
                  className="w-16 px-2 py-1 border border-[#E5E1DA] rounded bg-white font-bold text-[#2D2A26]"
                />
                <span>Máx:</span>
                <input
                  type="number"
                  value={config.faixasEtarias.PRE.max}
                  onChange={(e) => setConfig(p => ({
                    ...p,
                    faixasEtarias: { ...p.faixasEtarias, PRE: { ...p.faixasEtarias.PRE, max: Number(e.target.value) } }
                  }))}
                  className="w-16 px-2 py-1 border border-[#E5E1DA] rounded bg-white font-bold text-[#2D2A26]"
                />
                <span>anos</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl space-y-2">
              <span className="font-bold text-[#2D2A26] block">Eucaristia (EUC)</span>
              <div className="flex gap-2 items-center">
                <span>Mín:</span>
                <input
                  type="number"
                  value={config.faixasEtarias.EUC.min}
                  onChange={(e) => setConfig(p => ({
                    ...p,
                    faixasEtarias: { ...p.faixasEtarias, EUC: { ...p.faixasEtarias.EUC, min: Number(e.target.value) } }
                  }))}
                  className="w-16 px-2 py-1 border border-[#E5E1DA] rounded bg-white font-bold text-[#2D2A26]"
                />
                <span>Máx:</span>
                <input
                  type="number"
                  value={config.faixasEtarias.EUC.max}
                  onChange={(e) => setConfig(p => ({
                    ...p,
                    faixasEtarias: { ...p.faixasEtarias, EUC: { ...p.faixasEtarias.EUC, max: Number(e.target.value) } }
                  }))}
                  className="w-16 px-2 py-1 border border-[#E5E1DA] rounded bg-white font-bold text-[#2D2A26]"
                />
                <span>anos</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl space-y-2">
              <span className="font-bold text-[#2D2A26] block">Crisma Jovem (CRI)</span>
              <div className="flex gap-2 items-center">
                <span>Mín:</span>
                <input
                  type="number"
                  value={config.faixasEtarias.CRI.min}
                  onChange={(e) => setConfig(p => ({
                    ...p,
                    faixasEtarias: { ...p.faixasEtarias, CRI: { ...p.faixasEtarias.CRI, min: Number(e.target.value) } }
                  }))}
                  className="w-16 px-2 py-1 border border-[#E5E1DA] rounded bg-white font-bold text-[#2D2A26]"
                />
                <span>Máx:</span>
                <input
                  type="number"
                  value={config.faixasEtarias.CRI.max}
                  onChange={(e) => setConfig(p => ({
                    ...p,
                    faixasEtarias: { ...p.faixasEtarias, CRI: { ...p.faixasEtarias.CRI, max: Number(e.target.value) } }
                  }))}
                  className="w-16 px-2 py-1 border border-[#E5E1DA] rounded bg-white font-bold text-[#2D2A26]"
                />
                <span>anos</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl space-y-2">
              <span className="font-bold text-[#2D2A26] block">Catecumenato Adulto (ADU)</span>
              <div className="flex gap-2 items-center">
                <span>A partir de:</span>
                <input
                  type="number"
                  value={config.faixasEtarias.ADU.min}
                  onChange={(e) => setConfig(p => ({
                    ...p,
                    faixasEtarias: { ...p.faixasEtarias, ADU: { ...p.faixasEtarias.ADU, min: Number(e.target.value) } }
                  }))}
                  className="w-16 px-2 py-1 border border-[#E5E1DA] rounded bg-white font-bold text-[#2D2A26]"
                />
                <span>anos</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MENSAGENS AUTOMÁTICAS */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#2D2A26] border-b border-[#E5E1DA] pb-2">
            3. Mensagens Automáticas de Notificação
          </h3>

          <div>
            <label className="block font-bold text-[#2D2A26] mb-1">Confirmação de Inscrição Enviada</label>
            <textarea
              rows={2}
              value={config.mensagens.confirmacaoInscricao}
              onChange={(e) => setConfig(p => ({ ...p, mensagens: { ...p.mensagens, confirmacaoInscricao: e.target.value } }))}
              className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
            />
          </div>
        </div>

        {/* BOTÃO SALVAR */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-[#8C7851] hover:bg-[#7A6946] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#8C7851]/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Parâmetros de Configuração</span>
          </button>
        </div>
      </form>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE USUÁRIO */}
      {isModalUsuarioOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-[#E5E1DA] overflow-hidden">
            <div className="bg-[#2D2A26] text-white p-5 border-b border-[#8C7851]">
              <h3 className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C4A976]" />
                <span>{usuarioEdicao.uid ? 'Editar Login de Acesso' : 'Cadastrar Novo Login de Acesso'}</span>
              </h3>
              <p className="text-xs text-[#A69F95] mt-0.5">
                Defina o perfil de permissões do colaborador para o sistema.
              </p>
            </div>

            <form onSubmit={handleSalvarUsuario} className="p-6 space-y-4 text-xs text-[#4A443F]">
              <div>
                <label className="block font-bold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={usuarioEdicao.nome || ''}
                  onChange={(e) => setUsuarioEdicao({ ...usuarioEdicao, nome: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                  placeholder="Ex: Maria das Graças Silva"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">E-mail de Acesso *</label>
                <input
                  type="email"
                  required
                  value={usuarioEdicao.email || ''}
                  onChange={(e) => setUsuarioEdicao({ ...usuarioEdicao, email: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                  placeholder="usuario@catequese.org"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={usuarioEdicao.cargo || ''}
                  onChange={(e) => setUsuarioEdicao({ ...usuarioEdicao, cargo: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                  placeholder="Ex: Catequista Sala 01 / Secretária"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Perfil de Acesso</label>
                  <select
                    value={usuarioEdicao.perfil || 'Secretaria'}
                    onChange={(e) => setUsuarioEdicao({ ...usuarioEdicao, perfil: e.target.value as any })}
                    className="w-full p-2.5 border border-[#E5E1DA] rounded-xl font-bold bg-white focus:outline-none focus:border-[#8C7851]"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Coordenador">Coordenador</option>
                    <option value="Secretaria">Secretária / Auxiliar</option>
                    <option value="Catequista">Catequista</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Status do Login</label>
                  <select
                    value={usuarioEdicao.ativo ? 'true' : 'false'}
                    onChange={(e) => setUsuarioEdicao({ ...usuarioEdicao, ativo: e.target.value === 'true' })}
                    className="w-full p-2.5 border border-[#E5E1DA] rounded-xl font-bold bg-white focus:outline-none focus:border-[#8C7851]"
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#E5E1DA]">
                <button
                  type="button"
                  onClick={() => setIsModalUsuarioOpen(false)}
                  className="px-4 py-2 bg-[#E5E1DA] text-[#2D2A26] rounded-xl text-xs font-bold hover:bg-[#D2C7B5] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8C7851] text-white rounded-xl text-xs font-bold hover:bg-[#7A6946] cursor-pointer shadow-md shadow-[#8C7851]/20"
                >
                  Salvar Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Excluir Usuário */}
      <ConfirmModal
        isOpen={!!userUidExcluir}
        title="Excluir Login de Usuário"
        message="Tem certeza que deseja excluir este login do sistema? O acesso do usuário será revogado imediatamente."
        confirmLabel="Excluir Usuário"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={executarExclusaoUsuario}
        onClose={() => setUserUidExcluir(null)}
      />
    </div>
  );
};
