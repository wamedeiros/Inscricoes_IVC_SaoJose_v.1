import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Users,
  UserCheck,
  Clock,
  MapPin,
  Printer,
  FileSpreadsheet,
  Edit,
  Trash2,
  AlertCircle,
  X,
  Phone,
  Mail,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import { Turma, Catequista, MODALIDADE_NAMES } from '../types';
import {
  getTurmas,
  getCatequistas,
  getInscritos,
  saveTurma,
  deleteTurma,
  saveCatequista,
  deleteCatequista
} from '../services/storage';
import { gerarListaPresencaPDF } from '../services/pdfGenerator';
import { exportarTurmasExcel } from '../services/excelGenerator';
import { ConfirmModal } from './ConfirmModal';

export const TurmasManager: React.FC = () => {
  const [turmas, setTurmas] = useState<Turma[]>(() => getTurmas());
  const [catequistas, setCatequistas] = useState<Catequista[]>(() => getCatequistas());
  const [catequistaExcluirId, setCatequistaExcluirId] = useState<string | null>(null);
  const inscritos = getInscritos();

  // Catequistas organizados estritamente em ordem alfabética
  const catequistasOrdenados = [...catequistas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  // Modais de Turma
  const [modalTurmaAberto, setModalTurmaAberto] = useState(false);
  const [turmaEdicao, setTurmaEdicao] = useState<Partial<Turma> | null>(null);
  const [turmaParaExcluir, setTurmaParaExcluir] = useState<Turma | null>(null);

  // Modais de Catequista
  const [modalCatequistasAberto, setModalCatequistasAberto] = useState(false);
  const [catequistaEdicao, setCatequistaEdicao] = useState<Partial<Catequista> | null>(null);
  const [modalNovoCatequista, setModalNovoCatequista] = useState(false);

  const refresh = () => {
    setTurmas(getTurmas());
    setCatequistas(getCatequistas());
  };

  const handleSalvarTurma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaEdicao?.nome || !turmaEdicao?.modalidade) return;

    const catObj1 = catequistas.find(c => c.id === turmaEdicao.catequistaId);
    const catObj2 = catequistas.find(c => c.id === turmaEdicao.catequistaSecundarioId);

    saveTurma({
      id: turmaEdicao.id || `tur-${Date.now()}`,
      paroquiaId: turmaEdicao.paroquiaId || 'par-01',
      comunidadeId: turmaEdicao.comunidadeId || 'com-01',
      modalidade: turmaEdicao.modalidade || 'EUC',
      anoPastoral: Number(turmaEdicao.anoPastoral) || 2028,
      nome: turmaEdicao.nome,
      horario: turmaEdicao.horario || '08:30 - 10:00',
      diaSemana: turmaEdicao.diaSemana || 'Sábado',
      sala: turmaEdicao.sala || 'Sala de Catequese',
      catequistaId: turmaEdicao.catequistaId || undefined,
      catequistaNome: catObj1 ? catObj1.nome : (turmaEdicao.catequistaNome || 'A definir'),
      catequistaSecundarioId: turmaEdicao.catequistaSecundarioId || undefined,
      catequistaSecundarioNome: catObj2 ? catObj2.nome : undefined,
      vagasMaximas: Number(turmaEdicao.vagasMaximas) || 20,
      vagasOcupadas: turmaEdicao.vagasOcupadas || 0,
      listaEsperaCount: turmaEdicao.listaEsperaCount || 0,
      ativa: true
    });

    refresh();
    setModalTurmaAberto(false);
    setTurmaEdicao(null);
  };

  const handleConfirmarExclusaoTurma = () => {
    if (turmaParaExcluir) {
      deleteTurma(turmaParaExcluir.id);
      refresh();
      setTurmaParaExcluir(null);
    }
  };

  const handleSalvarCatequista = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catequistaEdicao?.nome) return;

    saveCatequista({
      id: catequistaEdicao.id || `cat-${Date.now()}`,
      paroquiaId: catequistaEdicao.paroquiaId || 'par-01',
      comunidadeId: catequistaEdicao.comunidadeId || 'com-01',
      nome: catequistaEdicao.nome,
      cpf: catequistaEdicao.cpf || '',
      telefone: catequistaEdicao.telefone || '',
      email: catequistaEdicao.email || '',
      dataNascimento: catequistaEdicao.dataNascimento || '',
      formacao: catequistaEdicao.formacao || 'Iniciação à Vida Cristã (IVC)',
      turmasAtribuidas: catequistaEdicao.turmasAtribuidas || [],
      ativo: true
    });

    refresh();
    setModalNovoCatequista(false);
    setCatequistaEdicao(null);
  };

  const handleExcluirCatequista = (id: string) => {
    setCatequistaExcluirId(id);
  };

  const executarExcluirCatequista = () => {
    if (!catequistaExcluirId) return;
    deleteCatequista(catequistaExcluirId);
    refresh();
    setCatequistaExcluirId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C7851] bg-[#F3F1ED] px-2.5 py-1 rounded-md border border-[#E5E1DA]">
            Igreja São José - Lar de Misericórdia
          </span>
          <h2 className="text-2xl font-black text-[#2D2A26] mt-1">Gestão de Turmas e Catequistas</h2>
          <p className="text-xs text-[#5D574F]">
            Cadastro de catequistas, controle dinâmico de ocupação de vagas e diários de presença.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalCatequistasAberto(true)}
            className="px-4 py-2 bg-[#F3F1ED] hover:bg-[#E5E1DA] text-[#2D2A26] border border-[#E5E1DA] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-[#8C7851]" />
            Gerenciar Catequistas ({catequistas.length})
          </button>

          <button
            onClick={() => exportarTurmasExcel(turmas)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
          </button>

          <button
            onClick={() => {
              setTurmaEdicao({
                vagasMaximas: 20,
                anoPastoral: 2028,
                modalidade: 'EUC',
                diaSemana: 'Sábado'
              });
              setModalTurmaAberto(true);
            }}
            className="px-4 py-2 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow shadow-[#8C7851]/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Turma
          </button>
        </div>
      </div>

      {/* Grid de Turmas Cadastradas */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {turmas.map(t => {
          // Ocupação dinamicamente calculada com base nos inscritos reais vinculados a esta turma
          const alunosNaTurma = inscritos.filter(i => i.turmaId === t.id && i.status !== 'Cancelada');
          const ocupacaoReal = alunosNaTurma.length;
          const percentual = Math.round((ocupacaoReal / (t.vagasMaximas || 1)) * 100);

          return (
            <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#E5E1DA] space-y-4 hover:border-[#8C7851] transition-colors relative flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8C7851] bg-[#F3F1ED] px-2 py-0.5 rounded border border-[#E5E1DA]">
                      {MODALIDADE_NAMES[t.modalidade]}
                    </span>
                    <h3 className="font-bold text-[#2D2A26] text-sm mt-1">{t.nome}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setTurmaEdicao(t);
                        setModalTurmaAberto(true);
                      }}
                      title="Editar Turma"
                      className="p-1.5 text-[#5D574F] hover:text-[#8C7851] hover:bg-[#F3F1ED] rounded-lg cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setTurmaParaExcluir(t)}
                      title="Excluir Turma"
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#5D574F] space-y-1.5 mt-3">
                  <p className="flex items-start gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#8C7851] shrink-0 mt-0.5" />
                    <span>
                      Catequista(s): <strong>{t.catequistaNome || 'A definir'}</strong>
                      {t.catequistaSecundarioNome && (
                        <span className="text-[#8C7851] font-bold"> &bull; {t.catequistaSecundarioNome}</span>
                      )}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-[#A69F95]" />
                    <span>Ano de Conclusão: <strong className="text-[#2D2A26]">{t.anoPastoral || 2028}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#A69F95]" />
                    <span>{t.diaSemana} &bull; {t.horario}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A69F95]" />
                    <span>{t.sala}</span>
                  </p>
                </div>

                {/* Barra de Ocupação Real de Vagas */}
                <div className="space-y-1 mt-4">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-[#5D574F]">Ocupação de Vagas (Real):</span>
                    <span className={ocupacaoReal >= t.vagasMaximas ? 'text-amber-700 font-extrabold' : 'text-[#2D2A26]'}>
                      {ocupacaoReal} / {t.vagasMaximas} ({percentual}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F3F1ED] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentual >= 100 ? 'bg-amber-600' : 'bg-[#8C7851]'
                      }`}
                      style={{ width: `${Math.min(100, percentual)}%` }}
                    />
                  </div>
                  {ocupacaoReal > t.vagasMaximas && (
                    <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      Excesso/Lista de espera: {ocupacaoReal - t.vagasMaximas} catequizando(s)
                    </span>
                  )}
                </div>

                {/* Lista rápida de Catequizandos inscritos nesta turma */}
                <div className="mt-3 bg-[#FAF9F7] p-2.5 rounded-xl border border-[#E5E1DA] text-xs">
                  <span className="text-[10px] font-bold text-[#8C7851] uppercase tracking-wider block mb-1">
                    Inscritos Alocados ({alunosNaTurma.length}):
                  </span>
                  {alunosNaTurma.length === 0 ? (
                    <p className="text-[11px] text-[#A69F95] italic">Nenhum catequizando alocado nesta turma até o momento.</p>
                  ) : (
                    <ul className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {alunosNaTurma.map(a => (
                        <li key={a.id} className="text-[11px] text-[#2D2A26] flex justify-between items-center">
                          <span className="truncate max-w-[170px]">• {a.nome}</span>
                          <span className="text-[10px] text-[#8C7851] font-mono">{a.protocolo}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Botão de Diário de Presença */}
              <div className="pt-3 border-t border-[#E5E1DA] flex justify-end mt-4">
                <button
                  onClick={() => gerarListaPresencaPDF(t, alunosNaTurma)}
                  className="px-3 py-1.5 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm w-full justify-center"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Diário de Presença (PDF)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Confirmação de Exclusão de Turma */}
      {turmaParaExcluir && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-[#E5E1DA] overflow-hidden">
            <div className="bg-rose-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-300" />
                Excluir Turma Paroquial
              </h3>
              <button onClick={() => setTurmaParaExcluir(null)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-[#2D2A26]">
              <p>
                Tem certeza que deseja excluir a turma <strong>"{turmaParaExcluir.nome}"</strong>?
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                ⚠️ <strong>Atenção:</strong> Se houver catequizandos alocados nesta turma, eles serão desvinculados e retornarão para o status <em>"Aguardando Turma"</em>.
              </div>
            </div>
            <div className="p-4 bg-[#FAF9F7] border-t border-[#E5E1DA] flex justify-end gap-2 text-xs">
              <button
                onClick={() => setTurmaParaExcluir(null)}
                className="px-4 py-2 bg-white text-[#5D574F] border border-[#E5E1DA] rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusaoTurma}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer shadow-sm"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestão de Catequistas */}
      {modalCatequistasAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-[#E5E1DA] overflow-hidden">
            <div className="bg-[#2D2A26] text-white p-5 flex items-center justify-between border-b border-[#8C7851]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#C4A976]" />
                <div>
                  <h3 className="font-bold text-sm text-white">Cadastro e Gestão de Catequistas</h3>
                  <p className="text-xs text-[#C4A976]">Corpo de catequistas da Paróquia São José</p>
                </div>
              </div>
              <button onClick={() => setModalCatequistasAberto(false)} className="text-xs text-[#A69F95] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#E5E1DA] pb-3">
                <span className="text-xs font-bold text-[#2D2A26]">Catequistas Cadastrados ({catequistas.length}):</span>
                <button
                  onClick={() => {
                    setCatequistaEdicao({});
                    setModalNovoCatequista(true);
                  }}
                  className="px-3 py-1.5 bg-[#8C7851] hover:bg-[#7A6946] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Novo Catequista
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {catequistasOrdenados.length === 0 ? (
                  <p className="text-xs text-[#A69F95] italic text-center py-4">Nenhum catequista cadastrado.</p>
                ) : (
                  catequistasOrdenados.map(c => (
                    <div key={c.id} className="p-3 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#2D2A26]">{c.nome}</p>
                        <p className="text-[11px] text-[#5D574F] flex items-center gap-2 mt-0.5">
                          {c.dataNascimento && <span>Nasc: {new Date(c.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR')} &bull;</span>}
                          <span>{c.telefone || 'Sem telefone'}</span>
                          <span>&bull;</span>
                          <span>{c.formacao || 'Formação IVC'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setCatequistaEdicao(c);
                            setModalNovoCatequista(true);
                          }}
                          className="p-1.5 text-[#5D574F] hover:text-[#8C7851] rounded-lg hover:bg-white cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExcluirCatequista(c.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-[#FAF9F7] border-t border-[#E5E1DA] flex justify-end text-xs">
              <button
                onClick={() => setModalCatequistasAberto(false)}
                className="px-4 py-2 bg-white text-[#5D574F] border border-[#E5E1DA] rounded-xl font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulário Catequista */}
      {modalNovoCatequista && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-[#E5E1DA] overflow-hidden">
            <div className="bg-[#2D2A26] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {catequistaEdicao?.id ? 'Editar Catequista' : 'Cadastrar Novo Catequista'}
              </h3>
              <button onClick={() => setModalNovoCatequista(false)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarCatequista} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#2D2A26] mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria das Graças Silva"
                  value={catequistaEdicao?.nome || ''}
                  onChange={(e) => setCatequistaEdicao(p => ({ ...p, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2A26] mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={catequistaEdicao?.dataNascimento || ''}
                  onChange={(e) => setCatequistaEdicao(p => ({ ...p, dataNascimento: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2A26] mb-1">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="(86) 99999-0000"
                  value={catequistaEdicao?.telefone || ''}
                  onChange={(e) => setCatequistaEdicao(p => ({ ...p, telefone: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2A26] mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="exemplo@gmail.com"
                  value={catequistaEdicao?.email || ''}
                  onChange={(e) => setCatequistaEdicao(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2A26] mb-1">Formação / Nível Catequético</label>
                <input
                  type="text"
                  placeholder="Ex: Escola Catequética Arquidiocesana (IVC)"
                  value={catequistaEdicao?.formacao || ''}
                  onChange={(e) => setCatequistaEdicao(p => ({ ...p, formacao: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E1DA]">
                <button
                  type="button"
                  onClick={() => setModalNovoCatequista(false)}
                  className="px-4 py-2 bg-[#FAF9F7] text-[#5D574F] border border-[#E5E1DA] rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  Salvar Catequista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edição / Nova Turma */}
      {modalTurmaAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-[#E5E1DA] overflow-hidden">
            <div className="bg-[#2D2A26] text-white p-5 flex items-center justify-between border-b border-[#8C7851]">
              <h3 className="font-bold text-sm">
                {turmaEdicao?.id ? 'Editar Turma Paroquial' : 'Nova Turma de Catequese'}
              </h3>
              <button onClick={() => setModalTurmaAberto(false)} className="text-xs text-[#A69F95] hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarTurma} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2D2A26] mb-1">Nome da Turma *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Eucaristia I - Sábado Manhã"
                  value={turmaEdicao?.nome || ''}
                  onChange={(e) => setTurmaEdicao(p => ({ ...p, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D2A26] mb-1">Modalidade *</label>
                  <select
                    value={turmaEdicao?.modalidade || 'EUC'}
                    onChange={(e: any) => setTurmaEdicao(p => ({ ...p, modalidade: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl bg-white focus:outline-none focus:border-[#8C7851]"
                  >
                    <option value="PRE">Pré-Catequese</option>
                    <option value="EUC">Eucaristia</option>
                    <option value="PER">Perseverança</option>
                    <option value="CRI">Crisma Jovem</option>
                    <option value="ADU">Catecumenato Adulto</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#2D2A26] mb-1">Ano de Conclusão *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 2028"
                    value={turmaEdicao?.anoPastoral || 2028}
                    onChange={(e) => setTurmaEdicao(p => ({ ...p, anoPastoral: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                  />
                </div>
              </div>

              {/* Vínculo de até 2 Catequistas (Organizados Alfabeticamente) */}
              <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[#E5E1DA] space-y-3">
                <span className="text-[11px] font-bold text-[#8C7851] uppercase tracking-wider block">
                  Catequistas Responsáveis (Até 2)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#2D2A26] mb-1">1º Catequista</label>
                    <select
                      value={turmaEdicao?.catequistaId || ''}
                      onChange={(e) => {
                        const selectedCat = catequistas.find(c => c.id === e.target.value);
                        setTurmaEdicao(p => ({
                          ...p,
                          catequistaId: e.target.value,
                          catequistaNome: selectedCat ? selectedCat.nome : 'A definir'
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 border border-[#E5E1DA] rounded-xl bg-white focus:outline-none focus:border-[#8C7851]"
                    >
                      <option value="">-- Nenhum / A definir --</option>
                      {catequistasOrdenados.map(c => (
                        <option key={c.id} value={c.id} disabled={c.id === turmaEdicao?.catequistaSecundarioId}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#2D2A26] mb-1">2º Catequista</label>
                    <select
                      value={turmaEdicao?.catequistaSecundarioId || ''}
                      onChange={(e) => {
                        const selectedCat = catequistas.find(c => c.id === e.target.value);
                        setTurmaEdicao(p => ({
                          ...p,
                          catequistaSecundarioId: e.target.value,
                          catequistaSecundarioNome: selectedCat ? selectedCat.nome : undefined
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 border border-[#E5E1DA] rounded-xl bg-white focus:outline-none focus:border-[#8C7851]"
                    >
                      <option value="">-- Nenhum (Opcional) --</option>
                      {catequistasOrdenados.map(c => (
                        <option key={c.id} value={c.id} disabled={c.id === turmaEdicao?.catequistaId}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D2A26] mb-1">Dia da Semana</label>
                  <select
                    value={turmaEdicao?.diaSemana || 'Sábado'}
                    onChange={(e: any) => setTurmaEdicao(p => ({ ...p, diaSemana: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl bg-white focus:outline-none focus:border-[#8C7851]"
                  >
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#2D2A26] mb-1">Horário (Ex: 08:30 - 10:00)</label>
                  <input
                    type="text"
                    value={turmaEdicao?.horario || ''}
                    onChange={(e) => setTurmaEdicao(p => ({ ...p, horario: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D2A26] mb-1">Sala / Local</label>
                  <input
                    type="text"
                    placeholder="Ex: Sala 02"
                    value={turmaEdicao?.sala || ''}
                    onChange={(e) => setTurmaEdicao(p => ({ ...p, sala: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2D2A26] mb-1">Limite Máximo de Vagas</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={turmaEdicao?.vagasMaximas || 20}
                    onChange={(e) => setTurmaEdicao(p => ({ ...p, vagasMaximas: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-[#E5E1DA] rounded-xl focus:outline-none focus:border-[#8C7851]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalTurmaAberto(false)}
                  className="px-4 py-2 bg-[#FAF9F7] text-[#2D2A26] border border-[#E5E1DA] rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8C7851] hover:bg-[#7A6946] text-white rounded-xl font-bold cursor-pointer shadow"
                >
                  Salvar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Excluir Catequista */}
      <ConfirmModal
        isOpen={!!catequistaExcluirId}
        title="Excluir Catequista"
        message="Tem certeza que deseja excluir este catequista? Ele será desvinculado das turmas que ministra."
        confirmLabel="Excluir Catequista"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={executarExcluirCatequista}
        onClose={() => setCatequistaExcluirId(null)}
      />
    </div>
  );
};
