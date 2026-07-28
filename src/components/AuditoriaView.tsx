import React, { useState } from 'react';
import { History, Search, ShieldCheck, User, Trash2, RefreshCw } from 'lucide-react';
import { getAuditoriaGlobal, limparAuditoria, deleteRegistroAuditoria } from '../services/storage';
import { ConfirmModal } from './ConfirmModal';

export const AuditoriaView: React.FC = () => {
  const [auditorias, setAuditorias] = useState(() => getAuditoriaGlobal());
  const [busca, setBusca] = useState('');

  // Confirmações
  const [isLimparOpen, setIsLimparOpen] = useState(false);
  const [itemExcluirId, setItemExcluirId] = useState<string | null>(null);

  const refresh = () => {
    setAuditorias(getAuditoriaGlobal());
  };

  const handleLimpar = () => {
    setIsLimparOpen(true);
  };

  const executarLimpar = () => {
    limparAuditoria();
    refresh();
    setIsLimparOpen(false);
  };

  const handleExcluirItem = (audId: string) => {
    setItemExcluirId(audId);
  };

  const executarExcluirItem = () => {
    if (!itemExcluirId) return;
    deleteRegistroAuditoria(itemExcluirId);
    refresh();
    setItemExcluirId(null);
  };

  const filtradas = auditorias.filter(a =>
    (a.usuarioNome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (a.campo || '').toLowerCase().includes(busca.toLowerCase()) ||
    (a.descricao || '').toLowerCase().includes(busca.toLowerCase()) ||
    (a.dataHora || '').includes(busca)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7851] bg-[#F3F1ED] px-2.5 py-1 rounded-md border border-[#E5E1DA]">
            Segurança & Conformidade
          </span>
          <h2 className="text-2xl font-black text-[#2D2A26] mt-1">Trilha de Auditoria do Sistema</h2>
          <p className="text-xs text-[#5D574F]">
            Registro imutável de todas as alterações cadastrais, atribuições de turmas e acessos efetuados pelos usuários.
          </p>
        </div>

        <button
          onClick={handleLimpar}
          className="px-4 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Limpar Auditoria e Iniciar Novos Registros
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E1DA] max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Filtrar por usuário, ação ou data..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
          />
          <Search className="w-4 h-4 text-[#A69F95] absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E1DA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F3F1ED] text-[#2D2A26] font-bold border-b border-[#E5E1DA] uppercase tracking-wider text-[10px]">
                <th className="p-3 pl-6">Data / Hora</th>
                <th className="p-3">Usuário / Perfil</th>
                <th className="p-3">Campo Alterado</th>
                <th className="p-3">Valor Antigo</th>
                <th className="p-3">Valor Novo</th>
                <th className="p-3">Descrição</th>
                <th className="p-3 text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1DA] text-[#5D574F]">
              {filtradas.map((aud, idx) => (
                <tr key={aud.id || idx} className="hover:bg-[#FAF9F7] transition-colors">
                  <td className="p-3 pl-6 font-mono font-bold text-[#5D574F] whitespace-nowrap">
                    {aud.dataHora}
                  </td>
                  <td className="p-3 font-semibold text-[#2D2A26]">
                    {aud.usuarioNome}
                    <span className="block text-[10px] text-[#8C7851]">{aud.usuarioPerfil}</span>
                  </td>
                  <td className="p-3 font-bold text-[#2D2A26]">
                    {aud.campo}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-[#A69F95]">
                    {aud.valorAntigo || '-'}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-emerald-800 font-bold">
                    {aud.valorNovo || '-'}
                  </td>
                  <td className="p-3 text-[#5D574F]">
                    {aud.descricao}
                  </td>
                  <td className="p-3 text-right pr-6">
                    <button
                      onClick={() => handleExcluirItem(aud.id)}
                      className="p-1.5 text-[#A69F95] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir este registro"
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

      {/* Modais de Confirmação */}
      <ConfirmModal
        isOpen={isLimparOpen}
        title="Limpar Trilha de Auditoria"
        message="Tem certeza que deseja limpar toda a trilha de auditoria e iniciar novos registros? Esta ação não pode ser desfeita."
        confirmLabel="Limpar Auditoria"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={executarLimpar}
        onClose={() => setIsLimparOpen(false)}
      />

      <ConfirmModal
        isOpen={!!itemExcluirId}
        title="Excluir Registro de Auditoria"
        message="Deseja excluir permanentemente este registro individual de auditoria?"
        confirmLabel="Excluir Registro"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={executarExcluirItem}
        onClose={() => setItemExcluirId(null)}
      />
    </div>
  );
};
