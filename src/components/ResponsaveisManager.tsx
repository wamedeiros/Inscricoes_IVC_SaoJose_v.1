import React, { useState } from 'react';
import { UserCheck, Search, Plus, Edit, Trash2, Phone, Mail, MapPin, Users, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { Responsavel, Inscrito } from '../types';
import { getResponsaveis, getInscritos, saveResponsavel, deleteResponsavel } from '../services/storage';
import { formatarCPF, formatarTelefone } from '../services/config';
import { exportarResponsaveisExcel } from '../services/excelGenerator';

export const ResponsaveisManager: React.FC = () => {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>(() => getResponsaveis());
  const inscritos = getInscritos();

  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [respEdicao, setRespEdicao] = useState<Partial<Responsavel> | null>(null);
  const [respParaExcluir, setRespParaExcluir] = useState<Responsavel | null>(null);
  const [erro, setErro] = useState('');

  const refresh = () => {
    setResponsaveis(getResponsaveis());
  };

  const responsaveisFiltrados = responsaveis.filter(r =>
    r.nome.toLowerCase().includes(busca.toLowerCase()) ||
    r.cpf.includes(busca) ||
    r.telefone.includes(busca) ||
    (r.email && r.email.toLowerCase().includes(busca.toLowerCase()))
  );

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!respEdicao?.nome || !respEdicao?.telefone) {
      setErro('Nome e Telefone são campos obrigatórios.');
      return;
    }

    try {
      saveResponsavel({
        id: respEdicao.id || '',
        nome: respEdicao.nome,
        cpf: respEdicao.cpf || '',
        rg: respEdicao.rg,
        telefone: respEdicao.telefone,
        whatsapp: respEdicao.whatsapp || respEdicao.telefone,
        email: respEdicao.email || '',
        endereco: respEdicao.endereco || '',
        bairro: respEdicao.bairro,
        cidade: respEdicao.cidade,
        createdAt: respEdicao.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      refresh();
      setModalAberto(false);
      setRespEdicao(null);
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar responsável.');
    }
  };

  const handleConfirmarExclusao = () => {
    if (respParaExcluir) {
      deleteResponsavel(respParaExcluir.id);
      refresh();
      setRespParaExcluir(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7851] bg-[#F3F1ED] px-2.5 py-1 rounded-md border border-[#E5E1DA]">
            Igreja São José - Lar de Misericórdia
          </span>
          <h2 className="text-2xl font-black text-[#2D2A26] mt-1">Gestão de Responsáveis Legais</h2>
          <p className="text-xs text-[#5D574F]">
            Cadastro e alteração de pais e responsáveis, vinculados diretamente às inscrições dos catequizandos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportarResponsaveisExcel(responsaveisFiltrados)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
          </button>

          <button
            onClick={() => {
              setRespEdicao({});
              setModalAberto(true);
            }}
            className="px-4 py-2 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow shadow-[#8C7851]/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Responsável
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E1DA] max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar responsável por Nome, CPF, Telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
          />
          <Search className="w-4 h-4 text-[#A69F95] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Lista de Cards de Responsáveis */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {responsaveisFiltrados.map(resp => {
          // Filhos / Dependentes vinculados dinamicamente das inscrições
          const dependentes = inscritos.filter(i =>
            i.responsavelId === resp.id ||
            (resp.cpf && i.responsavel && i.responsavel.cpf && i.responsavel.cpf.replace(/\D/g, '') === resp.cpf.replace(/\D/g, '')) ||
            (i.responsavel && i.responsavel.nome && i.responsavel.nome.trim().toLowerCase() === resp.nome.trim().toLowerCase())
          );

          return (
            <div key={resp.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5E1DA] space-y-4 hover:border-[#8C7851] transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[#2D2A26] text-sm">{resp.nome}</h3>
                    <span className="text-[11px] font-mono text-[#8C7851] font-bold block">
                      CPF: {resp.cpf ? formatarCPF(resp.cpf) : 'Não informado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setRespEdicao(resp);
                        setModalAberto(true);
                      }}
                      title="Editar Responsável"
                      className="p-1.5 text-[#5D574F] hover:text-[#8C7851] rounded-lg hover:bg-[#F3F1ED] cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setRespParaExcluir(resp)}
                      title="Excluir Responsável"
                      className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#5D574F] space-y-1 pt-2 border-t border-[#E5E1DA] mt-2">
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#A69F95]" />
                    <span>{formatarTelefone(resp.telefone)}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#A69F95]" />
                    <span>{resp.email || 'Não informado'}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A69F95]" />
                    <span>{resp.endereco || 'Endereço não cadastrado'}</span>
                  </p>
                </div>
              </div>

              {/* Dependentes / Filhos na Catequese */}
              <div className="bg-[#FAF9F7] p-3 rounded-xl border border-[#E5E1DA] mt-3">
                <span className="text-[10px] font-bold text-[#A69F95] uppercase tracking-wider block mb-1">
                  Catequizandos Vinculados ({dependentes.length}):
                </span>
                {dependentes.length === 0 ? (
                  <span className="text-[11px] text-[#A69F95] italic">Nenhum catequizando vinculado no momento.</span>
                ) : (
                  <div className="space-y-1">
                    {dependentes.map(dep => (
                      <div key={dep.id} className="text-xs font-semibold text-[#2D2A26] flex justify-between items-center">
                        <span>• {dep.nome}</span>
                        <span className="text-[10px] text-[#8C7851] font-mono">{dep.protocolo}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Confirmação de Exclusão de Responsável */}
      {respParaExcluir && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-[#E5E1DA] overflow-hidden">
            <div className="bg-rose-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-300" />
                Excluir Responsável Legal
              </h3>
              <button onClick={() => setRespParaExcluir(null)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-[#2D2A26]">
              <p>
                Tem certeza que deseja excluir o cadastro de <strong>"{respParaExcluir.nome}"</strong> (CPF: {formatarCPF(respParaExcluir.cpf)})?
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                ⚠️ <strong>Aviso:</strong> Os catequizandos vinculados permanecerão no sistema, porém terão a referência deste responsável removida de seu vínculo cadastral.
              </div>
            </div>
            <div className="p-4 bg-[#FAF9F7] border-t border-[#E5E1DA] flex justify-end gap-2 text-xs">
              <button
                onClick={() => setRespParaExcluir(null)}
                className="px-4 py-2 bg-white text-[#5D574F] border border-[#E5E1DA] rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusao}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer shadow-sm"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form de Responsável */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-[#E5E1DA] overflow-hidden">
            <div className="bg-[#2D2A26] text-white p-5 flex items-center justify-between border-b border-[#8C7851]">
              <h3 className="font-bold text-sm">
                {respEdicao?.id ? 'Editar Cadastro de Responsável' : 'Novo Responsável Legal'}
              </h3>
              <button onClick={() => setModalAberto(false)} className="text-xs text-[#A69F95] hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            {erro && (
              <div className="m-4 p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                {erro}
              </div>
            )}

            <form onSubmit={handleSalvar} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2D2A26] mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={respEdicao?.nome || ''}
                  onChange={(e) => setRespEdicao(p => ({ ...p, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D2A26] mb-1">CPF (Opcional)</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00 (Opcional)"
                    value={respEdicao?.cpf || ''}
                    onChange={(e) => setRespEdicao(p => ({ ...p, cpf: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2D2A26] mb-1">RG</label>
                  <input
                    type="text"
                    placeholder="Número do RG"
                    value={respEdicao?.rg || ''}
                    onChange={(e) => setRespEdicao(p => ({ ...p, rg: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D2A26] mb-1">Telefone Principal *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(86) 99999-9999"
                    value={respEdicao?.telefone || ''}
                    onChange={(e) => setRespEdicao(p => ({ ...p, telefone: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2D2A26] mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="(86) 99999-9999"
                    value={respEdicao?.whatsapp || ''}
                    onChange={(e) => setRespEdicao(p => ({ ...p, whatsapp: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2D2A26] mb-1">E-mail</label>
                <input
                  type="email"
                  value={respEdicao?.email || ''}
                  onChange={(e) => setRespEdicao(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2A26] mb-1">Endereço Completo</label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro..."
                  value={respEdicao?.endereco || ''}
                  onChange={(e) => setRespEdicao(p => ({ ...p, endereco: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 bg-[#FAF9F7] text-[#2D2A26] border border-[#E5E1DA] rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl font-bold cursor-pointer shadow"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
