import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Printer,
  CheckCircle2,
  XCircle,
  FileCheck,
  AlertCircle,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import {
  Inscrito,
  StatusInscricao,
  ModalidadeCatequese,
  MODALIDADE_NAMES,
  UsuarioSistema
} from '../types';
import {
  getInscritos,
  getTurmas,
  getComunidades,
  salvarInscrito,
  excluirInscritoLógico,
  excluirInscritoDefinitivo,
  subscribeStorage
} from '../services/storage';
import { formatarDataBR, formatarTelefone, formatarCPF } from '../services/config';
import { gerarComprovanteInscricaoPDF } from '../services/pdfGenerator';
import { exportarInscritosExcel } from '../services/excelGenerator';
import { ConfirmModal } from './ConfirmModal';

interface InscritosManagerProps {
  usuarioAtual: UsuarioSistema;
}

export const InscritosManager: React.FC<InscritosManagerProps> = ({ usuarioAtual }) => {
  const [inscritos, setInscritos] = useState<Inscrito[]>(() => getInscritos());
  const turmas = getTurmas();
  const comunidades = getComunidades();

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroModalidade, setFiltroModalidade] = useState<string>('TODAS');
  const [filtroComunidade, setFiltroComunidade] = useState<string>('TODAS');
  const [filtroTurma, setFiltroTurma] = useState<string>('TODAS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  // Modal de Detalhes / Edição
  const [inscritoSelecionado, setInscritoSelecionado] = useState<Inscrito | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Confirmação de Exclusão & Mensagens
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // Inscrever-se para atualizações reativas no storage
  useEffect(() => {
    const unsub = subscribeStorage(() => {
      setInscritos(getInscritos());
    });
    return () => unsub();
  }, []);

  // Recarregar dados
  const refresh = () => {
    setInscritos(getInscritos());
  };

  // Filtragem
  const inscritosFiltrados = inscritos.filter(i => {
    const key = busca.toLowerCase();
    const matchBusca =
      i.nome.toLowerCase().includes(key) ||
      i.protocolo.toLowerCase().includes(key) ||
      (i.responsavel && i.responsavel.cpf.includes(key)) ||
      (i.responsavel && i.responsavel.nome.toLowerCase().includes(key)) ||
      i.telefone.includes(key);

    const matchMod = filtroModalidade === 'TODAS' || i.modalidade === filtroModalidade;
    const matchCom = filtroComunidade === 'TODAS' || i.comunidadeId === filtroComunidade;
    const matchTurma = filtroTurma === 'TODAS' || i.turmaId === filtroTurma;
    const matchStatus = filtroStatus === 'TODOS' || i.status === filtroStatus;

    return matchBusca && matchMod && matchCom && matchTurma && matchStatus;
  });

  // Atualizar Status do Inscrito
  const handleAtualizarStatus = (id: string, novoStatus: StatusInscricao) => {
    const target = inscritos.find(i => i.id === id);
    if (target) {
      let turmaId = target.turmaId;
      if (novoStatus === 'Turma definida' && !turmaId) {
        const turmasCompativeis = turmas.filter(t => t.modalidade === target.modalidade);
        if (turmasCompativeis.length > 0) {
          turmaId = turmasCompativeis[0].id;
        }
      }
      salvarInscrito(
        { ...target, status: novoStatus, turmaId },
        { uid: usuarioAtual.uid, nome: usuarioAtual.nome, perfil: usuarioAtual.perfil }
      );
      refresh();
      if (inscritoSelecionado?.id === id) {
        setInscritoSelecionado(prev => prev ? { ...prev, status: novoStatus, turmaId } : null);
      }
    }
  };

  // Atribuir Turma Manualmente
  const handleAtribuirTurma = (id: string, turmaId: string) => {
    const target = inscritos.find(i => i.id === id);
    if (target) {
      salvarInscrito(
        { ...target, turmaId, status: 'Turma definida' },
        { uid: usuarioAtual.uid, nome: usuarioAtual.nome, perfil: usuarioAtual.perfil }
      );
      refresh();
      if (inscritoSelecionado?.id === id) {
        setInscritoSelecionado(prev => prev ? { ...prev, turmaId, status: 'Turma definida' } : null);
      }
    }
  };

  // Abrir modal de confirmação para Excluir Inscrição
  const handleExcluir = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIdParaExcluir(id);
    setIsConfirmOpen(true);
  };

  // Executar Exclusão Definitiva
  const executarExclusao = () => {
    if (!idParaExcluir) return;
    try {
      const target = inscritos.find(i => i.id === idParaExcluir);
      const nomeExcluido = target ? target.nome : 'inscrito';
      excluirInscritoLógico(idParaExcluir, { uid: usuarioAtual.uid, nome: usuarioAtual.nome, perfil: usuarioAtual.perfil });
      excluirInscritoDefinitivo(idParaExcluir, { uid: usuarioAtual.uid, nome: usuarioAtual.nome, perfil: usuarioAtual.perfil });
      setInscritos(getInscritos());
      setMensagemSucesso(`Inscrição de "${nomeExcluido}" foi excluída com sucesso!`);
      setMensagemErro('');
      if (inscritoSelecionado?.id === idParaExcluir) {
        setInscritoSelecionado(null);
        setModoEdicao(false);
      }
    } catch (err: any) {
      setMensagemErro('Erro ao excluir inscrição: ' + (err.message || 'Falha na operação'));
    } finally {
      setIdParaExcluir(null);
      setIsConfirmOpen(false);
    }
  };

  // Salvar Alterações de Edição do Administrador
  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inscritoSelecionado) return;
    salvarInscrito(
      inscritoSelecionado,
      { uid: usuarioAtual.uid, nome: usuarioAtual.nome, perfil: usuarioAtual.perfil }
    );
    refresh();
    setModoEdicao(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7851] bg-[#F3F1ED] px-2.5 py-1 rounded-md border border-[#E5E1DA]">
            Gestão de Inscrições
          </span>
          <h2 className="text-2xl font-black text-[#2D2A26] mt-1">Catequizandos Inscritos</h2>
          <p className="text-xs text-[#5D574F]">
            Filtre, altere o status do fluxo, atribua turmas e emita comprovantes em PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportarInscritosExcel(inscritosFiltrados)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
          >
            <FileCheck className="w-4 h-4" />
            Exportar Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Alertas de Sucesso e Erro */}
      {mensagemSucesso && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <button onClick={() => setMensagemSucesso('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {mensagemErro && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <button onClick={() => setMensagemErro('')} className="text-rose-700 hover:text-rose-900 cursor-pointer p-1">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E1DA] grid sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div className="lg:col-span-1">
          <label className="block text-[11px] font-bold text-[#5D574F] mb-1">Buscar (Nome, CPF, Protocolo)</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Digite para pesquisar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
            />
            <Search className="w-3.5 h-3.5 text-[#A69F95] absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#5D574F] mb-1">Modalidade</label>
          <select
            value={filtroModalidade}
            onChange={(e) => setFiltroModalidade(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl bg-white focus:outline-none focus:border-[#8C7851]"
          >
            <option value="TODAS">Todas as Modalidades</option>
            <option value="PRE">Pré-Catequese</option>
            <option value="EUC">Eucaristia</option>
            <option value="PER">Perseverança</option>
            <option value="CRI">Crisma Jovem</option>
            <option value="ADU">Catecumenato Adulto</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#5D574F] mb-1">Comunidade</label>
          <select
            value={filtroComunidade}
            onChange={(e) => setFiltroComunidade(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl bg-white focus:outline-none focus:border-[#8C7851]"
          >
            <option value="TODAS">Todas as Comunidades</option>
            {comunidades.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#5D574F] mb-1">Turma Atribuída</label>
          <select
            value={filtroTurma}
            onChange={(e) => setFiltroTurma(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl bg-white focus:outline-none focus:border-[#8C7851]"
          >
            <option value="TODAS">Todas as Turmas</option>
            {turmas.map(t => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#5D574F] mb-1">Status da Inscrição</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl bg-white focus:outline-none focus:border-[#8C7851]"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="Inscrição enviada">Inscrição enviada</option>
            <option value="Matriculada">Matriculada</option>
            <option value="Turma definida">Turma definida</option>
          </select>
        </div>
      </div>

      {/* Tabela Principal de Inscritos */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E1DA] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E1DA] flex items-center justify-between">
          <span className="text-xs font-bold text-[#5D574F]">
            Exibindo <strong className="text-[#8C7851]">{inscritosFiltrados.length}</strong> de {inscritos.length} inscrições
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F7] text-[#5D574F] font-bold border-b border-[#E5E1DA] uppercase tracking-wider text-[10px]">
                <th className="p-3 pl-6">Protocolo</th>
                <th className="p-3">Catequizando / Idade</th>
                <th className="p-3">Modalidade</th>
                <th className="p-3">Contato / Responsável</th>
                <th className="p-3">Turma</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1DA] text-[#4A443F]">
              {inscritosFiltrados.map(ins => {
                const turmaObj = turmas.find(t => t.id === ins.turmaId);
                return (
                  <tr key={ins.id} className="hover:bg-[#FAF9F7] transition-colors">
                    <td className="p-3 pl-6 font-mono font-bold text-[#8C7851]">
                      {ins.protocolo}
                    </td>

                    <td className="p-3">
                      <span className="font-bold text-[#2D2A26] block">{ins.nome}</span>
                      <span className="text-[11px] text-[#A69F95]">
                        {formatarDataBR(ins.dataNascimento)} ({ins.idadeCalculada} anos)
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-semibold text-[#2D2A26]">
                        {MODALIDADE_NAMES[ins.modalidade]}
                      </span>
                    </td>

                    <td className="p-3">
                      {ins.idadeCalculada < 18 || ins.modalidade !== 'ADU' ? (
                        <>
                          <span className="block font-medium text-[#2D2A26]">
                            {ins.responsavel
                              ? formatarTelefone(ins.responsavel.telefone || ins.responsavel.whatsapp)
                              : (ins.telefoneMae ? formatarTelefone(ins.telefoneMae) : (ins.telefonePai ? formatarTelefone(ins.telefonePai) : formatarTelefone(ins.telefone)))}
                          </span>
                          <span className="text-[11px] text-[#8C7851] font-semibold block">
                            {ins.responsavel
                              ? `Resp: ${ins.responsavel.nome}`
                              : (ins.nomeMae ? `Mãe: ${ins.nomeMae}` : (ins.nomePai ? `Pai: ${ins.nomePai}` : 'Resp. não informado'))}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="block font-medium text-[#2D2A26]">{formatarTelefone(ins.telefone)}</span>
                          <span className="text-[11px] text-[#A69F95] block">
                            O próprio catequizando
                          </span>
                        </>
                      )}
                    </td>

                    <td className="p-3">
                      {turmaObj ? (
                        <span className="text-xs font-semibold text-[#2D2A26] bg-[#F3F1ED] px-2 py-0.5 rounded border border-[#E5E1DA]">
                          {turmaObj.nome}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#A69F95] italic">Não atribuída</span>
                      )}
                    </td>

                    <td className="p-3">
                      <select
                        value={ins.status}
                        onChange={(e) => handleAtualizarStatus(ins.id, e.target.value as StatusInscricao)}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#E5E1DA] cursor-pointer bg-white text-[#2D2A26]"
                      >
                        <option value="Inscrição enviada">Inscrição enviada</option>
                        <option value="Documentos pendentes">Documentos pendentes</option>
                        <option value="Matriculada">Matriculada</option>
                        <option value="Turma definida">Turma definida</option>
                      </select>
                    </td>

                    <td className="p-3 pr-6 text-right space-x-1">
                      <button
                        title="Ver Ficha Completa"
                        onClick={() => setInscritoSelecionado(ins)}
                        className="p-1.5 text-[#5D574F] hover:text-[#8C7851] hover:bg-[#F3F1ED] rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        title="Baixar Comprovante PDF"
                        onClick={() => gerarComprovanteInscricaoPDF(ins)}
                        className="p-1.5 text-[#5D574F] hover:text-[#8C7851] hover:bg-[#F3F1ED] rounded-lg transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {(usuarioAtual.perfil === 'Administrador' || usuarioAtual.perfil === 'Coordenador') && (
                        <>
                          <button
                            title="Editar Inscrição"
                            onClick={() => {
                              setInscritoSelecionado(ins);
                              setModoEdicao(true);
                            }}
                            className="p-1.5 text-[#8C7851] hover:text-[#7A6946] hover:bg-[#F3F1ED] rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            title="Excluir Inscrição"
                            onClick={(e) => handleExcluir(ins.id, e)}
                            className="p-1.5 text-[#A69F95] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Drawer de Ficha Completa do Inscrito */}
      {inscritoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl border border-[#E5E1DA] overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#2D2A26] text-white p-5 flex items-center justify-between border-b border-[#8C7851]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C4A976]">
                  {modoEdicao ? 'Editar Registro de Inscrito' : 'Ficha Oficial do Inscrito'}
                </span>
                <h3 className="text-lg font-bold">{inscritoSelecionado.nome}</h3>
                <p className="text-xs text-[#A69F95] font-mono">Protocolo: {inscritoSelecionado.protocolo}</p>
              </div>

              <div className="flex items-center gap-2">
                {(usuarioAtual.perfil === 'Administrador' || usuarioAtual.perfil === 'Coordenador') && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModoEdicao(!modoEdicao)}
                      className="px-3 py-1 bg-[#8C7851] hover:bg-[#7A6946] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      {modoEdicao ? 'Visualizar' : 'Editar'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleExcluir(inscritoSelecionado.id, e)}
                      className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                      title="Excluir esta inscrição"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setInscritoSelecionado(null);
                    setModoEdicao(false);
                  }}
                  className="px-3 py-1 bg-[#4A443F] hover:bg-[#3D3834] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Modal Content */}
            {modoEdicao ? (
              <form onSubmit={handleSalvarEdicao} className="p-6 space-y-6 overflow-y-auto max-h-[80vh] text-xs text-[#4A443F]">
                {/* 1. DADOS PESSOAIS */}
                <div className="space-y-3 bg-[#FAF9F7] p-4 rounded-xl border border-[#E5E1DA]">
                  <h4 className="font-bold text-sm text-[#8C7851] uppercase border-b border-[#E5E1DA] pb-1">
                    1. Dados Pessoais do Catequizando
                  </h4>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        value={inscritoSelecionado.nome}
                        onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, nome: e.target.value })}
                        className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Data de Nascimento *</label>
                      <input
                        type="date"
                        value={inscritoSelecionado.dataNascimento}
                        onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, dataNascimento: e.target.value })}
                        className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Naturalidade / Onde Nasceu</label>
                      <input
                        type="text"
                        value={inscritoSelecionado.ondeNasceu || ''}
                        onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, ondeNasceu: e.target.value })}
                        className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Telefone / WhatsApp</label>
                      <input
                        type="tel"
                        value={inscritoSelecionado.telefone || ''}
                        onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, telefone: e.target.value })}
                        className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">E-mail</label>
                      <input
                        type="email"
                        value={inscritoSelecionado.email || ''}
                        onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, email: e.target.value })}
                        className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white"
                      />
                    </div>
                    {inscritoSelecionado.modalidade === 'ADU' && (
                      <div>
                        <label className="block font-bold mb-1">Estado Civil</label>
                        <select
                          value={inscritoSelecionado.estadoCivil === 'Outro' ? 'Outro (divorciado(a), 2ª união, ...)' : (inscritoSelecionado.estadoCivil || 'Solteiro(a)')}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, estadoCivil: e.target.value as any })}
                          className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white"
                        >
                          <option value="Solteiro(a)">Solteiro(a)</option>
                          <option value="Casado(a) no Civil">Casado(a) no Civil</option>
                          <option value="Celebrou Matrimônio Religioso">Celebrou Matrimônio Religioso</option>
                          <option value="Viúvo(a)">Viúvo(a)</option>
                          <option value="Outro (divorciado(a), 2ª união, ...)">Outro (divorciado(a), 2ª união, ...)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 pt-2">
                    <div className="sm:col-span-2">
                      <label className="block font-bold mb-1">Endereço Residencial</label>
                      <input
                        type="text"
                        value={inscritoSelecionado.endereco || ''}
                        onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, endereco: e.target.value })}
                        className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Bairro</label>
                      <input
                        type="text"
                        value={inscritoSelecionado.bairro || ''}
                        onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, bairro: e.target.value })}
                        className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. MODALIDADE, STATUS E TURMA */}
                <div className="space-y-3 bg-[#FAF9F7] p-4 rounded-xl border border-[#E5E1DA]">
                  <h4 className="font-bold text-sm text-[#8C7851] uppercase border-b border-[#E5E1DA] pb-1">
                    2. Modalidade, Status e Turma Atribuída
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Modalidade Catequética</label>
                      <select
                        value={inscritoSelecionado.modalidade}
                        onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, modalidade: e.target.value as any })}
                        className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white font-semibold text-[#8C7851]"
                      >
                        <option value="PRE">Pré-Catequese (2 a 6 anos)</option>
                        <option value="EUC">Eucaristia (7 a 13 anos)</option>
                        <option value="PER">Perseverança (7 a 13 anos)</option>
                        <option value="CRI">Crisma Jovem (14 a 18 anos)</option>
                        <option value="ADU">Catecumenato Adulto (A partir de 19 anos)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Status da Inscrição</label>
                      <select
                        value={inscritoSelecionado.status}
                        onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, status: e.target.value as any })}
                        className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white font-semibold"
                      >
                        <option value="Inscrição enviada">Inscrição enviada</option>
                        <option value="Matriculada">Matriculada</option>
                        <option value="Turma definida">Turma definida</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Turma Vinculada</label>
                      <select
                        value={inscritoSelecionado.turmaId || ''}
                        onChange={(e) => setInscritoSelecionado({
                          ...inscritoSelecionado,
                          turmaId: e.target.value || undefined,
                          status: e.target.value ? 'Turma definida' : inscritoSelecionado.status
                        })}
                        className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white font-medium"
                      >
                        <option value="">Nenhuma turma atribuída</option>
                        {turmas.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.nome} ({t.diaSemana} - {t.horario})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. DADOS DO PAI E DA MÃE */}
                <div className="space-y-4 bg-[#FAF9F7] p-4 rounded-xl border border-[#E5E1DA]">
                  <h4 className="font-bold text-sm text-[#8C7851] uppercase border-b border-[#E5E1DA] pb-1">
                    3. Dados dos Pais (Pai e Mãe)
                  </h4>

                  {/* DADOS DO PAI */}
                  <div className="space-y-2 bg-white p-3 rounded-lg border border-[#E5E1DA]">
                    <span className="font-bold text-xs text-[#2D2A26] block">Informações do Pai:</span>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold mb-1">Nome do Pai</label>
                        <input
                          type="text"
                          value={inscritoSelecionado.nomePai || ''}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, nomePai: e.target.value })}
                          className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Telefone do Pai (*)</label>
                        <input
                          type="tel"
                          value={inscritoSelecionado.telefonePai || ''}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, telefonePai: e.target.value })}
                          className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white font-medium text-[#8C7851]"
                          placeholder="(86) 90000-0000"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">E-mail do Pai (*)</label>
                        <input
                          type="email"
                          value={inscritoSelecionado.emailPai || ''}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, emailPai: e.target.value })}
                          className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white"
                          placeholder="pai@email.com"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <label className="block font-bold mb-1 text-[#5D574F]">Sacramentos Recebidos pelo Pai:</label>
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!inscritoSelecionado.paiSacramentos?.batismo}
                            onChange={(e) => setInscritoSelecionado({
                              ...inscritoSelecionado,
                              paiSacramentos: { ...inscritoSelecionado.paiSacramentos, batismo: e.target.checked } as any
                            })}
                            className="rounded border-[#E5E1DA]"
                          />
                          <span>Batismo</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!inscritoSelecionado.paiSacramentos?.eucaristia}
                            onChange={(e) => setInscritoSelecionado({
                              ...inscritoSelecionado,
                              paiSacramentos: { ...inscritoSelecionado.paiSacramentos, eucaristia: e.target.checked } as any
                            })}
                            className="rounded border-[#E5E1DA]"
                          />
                          <span>Eucaristia</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!inscritoSelecionado.paiSacramentos?.crisma}
                            onChange={(e) => setInscritoSelecionado({
                              ...inscritoSelecionado,
                              paiSacramentos: { ...inscritoSelecionado.paiSacramentos, crisma: e.target.checked } as any
                            })}
                            className="rounded border-[#E5E1DA]"
                          />
                          <span>Crisma</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* DADOS DA MÃE */}
                  <div className="space-y-2 bg-white p-3 rounded-lg border border-[#E5E1DA]">
                    <span className="font-bold text-xs text-[#2D2A26] block">Informações da Mãe:</span>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold mb-1">Nome da Mãe</label>
                        <input
                          type="text"
                          value={inscritoSelecionado.nomeMae || ''}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, nomeMae: e.target.value })}
                          className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">Telefone da Mãe (*)</label>
                        <input
                          type="tel"
                          value={inscritoSelecionado.telefoneMae || ''}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, telefoneMae: e.target.value })}
                          className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white font-medium text-[#8C7851]"
                          placeholder="(86) 90000-0000"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">E-mail da Mãe (*)</label>
                        <input
                          type="email"
                          value={inscritoSelecionado.emailMae || ''}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, emailMae: e.target.value })}
                          className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white"
                          placeholder="mae@email.com"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <label className="block font-bold mb-1 text-[#5D574F]">Sacramentos Recebidos pela Mãe:</label>
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!inscritoSelecionado.maeSacramentos?.batismo}
                            onChange={(e) => setInscritoSelecionado({
                              ...inscritoSelecionado,
                              maeSacramentos: { ...inscritoSelecionado.maeSacramentos, batismo: e.target.checked } as any
                            })}
                            className="rounded border-[#E5E1DA]"
                          />
                          <span>Batismo</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!inscritoSelecionado.maeSacramentos?.eucaristia}
                            onChange={(e) => setInscritoSelecionado({
                              ...inscritoSelecionado,
                              maeSacramentos: { ...inscritoSelecionado.maeSacramentos, eucaristia: e.target.checked } as any
                            })}
                            className="rounded border-[#E5E1DA]"
                          />
                          <span>Eucaristia</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!inscritoSelecionado.maeSacramentos?.crisma}
                            onChange={(e) => setInscritoSelecionado({
                              ...inscritoSelecionado,
                              maeSacramentos: { ...inscritoSelecionado.maeSacramentos, crisma: e.target.checked } as any
                            })}
                            className="rounded border-[#E5E1DA]"
                          />
                          <span>Crisma</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. SACRAMENTOS E SITUAÇÃO FAMILIAR */}
                <div className="space-y-3 bg-[#FAF9F7] p-4 rounded-xl border border-[#E5E1DA]">
                  <h4 className="font-bold text-sm text-[#8C7851] uppercase border-b border-[#E5E1DA] pb-1">
                    4. Sacramentos do Inscrito e Vida Familiar
                  </h4>

                  <div className="grid sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-[#E5E1DA]">
                    <div>
                      <label className="flex items-center gap-2 font-bold mb-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inscritoSelecionado.batizado}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, batizado: e.target.checked })}
                          className="rounded"
                        />
                        <span>Já foi Batizado?</span>
                      </label>
                      {inscritoSelecionado.batizado && (
                        <div className="mt-2 space-y-1">
                          <input
                            type="text"
                            placeholder="Local do Batismo"
                            value={inscritoSelecionado.localBatismo || ''}
                            onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, localBatismo: e.target.value })}
                            className="w-full p-1.5 border border-[#E5E1DA] rounded text-xs"
                          />
                          <input
                            type="date"
                            value={inscritoSelecionado.dataBatismo || ''}
                            onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, dataBatismo: e.target.value })}
                            className="w-full p-1.5 border border-[#E5E1DA] rounded text-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 font-bold mb-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inscritoSelecionado.eucaristia}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, eucaristia: e.target.checked })}
                          className="rounded"
                        />
                        <span>Fez Primeira Eucaristia?</span>
                      </label>
                      {inscritoSelecionado.eucaristia && (
                        <div className="mt-2 space-y-1">
                          <input
                            type="text"
                            placeholder="Local da Eucaristia"
                            value={inscritoSelecionado.localEucaristia || ''}
                            onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, localEucaristia: e.target.value })}
                            className="w-full p-1.5 border border-[#E5E1DA] rounded text-xs"
                          />
                          <input
                            type="date"
                            value={inscritoSelecionado.dataEucaristia || ''}
                            onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, dataEucaristia: e.target.value })}
                            className="w-full p-1.5 border border-[#E5E1DA] rounded text-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 font-bold mb-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inscritoSelecionado.crisma}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, crisma: e.target.checked })}
                          className="rounded"
                        />
                        <span>Possui Crisma?</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-white p-3 rounded-lg border border-[#E5E1DA] space-y-2">
                      <label className="flex items-center gap-2 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!inscritoSelecionado.paisMatrimonio}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, paisMatrimonio: e.target.checked })}
                          className="rounded"
                        />
                        <span>Pais Celebraram Matrimônio Religioso?</span>
                      </label>
                      {inscritoSelecionado.paisMatrimonio && (
                        <input
                          type="text"
                          placeholder="Local / Paróquia do Matrimônio"
                          value={inscritoSelecionado.ondeMatrimonioPais || ''}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, ondeMatrimonioPais: e.target.value })}
                          className="w-full p-1.5 border border-[#E5E1DA] rounded text-xs"
                        />
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#E5E1DA] space-y-2">
                      <label className="flex items-center gap-2 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!inscritoSelecionado.paisDivorciados}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, paisDivorciados: e.target.checked })}
                          className="rounded"
                        />
                        <span>Pais são Divorciados / Separados?</span>
                      </label>
                      {inscritoSelecionado.paisDivorciados && (
                        <input
                          type="text"
                          placeholder="Com quem fica a guarda legal?"
                          value={inscritoSelecionado.guardaDivorcio || ''}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, guardaDivorcio: e.target.value })}
                          className="w-full p-1.5 border border-[#E5E1DA] rounded text-xs"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. PASTORAIS & OBSERVAÇÕES */}
                <div className="space-y-3 bg-[#FAF9F7] p-4 rounded-xl border border-[#E5E1DA]">
                  <h4 className="font-bold text-sm text-[#8C7851] uppercase border-b border-[#E5E1DA] pb-1">
                    5. Participação Pastoral & Observações
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-[#E5E1DA] space-y-2">
                      <label className="flex items-center gap-2 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inscritoSelecionado.familiaPastoral}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, familiaPastoral: e.target.checked })}
                          className="rounded"
                        />
                        <span>Família Participa de Pastoral / Movimento?</span>
                      </label>
                      {inscritoSelecionado.familiaPastoral && (
                        <input
                          type="text"
                          placeholder="Qual Pastoral / Movimento?"
                          value={inscritoSelecionado.qualPastoral || ''}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, qualPastoral: e.target.value })}
                          className="w-full p-1.5 border border-[#E5E1DA] rounded text-xs"
                        />
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-[#E5E1DA] space-y-2">
                      <label className="flex items-center gap-2 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inscritoSelecionado.necessidadeEspecial}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, necessidadeEspecial: e.target.checked })}
                          className="rounded"
                        />
                        <span>Possui Necessidade Especial ou Restrição?</span>
                      </label>
                      {inscritoSelecionado.necessidadeEspecial && (
                        <input
                          type="text"
                          placeholder="Descreva a necessidade ou restrição"
                          value={inscritoSelecionado.qualNecessidade || ''}
                          onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, qualNecessidade: e.target.value })}
                          className="w-full p-1.5 border border-[#E5E1DA] rounded text-xs"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Observações Internas da Secretaria/Coordenação</label>
                    <textarea
                      rows={2}
                      value={inscritoSelecionado.observacoes || ''}
                      onChange={(e) => setInscritoSelecionado({ ...inscritoSelecionado, observacoes: e.target.value })}
                      className="w-full p-2 border border-[#E5E1DA] rounded-lg bg-white"
                      placeholder="Anotações internas..."
                    />
                  </div>
                </div>

                {/* Botões do Rodapé */}
                <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E1DA]">
                  <button
                    type="button"
                    onClick={() => setModoEdicao(false)}
                    className="px-4 py-2 bg-[#E5E1DA] text-[#2D2A26] rounded-xl text-xs font-bold hover:bg-[#D2C7B5] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#8C7851] text-white rounded-xl text-xs font-bold hover:bg-[#7A6946] cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#8C7851]/20"
                  >
                    <FileCheck className="w-4 h-4" />
                    Salvar Alterações
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-6 overflow-y-auto text-xs text-[#4A443F]">
              {/* Atribuição Rápida de Turma */}
              <div className="p-4 bg-[#FAF9F7] border border-[#E5E1DA] rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-[#8C7851] block">Atribuir Turma Paroquial:</span>
                  <span className="text-[11px] text-[#5D574F]">Selecione uma turma compatível com a modalidade ({MODALIDADE_NAMES[inscritoSelecionado.modalidade]}).</span>
                </div>

                <select
                  value={inscritoSelecionado.turmaId || ''}
                  onChange={(e) => handleAtribuirTurma(inscritoSelecionado.id, e.target.value)}
                  className="px-3 py-1.5 border border-[#E5E1DA] rounded-xl bg-white font-semibold text-xs text-[#2D2A26]"
                >
                  <option value="">-- Sem Turma Atribuída --</option>
                  {turmas
                    .filter(t => t.modalidade === inscritoSelecionado.modalidade)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nome} ({t.vagasOcupadas}/{t.vagasMaximas} vagas)
                      </option>
                    ))}
                </select>
              </div>

              {/* Seções da Ficha */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] space-y-1">
                  <span className="text-[10px] font-bold text-[#A69F95] uppercase">Dados Pessoais</span>
                  <p><strong>Nascimento:</strong> {formatarDataBR(inscritoSelecionado.dataNascimento)} ({inscritoSelecionado.idadeCalculada} anos)</p>
                  <p><strong>Naturalidade:</strong> {inscritoSelecionado.ondeNasceu}</p>
                  <p><strong>Endereço:</strong> {inscritoSelecionado.endereco} - {inscritoSelecionado.bairro}</p>
                  <p><strong>Telefone:</strong> {formatarTelefone(inscritoSelecionado.telefone)}</p>
                  <p><strong>E-mail:</strong> {inscritoSelecionado.email || 'Não informado'}</p>
                </div>

                <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] space-y-1">
                  <span className="text-[10px] font-bold text-[#A69F95] uppercase">Vida Sacramental</span>
                  <p><strong>Batizado:</strong> {inscritoSelecionado.batizado ? `Sim - ${inscritoSelecionado.localBatismo}` : 'Não'}</p>
                  <p><strong>Primeira Eucaristia:</strong> {inscritoSelecionado.eucaristia ? 'Sim' : 'Não'}</p>
                  <p><strong>Crisma:</strong> {inscritoSelecionado.crisma ? 'Sim' : 'Não'}</p>
                  {inscritoSelecionado.estadoCivil && <p><strong>Estado Civil:</strong> {inscritoSelecionado.estadoCivil === 'Outro' ? 'Outro (divorciado(a), 2ª união, ...)' : inscritoSelecionado.estadoCivil}</p>}
                </div>
              </div>

              {/* Dados dos Pais / Filiação */}
              {(inscritoSelecionado.nomePai || inscritoSelecionado.nomeMae) && (
                <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-[#8C7851] uppercase block border-b border-[#E5E1DA] pb-1">Filiação & Contato dos Pais</span>
                  {inscritoSelecionado.nomePai && (
                    <div className="bg-white p-2 rounded-lg border border-[#E5E1DA]">
                      <p className="font-bold text-[#2D2A26]">Pai: {inscritoSelecionado.nomePai}</p>
                      <p className="text-[#5D574F] mt-0.5">
                        <span><strong>Telefone Pai:</strong> {formatarTelefone(inscritoSelecionado.telefonePai) || 'Não informado'}</span>
                        <span className="mx-2">&bull;</span>
                        <span><strong>E-mail Pai:</strong> {inscritoSelecionado.emailPai || 'Não informado'}</span>
                      </p>
                    </div>
                  )}
                  {inscritoSelecionado.nomeMae && (
                    <div className="bg-white p-2 rounded-lg border border-[#E5E1DA]">
                      <p className="font-bold text-[#2D2A26]">Mãe: {inscritoSelecionado.nomeMae}</p>
                      <p className="text-[#5D574F] mt-0.5">
                        <span><strong>Telefone Mãe:</strong> {formatarTelefone(inscritoSelecionado.telefoneMae) || 'Não informado'}</span>
                        <span className="mx-2">&bull;</span>
                        <span><strong>E-mail Mãe:</strong> {inscritoSelecionado.emailMae || 'Não informado'}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Preferência de Horários / Turmas */}
              {inscritoSelecionado.preferenciasHorario && inscritoSelecionado.preferenciasHorario.length > 0 && (
                <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-[#8C7851] uppercase block mb-1">Preferência de Horários Selecionados</span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {inscritoSelecionado.preferenciasHorario.map((pref, idx) => (
                      <span key={idx} className="bg-[#F3F1ED] text-[#2D2A26] border border-[#E5E1DA] px-2 py-0.5 rounded font-semibold text-[11px]">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsáveis */}
              {inscritoSelecionado.responsavel && (
                <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-[#A69F95] uppercase block mb-1">Responsável Legal Cadastrado</span>
                  <p><strong>Nome:</strong> {inscritoSelecionado.responsavel.nome}</p>
                  <p><strong>CPF:</strong> {formatarCPF(inscritoSelecionado.responsavel.cpf)} | <strong>RG:</strong> {inscritoSelecionado.responsavel.rg || 'N/I'}</p>
                  <p><strong>Telefone/WhatsApp:</strong> {formatarTelefone(inscritoSelecionado.responsavel.telefone)}</p>
                </div>
              )}

              {/* Anexos */}
              <div className="space-y-2">
                <span className="font-bold text-[#2D2A26] block">Documentos Anexados:</span>
                {inscritoSelecionado.documentos.length === 0 ? (
                  <p className="text-[#A69F95] italic">Nenhum documento anexado digitalmente.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {inscritoSelecionado.documentos.map(doc => (
                      <div key={doc.id} className="p-2 bg-[#F3F1ED] rounded-lg border border-[#E5E1DA] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#2D2A26] block">{doc.tipo}</span>
                          <span className="text-[10px] text-[#A69F95]">{doc.nomeArquivo}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Histórico de Auditoria */}
              <div className="space-y-2 border-t border-[#E5E1DA] pt-3">
                <span className="font-bold text-[#2D2A26] block">Trilha de Auditoria (Histórico de Alterações):</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {inscritoSelecionado.historicoAuditoria.map(aud => (
                    <div key={aud.id} className="p-2 bg-[#FAF9F7] rounded border border-[#E5E1DA] text-[11px] flex justify-between items-center">
                      <div>
                        <strong className="text-[#8C7851]">{aud.campo}:</strong> {aud.descricao}
                        <span className="text-[#A69F95] block text-[10px]">Por: {aud.usuarioNome} ({aud.usuarioPerfil})</span>
                      </div>
                      <span className="text-[#A69F95] text-[10px] whitespace-nowrap">{aud.dataHora}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF9F7] border-t border-[#E5E1DA] flex justify-between items-center">
              <button
                onClick={() => gerarComprovanteInscricaoPDF(inscritoSelecionado)}
                className="px-4 py-2 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir Comprovante
              </button>

              <button
                onClick={() => setInscritoSelecionado(null)}
                className="px-4 py-2 bg-[#E5E1DA] text-[#2D2A26] hover:bg-[#D2C7B5] rounded-xl text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Excluir Inscrição"
        message="Tem certeza que deseja excluir esta inscrição? O cadastro e todo o seu histórico serão removidos permanentemente do sistema."
        confirmLabel="Excluir Definitivamente"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={executarExclusao}
        onClose={() => {
          setIsConfirmOpen(false);
          setIdParaExcluir(null);
        }}
      />
    </div>
  );
};
